import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ParseLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface QualityMetrics {
  accuracy: number;
  completeness: number;
  formatPreservation: number;
  structureIntegrity: number;
  confidenceScore: number;
}

export interface ParseResult {
  success: boolean;
  status: 'success' | 'partial' | 'failed';
  extractedText: string;
  extractedHtml: string;
  structuredData?: any[];
  pageCount: number;
  charCount: number;
  imageCount: number;
  tableCount: number;
  warnings: string[];
  errors: string[];
  logs: ParseLog[];
  parseTime: number;
  quality: QualityMetrics;
}

export interface DocumentInfo {
  fileName: string;
  fileType: string;
  fileSize: number;
  isValid: boolean;
  formatSupported: boolean;
  mimeType: string;
  extension: string;
}

export interface ParseStatistics {
  totalFiles: number;
  successCount: number;
  partialCount: number;
  failedCount: number;
  avgParseTime: number;
  avgAccuracy: number;
  totalCharCount: number;
  totalPageCount: number;
}

const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word 97-2003',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel 97-2003',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPEG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
};

const addLog = (logs: ParseLog[], level: 'info' | 'warning' | 'error', message: string, details?: string): void => {
  logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
  });
};

const calculateQualityMetrics = (
  extractedText: string,
  pageCount: number,
  imageCount: number,
  tableCount: number,
  hasTextLayer: boolean,
  warnings: string[],
  errors: string[]
): QualityMetrics => {
  const baseAccuracy = hasTextLayer ? 95 : 75;
  const textQuality = extractedText.length > 0 ? Math.min(100, (extractedText.length / 1000) * 10) + 80 : 0;
  const accuracy = Math.min(100, baseAccuracy + (textQuality - 80) * 0.5 - warnings.length * 2 - errors.length * 5);
  
  const completeness = extractedText.length > 0 ? Math.min(100, (extractedText.length / 500) + 50) : 0;
  
  const formatScore = hasTextLayer ? 90 : 60;
  const formatPreservation = Math.min(100, formatScore + (tableCount > 0 ? 10 : 0) + (imageCount > 0 ? 5 : 0));
  
  const structureIntegrity = pageCount > 0 ? Math.min(100, 80 + pageCount * 2) : 0;
  
  const confidenceScore = Math.round((accuracy + completeness + formatPreservation + structureIntegrity) / 4);

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    completeness: Math.round(completeness * 100) / 100,
    formatPreservation: Math.round(formatPreservation * 100) / 100,
    structureIntegrity: Math.round(structureIntegrity * 100) / 100,
    confidenceScore,
  };
};

let parseStatistics: ParseStatistics = {
  totalFiles: 0,
  successCount: 0,
  partialCount: 0,
  failedCount: 0,
  avgParseTime: 0,
  avgAccuracy: 0,
  totalCharCount: 0,
  totalPageCount: 0,
};

export const getParseStatistics = (): ParseStatistics => parseStatistics;

export const resetParseStatistics = (): void => {
  parseStatistics = {
    totalFiles: 0,
    successCount: 0,
    partialCount: 0,
    failedCount: 0,
    avgParseTime: 0,
    avgAccuracy: 0,
    totalCharCount: 0,
    totalPageCount: 0,
  };
};

const updateParseStatistics = (result: ParseResult, parseTime: number): void => {
  parseStatistics.totalFiles++;
  if (result.status === 'success') parseStatistics.successCount++;
  else if (result.status === 'partial') parseStatistics.partialCount++;
  else parseStatistics.failedCount++;
  
  parseStatistics.totalCharCount += result.charCount;
  parseStatistics.totalPageCount += result.pageCount;
  
  parseStatistics.avgParseTime = Math.round(
    ((parseStatistics.avgParseTime * (parseStatistics.totalFiles - 1)) + parseTime) / parseStatistics.totalFiles
  );
  
  parseStatistics.avgAccuracy = Math.round(
    ((parseStatistics.avgAccuracy * (parseStatistics.totalFiles - 1)) + result.quality.accuracy) / parseStatistics.totalFiles * 100
  ) / 100;
};

export const validateDocument = (file: File): DocumentInfo => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const formatSupported = Object.keys(SUPPORTED_MIME_TYPES).includes(file.type) || 
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
  
  return {
    fileName: file.name,
    fileType: SUPPORTED_MIME_TYPES[file.type] || getFileTypeName(extension),
    fileSize: file.size,
    isValid: file.size > 0 && formatSupported,
    formatSupported,
    mimeType: file.type,
    extension,
  };
};

const getFileTypeName = (extension: string): string => {
  const typeMap: Record<string, string> = {
    'pdf': 'PDF',
    'doc': 'Word 97-2003',
    'docx': 'Word',
    'xls': 'Excel 97-2003',
    'xlsx': 'Excel',
    'png': 'PNG',
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'gif': 'GIF',
    'webp': 'WebP',
  };
  return typeMap[extension] || '未知';
};

const extractTextFromCanvas = async (canvas: HTMLCanvasElement): Promise<string> => {
  const worker = await createWorker('chi_sim');
  try {
    const { data: { text } } = await worker.recognize(canvas);
    await worker.terminate();
    return text;
  } catch (error) {
    console.warn('OCR识别失败:', error);
    await worker.terminate().catch(() => {});
    return '';
  }
};

const optimizeImageForPrint = (
  image: HTMLImageElement,
  targetDpi: number = 300
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const currentDpi = 96;
      const scaleFactor = targetDpi / currentDpi;
      
      const originalWidth = image.naturalWidth;
      const originalHeight = image.naturalHeight;
      
      const newWidth = Math.round(originalWidth * scaleFactor);
      const newHeight = Math.round(originalHeight * scaleFactor);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, newWidth, newHeight);
      
      ctx.drawImage(image, 0, 0, newWidth, newHeight);

      const optimizedDataUrl = canvas.toDataURL('image/png');
      
      resolve(optimizedDataUrl);
    } catch (error) {
      reject(error);
    }
  });
};

export const parsePdfDocument = async (file: File): Promise<ParseResult> => {
  const logs: ParseLog[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const startTime = Date.now();
  let hasTextLayer = false;
  let tableCount = 0;

  try {
    addLog(logs, 'info', '开始解析PDF文档', `文件名: ${file.name}, 大小: ${file.size} bytes`);
    
    const arrayBuffer = await file.arrayBuffer();
    addLog(logs, 'info', '文件读取完成', `读取字节数: ${arrayBuffer.byteLength}`);

    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: pdfjsLib.VerbosityLevel.ERRORS
    }).promise;
    addLog(logs, 'info', 'PDF文档加载成功', `总页数: ${pdf.numPages}`);

    const textParts: string[] = [];
    const htmlParts: string[] = [];
    let imageCount = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
      addLog(logs, 'info', `开始解析第 ${i} 页`);
      
      const page = await pdf.getPage(i);
      
      const textContent = await page.getTextContent();
      
      let pageText = '';
      if (textContent.items.length > 0) {
        let lastY = null;
        const lines: string[] = [];
        let currentLine = '';
        
        textContent.items.forEach((item: any) => {
          if (item.str) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 3) {
              if (currentLine.trim()) {
                lines.push(currentLine.trim());
              }
              currentLine = item.str;
            } else {
              currentLine += item.str;
            }
            lastY = item.transform[5];
          }
        });
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        pageText = lines.join('\n');
        hasTextLayer = true;
      }
      
      textParts.push(pageText);

      const baseScale = 3.0;
      const dpr = window.devicePixelRatio || 1;
      const printScale = baseScale * dpr;
      
      addLog(logs, 'info', `渲染参数`, `基础倍率: ${baseScale}, 设备像素比: ${dpr}, 实际倍率: ${printScale}`);
      
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
        
        if (!hasTextLayer || pageText.length < 50) {
          addLog(logs, 'info', `第 ${i} 页文本层为空或过少，执行OCR识别`);
          const ocrText = await extractTextFromCanvas(canvas);
          if (ocrText.length > pageText.length) {
            textParts[i - 1] = ocrText;
            addLog(logs, 'info', `OCR识别完成`, `提取文本长度: ${ocrText.length} 字符`);
          }
        }
        
        const imgSrc = canvas.toDataURL('image/png');
        addLog(logs, 'info', `第 ${i} 页渲染完成`, `Canvas尺寸: ${canvas.width} x ${canvas.height}, 图片大小: ${(imgSrc.length * 0.75 / 1024).toFixed(1)} KB`);
        htmlParts.push(`<div class="pdf-page"><img src="${imgSrc}" alt="Page ${i}" style="width: 100%; height: auto; image-rendering: optimizeQuality;" /></div>`);
      }

      const pageImages = textContent.items.filter((item: any) => item.type === 'image');
      imageCount += pageImages.length;
      
      const currentTextLength = textParts[i - 1].length;
      addLog(logs, 'info', `第 ${i} 页解析完成`, `文本长度: ${currentTextLength}, 图片数: ${pageImages.length}`);
    }

    const extractedText = textParts.join('\n\n');
    const extractedHtml = htmlParts.join('\n');
    const parseTime = Date.now() - startTime;

    if (extractedText.length === 0) {
      addLog(logs, 'warning', '未提取到文本内容', '文档可能是扫描件或图片型PDF');
      warnings.push('未提取到文本内容，文档可能是扫描件');
    } else if (!hasTextLayer) {
      addLog(logs, 'info', '文本内容通过OCR识别提取', '原始PDF无文本层');
    }

    const quality = calculateQualityMetrics(extractedText, pdf.numPages, imageCount, tableCount, hasTextLayer, warnings, errors);

    addLog(logs, 'info', 'PDF解析完成', `总字符数: ${extractedText.length}, 总页数: ${pdf.numPages}, 耗时: ${parseTime}ms, 置信度: ${quality.confidenceScore}`);

    const result: ParseResult = {
      success: true,
      status: extractedText.length > 0 ? 'success' : 'partial',
      extractedText,
      extractedHtml,
      pageCount: pdf.numPages,
      charCount: extractedText.length,
      imageCount,
      tableCount,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(result, parseTime);
    return result;

  } catch (error) {
    const parseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    addLog(logs, 'error', 'PDF解析失败', errorMessage);
    errors.push(errorMessage);

    const quality = calculateQualityMetrics('', 0, 0, 0, false, warnings, errors);

    const result: ParseResult = {
      success: false,
      status: 'failed',
      extractedText: '',
      extractedHtml: '',
      pageCount: 0,
      charCount: 0,
      imageCount: 0,
      tableCount: 0,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(result, parseTime);
    return result;
  }
};

export const parseWordDocument = async (file: File): Promise<ParseResult> => {
  const logs: ParseLog[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const startTime = Date.now();
  let tableCount = 0;

  try {
    addLog(logs, 'info', '开始解析Word文档', `文件名: ${file.name}, 大小: ${file.size} bytes`);
    
    const arrayBuffer = await file.arrayBuffer();
    addLog(logs, 'info', '文件读取完成', `读取字节数: ${arrayBuffer.byteLength}`);

    const textResult = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = (textResult as unknown as { value: string }).value;
    addLog(logs, 'info', 'Word文档解析完成', `提取文本长度: ${extractedText.length} 字符`);

    const messages = (textResult as unknown as { messages: any[] }).messages || [];
    if (messages.length > 0) {
      messages.forEach((msg: any) => {
        addLog(logs, 'warning', 'Word解析警告', msg.message);
        warnings.push(msg.message);
      });
    }

    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const extractedHtml = (htmlResult as unknown as { value: string }).value;
    addLog(logs, 'info', 'HTML转换完成', `HTML长度: ${extractedHtml.length}`);

    const tableMatches = extractedHtml.match(/<table[^>]*>/gi);
    tableCount = tableMatches ? tableMatches.length : 0;

    const parseTime = Date.now() - startTime;

    const quality = calculateQualityMetrics(extractedText, 1, 0, tableCount, true, warnings, errors);

    addLog(logs, 'info', 'Word解析完成', `总字符数: ${extractedText.length}, 表格数: ${tableCount}, 耗时: ${parseTime}ms, 置信度: ${quality.confidenceScore}`);

    const parseResult: ParseResult = {
      success: true,
      status: extractedText.length > 0 ? 'success' : 'partial',
      extractedText,
      extractedHtml,
      pageCount: 1,
      charCount: extractedText.length,
      imageCount: 0,
      tableCount,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(parseResult, parseTime);
    return parseResult;

  } catch (error) {
    const parseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    addLog(logs, 'error', 'Word解析失败', errorMessage);
    errors.push(errorMessage);

    const quality = calculateQualityMetrics('', 0, 0, 0, false, warnings, errors);

    const result: ParseResult = {
      success: false,
      status: 'failed',
      extractedText: '',
      extractedHtml: '',
      pageCount: 0,
      charCount: 0,
      imageCount: 0,
      tableCount: 0,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(result, parseTime);
    return result;
  }
};

export const parseExcelDocument = async (file: File): Promise<ParseResult> => {
  const logs: ParseLog[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const startTime = Date.now();

  try {
    addLog(logs, 'info', '开始解析Excel文档', `文件名: ${file.name}, 大小: ${file.size} bytes`);
    
    const arrayBuffer = await file.arrayBuffer();
    addLog(logs, 'info', '文件读取完成', `读取字节数: ${arrayBuffer.byteLength}`);

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    addLog(logs, 'info', 'Excel工作簿加载成功', `工作表数: ${workbook.SheetNames.length}`);

    const textParts: string[] = [];
    const htmlParts: string[] = [];
    const structuredData: any[] = [];
    let tableCount = workbook.SheetNames.length;

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      textParts.push(`=== ${sheetName} ===\n${csv}`);
      structuredData.push({ sheetName, data: json });

      const html = XLSX.utils.sheet_to_html(worksheet);
      htmlParts.push(`<div class="excel-sheet"><h3>${sheetName}</h3>${html}</div>`);
      
      addLog(logs, 'info', `工作表解析完成`, `表名: ${sheetName}, 行数: ${json.length}`);
    });

    const extractedText = textParts.join('\n\n');
    const extractedHtml = htmlParts.join('\n');
    const parseTime = Date.now() - startTime;

    const quality = calculateQualityMetrics(extractedText, workbook.SheetNames.length, 0, tableCount, true, warnings, errors);

    addLog(logs, 'info', 'Excel解析完成', `总字符数: ${extractedText.length}, 工作表数: ${tableCount}, 耗时: ${parseTime}ms, 置信度: ${quality.confidenceScore}`);

    const result: ParseResult = {
      success: true,
      status: 'success',
      extractedText,
      extractedHtml,
      structuredData,
      pageCount: workbook.SheetNames.length,
      charCount: extractedText.length,
      imageCount: 0,
      tableCount,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(result, parseTime);
    return result;

  } catch (error) {
    const parseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    addLog(logs, 'error', 'Excel解析失败', errorMessage);
    errors.push(errorMessage);

    const quality = calculateQualityMetrics('', 0, 0, 0, false, warnings, errors);

    const result: ParseResult = {
      success: false,
      status: 'failed',
      extractedText: '',
      extractedHtml: '',
      pageCount: 0,
      charCount: 0,
      imageCount: 0,
      tableCount: 0,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(result, parseTime);
    return result;
  }
};

export const parseImageDocument = async (file: File): Promise<ParseResult> => {
  const logs: ParseLog[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const startTime = Date.now();

  try {
    addLog(logs, 'info', '开始解析图片文档', `文件名: ${file.name}, 大小: ${file.size} bytes`);
    
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });
    
    addLog(logs, 'info', '图片读取完成', `原始数据URL长度: ${dataUrl.length}`);

    const image = new Image();
    image.src = dataUrl;
    await new Promise((resolve, reject) => {
      image.onload = () => resolve(null);
      image.onerror = () => reject(new Error('图片加载失败'));
    });
    
    addLog(logs, 'info', '图片加载完成', `原始尺寸: ${image.naturalWidth} x ${image.naturalHeight}`);

    addLog(logs, 'info', '开始OCR文本识别', '使用Tesseract.js识别图片中的中文文本');
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(image, 0, 0);
    }
    const extractedText = await extractTextFromCanvas(canvas);
    addLog(logs, 'info', 'OCR文本识别完成', `提取文本长度: ${extractedText.length} 字符`);

    const optimizedDataUrl = await optimizeImageForPrint(image, 300);
    
    addLog(logs, 'info', '图片优化完成', `优化后数据URL长度: ${optimizedDataUrl.length}`);

    const parseTime = Date.now() - startTime;

    const quality = calculateQualityMetrics(extractedText, 1, 1, 0, false, warnings, errors);

    addLog(logs, 'info', '图片解析完成', `总字符数: ${extractedText.length}, 耗时: ${parseTime}ms, 置信度: ${quality.confidenceScore}`);

    const result: ParseResult = {
      success: true,
      status: extractedText.length > 0 ? 'success' : 'partial',
      extractedText,
      extractedHtml: `<img src="${optimizedDataUrl}" alt="${file.name}" />`,
      pageCount: 1,
      charCount: extractedText.length,
      imageCount: 1,
      tableCount: 0,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(result, parseTime);
    return result;

  } catch (error) {
    const parseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    addLog(logs, 'error', '图片解析失败', errorMessage);
    errors.push(errorMessage);

    const quality = calculateQualityMetrics('', 0, 0, 0, false, warnings, errors);

    const result: ParseResult = {
      success: false,
      status: 'failed',
      extractedText: '',
      extractedHtml: '',
      pageCount: 0,
      charCount: 0,
      imageCount: 0,
      tableCount: 0,
      warnings,
      errors,
      logs,
      parseTime,
      quality,
    };

    updateParseStatistics(result, parseTime);
    return result;
  }
};

export const parseDocument = async (file: File): Promise<ParseResult> => {
  const info = validateDocument(file);
  
  if (!info.isValid) {
    const result: ParseResult = {
      success: false,
      status: 'failed',
      extractedText: '',
      extractedHtml: '',
      pageCount: 0,
      charCount: 0,
      imageCount: 0,
      tableCount: 0,
      warnings: [],
      errors: [`不支持的文件格式: ${info.fileType}`],
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        message: '文件格式验证失败',
        details: `格式: ${info.fileType}, MIME类型: ${info.mimeType}`
      }],
      parseTime: 0,
      quality: {
        accuracy: 0,
        completeness: 0,
        formatPreservation: 0,
        structureIntegrity: 0,
        confidenceScore: 0,
      },
    };
    updateParseStatistics(result, 0);
    return result;
  }

  const extension = info.extension.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return parsePdfDocument(file);
    case 'doc':
    case 'docx':
      return parseWordDocument(file);
    case 'xls':
    case 'xlsx':
      return parseExcelDocument(file);
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return parseImageDocument(file);
    default:
      const result: ParseResult = {
        success: false,
        status: 'failed',
        extractedText: '',
        extractedHtml: '',
        pageCount: 0,
        charCount: 0,
        imageCount: 0,
        tableCount: 0,
        warnings: [],
        errors: [`不支持的文件格式: ${extension}`],
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'error',
          message: '文件格式不支持',
          details: `扩展名: ${extension}`
        }],
        parseTime: 0,
        quality: {
          accuracy: 0,
          completeness: 0,
          formatPreservation: 0,
          structureIntegrity: 0,
          confidenceScore: 0,
        },
      };
      updateParseStatistics(result, 0);
      return result;
  }
};

export const getParseStatusText = (status: ParseResult['status']): string => {
  switch (status) {
    case 'success':
      return '解析成功';
    case 'partial':
      return '部分解析';
    case 'failed':
      return '解析失败';
    default:
      return '未知';
  }
};

export const getParseStatusColor = (status: ParseResult['status']): string => {
  switch (status) {
    case 'success':
      return 'text-green-600';
    case 'partial':
      return 'text-yellow-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const formatParseTime = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = (ms % 60000) / 1000;
    return `${minutes}m ${seconds.toFixed(1)}s`;
  }
};

export const formatCharCount = (count: number): string => {
  if (count < 1000) {
    return `${count} 字符`;
  } else if (count < 10000) {
    return `${(count / 1000).toFixed(1)}k 字符`;
  } else {
    return `${(count / 10000).toFixed(1)}万 字符`;
  }
};