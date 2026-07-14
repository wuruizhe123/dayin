import { Printer, Settings, HelpCircle } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/60 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Printer className="w-8 h-8 text-gray-800" />
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              打印中心
            </h1>
            <p className="text-sm text-gray-500">自动化文档打印管理系统</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200" title="帮助">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200" title="设置">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};