import React from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { usePrintStore } from '../../stores/printStore';
import {
  Printer,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';

const statCards = [
  {
    title: '总打印次数',
    key: 'total',
    icon: FileText,
    color: 'from-blue-600 to-cyan-600',
    bgColor: 'bg-blue-600/10',
  },
  {
    title: '成功次数',
    key: 'success',
    icon: CheckCircle,
    color: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-600/10',
  },
  {
    title: '失败次数',
    key: 'failed',
    icon: XCircle,
    color: 'from-red-600 to-rose-600',
    bgColor: 'bg-red-600/10',
  },
  {
    title: '成功率',
    key: 'rate',
    icon: TrendingUp,
    color: 'from-purple-600 to-violet-600',
    bgColor: 'bg-purple-600/10',
  },
];

export function Dashboard(): React.ReactElement {
  const printHistory = useAdminStore((state) => state.printHistory);
  const printers = usePrintStore((state) => state.printers);

  const stats = React.useMemo(() => {
    const total = printHistory.length;
    const success = printHistory.filter((h) => h.status === 'completed').length;
    const failed = total - success;
    const rate = total > 0 ? Math.round((success / total) * 100) : 0;
    return { total, success, failed, rate };
  }, [printHistory]);

  const recentHistory = React.useMemo(
    () => printHistory.slice(0, 5),
    [printHistory]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats];
          const displayValue = card.key === 'rate' ? value + '%' : value;
          return (
            <div
              key={card.key}
              className={`${card.bgColor} rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">{card.title}</span>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{displayValue}</p>
              <p className="text-xs text-slate-500 mt-1">
                {card.key === 'rate'
                  ? stats.success + '/' + stats.total
                  : card.key === 'total'
                  ? '次打印'
                  : '次'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-white">打印趋势</h3>
          </div>
          <div className="space-y-3">
            {React.useMemo(() => {
              const dayCounts = [0, 0, 0, 0, 0, 0, 0];
              printHistory.forEach((record) => {
                const dayOfWeek = new Date(record.timestamp).getDay();
                dayCounts[dayOfWeek]++;
              });
              const maxCount = Math.max(...dayCounts, 1);
              return dayCounts;
            }, [printHistory]).map((count, index) => {
              const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
              const maxCount = printHistory.length > 0 
                ? Math.max(...Object.values(printHistory.reduce((acc, r) => {
                    const day = new Date(r.timestamp).getDay();
                    if (!acc[day]) acc[day] = 0;
                    acc[day]++;
                    return acc;
                  }, {} as Record<number, number>)), 1)
                : 1;
              const height = Math.round((count / maxCount) * 100);
              return (
                <div key={days[index]} className="flex items-center gap-3">
                  <span className="w-10 text-sm text-slate-400">{days[index]}</span>
                  <div className="flex-1 h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                      style={{ width: `${height}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-slate-400 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Printer className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">打印机状态</h3>
          </div>
          <div className="space-y-3">
            {printers.length > 0 ? (
              printers.map((printer) => (
                <div key={printer.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${printer.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{printer.name}</p>
                      <p className="text-xs text-slate-500">
                        {printer.type === 'local' ? '本地打印机' : '网络打印机'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    printer.status === 'online'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {printer.status === 'online' ? '在线' : '离线'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Printer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无打印机信息</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-white">最近打印记录</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">文件名</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">大小</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">打印机</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.length > 0 ? (
                recentHistory.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm text-white">{record.fileName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{formatFileSize(record.fileSize)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{record.printerName}</span>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    暂无打印记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
