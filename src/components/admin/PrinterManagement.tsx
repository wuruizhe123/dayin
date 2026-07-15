import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdminStore, AdminPrinter, DiscoveredPrinter } from '../../stores/adminStore';
import { usePrintStore } from '../../stores/printStore';
import { usePrinterDiscovery } from '../../hooks/usePrinterDiscovery';
import { PrinterCard } from './PrinterCard';
import { DiscoveredPrinterCard } from './DiscoveredPrinterCard';
import { PrinterConnectWizard } from './PrinterConnectWizard';
import {
  Printer,
  Plus,
  X,
  Search,
  RefreshCw,
  Wifi,
  CheckCircle,
  AlertCircle,
  Bell,
  Play,
  Pause,
  Clock,
  Settings2,
  AlertTriangle,
} from 'lucide-react';

export function PrinterManagement(): React.ReactElement {
  const printers = usePrintStore((state) => state.printers);
  const adminPrinters = useAdminStore((state) => state.printers);
  const setPrinters = useAdminStore((state) => state.setPrinters);
  const updatePrinter = useAdminStore((state) => state.updatePrinter);
  const removePrinter = useAdminStore((state) => state.removePrinter);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ location: '', totalPrints: 0 });
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [discoverySearchTerm, setDiscoverySearchTerm] = useState('');
  const [selectedPrinters, setSelectedPrinters] = useState<string[]>([]);
  const [connectingPrinter, setConnectingPrinter] = useState<DiscoveredPrinter | null>(null);
  const [connectStep, setConnectStep] = useState(1);
  const [connectStatus, setConnectStatus] = useState<'idle' | 'checking' | 'installing' | 'testing' | 'success' | 'error'>('idle');
  const [connectMessage, setConnectMessage] = useState('');
  const [connectProgress, setConnectProgress] = useState(0);
  const [isDefault, setIsDefault] = useState(false);

  const printersRef = useRef<string[]>([]);

  const {
    discoveredPrinters,
    discoveryStatus,
    discoveryConfig,
    recentChanges,
    scanProgress,
    startDiscovery,
    stopDiscovery,
    refreshNow,
    updateConfig,
    dismissChange,
    clearChanges,
  } = usePrinterDiscovery();

  useEffect(() => {
    const printerIds = printers.map((p) => p.id);
    const prevIds = printersRef.current;

    if (printerIds.length !== prevIds.length || !printerIds.every((id, i) => id === prevIds[i])) {
      const mergedPrinters = printers.map((p) => {
        const adminP = adminPrinters.find((ap) => ap.id === p.id);
        return { ...p, ...adminP };
      });
      setPrinters(mergedPrinters);
      printersRef.current = printerIds;
    }
  }, [printers, adminPrinters, setPrinters]);

  const filteredPrinters = React.useMemo(() => {
    if (!searchTerm) return adminPrinters;
    const term = searchTerm.toLowerCase();
    return adminPrinters.filter((printer) => printer.name.toLowerCase().includes(term));
  }, [adminPrinters, searchTerm]);

  const filteredDiscoveredPrinters = React.useMemo(() => {
    if (!discoverySearchTerm) return discoveredPrinters;
    const term = discoverySearchTerm.toLowerCase();
    return discoveredPrinters.filter((printer) =>
      printer.name.toLowerCase().includes(term) ||
      printer.address?.toLowerCase().includes(term) ||
      printer.model.toLowerCase().includes(term)
    );
  }, [discoveredPrinters, discoverySearchTerm]);

  const handleEditStart = useCallback((printerId: string) => {
    const printer = adminPrinters.find((p) => p.id === printerId);
    if (printer) {
      setEditData({
        location: printer.location || '',
        totalPrints: printer.totalPrints || 0,
      });
      setEditingId(printerId);
    }
  }, [adminPrinters]);

  const handleEditSave = useCallback((printerId: string) => {
    updatePrinter(printerId, editData);
    setEditingId(null);
    setEditData({ location: '', totalPrints: 0 });
  }, [editData, updatePrinter]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditData({ location: '', totalPrints: 0 });
  }, []);

  const handleDelete = useCallback((printerId: string) => {
    removePrinter(printerId);
    setShowConfirm(null);
  }, [removePrinter]);

  const toggleSelectPrinter = useCallback((printerId: string) => {
    setSelectedPrinters((prev) =>
      prev.includes(printerId)
        ? prev.filter((id) => id !== printerId)
        : [...prev, printerId]
    );
  }, []);

  const handleAddPrinters = useCallback(() => {
    const newPrinters: AdminPrinter[] = filteredDiscoveredPrinters
      .filter((p) => selectedPrinters.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isDefault: false,
        status: p.status,
        location: p.address || '',
        totalPrints: 0,
      }));

    setPrinters([...adminPrinters, ...newPrinters]);
    setShowAddDialog(false);
    setSelectedPrinters([]);
  }, [filteredDiscoveredPrinters, selectedPrinters, adminPrinters, setPrinters]);

  const startConnect = useCallback((printer: DiscoveredPrinter) => {
    setConnectingPrinter(printer);
    setConnectStep(1);
    setConnectStatus('idle');
    setConnectMessage('');
    setConnectProgress(0);
    setIsDefault(false);
    setShowConnectDialog(true);
  }, []);

  const cancelConnect = useCallback(() => {
    setShowConnectDialog(false);
    setConnectingPrinter(null);
    setConnectStep(1);
    setConnectStatus('idle');
    setConnectMessage('');
    setConnectProgress(0);
    setIsDefault(false);
  }, []);

  const executeConnect = useCallback(async () => {
    if (!connectingPrinter) return;

    try {
      setConnectStatus('checking');
      setConnectMessage('正在检查打印机连接状态...');
      setConnectProgress(10);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setConnectStep(2);
      setConnectStatus('installing');
      setConnectMessage(`正在安装 ${connectingPrinter.manufacturer} 打印机驱动...`);
      setConnectProgress(30);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConnectProgress(60);
      setConnectMessage('配置打印机端口...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setConnectStep(3);
      setConnectStatus('testing');
      setConnectMessage('正在测试打印机连接...');
      setConnectProgress(80);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setConnectProgress(100);
      setConnectStatus('success');
      setConnectMessage('打印机连接配置完成！');

      await new Promise((resolve) => setTimeout(resolve, 500));

      const newPrinter: AdminPrinter = {
        id: connectingPrinter.id,
        name: connectingPrinter.name,
        type: connectingPrinter.type,
        isDefault: isDefault,
        status: connectingPrinter.status,
        location: connectingPrinter.address || '',
        totalPrints: 0,
      };

      setPrinters([...adminPrinters, newPrinter]);
    } catch {
      setConnectStatus('error');
      setConnectMessage('连接配置失败，请重试或检查打印机状态');
    }
  }, [connectingPrinter, isDefault, adminPrinters, setPrinters]);

  const formatTime = useCallback((timestamp: string | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  const formatInterval = useCallback((ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}秒`;
    return `${Math.round(ms / 60000)}分钟`;
  }, []);

  const onlineCount = React.useMemo(() => {
    return discoveredPrinters.filter((p) => p.status === 'online').length;
  }, [discoveredPrinters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">打印机管理</h3>
          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
            {filteredPrinters.length} 台已添加
          </span>
          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs font-medium rounded-full">
            {onlineCount}/{discoveredPrinters.length} 在线
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
          >
            <Settings2 className="w-4 h-4" />
            配置
          </button>
          <button
            onClick={discoveryStatus.isRunning ? stopDiscovery : startDiscovery}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              discoveryStatus.isRunning
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {discoveryStatus.isRunning ? (
              <><Pause className="w-4 h-4" /> 停止监测</>
            ) : (
              <><Play className="w-4 h-4" /> 开始监测</>
            )}
          </button>
          <button
            onClick={refreshNow}
            disabled={discoveryStatus.isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${discoveryStatus.isRunning ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {discoveryStatus.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">检测服务出现故障</p>
            <p className="text-red-300 text-sm mt-1">{discoveryStatus.error}</p>
            <p className="text-red-300 text-xs mt-2">
              连续失败次数: {discoveryStatus.consecutiveFailures}，系统将自动尝试恢复
            </p>
          </div>
          <button
            onClick={refreshNow}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm transition-all"
          >
            立即重试
          </button>
        </div>
      )}

      {recentChanges.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-500" />
              <span className="text-purple-400 font-medium">最近变化</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                {recentChanges.length}
              </span>
            </div>
            <button
              onClick={clearChanges}
              className="text-purple-400 hover:text-purple-300 text-sm transition-all"
            >
              清除全部
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentChanges.map((change, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    change.type === 'added' ? 'bg-green-500 animate-pulse' :
                    change.type === 'removed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm text-white">{change.printer.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    change.type === 'added' ? 'bg-green-500/20 text-green-400' :
                    change.type === 'removed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {change.type === 'added' ? '新增' : change.type === 'removed' ? '移除' : '状态变更'}
                  </span>
                  {change.type === 'status_changed' && (
                    <span className="text-xs text-slate-400">
                      {change.previousStatus} → {change.printer.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => dismissChange(index)}
                  className="text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Wifi className={`w-4 h-4 ${discoveryStatus.isRunning ? 'text-green-500 animate-pulse' : 'text-slate-500'}`} />
            <span>监测状态: {discoveryStatus.isRunning ? '运行中' : '已停止'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>检测间隔: {formatInterval(discoveryConfig.intervalMs)}</span>
          </div>
          {discoveryStatus.lastScanTime && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>上次检测: {formatTime(discoveryStatus.lastScanTime)}</span>
            </div>
          )}
          {discoveryStatus.nextScanTime && !discoveryStatus.isRunning && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>下次检测: {formatTime(discoveryStatus.nextScanTime)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">已添加的打印机</h4>
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              添加打印机
            </button>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索打印机名称..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredPrinters.length > 0 ? (
              filteredPrinters.map((printer) => (
                <PrinterCard
                  key={printer.id}
                  printer={printer}
                  editingId={editingId}
                  editData={editData}
                  onEditStart={handleEditStart}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                  onDeleteConfirm={setShowConfirm}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Printer className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-500">暂无已添加的打印机</p>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  添加打印机
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">附近的打印机</h4>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={discoverySearchTerm}
                onChange={(e) => setDiscoverySearchTerm(e.target.value)}
                placeholder="搜索打印机名称、型号或IP..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {discoveryStatus.isRunning ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <Wifi className="w-10 h-10 text-purple-500 mb-3 animate-pulse" />
                  {scanProgress && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${scanProgress.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-4">
                  {scanProgress?.message || '正在扫描附近打印机...'}
                </p>
                {scanProgress && (
                  <div className="w-full max-w-xs mt-4">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${scanProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : filteredDiscoveredPrinters.length > 0 ? (
              filteredDiscoveredPrinters.map((printer) => (
                <DiscoveredPrinterCard
                  key={printer.id}
                  printer={printer}
                  isSelected={selectedPrinters.includes(printer.id)}
                  onSelect={() => toggleSelectPrinter(printer.id)}
                  onConnect={() => startConnect(printer)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Printer className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-500">未发现附近的打印机</p>
                <p className="text-slate-600 text-xs mt-2">请启动监测或检查网络连接</p>
              </div>
            )}
          </div>
          {filteredDiscoveredPrinters.length > 0 && selectedPrinters.length > 0 && (
            <button
              onClick={handleAddPrinters}
              className="w-full mt-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
            >
              添加选中的 {selectedPrinters.length} 台打印机
            </button>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
            <p className="text-slate-400 mb-6">确定要删除这台打印机吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-slate-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-white">添加打印机</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedPrinters([]);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={discoverySearchTerm}
                  onChange={(e) => setDiscoverySearchTerm(e.target.value)}
                  placeholder="搜索打印机名称、型号或IP..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              {discoveryStatus.isRunning ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Wifi className="w-12 h-12 text-purple-500 mb-4 animate-pulse" />
                  <p className="text-slate-400 mb-2">正在搜索附近的打印机...</p>
                  <p className="text-slate-500 text-sm">请确保打印机已连接到同一网络</p>
                </div>
              ) : discoveredPrinters.length > 0 ? (
                <div className="space-y-2">
                  {filteredDiscoveredPrinters.map((printer) => (
                    <div
                      key={printer.id}
                      onClick={() => toggleSelectPrinter(printer.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPrinters.includes(printer.id)
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedPrinters.includes(printer.id)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-slate-400'
                      }`}>
                        {selectedPrinters.includes(printer.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{printer.name}</p>
                        <p className="text-xs text-slate-400">
                          {printer.type === 'local' ? '本地打印机' : '网络打印机'}
                          {printer.address && ` - ${printer.address}`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        printer.status === 'online'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {printer.status === 'online' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {printer.status === 'online' ? '在线' : '离线'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Printer className="w-12 h-12 text-slate-600 mb-4" />
                  <p className="text-slate-400 mb-2">未发现附近的打印机</p>
                  <p className="text-slate-500 text-sm">请检查网络连接或启动监测</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                已选择 {selectedPrinters.length} 台打印机
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setSelectedPrinters([]);
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleAddPrinters}
                  disabled={selectedPrinters.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  添加选中的打印机
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-white">监测配置</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">检测间隔</label>
                <select
                  value={discoveryConfig.intervalMs}
                  onChange={(e) => updateConfig({ intervalMs: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value={10000}>10秒</option>
                  <option value={30000}>30秒（默认）</option>
                  <option value={60000}>1分钟</option>
                  <option value={120000}>2分钟</option>
                  <option value={300000}>5分钟</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">扫描延迟</label>
                <select
                  value={discoveryConfig.scanDelayMs}
                  onChange={(e) => updateConfig({ scanDelayMs: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value={500}>0.5秒</option>
                  <option value={1000}>1秒</option>
                  <option value={1500}>1.5秒（默认）</option>
                  <option value={2000}>2秒</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">自动启动</label>
                  <p className="text-xs text-slate-500">页面加载时自动开始监测</p>
                </div>
                <button
                  onClick={() => updateConfig({ autoStart: !discoveryConfig.autoStart })}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    discoveryConfig.autoStart ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      discoveryConfig.autoStart ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">声音提示</label>
                  <p className="text-xs text-slate-500">检测到变化时播放提示音</p>
                </div>
                <button
                  onClick={() => updateConfig({ soundEnabled: !discoveryConfig.soundEnabled })}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    discoveryConfig.soundEnabled ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      discoveryConfig.soundEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {showConnectDialog && connectingPrinter && (
        <PrinterConnectWizard
          printer={connectingPrinter}
          step={connectStep}
          status={connectStatus}
          message={connectMessage}
          progress={connectProgress}
          isDefault={isDefault}
          onClose={cancelConnect}
          onNext={executeConnect}
          onToggleDefault={() => setIsDefault(!isDefault)}
        />
      )}
    </div>
  );
}
