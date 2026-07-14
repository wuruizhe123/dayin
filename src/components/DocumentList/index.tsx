import { FileText, File, Image, Trash2, CheckCircle, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import { formatFileSize } from '../../utils/fileUtils';

const getIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  if (type.includes('word') || type.includes('doc')) return <File className="w-5 h-5 text-blue-500" />;
  if (type.includes('image')) return <Image className="w-5 h-5 text-green-500" />;
  return <File className="w-5 h-5 text-gray-400" />;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'uploading':
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    case 'processed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

export const DocumentList = () => {
  const { files, selectedFileId, selectedFileIds, selectFile, removeFile, toggleFileSelection, selectAllFiles, clearSelection, addToPrintQueue } = usePrintStore();

  const allSelected = files.length > 0 && selectedFileIds.length === files.length;
  const isIndeterminate = selectedFileIds.length > 0 && !allSelected;

  const handleBatchPrint = () => {
    if (selectedFileIds.length > 0) {
      addToPrintQueue(selectedFileIds);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <FileText className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">暂无上传的文档</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selectedFileIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 mb-2 animate-fadeIn">
          <span className="text-sm text-blue-700">已选择 {selectedFileIds.length} 个文档</span>
          <div className="flex gap-2">
            <button
              onClick={handleBatchPrint}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加到打印队列
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors"
            >
              取消选择
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 p-2 mb-2">
        <button
          onClick={() => allSelected ? clearSelection() : selectAllFiles()}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4" />
          ) : isIndeterminate ? (
            <Square className="w-4 h-4" style={{ backgroundColor: '#94a3b8' }} />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
        <span className="text-xs text-gray-500">全选</span>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
        {files.map((file) => {
          const isSelected = selectedFileIds.includes(file.id);
          return (
            <div
              key={file.id}
              className={`
                group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer
                ${selectedFileId === file.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : isSelected
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => selectFile(file.id)}
            >
              <button
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFileSelection(file.id);
                }}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                {getIcon(file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </span>
                  {getStatusIcon(file.status)}
                </div>
                <span className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                  {file.pageCount && ` · ${file.pageCount} 页`}
                </span>
              </div>
              
              <button
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};