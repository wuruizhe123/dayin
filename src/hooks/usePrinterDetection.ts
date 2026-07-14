import { useEffect, useCallback } from 'react';
import { usePrintStore, Printer } from '../stores/printStore';

export const usePrinterDetection = () => {
  const { setPrinters, setIsDetectingPrinters } = usePrintStore();

  const detectPrinters = useCallback(async () => {
    setIsDetectingPrinters(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setPrinters([
        {
          id: 'default',
          name: '系统默认打印机',
          type: 'local',
          isDefault: true,
          status: 'online',
        },
      ]);
    } catch (error) {
      console.error('检测打印机失败:', error);
      setPrinters([
        {
          id: 'default',
          name: '系统默认打印机',
          type: 'local',
          isDefault: true,
          status: 'online',
        },
      ]);
    } finally {
      setIsDetectingPrinters(false);
    }
  }, [setPrinters, setIsDetectingPrinters]);

  useEffect(() => {
    detectPrinters();
  }, [detectPrinters]);

  return { detectPrinters };
};