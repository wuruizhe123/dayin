import React from 'react';
import { Printer, CheckCircle, Server, Cable, MapPin, Clock, Link } from 'lucide-react';
import { DiscoveredPrinter } from '../../stores/adminStore';

interface DiscoveredPrinterCardProps {
  printer: DiscoveredPrinter;
  isSelected: boolean;
  onSelect: () => void;
  onConnect: () => void;
}

export const DiscoveredPrinterCard: React.FC<DiscoveredPrinterCardProps> = ({
  printer,
  isSelected,
  onSelect,
  onConnect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`bg-slate-800/50 rounded-xl p-4 border cursor-pointer transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-600/10'
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            printer.status === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <Printer className={`w-5 h-5 ${
              printer.status === 'online' ? 'text-green-400' : 'text-red-400'
            }`} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">{printer.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{printer.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-400'
          }`}>
            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            printer.status === 'online'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {printer.status === 'online' ? '在线' : '离线'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">{printer.manufacturer}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cable className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">{printer.connectionType}</span>
        </div>
        {printer.address && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">{printer.address}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">
            {new Date(printer.lastSeen).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConnect();
          }}
          disabled={printer.status === 'offline'}
          className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          <Link className="w-4 h-4" />
          连接配置
        </button>
      </div>
    </div>
  );
};
