import { useState, useEffect, useRef } from 'react';
import { FileText, Image, File, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const DocumentPreview = () => {
  const { files, selectedFileId, settings } = usePrintStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const selectedFile = files.find((f) => f.id === selectedFileId);

  useEffect(() => {
    if (selectedFile && selectedFile.type.includes('pdf')) {
      loadPdf(selectedFile);
    } else {
      setPdfPages([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [selectedFile]);

  useEffect(() => {
    setZoom(1);
    setCurrentPage(1);
  }, [selectedFileId]);

  useEffect(() => {
    if (canvasContainerRef.current) {
      const updateSize = () => {
        if (canvasContainerRef.current) {
          const rect = canvasContainerRef.current.getBoundingClientRect();
          setContainerSize({ width: rect.width, height: rect.height });
        }
      };

      updateSize();
      window.addEventListener('resize', updateSize);

      resizeObserverRef.current = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserverRef.current.observe(canvasContainerRef.current);

      return () => {
        window.removeEventListener('resize', updateSize);
        resizeObserverRef.current?.disconnect();
      };
    }
  }, []);

  const loadPdf = async (file: typeof selectedFile) => {
    if (!file) return;
    
    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: pdfjsLib.VerbosityLevel.ERRORS
      }).promise;
      
      setTotalPages(pdf.numPages);
      const pages: HTMLCanvasElement[] = [];
      const dpr = window.devicePixelRatio || 1;
      const baseScale = 2.0;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: baseScale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = viewport.width * dpr;
          canvas.height = viewport.height * dpr;
          
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          
          context.scale(dpr, dpr);
          
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';
          
          await page.render({
            canvas,
            canvasContext: context,
            viewport,
            intent: 'print',
          }).promise;
          pages.push(canvas);
        }
      }
      
      setPdfPages(pages);
    } catch (error) {
      console.error('PDF加载失败:', error);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const calculateFitScale = (contentWidth: number, contentHeight: number): number => {
    const padding = 32;
    const availableWidth = containerSize.width - padding;
    const availableHeight = containerSize.height - padding;
    
    const widthScale = availableWidth / contentWidth;
    const heightScale = availableHeight / contentHeight;
    
    return Math.min(widthScale, heightScale, 1);
  };

  if (!selectedFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">请选择要预览的文档</p>
        <p className="text-sm mt-1">从左侧列表中选择一个文件</p>
      </div>
    );
  }

  const isPdf = selectedFile.type.includes('pdf');
  const isImage = selectedFile.type.includes('image');
  const isWord = selectedFile.type.includes('word') || selectedFile.type.includes('doc');
  const isExcel = selectedFile.type.includes('excel') || selectedFile.type.includes('spreadsheet');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          {isPdf && <FileText className="w-5 h-5 text-red-500" />}
          {isImage && <Image className="w-5 h-5 text-green-500" />}
          {isWord && <File className="w-5 h-5 text-blue-500" />}
          {isExcel && <File className="w-5 h-5 text-green-600" />}
          <span className="font-medium text-gray-700 truncate max-w-xs">
            {selectedFile.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="重置缩放"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={canvasContainerRef}
        className="flex-1 overflow-auto bg-gray-100"
      >
        <div className="min-h-full w-full flex items-center justify-center p-4">
          {isPdf && pdfPages.length > 0 && (
            <div 
              className="flex flex-col items-center"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                maxWidth: `${containerSize.width / zoom}px`,
                maxHeight: `${containerSize.height / zoom}px`,
              }}
            >
              {pdfPages.slice(currentPage - 1, currentPage).map((canvas, index) => {
                const fitScale = calculateFitScale(canvas.width, canvas.height);
                const displayWidth = canvas.width * fitScale;
                const displayHeight = canvas.height * fitScale;
                
                return (
                  <div 
                    key={index}
                    className="bg-white shadow-lg rounded-lg overflow-hidden"
                    style={{
                      width: displayWidth,
                      height: displayHeight,
                    }}
                  >
                    <img 
                      src={canvas.toDataURL()} 
                      alt={`第 ${currentPage} 页`}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: 'crisp-edges',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {isImage && (
            <div 
              className="flex justify-center items-center"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                maxWidth: `${containerSize.width / zoom}px`,
                maxHeight: `${containerSize.height / zoom}px`,
              }}
            >
              <img
                src={selectedFile.previewUrl}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain bg-white shadow-lg rounded-lg"
                style={{
                imageRendering: 'crisp-edges',
              }}
              />
            </div>
          )}

          {isWord && (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8 max-w-md">
              <File className="w-20 h-20 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {selectedFile.name}
              </h3>
              <p className="text-gray-500 text-sm">
                Word 文档预览
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full">
                <p className="text-sm text-gray-600">
                  文件大小: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  格式: {selectedFile.type}
                </p>
                {selectedFile.parseResult && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      解析字符数: {selectedFile.parseResult.charCount} 字符
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      解析状态: <span className={selectedFile.parseResult.status === 'success' ? 'text-green-600' : selectedFile.parseResult.status === 'partial' ? 'text-yellow-600' : 'text-red-600'}>
                        {selectedFile.parseResult.status === 'success' ? '成功' : selectedFile.parseResult.status === 'partial' ? '部分解析' : '失败'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isExcel && (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8 max-w-md">
              <File className="w-20 h-20 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {selectedFile.name}
              </h3>
              <p className="text-gray-500 text-sm">
                Excel 文档预览
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full">
                <p className="text-sm text-gray-600">
                  文件大小: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  格式: {selectedFile.type}
                </p>
                {selectedFile.parseResult && selectedFile.parseResult.structuredData && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      工作表数: {selectedFile.parseResult.structuredData.length} 个
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      总数据行数: {selectedFile.parseResult.structuredData.reduce((sum, sheet) => sum + (sheet.data?.length || 0), 0)} 行
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isPdf && pdfPages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};