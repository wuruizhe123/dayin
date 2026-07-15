import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PrintPageData {
  content: string;
  type: 'pdf' | 'image' | 'document';
}

export type FileWithParseResult = { 
  id: string; 
  name: string; 
  type: string; 
  file: File; 
  previewUrl: string;
  parseResult?: {
    success: boolean;
    status: 'success' | 'partial' | 'failed';
    extractedText: string;
    extractedHtml: string;
    pageCount: number;
    charCount: number;
    imageCount: number;
    warnings: string[];
    errors: string[];
    parseTime: number;
  };
};

export const generatePrintDocument = async (
  files: FileWithParseResult[],
  settings: {
    paperSize: string;
    orientation: string;
    colorMode: string;
    margin: string;
    scale: string;
    customScale: number;
  },
  useParseResult: boolean = false
): Promise<string> => {
  const marginValues: Record<string, string> = {
    none: '0mm',
    small: '5mm',
    medium: '10mm',
    large: '15mm',
  };

  const margin = marginValues[settings.margin] || '10mm';
  const scale = settings.scale === 'custom' ? settings.customScale / 100 : 1;

  let pagesHtml = '';

  for (const file of files) {
    if (useParseResult && file.parseResult) {
      pagesHtml += renderParseResultForPrint(file, file.parseResult, settings.colorMode);
    } else if (file.type.includes('pdf')) {
      pagesHtml += await renderPdfForPrint(file, scale);
    } else if (file.type.includes('image')) {
      pagesHtml += renderImageForPrint(file, settings.colorMode);
    } else {
      pagesHtml += renderDocumentInfoForPrint(file);
    }
  }

  const paperSizes: Record<string, { width: string; height: string }> = {
    A4: { width: '210mm', height: '297mm' },
    A3: { width: '297mm', height: '420mm' },
    B4: { width: '250mm', height: '353mm' },
    B5: { width: '176mm', height: '250mm' },
    Letter: { width: '8.5in', height: '11in' },
    Legal: { width: '8.5in', height: '14in' },
  };

  const paper = paperSizes[settings.paperSize] || paperSizes.A4;
  const contentWidth = settings.orientation === 'portrait' ? paper.width : paper.height;
  const contentHeight = settings.orientation === 'portrait' ? paper.height : paper.width;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>打印文档</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: #ffffff;
        }
        
        @page {
          size: ${settings.paperSize} ${settings.orientation};
          margin: ${margin};
        }
        
        .print-container {
          width: ${contentWidth};
          min-height: ${contentHeight};
          margin: 0 auto;
          padding: ${margin};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .print-page {
          width: 100%;
          min-height: ${contentHeight};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          page-break-after: always;
          position: relative;
          overflow: hidden;
        }
        
        .print-page:last-child {
          page-break-after: avoid;
        }
        
        .print-content-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          max-width: calc(${contentWidth} - ${margin} - ${margin});
          max-height: calc(${contentHeight} - ${margin} - ${margin});
        }
        
        .print-content {
          ${settings.scale === 'fit' ? 'max-width: 100%; max-height: 100%; object-fit: contain;' : ''}
          ${settings.scale === 'actual' ? 'width: auto; height: auto;' : ''}
          ${settings.scale === 'custom' ? `transform: scale(${scale}); transform-origin: center center;` : ''}
        }
        
        img {
          max-width: 100%;
          max-height: 100%;
          display: block;
          object-fit: contain;
          image-rendering: optimizeQuality;
          image-rendering: crisp-edges;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          ${settings.colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
        }
        
        canvas {
          display: block;
          ${settings.colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
        }
        
        .document-info {
          padding: 20mm;
          text-align: center;
          color: #333;
          width: 100%;
        }
        
        .document-info h2 {
          font-size: 18pt;
          margin-bottom: 10mm;
          color: #1a1a1a;
          word-break: break-all;
        }
        
        .document-info .meta {
          font-size: 12pt;
          line-height: 2;
          color: #666;
        }
        
        .document-info .file-icon {
          font-size: 48pt;
          margin-bottom: 10mm;
          color: #1e40af;
        }
        
        .page-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 5mm;
          font-size: 8pt;
          color: #999;
          text-align: center;
        }
        
        .page-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 5mm;
          font-size: 8pt;
          color: #999;
          text-align: center;
        }
        
        @media print {
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
          }
          
          .print-container {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
          }
          
          .print-page {
            break-inside: avoid;
            min-height: 100vh;
          }
          
          .print-content-wrapper {
            max-width: 100%;
            max-height: 100%;
          }
          
          img, canvas {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        ${pagesHtml}
      </div>
    </body>
    </html>
  `;
};

const renderPdfForPrint = async (
  file: { file: File },
  scale: number
): Promise<string> => {
  try {
    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: pdfjsLib.VerbosityLevel.ERRORS
    }).promise;
    let html = '';

    const dpr = window.devicePixelRatio || 1;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const baseScale = Math.max(scale, 3.0);
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
        
        const imgSrc = canvas.toDataURL('image/png');
        
        html += `
          <div class="print-page">
            <div class="print-content-wrapper">
              <img class="print-content" src="${imgSrc}" alt="PDF页面 ${i}" style="width: 100%; height: auto; image-rendering: optimizeQuality; print-color-adjust: exact;" />
            </div>
          </div>
        `;
      }
    }

    return html;
  } catch (error) {
    console.error('PDF渲染失败:', error);
    return renderDocumentInfoForPrint(file);
  }
};

const renderParseResultForPrint = (
  file: { name: string; type: string },
  parseResult: {
    success: boolean;
    status: 'success' | 'partial' | 'failed';
    extractedText: string;
    extractedHtml: string;
    pageCount: number;
    charCount: number;
    imageCount: number;
    warnings: string[];
    errors: string[];
    parseTime: number;
  },
  colorMode: string
): string => {
  if (parseResult.status === 'failed') {
    return `
      <div class="print-page">
        <div class="print-content-wrapper">
          <div class="document-info">
            <div class="file-icon">❌</div>
            <h2>${file.name}</h2>
            <div class="meta">
              <p>解析状态: 失败</p>
              <p>错误信息: ${parseResult.errors.join(', ') || '未知错误'}</p>
              <p>打印时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (parseResult.extractedHtml && parseResult.extractedHtml.length > 0) {
    return `
      <div class="print-page">
        <div class="print-content-wrapper">
          <div class="document-info">
            <h2>${file.name}</h2>
            <div class="meta">
              <p>解析状态: ${parseResult.status === 'success' ? '成功' : '部分解析'}</p>
              <p>字符数: ${parseResult.charCount}</p>
              <p>打印时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>
            <div style="margin-top: 20px; max-width: 100%; overflow-x: auto;">
              ${parseResult.extractedHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (parseResult.extractedText && parseResult.extractedText.length > 0) {
    return `
      <div class="print-page">
        <div class="print-content-wrapper">
          <div class="document-info">
            <h2>${file.name}</h2>
            <div class="meta">
              <p>解析状态: ${parseResult.status === 'success' ? '成功' : '部分解析'}</p>
              <p>字符数: ${parseResult.charCount}</p>
              <p>打印时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>
            <pre style="margin-top: 20px; white-space: pre-wrap; word-break: break-all; text-align: left; font-family: 'Noto Sans SC', sans-serif;">${parseResult.extractedText}</pre>
          </div>
        </div>
      </div>
    `;
  }

  return renderDocumentInfoForPrint(file);
};

const renderImageForPrint = (
  file: { name: string; previewUrl: string },
  colorMode: string
): string => {
  return `
    <div class="print-page">
      <div class="print-content-wrapper">
        <img class="print-content" src="${file.previewUrl}" alt="${file.name}" />
      </div>
    </div>
  `;
};

const renderDocumentInfoForPrint = (file: { name?: string; type?: string; file?: File; previewUrl?: string }): string => {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileName = file.name || file.file?.name || '未知文件';
  const fileType = file.type || file.file?.type || '未知类型';
  const fileSize = file.file?.size || 0;

  return `
    <div class="print-page">
      <div class="print-content-wrapper">
        <div class="document-info">
          <div class="file-icon">📄</div>
          <h2>${fileName}</h2>
          <div class="meta">
            <p>文件类型: ${fileType}</p>
            <p>文件大小: ${formatSize(fileSize)}</p>
            <p>打印时间: ${new Date().toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const openPrintWindow = (htmlContent: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      reject(new Error('无法打开打印窗口，请检查浏览器弹窗设置'));
      return;
    }

    let printed = false;
    
    const doPrint = () => {
      if (printed) return;
      printed = true;
      
      try {
        printWindow.focus();
        printWindow.print();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      doPrint();
    };

    setTimeout(() => {
      doPrint();
    }, 1000);
  });
};

export interface SilentPrintOptions {
  fileName?: string;
  downloadOnly?: boolean;
}

export const supportsSilentPrint = (): boolean => {
  return typeof (window as any).chrome?.print?.printToPDF === 'function';
};

export const downloadAsPDF = (htmlContent: string, fileName: string = 'print.pdf'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      reject(new Error('无法打开打印窗口，请检查浏览器弹窗设置'));
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    const tryDownload = () => {
      try {
        const blob = new Blob([htmlContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        printWindow.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    printWindow.onload = () => {
      tryDownload();
    };

    setTimeout(() => {
      tryDownload();
    }, 1000);
  });
};

export const silentPrintToPDF = (htmlContent: string, options: SilentPrintOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const chrome = (window as any).chrome;
    
    if (!chrome?.print?.printToPDF) {
      downloadAsPDF(htmlContent, options.fileName).then(resolve).catch(reject);
      return;
    }

    chrome.print.printToPDF(
      {
        landscape: false,
        displayHeaderFooter: false,
        printBackground: true,
        scale: 1,
      },
      (data: string | null) => {
        if (data) {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          if (options.downloadOnly) {
            const a = document.createElement('a');
            a.href = url;
            a.download = options.fileName || 'print.pdf';
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          } else {
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                printWindow.print();
                URL.revokeObjectURL(url);
                resolve();
              };
            } else {
              URL.revokeObjectURL(url);
              reject(new Error('无法打开打印预览窗口'));
            }
          }
        } else {
          downloadAsPDF(htmlContent, options.fileName).then(resolve).catch(reject);
        }
      }
    );
  });
};