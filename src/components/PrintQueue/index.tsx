import { ListOrdered, Play, Pause, Trash2, ArrowUp, ArrowDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';

export const PrintQueue = () => {
  const { printQueue, removeFromPrintQueue, reorderQueue, clearPrintQueue, updateQueueItemStatus, setCurrentPrintIndex, printStatus, currentPrintIndex } = usePrintStore();

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < printQueue.length - 1) {
      reorderQueue(index, index + 1);
    }
  };

  const handleRetry = (id: string) => {
    updateQueueItemStatus(id, 'pending');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <div className="w-3 h-3 rounded-full bg-yellow-400" />;
      case 'printing':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待打印';
      case 'printing':
        return '正在打印';
      case 'completed':
        return '已完成';
      case 'failed':
        return '打印失败';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'printing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (printQueue.length === 0) {
    return null;
  }

  return (
    <div className="card p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-blue-600" />
          <h3 className="font-display font-semibold text-lg text-gray-700">打印队列</h3>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
            {printQueue.length}
          </span>
        </div>
        <button
          onClick={clearPrintQueue}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="清空队列"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
        {printQueue.map((item, index) => (
          <div
            key={item.id}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
              ${index === currentPrintIndex && item.status === 'printing'
                ? 'border-blue-400 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-gray-50'
              }
            `}
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-xs font-medium text-gray-600">
              {index + 1}
            </div>
            
            <div className="flex-shrink-0">
              {getStatusIcon(item.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 truncate">
                {item.fileName}
              </div>
              <div className={`text-xs ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
                {item.error && ` · ${item.error}`}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="上移"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === printQueue.length - 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="下移"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              {item.status === 'failed' && (
                <button
                  onClick={() => handleRetry(item.id)}
                  className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="重试"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => removeFromPrintQueue(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-colors"
                title="移除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-500">
              待打印: <span className="font-medium text-yellow-600">{printQueue.filter((i) => i.status === 'pending').length}</span>
            </span>
            <span className="text-gray-500">
              进行中: <span className="font-medium text-blue-600">{printQueue.filter((i) => i.status === 'printing').length}</span>
            </span>
            <span className="text-gray-500">
              已完成: <span className="font-medium text-green-600">{printQueue.filter((i) => i.status === 'completed').length}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};