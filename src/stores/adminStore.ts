import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Printer } from './printStore';

export interface PrintHistoryRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  printerName: string;
  copies: number;
  paperSize: string;
  status: 'completed' | 'failed';
  error?: string;
  timestamp: string;
  duration: number;
}

export interface SystemConfig {
  defaultPaperSize: string;
  defaultCopies: number;
  autoDetectPrinters: boolean;
  maxFileSizeMB: number;
  allowedFileTypes: string[];
  theme: 'light' | 'dark';
}

export interface AdminPrinter extends Printer {
  location?: string;
  lastUsed?: string;
  totalPrints?: number;
  avgPrintTime?: number;
}

export interface DiscoveredPrinter {
  id: string;
  name: string;
  model: string;
  type: 'local' | 'network';
  address?: string;
  status: 'online' | 'offline';
  connectionType: string;
  manufacturer: string;
  lastSeen: string;
}

export interface DiscoveryConfig {
  autoStart: boolean;
  intervalMs: number;
  scanDelayMs: number;
  soundEnabled: boolean;
}

export interface DiscoveryStatus {
  isRunning: boolean;
  lastScanTime: string | null;
  nextScanTime: string | null;
  error: string | null;
  consecutiveFailures: number;
}

export interface PrinterChange {
  type: 'added' | 'removed' | 'status_changed';
  printer: DiscoveredPrinter;
  previousStatus?: string;
}

interface AdminStore {
  isAuthenticated: boolean;
  authToken: string | null;
  printHistory: PrintHistoryRecord[];
  systemConfig: SystemConfig;
  printers: AdminPrinter[];
  discoveredPrinters: DiscoveredPrinter[];
  discoveryConfig: DiscoveryConfig;
  discoveryStatus: DiscoveryStatus;
  recentChanges: PrinterChange[];
  hashedPassword: string | null;

  login: (password: string) => boolean;
  logout: () => void;
  setAuthToken: (token: string | null) => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
  verifyPassword: (password: string) => boolean;

  addPrintRecord: (record: PrintHistoryRecord) => void;
  clearPrintHistory: () => void;

  setSystemConfig: (config: Partial<SystemConfig>) => void;
  resetSystemConfig: () => void;

  setPrinters: (printers: AdminPrinter[]) => void;
  updatePrinter: (id: string, updates: Partial<AdminPrinter>) => void;
  removePrinter: (id: string) => void;

  setDiscoveredPrinters: (printers: DiscoveredPrinter[]) => void;
  setDiscoveryConfig: (config: Partial<DiscoveryConfig>) => void;
  setDiscoveryStatus: (status: DiscoveryStatus | ((prev: DiscoveryStatus) => DiscoveryStatus)) => void;
  setRecentChanges: (changes: PrinterChange[] | ((prev: PrinterChange[]) => PrinterChange[])) => void;
}

const DEFAULT_PASSWORD = 'admin';
const DEFAULT_HASH = 'sha256$admin$d033e22ae348aeb5660fc2140aec35850c4da997';

const defaultSystemConfig: SystemConfig = {
  defaultPaperSize: 'A4',
  defaultCopies: 1,
  autoDetectPrinters: true,
  maxFileSizeMB: 50,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'],
  theme: 'light',
};

const defaultDiscoveryConfig: DiscoveryConfig = {
  autoStart: true,
  intervalMs: 30000,
  scanDelayMs: 1500,
  soundEnabled: true,
};

const defaultDiscoveryStatus: DiscoveryStatus = {
  isRunning: false,
  lastScanTime: null,
  nextScanTime: null,
  error: null,
  consecutiveFailures: 0,
};

const hashPassword = (password: string, salt?: string): string => {
  const actualSalt = salt || Math.random().toString(36).substring(2, 15);
  const hash = password + actualSalt;
  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result = ((result << 5) - result) + hash.charCodeAt(i);
    result = result & result;
  }
  return `sha256$${actualSalt}$${Math.abs(result).toString(16)}`;
};

const verifyHash = (password: string, hashedPassword: string): boolean => {
  const parts = hashedPassword.split('$');
  if (parts.length !== 3) return false;
  const [, salt, expectedHash] = parts;
  const computedHash = hashPassword(password, salt);
  return computedHash === hashedPassword;
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      authToken: null,
      printHistory: [],
      systemConfig: defaultSystemConfig,
      printers: [],
      discoveredPrinters: [],
      discoveryConfig: defaultDiscoveryConfig,
      discoveryStatus: defaultDiscoveryStatus,
      recentChanges: [],
      hashedPassword: DEFAULT_HASH,

      login: (password) => {
        const { hashedPassword } = get();
        const isValid = verifyHash(password, hashedPassword || DEFAULT_HASH);
        if (isValid) {
          set({ isAuthenticated: true, authToken: 'admin-token-' + Date.now() });
          return true;
        }
        return false;
      },

      verifyPassword: (password) => {
        const { hashedPassword } = get();
        return verifyHash(password, hashedPassword || DEFAULT_HASH);
      },

      changePassword: (currentPassword, newPassword) => {
        const { hashedPassword, logout } = get();
        
        if (!verifyHash(currentPassword, hashedPassword || DEFAULT_HASH)) {
          return { success: false, error: '当前密码不正确' };
        }
        
        if (newPassword.length < 6) {
          return { success: false, error: '密码长度至少为6位' };
        }
        
        if (newPassword.length > 50) {
          return { success: false, error: '密码长度不能超过50位' };
        }
        
        const newHash = hashPassword(newPassword);
        set({ hashedPassword: newHash });
        logout();
        
        return { success: true };
      },

      logout: () => set({ isAuthenticated: false, authToken: null }),

      setAuthToken: (token) => set({ authToken: token, isAuthenticated: !!token }),

      addPrintRecord: (record) => set((state) => ({
        printHistory: [record, ...state.printHistory],
      })),

      clearPrintHistory: () => set({ printHistory: [] }),

      setSystemConfig: (config) => set((state) => ({
        systemConfig: { ...state.systemConfig, ...config },
      })),

      resetSystemConfig: () => set({ systemConfig: defaultSystemConfig }),

      setPrinters: (printers) => set({ printers }),

      updatePrinter: (id, updates) => set((state) => ({
        printers: state.printers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),

      removePrinter: (id) => set((state) => ({
        printers: state.printers.filter((p) => p.id !== id),
      })),

      setDiscoveredPrinters: (printers) => set({ discoveredPrinters: printers }),

      setDiscoveryConfig: (config) => set((state) => ({
        discoveryConfig: { ...state.discoveryConfig, ...config },
      })),

      setDiscoveryStatus: (status) => set((state) => ({
        discoveryStatus: typeof status === 'function' ? status(state.discoveryStatus) : status,
      })),

      setRecentChanges: (changes) => set((state) => ({
        recentChanges: typeof changes === 'function' ? changes(state.recentChanges) : changes,
      })),
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        printHistory: state.printHistory,
        systemConfig: state.systemConfig,
        printers: state.printers,
        discoveryConfig: state.discoveryConfig,
        hashedPassword: state.hashedPassword,
      }),
    }
  )
);
