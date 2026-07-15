import React, { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import {
  FileText,
  CheckCircle,
  XCircle,
  Filter,
  Trash2,
  Download,
  Search,
} from 'lucide-react';

export function PrintHistory(): React.ReactElement {
  const printHistory = useAdminStore((state) => state.printHistory);
  const clearPrintHistory = useAdminStore((state) => state.clearPrintHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');
  const [showConfirm, setShowConfirm] = useState(false);

  const filteredHistory = React.useMemo(() => {
    return printHistory.filter((record) => {
      const matchesSearch = record.fileName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [printHistory, searchTerm, statusFilter]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleClear = () => {
    clearPrintHistory();
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">打印历史记录</h3>
          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
            {filteredHistory.length} 条记录
          </span>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={printHistory.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Trash2 className="w-4 h-4" />
          清空记录
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索文件名..."
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">全部状态</option>
              <option value="completed">成功</option>
              <option value="failed">失败</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">文件名</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">类型</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">大小</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">打印机</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">份数</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">纸张</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">时间</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm text-white">{record.fileName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{record.fileType}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{formatFileSize(record.fileSize)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{record.printerName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{record.copies}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{record.paperSize}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {record.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {record.status === 'completed' ? '成功' : '失败'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{formatTime(record.timestamp)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-600/10 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>暂无打印记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredHistory.length > 0 && (
          <div className="px-4 py-3 bg-slate-700/30 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              显示 {filteredHistory.length} 条记录
            </span>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">确认清空</h3>
            <p className="text-slate-400 mb-6">确定要清空所有打印历史记录吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
