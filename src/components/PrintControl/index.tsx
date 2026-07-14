import { useState } from 'react';
import { Printer, Loader2, CheckCircle, AlertCircle, Play, Layers } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import { generatePrintDocument, openPrintWindow } from '../../utils/printUtils';

export const PrintControl = () => {
  const { 
    files, 
    selectedFileId, 
    selectedFileIds,
    settings, 
    printStatus, 
    printError, 
    printQueue,
    isPrinting,
    setPrintStatus, 
    setPrintError,
    setIsPrinting,
    updateQueueItemStatus,
    setCurrentPrintIndex,
    addToPrintQueue,
    clearPrintQueue
  } = usePrintStore();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [useParseResult, setUseParseResult] = useState(false);

  const selectedFile = files.find((f) => f.id === selectedFileId);
  const pendingItems = printQueue.filter((item) => item.status === 'pending');

  const handleSinglePrint = async () => {
    if (isPrinting) return;
    if (!selectedFile) {
      setPrintError('请先选择要打印的文档');
      setPrintStatus('error');
      setTimeout(() => {
        setPrintStatus('idle');
        setPrintError(null);
      }, 3000);
      return;
    }

    setShowConfirm(false);
    setIsPrinting(true);
    setPrintStatus('preparing');

    try {
      const printFiles = [{ ...selectedFile }];
      const htmlContent = await generatePrintDocument(printFiles, settings, useParseResult);
      
      setPrintStatus('printing');
      await openPrintWindow(htmlContent);

      setPrintStatus('completed');
      setTimeout(() => {
        setPrintStatus('idle');
        setIsPrinting(false);
      }, 3000);
    } catch (error) {
      setPrintError(error instanceof Error ? error.message : '打印失败');
      setPrintStatus('error');
      setTimeout(() => {
        setPrintStatus('idle');
        setPrintError(null);
        setIsPrinting(false);
      }, 3000);
    }
  };

  const handleBatchPrint = async () => {
    if (isPrinting) return;
    if (pendingItems.length === 0) {
      setPrintError('打印队列为空，请先添加文档');
      setPrintStatus('error');
      return;
    }

    setShowConfirm(false);
    setIsPrinting(true);
    setPrintStatus('preparing');

    try {
      const queueFiles = pendingItems.map((item) => {
        const file = files.find((f) => f.id === item.fileId);
        return file;
      }).filter(Boolean) as typeof files;

      const htmlContent = await generatePrintDocument(queueFiles, settings, useParseResult);
      
      setPrintStatus('printing');
      
      for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        setCurrentPrintIndex(printQueue.findIndex((q) => q.id === item.id));
        updateQueueItemStatus(item.id, 'printing');
      }
      
      await openPrintWindow(htmlContent);
      
      pendingItems.forEach((item) => {
        updateQueueItemStatus(item.id, 'completed');
      });

      setPrintStatus('completed');
      setTimeout(() => {
        setPrintStatus('idle');
        setIsPrinting(false);
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : '批量打印失败';
      setPrintError(message);
      setPrintStatus('error');
      setIsPrinting(false);
      
      pendingItems.forEach((item) => {
        updateQueueItemStatus(item.id, 'failed', message);
      });
    }
  };

  const handleRetryPrint = () => {
    const failedItems = printQueue.filter((item) => item.status === 'failed');
    if (failedItems.length > 0) {
      failedItems.forEach((item) => {
        updateQueueItemStatus(item.id, 'pending');
      });
      setPrintError(null);
      setPrintStatus('idle');
    }
  };

  const handleAddSelectedToQueue = () => {
    if (selectedFileIds.length > 0) {
      addToPrintQueue(selectedFileIds);
      setIsBatchMode(true);
    }
  };

  const getStatusContent = () => {
    switch (printStatus) {
      case 'preparing':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在准备打印...</span>
          </div>
        );
      case 'printing':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在打印...</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>打印成功</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5" />
              <span>{printError || '批量打印失败'}</span>
            </div>
            <button
              onClick={handleRetryPrint}
              className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
            >
              重试打印
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-5">
      {printStatus !== 'idle' && (
        <div className={`
          mb-4 p-3 rounded-xl flex items-center justify-center
          ${printStatus === 'completed' ? 'bg-green-50' : ''}
          ${printStatus === 'error' ? 'bg-red-600 text-white' : ''}
          ${printStatus === 'preparing' || printStatus === 'printing' ? 'bg-blue-50' : ''}
        `}>
          {getStatusContent()}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsBatchMode(false)}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
            ${!isBatchMode
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }
          `}
        >
          <Printer className="w-4 h-4" />
          <span className="text-sm">单文档打印</span>
        </button>
        <button
          onClick={() => setIsBatchMode(true)}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
            ${isBatchMode
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }
          `}
        >
          <Layers className="w-4 h-4" />
          <span className="text-sm">批量打印</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-700 font-medium">解析保证打印</span>
        </div>
        <button
          onClick={() => setUseParseResult(!useParseResult)}
          className={`
            relative w-12 h-6 rounded-full transition-colors
            ${useParseResult ? 'bg-purple-600' : 'bg-gray-300'}
          `}
        >
          <span className={`
            absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
            ${useParseResult ? 'translate-x-7' : 'translate-x-1'}
          `}></span>
        </button>
      </div>

      {!isBatchMode ? (
        <div className="space-y-3">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!selectedFile || printStatus !== 'idle'}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${selectedFile && printStatus === 'idle'
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Printer className="w-5 h-5" />
            <span>打印 "{selectedFile?.name || '文档'}"</span>
          </button>
          
          <button
            onClick={() => window.print()}
            disabled={!selectedFile}
            className={`
              w-full px-6 py-3 rounded-xl font-medium transition-all
              ${selectedFile
                ? 'btn-secondary'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            浏览器打印
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedFileIds.length > 0 && (
            <button
              onClick={handleAddSelectedToQueue}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>将 {selectedFileIds.length} 个文档添加到队列</span>
            </button>
          )}
          
          <button
            onClick={() => setShowConfirm(true)}
            disabled={pendingItems.length === 0 || printStatus !== 'idle'}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${pendingItems.length > 0 && printStatus === 'idle'
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Play className="w-5 h-5" />
            <span>批量打印队列 ({pendingItems.length} 个文档)</span>
          </button>
          
          {printQueue.length > 0 && (
            <button
              onClick={clearPrintQueue}
              className="w-full px-6 py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              清空打印队列
            </button>
          )}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">确认打印</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              {!isBatchMode ? (
                <>
                  <p><strong>文档:</strong> {selectedFile?.name}</p>
                  <p><strong>页数:</strong> {selectedFile?.pageCount || '未知'}</p>
                </>
              ) : (
                <>
                  <p><strong>文档数量:</strong> {pendingItems.length} 个</p>
                  <p><strong>文档列表:</strong></p>
                  <ul className="max-h-32 overflow-y-auto space-y-1 mt-1">
                    {pendingItems.slice(0, 5).map((item) => (
                      <li key={item.id} className="text-gray-500">• {item.fileName}</li>
                    ))}
                    {pendingItems.length > 5 && (
                      <li className="text-gray-400">• ...还有 {pendingItems.length - 5} 个文档</li>
                    )}
                  </ul>
                </>
              )}
              <p><strong>纸张大小:</strong> {settings.paperSize}</p>
              <p><strong>方向:</strong> {settings.orientation === 'portrait' ? '纵向' : '横向'}</p>
              <p><strong>份数:</strong> {settings.copies}</p>
              <p><strong>色彩:</strong> {settings.colorMode === 'color' ? '彩色' : '黑白'}</p>
              <p><strong>边距:</strong> {settings.margin === 'none' ? '无' : settings.margin === 'small' ? '小' : settings.margin === 'medium' ? '中' : '大'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={isBatchMode ? handleBatchPrint : handleSinglePrint}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                确认打印
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};