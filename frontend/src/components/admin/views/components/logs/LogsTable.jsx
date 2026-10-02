'use client';
import React from 'react';
import { Download, RotateCcw, ArrowRight, ExternalLink } from 'lucide-react';

export function LogsTable({ filteredLogs, isRetrying, onRowClick, onRetry, onRefresh }) {
    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2">
                <div className="flex items-center gap-4">
                    <h4 className="text-sm font-bold text-text-primary">System Logs</h4>
                    <span className="px-2 py-0.5 bg-brand/10 text-brand text-label font-bold rounded-full border border-brand/20">
                        {filteredLogs.length} Entries
                    </span>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-all cursor-pointer" title="Download Logs" aria-label="Download logs">
                        <Download size={16} />
                    </button>
                    <button onClick={onRefresh} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-all cursor-pointer" title="Refresh" aria-label="Refresh logs">
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-2/40 text-label font-bold text-text-muted uppercase tracking-widest border-b border-border">
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Run ID</th>
                            <th className="px-6 py-4">Connector</th>
                            <th className="px-6 py-4">Source → Dest</th>
                            <th className="px-6 py-4">Operation</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Records</th>
                            <th className="px-6 py-4 text-right">Duration</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs text-text-secondary">
                        {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                            <tr key={log.runId} onClick={() => onRowClick(log)} className="border-b border-border/50 hover:bg-surface-2 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 font-mono text-label">{log.timestamp}</td>
                                <td className="px-6 py-4 font-bold text-brand">{log.runId}</td>
                                <td className="px-6 py-4">{log.connector}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-text-muted">{log.source}</span>
                                        <ArrowRight size={10} className="text-text-secondary" />
                                        <span className="text-text-muted">{log.destination}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-surface-2 rounded-md text-label font-bold uppercase">{log.operation}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            log.status === 'Success' ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                            : log.status === 'Failed' ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                            : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                        }`} />
                                        <span className={`font-bold ${
                                            log.status === 'Success' ? 'text-success'
                                            : log.status === 'Failed' ? 'text-danger'
                                            : 'text-warning'
                                        }`}>{log.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono">{log.records.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-text-muted">{log.duration}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRetry(log.runId); }}
                                            disabled={isRetrying === log.runId}
                                            aria-busy={isRetrying === log.runId}
                                            aria-label="Retry run"
                                            className={`p-1.5 text-text-muted hover:text-brand hover:bg-brand/10 rounded-md transition-all cursor-pointer disabled:opacity-50 ${isRetrying === log.runId ? 'animate-spin' : ''}`}
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                        <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-md transition-all cursor-pointer" aria-label="Open log details">
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={9} className="px-6 py-20 text-center text-text-muted italic">
                                    No logs found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
