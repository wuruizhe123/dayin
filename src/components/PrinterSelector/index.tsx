import { useState, useEffect } from 'react';
import { Printer, RefreshCw, Wifi, Globe, CheckCircle, AlertCircle, ChevronDown, Search, Clock } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import { useAdminStore } from '../../stores/adminStore';
import { usePrinterDetection } from '../../hooks/usePrinterDetection';

export const PrinterSelector = () => {
  const { printers, settings, setSettings, isDetectingPrinters } = usePrintStore();
  const { printers: adminPrinters } = useAdminStore();
  const { detectPrinters } = usePrinterDetection();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allPrinters = [...printers];
  
  adminPrinters.forEach((adminPrinter) => {
    if (!allPrinters.some((p) => p.id === adminPrinter.id)) {
      allPrinters.push({
        id: adminPrinter.id,
        name: adminPrinter.name,
        type: adminPrinter.type,
        isDefault: adminPrinter.isDefault || false,
        status: adminPrinter.status,
      });
    }
  });

  const filteredPrinters = allPrinters.filter((printer) =>
    printer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlinePrinters = allPrinters.filter((p) => p.status === 'online');
  const offlinePrinters = allPrinters.filter((p) => p.status === 'offline');

  const selectedPrinter = allPrinters.find((p) => p.id === settings.selectedPrinterId) || null;

  const handleSelectPrinter = (printerId: string) => {
    setSettings({ selectedPrinterId: printerId });
    setIsExpanded(false);
  };

  useEffect(() => {
    if (allPrinters.length > 0 && !settings.selectedPrinterId) {
      const defaultPrinter = allPrinters.find((p) => p.isDefault) || allPrinters[0];
      setSettings({ selectedPrinterId: defaultPrinter.id });
    }
  }, [allPrinters, settings.selectedPrinterId, setSettings]);

  const getPrinterIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <Globe className="w-4 h-4" />;
      case 'usb':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Printer className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-700">打印机选择</h3>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
            {onlinePrinters.length}/{allPrinters.length} 在线
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={detectPrinters}
            disabled={isDetectingPrinters}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${isDetectingPrinters ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div
        className="relative cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedPrinter?.status || 'online')}`} />
            {getPrinterIcon(selectedPrinter?.type || 'local')}
            <div>
              <div className="text-sm font-medium text-gray-700">
                {selectedPrinter?.name || '选择打印机'}
              </div>
              <div className="text-xs text-gray-500">
                {selectedPrinter?.type === 'network' ? '网络打印机' : '本地打印机'}
                {selectedPrinter?.isDefault && ' · 默认'}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>

        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索打印机..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isDetectingPrinters ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  <span className="text-sm">正在检测打印机...</span>
                </div>
              ) : filteredPrinters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <Printer className="w-8 h-8 mb-2 text-gray-300" />
                  <span className="text-sm">未找到打印机</span>
                  <button
                    onClick={detectPrinters}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    点击刷新检测
                  </button>
                </div>
              ) : (
                <>
                  {onlinePrinters.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                        在线 ({onlinePrinters.length})
                      </div>
                      {onlinePrinters
                        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((printer) => (
                          <button
                            key={printer.id}
                            onClick={() => handleSelectPrinter(printer.id)}
                            className={`w-full flex items-center justify-between p-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                              settings.selectedPrinterId === printer.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              {getPrinterIcon(printer.type)}
                              <div className="text-left">
                                <div className="text-sm font-medium text-gray-700">
                                  {printer.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {printer.type === 'network' ? '网络打印机' : '本地打印机'}
                                  {printer.isDefault && ' · 默认'}
                                </div>
                              </div>
                            </div>
                            {settings.selectedPrinterId === printer.id && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                    </>
                  )}

                  {offlinePrinters.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                        离线 ({offlinePrinters.length})
                      </div>
                      {offlinePrinters
                        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((printer) => (
                          <button
                            key={printer.id}
                            onClick={() => handleSelectPrinter(printer.id)}
                            className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 opacity-60 ${
                              settings.selectedPrinterId === printer.id ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                              {getPrinterIcon(printer.type)}
                              <div className="text-left">
                                <div className="text-sm font-medium text-gray-500 line-through">
                                  {printer.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {printer.type === 'network' ? '网络打印机' : '本地打印机'}
                                </div>
                              </div>
                            </div>
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>打印机列表会自动更新</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!selectedPrinter && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">
            未选择打印机，将使用系统默认打印机
          </p>
        </div>
      )}
    </div>
  );
};