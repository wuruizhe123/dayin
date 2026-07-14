import React from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { DocumentList } from './components/DocumentList';
import { DocumentPreview } from './components/DocumentPreview';
import { PrinterSelector } from './components/PrinterSelector';
import { PrintSettings } from './components/PrintSettings';
import { PrintControl } from './components/PrintControl';
import { PrintQueue } from './components/PrintQueue';
import { ParseStatus } from './components/ParseStatus';
import { usePrintStore } from './stores/printStore';

export default function App(): React.ReactElement {
  const { printQueue } = usePrintStore();

  return (

    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="card p-5 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <h3 className="font-display font-semibold text-lg text-gray-700 mb-4">上传文档</h3>
                <FileUpload />
              </div>
              
              <div className="card p-5 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-display font-semibold text-lg text-gray-700 mb-4">文档列表</h3>
                <DocumentList />
              </div>
              
              {printQueue.length > 0 && (
                <PrintQueue />
              )}
              
              <ParseStatus />
            </div>
            
            <div className="lg:col-span-2 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="card h-[600px] flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-display font-semibold text-lg text-gray-700">文档预览</h3>
                </div>
                <div className="flex-1 overflow-hidden">
                  <DocumentPreview />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <div className="card p-5 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <PrinterSelector />
              </div>
              <div className="card p-5 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <PrintSettings />
              </div>
              <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                <PrintControl />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span className="font-medium">打印中心</span>
          <span>支持 PDF、Word、图片等格式</span>
        </div>
      </footer>
    </div>
  );
}