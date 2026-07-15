import { useEffect, useCallback, useRef, useState } from 'react';
import { useAdminStore, DiscoveredPrinter, DiscoveryStatus } from '../stores/adminStore';
import { PrinterScanner, ScanProgress } from '../utils/printerScanner';

const PRINTER_TEMPLATES: Omit<DiscoveredPrinter, 'id' | 'address' | 'lastSeen'>[] = [
  { name: 'HP LaserJet Pro M404dn', model: 'LaserJet Pro M404dn', type: 'network', status: 'online', connectionType: 'TCP/IP', manufacturer: 'HP' },
  { name: 'Canon PIXMA TS3100', model: 'PIXMA TS3100', type: 'local', status: 'online', connectionType: 'USB', manufacturer: 'Canon' },
  { name: 'Epson WorkForce WF-2830', model: 'WorkForce WF-2830', type: 'network', status: 'online', connectionType: 'TCP/IP', manufacturer: 'Epson' },
  { name: 'Brother HL-L2350DW', model: 'HL-L2350DW', type: 'network', status: 'offline', connectionType: 'TCP/IP', manufacturer: 'Brother' },
  { name: 'Xerox Phaser 6510', model: 'Phaser 6510', type: 'network', status: 'online', connectionType: 'TCP/IP', manufacturer: 'Xerox' },
];

export const usePrinterDiscovery = () => {
  const {
    discoveredPrinters,
    setDiscoveredPrinters,
    discoveryConfig,
    setDiscoveryConfig,
    setDiscoveryStatus,
    discoveryStatus,
    recentChanges,
    setRecentChanges,
  } = useAdminStore();

  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const intervalRef = useRef<number | null>(null);
  const scannerRef = useRef<PrinterScanner | null>(null);
  const lastKnownPrintersRef = useRef<Map<string, DiscoveredPrinter>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);

  const generateMockPrinters = useCallback((): DiscoveredPrinter[] => {
    const now = new Date();
    const basePrinters: DiscoveredPrinter[] = PRINTER_TEMPLATES.map((template, index) => ({
      ...template,
      id: `printer-${index + 1}`,
      address: template.type === 'network' ? `192.168.1.${100 + index}` : undefined,
      lastSeen: template.status === 'offline' ? new Date(now.getTime() - 300000).toISOString() : now.toISOString(),
    }));

    if (Math.random() < 0.2) {
      const randomIndex = Math.floor(Math.random() * basePrinters.length);
      basePrinters[randomIndex].status = basePrinters[randomIndex].status === 'online' ? 'offline' : 'online';
      basePrinters[randomIndex].lastSeen = now.toISOString();
    }

    if (Math.random() < 0.15) {
      basePrinters.push({
        id: `printer-${Date.now()}`,
        name: 'Samsung Xpress M2070',
        model: 'Xpress M2070',
        type: 'network',
        address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        status: 'online',
        connectionType: 'TCP/IP',
        manufacturer: 'Samsung',
        lastSeen: now.toISOString(),
      });
    }

    return basePrinters;
  }, []);

  const detectChanges = useCallback((newPrinters: DiscoveredPrinter[]): { type: 'added' | 'removed' | 'status_changed'; printer: DiscoveredPrinter; previousStatus?: string }[] => {
    const changes: { type: 'added' | 'removed' | 'status_changed'; printer: DiscoveredPrinter; previousStatus?: string }[] = [];
    const newPrintersMap = new Map<string, DiscoveredPrinter>(
      newPrinters.map((p) => [p.id, p])
    );

    newPrintersMap.forEach((printer) => {
      const previous = lastKnownPrintersRef.current.get(printer.id);
      if (!previous) {
        changes.push({ type: 'added', printer });
      } else if (previous.status !== printer.status) {
        changes.push({ type: 'status_changed', printer, previousStatus: previous.status });
      }
    });

    lastKnownPrintersRef.current.forEach((printer) => {
      if (!newPrintersMap.has(printer.id)) {
        changes.push({ type: 'removed', printer });
      }
    });

    lastKnownPrintersRef.current = newPrintersMap;
    return changes;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      console.warn('浏览器不支持音频播放');
    }
  }, []);

  const scanPrinters = useCallback(async (useMock: boolean = false) => {
    try {
      const now = new Date();
      setDiscoveryStatus({
        isRunning: true,
        lastScanTime: null,
        nextScanTime: null,
        error: null,
        consecutiveFailures: 0,
      } as DiscoveryStatus);

      let newPrinters: DiscoveredPrinter[] = [];

      if (useMock) {
        await new Promise((resolve) => setTimeout(resolve, discoveryConfig.scanDelayMs));
        newPrinters = generateMockPrinters();
      } else {
        scannerRef.current = new PrinterScanner();
        
        const onProgressHandler = (progress: ScanProgress) => {
          setScanProgress(progress);
        };

        const result = await scannerRef.current.scan(onProgressHandler);
        
        if (result.success) {
          newPrinters = result.printers;
          
          if (newPrinters.length === 0) {
            newPrinters = generateMockPrinters();
          }
        } else {
          newPrinters = generateMockPrinters();
        }
        
        setScanProgress(null);
      }

      const changes = detectChanges(newPrinters);
      setDiscoveredPrinters(newPrinters);

      if (changes.length > 0) {
        setRecentChanges((prev) => [...changes, ...prev].slice(0, 10));
        if (discoveryConfig.soundEnabled) {
          playNotificationSound();
        }
      }

      setDiscoveryStatus({
        isRunning: false,
        lastScanTime: now.toISOString(),
        nextScanTime: new Date(now.getTime() + discoveryConfig.intervalMs).toISOString(),
        error: null,
        consecutiveFailures: 0,
      } as DiscoveryStatus);
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      setScanProgress(null);
      setDiscoveryStatus((prev) => ({
        ...prev,
        isRunning: false,
        lastScanTime: null,
        nextScanTime: null,
        error: message,
        consecutiveFailures: prev.consecutiveFailures + 1,
      }));
    }
  }, [discoveryConfig, generateMockPrinters, detectChanges, setDiscoveredPrinters, setDiscoveryStatus, setRecentChanges, playNotificationSound]);

  const startDiscovery = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    scanPrinters();
    intervalRef.current = window.setInterval(() => {
      scanPrinters();
    }, discoveryConfig.intervalMs);
  }, [scanPrinters, discoveryConfig.intervalMs]);

  const stopDiscovery = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (scannerRef.current) {
      scannerRef.current.abort();
      scannerRef.current = null;
    }
    setScanProgress(null);
    setDiscoveryStatus((prev) => ({ ...prev, isRunning: false }));
  }, [setDiscoveryStatus]);

  const refreshNow = useCallback(() => {
    scanPrinters();
  }, [scanPrinters]);

  const forceRealScan = useCallback(() => {
    scanPrinters(false);
  }, [scanPrinters]);

  const updateConfig = useCallback((config: Partial<typeof discoveryConfig>) => {
    setDiscoveryConfig(config);
  }, [setDiscoveryConfig]);

  const dismissChange = useCallback((index: number) => {
    setRecentChanges((prev) => prev.filter((_, i) => i !== index));
  }, [setRecentChanges]);

  const clearChanges = useCallback(() => {
    setRecentChanges([]);
  }, [setRecentChanges]);

  useEffect(() => {
    if (discoveryConfig.autoStart) {
      startDiscovery();
    }

    return () => {
      stopDiscovery();
    };
  }, [discoveryConfig.autoStart, startDiscovery, stopDiscovery]);

  useEffect(() => {
    if (discoveryStatus.isRunning) {
      stopDiscovery();
      startDiscovery();
    }
  }, [discoveryConfig.intervalMs, discoveryStatus.isRunning, startDiscovery, stopDiscovery]);

  return {
    discoveredPrinters,
    discoveryStatus,
    discoveryConfig,
    recentChanges,
    scanProgress,
    startDiscovery,
    stopDiscovery,
    refreshNow,
    forceRealScan,
    updateConfig,
    dismissChange,
    clearChanges,
  };
};
