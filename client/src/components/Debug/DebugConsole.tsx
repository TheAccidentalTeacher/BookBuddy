import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDebug } from '../../contexts/DebugContext';

function DebugConsole() {
  const {
    isOpen,
    close,
    logs,
    networkRequests,
    aiInteractions,
    performanceMetrics,
    clearLogs,
    exportLogs,
    runAccessibilityAudit,
  } = useDebug();

  const [activeTab, setActiveTab] = useState<'logs' | 'network' | 'ai' | 'performance' | 'accessibility'>('logs');
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [accessibilityResults, setAccessibilityResults] = useState<any[]>([]);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        close();
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('logs');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('network');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('ai');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('performance');
            break;
          case '5':
            e.preventDefault();
            setActiveTab('accessibility');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const handleAccessibilityAudit = async () => {
    setIsRunningAudit(true);
    try {
      const results = await runAccessibilityAudit();
      setAccessibilityResults(results);
    } catch (error) {
      console.error('Accessibility audit failed:', error);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  if (!isOpen) return null;

  const debugRoot = document.getElementById('debug-console-root');
  if (!debugRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[var(--z-debug)]"
      role="dialog"
      aria-labelledby="debug-console-title"
      aria-modal="true"
    >
      <div
        ref={consoleRef}
        className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg shadow-lg 
          w-full max-w-6xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 id="debug-console-title" className="text-lg font-semibold text-[var(--text-color)]">
            Debug Console
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-[var(--warning-color)] text-white rounded 
                hover:opacity-80 transition-opacity"
              aria-label="Clear all logs"
            >
              Clear
            </button>
            <button
              onClick={exportLogs}
              className="px-3 py-1 text-sm bg-[var(--primary-color)] text-white rounded 
                hover:opacity-80 transition-opacity"
              aria-label="Export logs as JSON"
            >
              Export
            </button>
            <button
              onClick={close}
              className="p-1 hover:bg-[var(--border-color)] rounded transition-colors"
              aria-label="Close debug console"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)]" role="tablist">
          {[
            { id: 'logs', label: 'Logs', shortcut: 'Ctrl+1' },
            { id: 'network', label: 'Network', shortcut: 'Ctrl+2' },
            { id: 'ai', label: 'AI', shortcut: 'Ctrl+3' },
            { id: 'performance', label: 'Performance', shortcut: 'Ctrl+4' },
            { id: 'accessibility', label: 'Accessibility', shortcut: 'Ctrl+5' },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              title={tab.shortcut}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div id="logs-panel" role="tabpanel" className="h-full flex flex-col">
              {/* Log Filter */}
              <div className="p-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <label htmlFor="log-filter" className="text-sm font-medium text-[var(--text-color)]">
                    Filter:
                  </label>
                  <select
                    id="log-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-2 py-1 text-sm border border-[var(--border-color)] rounded 
                      bg-[var(--bg-color)] text-[var(--text-color)]"
                  >
                    <option value="all">All ({logs.length})</option>
                    <option value="info">Info ({logs.filter(l => l.level === 'info').length})</option>
                    <option value="warn">Warnings ({logs.filter(l => l.level === 'warn').length})</option>
                    <option value="error">Errors ({logs.filter(l => l.level === 'error').length})</option>
                  </select>
                </div>
              </div>

              {/* Log List */}
              <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {filteredLogs.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-center py-8">
                    No logs to display
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 p-2 border border-[var(--border-color)] rounded"
                      >
                        <span className="flex-shrink-0">
                          {getLogLevelIcon(log.level)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${getLogLevelColor(log.level)}`}>
                              [{log.level.toUpperCase()}]
                            </span>
                            <span className="text-[var(--text-muted)] text-xs">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                            <span className="text-[var(--primary-color)] text-xs font-medium">
                              {log.category}
                            </span>
                          </div>
                          <p className="text-[var(--text-color)]">{log.message}</p>
                          {log.data && (
                            <details className="mt-1">
                              <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-color)]">
                                Show data
                              </summary>
                              <pre className="mt-1 p-2 bg-[var(--bg-color)] rounded text-xs overflow-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Network Tab */}
          {activeTab === 'network' && (
            <div id="network-panel" role="tabpanel" className="h-full p-4 overflow-auto">
              <h3 className="text-lg font-medium text-[var(--text-color)] mb-4">
                Network Requests ({networkRequests.length})
              </h3>
              {networkRequests.length === 0 ? (
                <p className="text-[var(--text-muted)] text-center py-8">
                  No network requests logged
                </p>
              ) : (
                <div className="space-y-3">
                  {networkRequests.map((request, index) => (
                    <div
                      key={index}
                      className="border border-[var(--border-color)] rounded p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-mono bg-[var(--primary-color)] text-white rounded">
                          {request.method || 'GET'}
                        </span>
                        <span className="font-mono text-sm text-[var(--text-color)]">
                          {request.url}
                        </span>
                      </div>
                      <pre className="text-xs text-[var(--text-muted)] overflow-auto">
                        {JSON.stringify(request, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div id="ai-panel" role="tabpanel" className="h-full p-4 overflow-auto">
              <h3 className="text-lg font-medium text-[var(--text-color)] mb-4">
                AI Interactions ({aiInteractions.length})
              </h3>
              {aiInteractions.length === 0 ? (
                <p className="text-[var(--text-muted)] text-center py-8">
                  No AI interactions logged
                </p>
              ) : (
                <div className="space-y-3">
                  {aiInteractions.map((interaction, index) => (
                    <div
                      key={index}
                      className="border border-[var(--border-color)] rounded p-3"
                    >
                      <h4 className="font-medium text-[var(--text-color)] mb-2">
                        AI Interaction #{index + 1}
                      </h4>
                      <pre className="text-xs text-[var(--text-muted)] overflow-auto">
                        {JSON.stringify(interaction, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div id="performance-panel" role="tabpanel" className="h-full p-4 overflow-auto">
              <h3 className="text-lg font-medium text-[var(--text-color)] mb-4">
                Performance Metrics
              </h3>
              {Object.keys(performanceMetrics).length === 0 ? (
                <p className="text-[var(--text-muted)] text-center py-8">
                  No performance metrics logged
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(performanceMetrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded"
                    >
                      <span className="font-medium text-[var(--text-color)]">{key}</span>
                      <span className="font-mono text-[var(--primary-color)]">
                        {typeof value === 'number' ? `${value.toFixed(2)}ms` : value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div id="accessibility-panel" role="tabpanel" className="h-full p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--text-color)]">
                  Accessibility Audit
                </h3>
                <button
                  onClick={handleAccessibilityAudit}
                  disabled={isRunningAudit}
                  className="px-3 py-1 text-sm bg-[var(--primary-color)] text-white rounded 
                    hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {isRunningAudit ? 'Running...' : 'Run Audit'}
                </button>
              </div>

              {accessibilityResults.length === 0 ? (
                <p className="text-[var(--text-muted)] text-center py-8">
                  Click "Run Audit" to check accessibility issues
                </p>
              ) : (
                <div className="space-y-3">
                  {accessibilityResults.map((issue, index) => (
                    <div
                      key={index}
                      className={`border rounded p-3 ${
                        issue.severity === 'error'
                          ? 'border-red-300 bg-red-50'
                          : issue.severity === 'warning'
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          issue.severity === 'error'
                            ? 'bg-red-500 text-white'
                            : issue.severity === 'warning'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}>
                          {issue.severity?.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900">
                          {issue.type}
                        </span>
                      </div>
                      <p className="text-gray-700">{issue.message}</p>
                      {issue.count && (
                        <p className="text-sm text-gray-600 mt-1">
                          Found {issue.count} instances
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
          <p>
            Use Ctrl+1-5 to switch tabs, Escape to close. 
            This console helps debug and monitor your application.
          </p>
        </div>
      </div>
    </div>,
    debugRoot
  );
}

export default DebugConsole;
