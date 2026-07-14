import { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, FileText, Image as ImageIcon, Copy, Eye, ChevronDown, ChevronUp, Table, BarChart3, Target, Shield, Zap } from 'lucide-react';
import { usePrintStore } from '../../stores/printStore';
import { getParseStatusText, getParseStatusColor, formatParseTime, formatCharCount, getParseStatistics } from '../../utils/documentParser';

export const ParseStatus = () => {
  const { selectedFile } = usePrintStore();
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const statistics = getParseStatistics();

  if (!selectedFile?.parseResult) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="font-display font-semibold text-lg text-gray-700">解析统计</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">总文件数</div>
            <div className="text-sm font-semibold text-gray-700">{statistics.totalFiles}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">成功数</div>
            <div className="text-sm font-semibold text-green-600">{statistics.successCount}</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">部分解析</div>
            <div className="text-sm font-semibold text-yellow-600">{statistics.partialCount}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">失败数</div>
            <div className="text-sm font-semibold text-red-600">{statistics.failedCount}</div>
          </div>
        </div>
        {statistics.totalFiles > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">平均准确率</span>
              <span className="font-semibold text-blue-600">{statistics.avgAccuracy}%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">平均耗时</span>
              <span className="font-semibold text-blue-600">{formatParseTime(statistics.avgParseTime)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  const { parseResult } = selectedFile;
  const statusText = getParseStatusText(parseResult.status);
  const statusColor = getParseStatusColor(parseResult.status);

  const getStatusIcon = () => {
    switch (parseResult.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityBarWidth = (value: number): string => {
    return `${value}%`;
  };

  const handleCopyText = async () => {
    if (parseResult.extractedText) {
      await navigator.clipboard.writeText(parseResult.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="font-display font-semibold text-lg text-gray-700">解析状态</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${parseResult.status === 'success' ? 'bg-green-100 text-green-700' : parseResult.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <FileText className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div className="text-xs text-gray-500">字符数</div>
          <div className="text-sm font-semibold text-gray-700">{formatCharCount(parseResult.charCount)}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <Eye className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <div className="text-xs text-gray-500">页数</div>
          <div className="text-sm font-semibold text-gray-700">{parseResult.pageCount}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <ImageIcon className="w-5 h-5 mx-auto mb-1 text-purple-500" />
          <div className="text-xs text-gray-500">图片数</div>
          <div className="text-sm font-semibold text-gray-700">{parseResult.imageCount}</div>
        </div>
      </div>

      {parseResult.tableCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
          <Table className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium text-blue-700">检测到表格</div>
            <div className="text-xs text-blue-500">共 {parseResult.tableCount} 个表格</div>
          </div>
        </div>
      )}

      <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-indigo-700">质量评估</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getConfidenceColor(parseResult.quality.confidenceScore)}`}>
            置信度 {parseResult.quality.confidenceScore}
          </span>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">准确率</span>
              <span className="font-medium text-gray-700">{parseResult.quality.accuracy}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: getQualityBarWidth(parseResult.quality.accuracy) }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">完整性</span>
              <span className="font-medium text-gray-700">{parseResult.quality.completeness}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: getQualityBarWidth(parseResult.quality.completeness) }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">格式还原</span>
              <span className="font-medium text-gray-700">{parseResult.quality.formatPreservation}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: getQualityBarWidth(parseResult.quality.formatPreservation) }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">结构完整</span>
              <span className="font-medium text-gray-700">{parseResult.quality.structureIntegrity}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: getQualityBarWidth(parseResult.quality.structureIntegrity) }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        <span>解析耗时: {formatParseTime(parseResult.parseTime)}</span>
      </div>

      {parseResult.warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">警告信息</span>
          </div>
          <ul className="space-y-1">
            {parseResult.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-600">- {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {parseResult.errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">错误信息</span>
          </div>
          <ul className="space-y-1">
            {parseResult.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">- {error}</li>
            ))}
          </ul>
        </div>
      )}

      {parseResult.extractedText.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">文本预览</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTextPreview(!showTextPreview)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              >
                {showTextPreview ? '隐藏' : '查看'}
              </button>
              <button
                onClick={handleCopyText}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
          {showTextPreview && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{parseResult.extractedText.substring(0, 2000)}{parseResult.extractedText.length > 2000 ? '...' : ''}</p>
            </div>
          )}
        </div>
      )}

      {parseResult.structuredData && parseResult.structuredData.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">结构化数据</span>
          </div>
          <div className="text-xs text-blue-600">
            检测到 {parseResult.structuredData.length} 个数据表，共 {parseResult.structuredData.reduce((sum, sheet) => sum + (sheet.data?.length || 0), 0)} 行数据
          </div>
        </div>
      )}

      <button
        onClick={() => setShowLogs(!showLogs)}
        className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>解析日志</span>
        {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showLogs && (
        <div className="mt-2 p-3 bg-gray-900 rounded-xl text-xs font-mono max-h-48 overflow-y-auto">
          {parseResult.logs.map((log, index) => (
            <div key={index} className={`flex gap-2 ${log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : 'text-gray-400'}`}>
              <span className="text-gray-500 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`flex-shrink-0 w-16 ${log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>[{log.level.toUpperCase()}]</span>
              <span>{log.message}</span>
              {log.details && <span className="text-gray-500">{log.details}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              统计: {statistics.totalFiles} 个文件
            </span>
            <span>成功率: {statistics.totalFiles > 0 ? Math.round(statistics.successCount / statistics.totalFiles * 100) : 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};