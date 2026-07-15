import { DiscoveredPrinter } from '../stores/adminStore';

export interface ScanProgress {
  stage: 'initializing' | 'scanning_network' | 'scanning_usb' | 'scanning_mdns' | 'analyzing';
  progress: number;
  message: string;
}

export interface ScanResult {
  printers: DiscoveredPrinter[];
  success: boolean;
  error?: string;
  scanDuration: number;
  networkCount: number;
  usbCount: number;
  mdnsCount: number;
}

const CUPS_PORT = 631;
const RAW_PRINT_PORT = 9100;
const MDNS_TIMEOUT = 5000;
const NETWORK_TIMEOUT = 3000;

interface USBDeviceInfo {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  configurations: Array<{
    interfaces: Array<{
      alternates: Array<{
        interfaceClass: number;
      }>;
    }>;
  }>;
}

interface NavigatorWithUSB extends Navigator {
  usb?: {
    getDevices: () => Promise<USBDeviceInfo[]>;
    requestDevice: (options: { filters: Array<{ classCode?: number }> }) => Promise<USBDeviceInfo>;
  };
}

export class PrinterScanner {
  private abortController: AbortController | null = null;
  private onProgress?: (progress: ScanProgress) => void;

  async scan(onProgress?: (progress: ScanProgress) => void): Promise<ScanResult> {
    this.onProgress = onProgress;
    this.abortController = new AbortController();

    const startTime = Date.now();
    const allPrinters: DiscoveredPrinter[] = [];

    try {
      this.reportProgress('initializing', 0, '正在初始化扫描...');

      const [networkPrinters, usbPrinters, mdnsPrinters] = await Promise.all([
        this.scanNetwork(),
        this.scanUSB(),
        this.scanMDNS(),
      ]);

      allPrinters.push(...networkPrinters, ...usbPrinters, ...mdnsPrinters);

      const uniquePrinters = this.deduplicatePrinters(allPrinters);

      this.reportProgress('analyzing', 100, `扫描完成，发现 ${uniquePrinters.length} 台打印机`);

      return {
        printers: uniquePrinters,
        success: true,
        scanDuration: Date.now() - startTime,
        networkCount: networkPrinters.length,
        usbCount: usbPrinters.length,
        mdnsCount: mdnsPrinters.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '扫描失败';
      return {
        printers: [],
        success: false,
        error: message,
        scanDuration: Date.now() - startTime,
        networkCount: 0,
        usbCount: 0,
        mdnsCount: 0,
      };
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private reportProgress(stage: ScanProgress['stage'], progress: number, message: string): void {
    if (this.onProgress && !this.abortController?.signal.aborted) {
      this.onProgress({ stage, progress, message });
    }
  }

  private async scanNetwork(): Promise<DiscoveredPrinter[]> {
    this.reportProgress('scanning_network', 10, '正在扫描网络打印机...');

    const printers: DiscoveredPrinter[] = [];

    try {
      const localIP = await this.getLocalIP();
      if (localIP) {
        const subnet = localIP.substring(0, localIP.lastIndexOf('.'));
        const ipRange = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);

        const chunkSize = 10;
        for (let i = 0; i < ipRange.length; i += chunkSize) {
          if (this.abortController?.signal.aborted) break;

          const chunk = ipRange.slice(i, i + chunkSize);
          const promises = chunk.map((ip) => this.checkPrinter(ip));

          const results = await Promise.allSettled(promises);
          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
              printers.push(result.value);
            }
          });

          const progress = Math.min(40, 10 + Math.round((i / ipRange.length) * 30));
          this.reportProgress('scanning_network', progress, `已扫描 ${i + chunkSize} 个IP地址...`);
        }
      }
    } catch {
      console.warn('网络扫描失败，跳过');
    }

    return printers;
  }

  private async checkPrinter(ip: string): Promise<DiscoveredPrinter | null> {
    const ports = [CUPS_PORT, RAW_PRINT_PORT];

    for (const port of ports) {
      try {
        const result = await this.testConnection(ip, port);
        if (result) {
          return result;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private async testConnection(ip: string, port: number): Promise<DiscoveredPrinter | null> {
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), NETWORK_TIMEOUT)
    );

    const connectionPromise = new Promise<DiscoveredPrinter | null>((resolve) => {
      const socket = new WebSocket(`ws://${ip}:${port}`);
      socket.onopen = () => {
        socket.close();
        resolve({
          id: `network-${ip}-${port}`,
          name: `网络打印机 (${ip})`,
          model: port === CUPS_PORT ? 'CUPS Printer' : 'Raw Printer',
          type: 'network',
          address: ip,
          status: 'online',
          connectionType: port === CUPS_PORT ? 'IPP/CUPS' : 'RAW/TCP',
          manufacturer: '未知',
          lastSeen: new Date().toISOString(),
        });
      };
      socket.onerror = () => {
        resolve(null);
      };
      socket.onclose = () => {
        resolve(null);
      };
    });

    return Promise.race([connectionPromise, timeoutPromise]);
  }

  private async getLocalIP(): Promise<string | null> {
    return new Promise((resolve) => {
      const RTCPeerConnection =
        (window as unknown as { RTCPeerConnection: typeof window.RTCPeerConnection }).RTCPeerConnection;
      if (!RTCPeerConnection) {
        resolve(null);
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => resolve(null));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const ipMatch = event.candidate.candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
          if (ipMatch) {
            resolve(ipMatch[0]);
            pc.close();
          }
        } else {
          resolve(null);
        }
      };
    });
  }

  private async scanUSB(): Promise<DiscoveredPrinter[]> {
    this.reportProgress('scanning_usb', 45, '正在扫描USB打印机...');

    const printers: DiscoveredPrinter[] = [];

    try {
      const navigatorWithUSB = navigator as NavigatorWithUSB;
      if (!navigatorWithUSB.usb) {
        return printers;
      }

      const usbDevices = await navigatorWithUSB.usb.getDevices();

      for (const device of usbDevices) {
        if (this.abortController?.signal.aborted) break;

        const isPrinter = this.isPrinterDevice(device);
        if (isPrinter) {
          printers.push({
            id: `usb-${device.vendorId}-${device.productId}`,
            name: device.productName || `USB 设备 (${device.vendorId}:${device.productId})`,
            model: device.productName || '未知型号',
            type: 'local',
            status: 'online',
            connectionType: 'USB',
            manufacturer: device.manufacturerName || '未知',
            lastSeen: new Date().toISOString(),
          });
        }
      }

      if (printers.length === 0) {
        try {
          const newDevice = await navigatorWithUSB.usb.requestDevice({
            filters: [{ classCode: 7 }],
          });

          if (this.isPrinterDevice(newDevice)) {
            printers.push({
              id: `usb-${newDevice.vendorId}-${newDevice.productId}`,
              name: newDevice.productName || `USB 设备 (${newDevice.vendorId}:${newDevice.productId})`,
              model: newDevice.productName || '未知型号',
              type: 'local',
              status: 'online',
              connectionType: 'USB',
              manufacturer: newDevice.manufacturerName || '未知',
              lastSeen: new Date().toISOString(),
            });
          }
        } catch {
          console.warn('用户未授权USB设备访问');
        }
      }
    } catch {
      console.warn('USB扫描失败或浏览器不支持');
    }

    return printers;
  }

  private isPrinterDevice(device: USBDeviceInfo): boolean {
    for (const configuration of device.configurations) {
      for (const interface_ of configuration.interfaces) {
        for (const alternate of interface_.alternates) {
          if (alternate.interfaceClass === 7) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private async scanMDNS(): Promise<DiscoveredPrinter[]> {
    this.reportProgress('scanning_mdns', 70, '正在搜索mDNS打印机...');

    const printers: DiscoveredPrinter[] = [];

    try {
      const mdns = (window as unknown as { mdns?: { Browser: new (type: string) => MDNSBrowser } }).mdns;
      if (!mdns) {
        return printers;
      }

      const mdnsBrowser = new mdns.Browser('printer');

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          mdnsBrowser.stop();
          resolve(printers);
        }, MDNS_TIMEOUT);

        mdnsBrowser.on('serviceUp', (service: any) => {
          printers.push({
            id: `mdns-${service.name}`,
            name: service.name || 'mDNS 打印机',
            model: service.type || '网络打印机',
            type: 'network',
            address: service.addresses?.[0] || '',
            status: 'online',
            connectionType: 'mDNS/DNS-SD',
            manufacturer: service.host || '未知',
            lastSeen: new Date().toISOString(),
          });
        });

        mdnsBrowser.start();
      });
    } catch {
      console.warn('mDNS扫描失败或浏览器不支持');
      return printers;
    }
  }

  private deduplicatePrinters(printers: DiscoveredPrinter[]): DiscoveredPrinter[] {
    const seen = new Set<string>();
    return printers.filter((printer) => {
      const key = printer.address || printer.id;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

interface MDNSBrowser {
  on(event: string, callback: (service: any) => void): void;
  start(): void;
  stop(): void;
}

export const scanPrinters = async (onProgress?: (progress: ScanProgress) => void): Promise<ScanResult> => {
  const scanner = new PrinterScanner();
  return scanner.scan(onProgress);
};

export const abortScan = (scanner: PrinterScanner): void => {
  scanner.abort();
};
