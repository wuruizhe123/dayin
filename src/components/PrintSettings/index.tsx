import { Settings, Maximize, Minimize, Palette, Ruler, ZoomIn } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';

const PAPER_SIZES = [
  { value: 'A4', label: 'A4' },
  { value: 'A3', label: 'A3' },
  { value: 'B4', label: 'B4' },
  { value: 'B5', label: 'B5' },
  { value: 'Letter', label: 'Letter' },
  { value: 'Legal', label: 'Legal' },
];

const MARGIN_OPTIONS = [
  { value: 'none', label: '无' },
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
];

const SCALE_OPTIONS = [
  { value: 'fit', label: '自适应' },
  { value: 'actual', label: '实际大小' },
  { value: 'custom', label: '自定义' },
];

export const PrintSettings = () => {
  const { settings, setSettings, resetSettings } = usePrintStore();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="font-display font-semibold text-lg text-gray-700">打印设置</h3>
        </div>
        <button
          onClick={resetSettings}
          className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          重置
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            纸张大小
          </label>
          <select
            value={settings.paperSize}
            onChange={(e) => setSettings({ paperSize: e.target.value as typeof settings.paperSize })}
            className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          >
            {PAPER_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            打印方向
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings({ orientation: 'portrait' })}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all
                ${settings.orientation === 'portrait' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Minimize className="w-4 h-4" />
              <span className="text-sm">纵向</span>
            </button>
            <button
              onClick={() => setSettings({ orientation: 'landscape' })}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all
                ${settings.orientation === 'landscape' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Maximize className="w-4 h-4" />
              <span className="text-sm">横向</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            打印份数
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettings({ copies: Math.max(1, settings.copies - 1) })}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={settings.copies}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setSettings({ copies: Math.max(1, Math.min(99, value)) });
              }}
              min="1"
              max="99"
              className="flex-1 px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              onClick={() => setSettings({ copies: Math.min(99, settings.copies + 1) })}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            色彩模式
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings({ colorMode: 'color' })}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all
                ${settings.colorMode === 'color' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm">彩色</span>
            </button>
            <button
              onClick={() => setSettings({ colorMode: 'grayscale' })}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all
                ${settings.colorMode === 'grayscale' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Palette className="w-4 h-4 grayscale" />
              <span className="text-sm">黑白</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            页边距
          </label>
          <div className="flex gap-2">
            {MARGIN_OPTIONS.map((margin) => (
              <button
                key={margin.value}
                onClick={() => setSettings({ margin: margin.value as typeof settings.margin })}
                className={`
                  flex-1 px-3 py-2.5 rounded-xl border text-sm transition-all
                  ${settings.margin === margin.value 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {margin.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            缩放比例
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              {SCALE_OPTIONS.map((scale) => (
                <button
                  key={scale.value}
                  onClick={() => setSettings({ scale: scale.value as typeof settings.scale })}
                  className={`
                    flex-1 px-3 py-2.5 rounded-xl border text-sm transition-all
                    ${settings.scale === scale.value 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {scale.label}
                </button>
              ))}
            </div>
            {settings.scale === 'custom' && (
              <div className="flex items-center gap-3">
                <ZoomIn className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="25"
                  max="200"
                  value={settings.customScale}
                  onChange={(e) => setSettings({ customScale: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{settings.customScale}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">预览尺寸</span>
          <span className="text-gray-700 font-medium">
            {settings.orientation === 'portrait' ? '210mm × 297mm' : '297mm × 210mm'}
          </span>
        </div>
      </div>
    </div>
  );
};