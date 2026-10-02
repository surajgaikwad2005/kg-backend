'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertTriangle, RotateCcw, Info, FileCode, FileJson, FileSpreadsheet, Server } from 'lucide-react';

const META_ROWS = [
    { label: 'Host', value: 'worker-node-04-prod' },
    { label: 'Version', value: '2.4.1-stable' },
    { label: 'Commit ID', value: '8f2a1c9' },
    { label: 'Environment', value: 'Production' },
];

const INFO_STATS = (log) => [
    { label: 'Connector', value: log.connector },
    { label: 'Operation', value: log.operation },
    { label: 'Duration', value: log.duration },
    { label: 'Retry Count', value: log.retryCount },
];

const statusIconCls = (status) => {
    if (status === 'Success') return 'bg-success/10 text-success';
    if (status === 'Failed') return 'bg-danger/10 text-danger';
    return 'bg-warning/10 text-warning';
};

export function LogDetailDrawer({ selectedLog, onClose, isRetrying, onRetry }) {
    return (
        <AnimatePresence>
            {selectedLog && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60" />
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        role="dialog" aria-modal="true" aria-labelledby="log-detail-drawer-title"
                        className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-surface-2 border-l border-border z-70 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusIconCls(selectedLog.status)}`}>
                                    {selectedLog.status === 'Success' ? <CheckCircle2 size={20} />
                                        : selectedLog.status === 'Failed' ? <X size={20} />
                                        : <AlertTriangle size={20} />}
                                </div>
                                <div>
                                    <h3 id="log-detail-drawer-title" className="text-lg font-bold text-text-primary">Run Details: {selectedLog.runId}</h3>
                                    <p className="text-xs text-text-muted">{selectedLog.timestamp}</p>
                                </div>
                            </div>
                            <button onClick={onClose} aria-label="Close"
                                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-xl transition-all cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-border-strong">
                            <div className="grid grid-cols-2 gap-4">
                                {INFO_STATS(selectedLog).map((item) => (
                                    <div key={item.label} className="bg-surface border border-border p-4 rounded-xl space-y-1">
                                        <span className="text-label font-bold text-text-muted uppercase tracking-widest">{item.label}</span>
                                        <p className="text-sm text-text-primary font-medium">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Info size={14} />Log Message
                                </h4>
                                <div className="bg-surface border border-border p-4 rounded-xl">
                                    <p className="text-sm text-text-secondary leading-relaxed">{selectedLog.logMessage}</p>
                                </div>
                            </div>

                            {selectedLog.status === 'Failed' && selectedLog.stackTrace && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-danger uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={14} />Stack Trace
                                    </h4>
                                    <div className="bg-danger/5 border border-danger/20 p-4 rounded-xl">
                                        <pre className="text-label font-mono text-danger overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                            {selectedLog.stackTrace}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <FileCode size={14} />Configuration Snapshot
                                </h4>
                                <div className="bg-surface border border-border p-4 rounded-xl">
                                    <pre className="text-label font-mono text-brand overflow-x-auto">
                                        {JSON.stringify(selectedLog.params, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Server size={14} />System Metadata
                                </h4>
                                <div className="bg-surface border border-border rounded-xl divide-y divide-border">
                                    {META_ROWS.map((meta) => (
                                        <div key={meta.label} className="flex items-center justify-between p-4">
                                            <span className="text-label font-bold text-text-muted uppercase">{meta.label}</span>
                                            <span className="text-xs text-text-primary font-mono">{meta.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-surface flex gap-4">
                            <button
                                onClick={() => onRetry(selectedLog.runId)}
                                disabled={isRetrying === selectedLog.runId}
                                aria-busy={isRetrying === selectedLog.runId}
                                className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                <RotateCcw size={18} className={isRetrying === selectedLog.runId ? 'animate-spin' : ''} />
                                {isRetrying === selectedLog.runId ? 'Retrying...' : 'Retry Run'}
                            </button>
                            <div className="flex gap-2">
                                <button aria-label="Download JSON"
                                    className="p-3 bg-surface-2 hover:bg-border/40 text-text-primary rounded-xl border border-border transition-all cursor-pointer">
                                    <FileJson size={20} />
                                </button>
                                <button aria-label="Export CSV"
                                    className="p-3 bg-surface-2 hover:bg-border/40 text-text-primary rounded-xl border border-border transition-all cursor-pointer">
                                    <FileSpreadsheet size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
