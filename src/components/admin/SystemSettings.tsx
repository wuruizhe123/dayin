import React, { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import {
  Settings,
  RotateCcw,
  Save,
  Check,
  FileType,
  Monitor,
  Upload,
} from 'lucide-react';

const paperSizes = ['A4', 'Letter', 'Legal', 'A3', 'B4', 'B5'];

export function SystemSettings(): React.ReactElement {
  const systemConfig = useAdminStore((state) => state.systemConfig);
  const setSystemConfig = useAdminStore((state) => state.setSystemConfig);
  const resetSystemConfig = useAdminStore((state) => state.resetSystemConfig);
  const [config, setConfig] = useState(systemConfig);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    setConfig(systemConfig);
  }, [systemConfig]);

  const handleChange = (key: keyof typeof config, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSystemConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    resetSystemConfig();
    setShowResetConfirm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-white">系统设置</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            重置默认
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-blue-500" />
            <h4 className="text-sm font-semibold text-white">打印设置</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">默认纸张尺寸</label>
              <select
                value={config.defaultPaperSize}
                onChange={(e) => handleChange('defaultPaperSize', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {paperSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">默认打印份数</label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.defaultCopies}
                onChange={(e) => handleChange('defaultCopies', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-slate-400 mb-1">自动检测打印机</label>
                <p className="text-xs text-slate-500">启动时自动扫描可用打印机</p>
              </div>
              <button
                onClick={() => handleChange('autoDetectPrinters', !config.autoDetectPrinters)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  config.autoDetectPrinters ? 'bg-purple-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    config.autoDetectPrinters ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-green-500" />
            <h4 className="text-sm font-semibold text-white">文件上传设置</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">最大文件大小 (MB)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={config.maxFileSizeMB}
                onChange={(e) => handleChange('maxFileSizeMB', parseInt(e.target.value) || 50)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">主题模式</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange('theme', 'light')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    config.theme === 'light'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  浅色模式
                </button>
                <button
                  onClick={() => handleChange('theme', 'dark')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    config.theme === 'dark'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  深色模式
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <FileType className="w-5 h-5 text-cyan-500" />
            <h4 className="text-sm font-semibold text-white">支持的文件类型</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.allowedFileTypes.map((type) => (
              <span
                key={type}
                className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm rounded-lg border border-slate-600"
              >
                .{type}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm text-slate-400 mb-2">添加文件类型</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入扩展名（如 pdf）"
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all">
                添加
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
          <h4 className="text-sm font-semibold text-white mb-4">系统信息</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">应用名称</span>
              <span className="text-sm text-white">打印中心</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">版本</span>
              <span className="text-sm text-white">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">运行环境</span>
              <span className="text-sm text-white">Production</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">数据存储</span>
              <span className="text-sm text-white">LocalStorage</span>
            </div>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">确认重置</h3>
            <p className="text-slate-400 mb-6">确定要将所有设置重置为默认值吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
