import React from 'react';
import { Printer, X, CheckCircle, Download, TestTube, ChevronRight } from 'lucide-react';
import { DiscoveredPrinter } from '../../stores/adminStore';

interface PrinterConnectWizardProps {
  printer: DiscoveredPrinter;
  step: number;
  status: 'idle' | 'checking' | 'installing' | 'testing' | 'success' | 'error';
  message: string;
  progress: number;
  isDefault: boolean;
  onClose: () => void;
  onNext: () => void;
  onToggleDefault: () => void;
}

export const PrinterConnectWizard: React.FC<PrinterConnectWizardProps> = ({
  printer,
  step,
  status,
  message,
  progress,
  isDefault,
  onClose,
  onNext,
  onToggleDefault,
}) => {
  const getStepLabel = (stepNum: number) => {
    const labels = {
      1: '确认',
      2: '安装',
      3: '测试',
      4: '完成',
    };
    return labels[stepNum];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              printer.status === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <Printer className={`w-6 h-6 ${
                printer.status === 'online' ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">连接打印机</h3>
              <p className="text-sm text-slate-400">{printer.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex-1 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step > stepNum
                  ? 'bg-green-500 text-white'
                  : step === stepNum
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-xs mt-1 ${step >= stepNum ? 'text-slate-300' : 'text-slate-500'}`}>
                {getStepLabel(stepNum)}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-3">打印机信息</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">制造商</span>
                  <p className="text-white">{printer.manufacturer}</p>
                </div>
                <div>
                  <span className="text-slate-500">型号</span>
                  <p className="text-white">{printer.model}</p>
                </div>
                <div>
                  <span className="text-slate-500">连接方式</span>
                  <p className="text-white">{printer.connectionType}</p>
                </div>
                <div>
                  <span className="text-slate-500">IP地址</span>
                  <p className="text-white">{printer.address || '-'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-slate-400 mb-1">设为默认打印机</label>
                <p className="text-xs text-slate-500">打印时优先使用此打印机</p>
              </div>
              <button
                onClick={onToggleDefault}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  isDefault ? 'bg-purple-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    isDefault ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Download className={`w-10 h-10 ${
                status === 'installing' ? 'text-blue-400 animate-pulse' : 'text-slate-500'
              }`} />
              <div>
                <p className="text-white font-medium">安装打印机驱动</p>
                <p className="text-sm text-slate-400">{message}</p>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <TestTube className={`w-10 h-10 ${
                status === 'testing' ? 'text-green-400 animate-pulse' : 'text-slate-500'
              }`} />
              <div>
                <p className="text-white font-medium">测试连接</p>
                <p className="text-sm text-slate-400">{message}</p>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-4">
            {status === 'success' ? (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">连接成功！</h4>
                <p className="text-slate-400">打印机已添加到可用设备列表</p>
              </>
            ) : status === 'error' ? (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">连接失败</h4>
                <p className="text-slate-400">{message}</p>
              </>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                取消
              </button>
              <button
                onClick={onNext}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                开始连接
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          {step === 4 && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
