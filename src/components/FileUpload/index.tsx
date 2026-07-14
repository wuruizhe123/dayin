import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Image, File } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import { isValidFile, generateId, readFileAsDataURL } from '../../utils/fileUtils';
import { parseDocument, validateDocument } from '../../utils/documentParser';

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFile, updateFile } = usePrintStore();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setError(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const documentInfo = validateDocument(file);
      
      if (!documentInfo.isValid) {
        setError(`不支持的文件格式: ${file.name} (${file.type})`);
        continue;
      }

      try {
        const id = generateId();
        const previewUrl = await readFileAsDataURL(file);
        
        addFile({
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          previewUrl,
          status: 'processing',
        });
        
        const parseResult = await parseDocument(file);
        
        updateFile(id, {
          status: parseResult.status === 'failed' ? 'error' : 'processed',
          pageCount: parseResult.pageCount,
          parseResult,
          error: parseResult.status === 'failed' ? parseResult.errors.join(', ') : undefined,
        });
        
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '文件处理失败';
        setError(`文件处理失败: ${file.name} - ${errorMsg}`);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          upload-zone cursor-pointer border-gray-300
          ${isDragging ? 'dragging' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className={`
          w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300
          ${isDragging ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-110' : 'bg-gray-100 text-gray-400'}
        `}>
          <Upload className="w-10 h-10" />
        </div>
        
        <h3 className={`
          text-lg font-semibold mb-2 transition-colors duration-300
          ${isDragging ? 'text-blue-600' : 'text-gray-700'}
        `}>
          {isDragging ? '释放文件以上传' : '拖放文件到此处'}
        </h3>
        
        <p className="text-gray-500 text-sm mb-4">
          或点击选择文件
        </p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <FileText className="w-4 h-4" />
          <span>PDF</span>
          <span className="text-gray-300">|</span>
          <File className="w-4 h-4" />
          <span>Word</span>
          <span className="text-gray-300">|</span>
          <Image className="w-4 h-4" />
          <span>图片</span>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fadeIn">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};