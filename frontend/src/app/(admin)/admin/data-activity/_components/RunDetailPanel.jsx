'use client';
import React from 'react';
import { ArrowDownRight, RefreshCw, Trash2, AlertTriangle, Database } from 'lucide-react';
import { statusBadgeCls } from './activityUtils';

export function RunDetailPanel({ run, job }) {
    const infoStats = [
        { label: 'Source', value: job.source },
        { label: 'Time Window', value: run.timeWindow },
        { label: 'Duration', value: run.duration },
        { label: 'Trigger', value: job.trigger },
        { label: 'Run ID', value: run.id },
        { label: 'Executed At', value: run.executedAt },
        { label: 'Total Records', value: run.totalRecords.toLocaleString() },
        { label: 'Tables', value: job.tables.join(', ') || '—' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {infoStats.map((info) => (
                    <div key={info.label} className="bg-surface-2/60 border border-border p-3 rounded-xl space-y-1">
                        <span className="text-label font-bold text-text-muted uppercase tracking-widest">{info.label}</span>
                        <p className="text-xs text-text-primary font-medium truncate" title={info.value}>{info.value}</p>
                    </div>
                ))}
            </div>

            {/*
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-success/5 border border-success/20 p-4 rounded-xl text-center">
                    <ArrowDownRight size={16} className="text-success mx-auto mb-1" />
                    <div className="text-xl font-bold text-success">{run.inserts.toLocaleString()}</div>
                    <div className="text-label font-bold text-success/60 uppercase tracking-widest">Inserts</div>
                </div>
                <div className="bg-warning/5 border border-warning/20 p-4 rounded-xl text-center">
                    <RefreshCw size={16} className="text-warning mx-auto mb-1" />
                    <div className="text-xl font-bold text-warning">{run.updates.toLocaleString()}</div>
                    <div className="text-label font-bold text-warning/60 uppercase tracking-widest">Updates</div>
                </div>
                <div className="bg-danger/5 border border-danger/20 p-4 rounded-xl text-center">
                    <Trash2 size={16} className="text-danger mx-auto mb-1" />
                    <div className="text-xl font-bold text-danger">{run.deletes.toLocaleString()}</div>
                    <div className="text-label font-bold text-danger/60 uppercase tracking-widest">Deletes</div>
                </div>
            </div>

            {run.changeBreakdown && run.changeBreakdown.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Database size={14} />Table Breakdown
                    </h4>
                    <div className="bg-surface-2/60 border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-label font-bold text-text-muted uppercase tracking-widest border-b border-border bg-surface-2">
                                    <th className="px-4 py-2">Table</th>
                                    <th className="px-4 py-2 text-right text-success">Ins</th>
                                    <th className="px-4 py-2 text-right text-warning">Upd</th>
                                    <th className="px-4 py-2 text-right text-danger">Del</th>
                                    <th className="px-4 py-2">Distribution</th>
                                </tr>
                            </thead>
                            <tbody className="text-text-secondary">
                                {run.changeBreakdown.map((row) => {
                                    const total = row.inserts + row.updates + row.deletes;
                                    const iPct = total > 0 ? (row.inserts / total) * 100 : 0;
                                    const uPct = total > 0 ? (row.updates / total) * 100 : 0;
                                    const dPct = total > 0 ? (row.deletes / total) * 100 : 0;
                                    return (
                                        <tr key={row.table} className="border-b border-border/50">
                                            <td className="px-4 py-2 font-mono text-brand font-bold text-xs">{row.table}</td>
                                            <td className="px-4 py-2 text-right text-success font-medium text-xs">{row.inserts.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right text-warning font-medium text-xs">{row.updates.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right text-danger font-medium text-xs">{row.deletes.toLocaleString()}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex h-2 rounded-full overflow-hidden bg-surface-2 w-28">
                                                    <div className="bg-success w-[var(--pct)]" style={{ '--pct': `${iPct}%` }} />
                                                    <div className="bg-warning w-[var(--pct)]" style={{ '--pct': `${uPct}%` }} />
                                                    <div className="bg-danger w-[var(--pct)]" style={{ '--pct': `${dPct}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            */}

            {/*
            {run.errorMessage && (
                <div className={`p-4 rounded-xl border ${run.status === 'Failed' ? 'bg-danger/5 border-danger/20' : 'bg-warning/5 border-warning/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className={run.status === 'Failed' ? 'text-danger' : 'text-warning'} />
                        <span className={`text-xs font-bold uppercase ${run.status === 'Failed' ? 'text-danger' : 'text-warning'}`}>
                            {run.status === 'Failed' ? 'Error' : 'Warning'}
                        </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${run.status === 'Failed' ? 'text-danger' : 'text-warning'}`}>{run.errorMessage}</p>
                </div>
            )}
            */}
        </div>
    );
}
