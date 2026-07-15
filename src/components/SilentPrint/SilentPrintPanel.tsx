import { useState } from 'react';
import { Printer, FileText, Download, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import { supportsSilentPrint, silentPrintToPDF, downloadAsPDF, generatePrintDocument } from '../../utils/printUtils';

interface SilentPrintPanelProps {
  files: { id: string; name: string; type: string; file: File; previewUrl: string; parseResult?: any }[];
  useParseResult?: boolean;
  onPrintComplete?: () => void;
  onPrintError?: (error: string) => void;
}

export const SilentPrintPanel = ({ files, useParseResult = false, onPrintComplete, onPrintError }: SilentPrintPanelProps) => {
  const { settings } = usePrintStore();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMode, setPrintMode] = useState<'silent' | 'download' | 'preview'>('silent');
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const canSilentPrint = supportsSilentPrint();

  const handleSilentPrint = async () => {
    if (isPrinting || files.length === 0) return;
    
    setIsPrinting(true);
    
    try {
      const htmlContent = await generatePrintDocument(files, settings, useParseResult);
      
      if (printMode === 'silent') {
        await silentPrintToPDF(htmlContent, { fileName: files[0].name.replace(/\.[^/.]+$/, '') + '.pdf' });
      } else if (printMode === 'download') {
        await downloadAsPDF(htmlContent, files[0].name.replace(/\.[^/.]+$/, '') + '.pdf');
      } else if (printMode === 'preview') {
        setPreviewContent(htmlContent);
        setShowPreview(true);
        setIsPrinting(false);
        return;
      }
      
      if (onPrintComplete) {
        onPrintComplete();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '打印失败';
      if (onPrintError) {
        onPrintError(errorMessage);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePreviewPrint = () => {
    setShowPreview(false);
    printMode === 'silent' ? handleSilentPrint() : handleSilentPrint();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Printer className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-700">静默打印模式</h3>
      </div>

      {!canSilentPrint && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">
              当前浏览器不支持静默打印，将自动降级为PDF下载模式。
              建议使用 Google Chrome 浏览器以获得最佳体验。
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="radio"
            name="printMode"
            value="silent"
            checked={printMode === 'silent'}
            onChange={() => setPrintMode('silent')}
            disabled={!canSilentPrint}
            className="w-4 h-4 text-purple-600"
          />
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">静默打印</div>
              <div className="text-xs text-gray-500">直接发送到打印机，不弹出对话框</div>
            </div>
          </div>
          {canSilentPrint && (
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          )}
        </label>

        <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="radio"
            name="printMode"
            value="download"
            checked={printMode === 'download'}
            onChange={() => setPrintMode('download')}
            className="w-4 h-4 text-purple-600"
          />
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">下载PDF</div>
              <div className="text-xs text-gray-500">生成PDF文件并下载到本地</div>
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="radio"
            name="printMode"
            value="preview"
            checked={printMode === 'preview'}
            onChange={() => setPrintMode('preview')}
            className="w-4 h-4 text-purple-600"
          />
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">预览后打印</div>
              <div className="text-xs text-gray-500">先预览文档，再选择打印方式</div>
            </div>
          </div>
        </label>
      </div>

      <button
        onClick={handleSilentPrint}
        disabled={isPrinting || files.length === 0}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
          ${isPrinting || files.length === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25'
          }
        `}
      >
        {isPrinting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>处理中...</span>
          </>
        ) : (
          <>
            {printMode === 'download' ? <Download className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            <span>
              {printMode === 'silent' ? '静默打印' : printMode === 'download' ? '下载PDF' : '预览文档'}
            </span>
          </>
        )}
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">打印预览</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviewPrint}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Printer className="w-4 h-4" />
                  <span>打印</span>
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                srcDoc={previewContent}
                title="打印预览"
                className="w-full h-full min-h-[500px] border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};