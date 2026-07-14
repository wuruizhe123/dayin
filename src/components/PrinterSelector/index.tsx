import { Printer, RefreshCw, Info } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import { usePrinterDetection } from '../../hooks/usePrinterDetection';

export const PrinterSelector = () => {
  const { printers, settings, setSettings, isDetectingPrinters } = usePrintStore();
  const { detectPrinters } = usePrinterDetection();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-700">打印机设置</h3>
        </div>
        <button
          onClick={detectPrinters}
          disabled={isDetectingPrinters}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="刷新"
        >
          <RefreshCw className={`w-4 h-4 ${isDetectingPrinters ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isDetectingPrinters ? (
        <div className="flex items-center justify-center py-4 text-gray-500">
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          <span className="text-sm">正在检测...</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Printer className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">系统默认打印机</div>
              <div className="text-xs text-gray-500">将使用浏览器默认打印机</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                由于浏览器安全限制，无法直接检测和选择打印机设备。
                实际打印机选择将在点击打印后，在浏览器弹出的打印对话框中进行。
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        type="hidden"
        value={settings.selectedPrinterId}
        onChange={(e) => setSettings({ selectedPrinterId: e.target.value })}
      />
    </div>
  );
};