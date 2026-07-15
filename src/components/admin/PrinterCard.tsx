import React from 'react';
import { Printer, Edit, Trash2, Save, X } from 'lucide-react';
import { AdminPrinter } from '../../stores/adminStore';

interface PrinterCardProps {
  printer: AdminPrinter;
  editingId: string | null;
  editData: { location: string; totalPrints: number };
  onEditStart: (id: string) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onDeleteConfirm: (id: string) => void;
}

export const PrinterCard: React.FC<PrinterCardProps> = ({
  printer,
  editingId,
  editData,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDeleteConfirm,
}) => {
  const isEditing = editingId === printer.id;

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all">
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
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                printer.status === 'online'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  printer.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {printer.status === 'online' ? '在线' : '离线'}
              </span>
              <span className="text-xs text-slate-500">
                {printer.type === 'local' ? '本地' : '网络'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={() => onEditSave(printer.id)}
                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onEditCancel}
                className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditStart(printer.id)}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-600/10 rounded-lg transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteConfirm(printer.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div>
          <span className="text-xs text-slate-500">位置</span>
          {isEditing ? (
            <input
              type="text"
              value={editData.location}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                onEditStart(printer.id);
              }}
              className="w-full mt-1 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-slate-300 mt-1">{printer.location || '-'}</p>
          )}
        </div>
        <div>
          <span className="text-xs text-slate-500">总打印次数</span>
          {isEditing ? (
            <input
              type="number"
              value={editData.totalPrints}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                onEditStart(printer.id);
              }}
              className="w-full mt-1 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-slate-300 mt-1">{printer.totalPrints || 0}</p>
          )}
        </div>
      </div>
    </div>
  );
};
