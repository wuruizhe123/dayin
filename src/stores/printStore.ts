import { create } from 'zustand';

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

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'processing' | 'processed' | 'error';
  error?: string;
  pageCount?: number;
  parseResult?: ParseResult;
}

export interface Printer {
  id: string;
  name: string;
  type: 'local' | 'network';
  isDefault: boolean;
  status: 'online' | 'offline';
}

export interface PrintSettings {
  paperSize: 'A4' | 'Letter' | 'Legal' | 'A3' | 'B4' | 'B5';
  orientation: 'portrait' | 'landscape';
  copies: number;
  colorMode: 'color' | 'grayscale';
  selectedPrinterId: string;
  margin: 'none' | 'small' | 'medium' | 'large';
  scale: 'fit' | 'actual' | 'custom';
  customScale: number;
}

export interface PrintQueueItem {
  id: string;
  fileId: string;
  fileName: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  priority: number;
  error?: string;
}

interface PrintStore {
  files: UploadedFile[];
  printers: Printer[];
  settings: PrintSettings;
  selectedFileId: string | null;
  selectedFileIds: string[];
  isDetectingPrinters: boolean;
  printStatus: 'idle' | 'preparing' | 'printing' | 'completed' | 'error';
  printError: string | null;
  printQueue: PrintQueueItem[];
  currentPrintIndex: number;
  selectedFile: UploadedFile | null;
  isPrinting: boolean;

  addFile: (file: UploadedFile) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<UploadedFile>) => void;
  selectFile: (id: string | null) => void;
  toggleFileSelection: (id: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;

  setPrinters: (printers: Printer[]) => void;
  setIsDetectingPrinters: (isDetecting: boolean) => void;

  setSettings: (settings: Partial<PrintSettings>) => void;
  resetSettings: () => void;

  setPrintStatus: (status: PrintStore['printStatus']) => void;
  setPrintError: (error: string | null) => void;
  setIsPrinting: (isPrinting: boolean) => void;

  addToPrintQueue: (fileIds: string[]) => void;
  removeFromPrintQueue: (id: string) => void;
  updateQueueItemStatus: (id: string, status: PrintQueueItem['status'], error?: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearPrintQueue: () => void;
  setCurrentPrintIndex: (index: number) => void;
}

export const usePrintStore = create<PrintStore>((set) => ({
  files: [],
  printers: [],
  settings: {
    paperSize: 'A4',
    orientation: 'portrait',
    copies: 1,
    colorMode: 'color',
    selectedPrinterId: '',
    margin: 'medium',
    scale: 'fit',
    customScale: 100,
  },
  selectedFileId: null,
  selectedFileIds: [],
  isDetectingPrinters: false,
  printStatus: 'idle',
  printError: null,
  printQueue: [],
  currentPrintIndex: 0,
  selectedFile: null,
  isPrinting: false,

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (id) => set((state) => ({
    files: state.files.filter((f) => f.id !== id),
    selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
    selectedFile: state.selectedFile?.id === id ? null : state.selectedFile,
    selectedFileIds: state.selectedFileIds.filter((fid) => fid !== id),
    printQueue: state.printQueue.filter((item) => item.fileId !== id),
  })),
  updateFile: (id, updates) => set((state) => ({
    files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    selectedFile: state.selectedFile?.id === id ? { ...state.selectedFile, ...updates } : state.selectedFile,
  })),
  selectFile: (id) => set((state) => ({
    selectedFileId: id,
    selectedFile: id ? state.files.find((f) => f.id === id) || null : null,
  })),
  toggleFileSelection: (id) => set((state) => ({
    selectedFileIds: state.selectedFileIds.includes(id)
      ? state.selectedFileIds.filter((fid) => fid !== id)
      : [...state.selectedFileIds, id],
  })),
  selectAllFiles: () => set((state) => ({
    selectedFileIds: state.files.map((f) => f.id),
  })),
  clearSelection: () => set({ selectedFileIds: [] }),

  setPrinters: (printers) => set({ printers }),
  setIsDetectingPrinters: (isDetecting) => set({ isDetectingPrinters: isDetecting }),

  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  resetSettings: () => set({
    settings: {
      paperSize: 'A4',
      orientation: 'portrait',
      copies: 1,
      colorMode: 'color',
      selectedPrinterId: '',
      margin: 'medium',
      scale: 'fit',
      customScale: 100,
    },
  }),

  setPrintStatus: (status) => set({ printStatus: status }),
  setPrintError: (error) => set({ printError: error }),
  setIsPrinting: (isPrinting) => set({ isPrinting }),

  addToPrintQueue: (fileIds) => set((state) => {
    const newItems: PrintQueueItem[] = fileIds
      .filter((id) => !state.printQueue.some((item) => item.fileId === id))
      .map((fileId) => {
        const file = state.files.find((f) => f.id === fileId);
        return {
          id: Math.random().toString(36).substring(2, 15),
          fileId,
          fileName: file?.name || '未知文件',
          status: 'pending',
          priority: state.printQueue.length + 1,
        };
      });
    return { printQueue: [...state.printQueue, ...newItems] };
  }),
  removeFromPrintQueue: (id) => set((state) => ({
    printQueue: state.printQueue.filter((item) => item.id !== id),
  })),
  updateQueueItemStatus: (id, status, error) => set((state) => ({
    printQueue: state.printQueue.map((item) =>
      item.id === id ? { ...item, status, error } : item
    ),
  })),
  reorderQueue: (fromIndex, toIndex) => set((state) => {
    const queue = [...state.printQueue];
    const [removed] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, removed);
    return { printQueue: queue.map((item, index) => ({ ...item, priority: index + 1 })) };
  }),
  clearPrintQueue: () => set({ printQueue: [], currentPrintIndex: 0 }),
  setCurrentPrintIndex: (index) => set({ currentPrintIndex: index }),
}));