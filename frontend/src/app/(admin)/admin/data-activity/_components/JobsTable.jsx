'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, History, X, CheckCircle2, Activity, AlertTriangle, RotateCcw, Clock } from 'lucide-react';
import { statusBadgeCls, statusIconCls, intervalToHuman, cronToInterval } from './activityUtils';
import { ExecutionBars } from './ExecutionBars';
import { RunDetailPanel } from './RunDetailPanel';

const TABLE_HEADERS = ['', 'Job ID', 'Labels', 'Namespace', 'Last Run', 'Status', 'Run History', 'Trigger', 'History'];

const STATUS_ICON = { Success: CheckCircle2, Failed: X, Running: Activity, Warning: AlertTriangle };

export function JobsTable({ filteredJobs, lastRefreshed, realJobs, expandedJobId, setExpandedJobId, showHistoryFor, setShowHistoryFor }) {
    const timeAgo = () => {
        const diff = Math.round((Date.now() - lastRefreshed.getTime()) / 1000);
        if (diff < 5) return 'just now';
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return lastRefreshed.toLocaleTimeString();
    };

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2">
                <div className="flex items-center gap-4">
                    <h4 className="text-sm font-bold text-text-primary">Pipeline Jobs</h4>
                    <span className="px-2 py-0.5 bg-brand/10 text-brand text-label font-bold rounded-full border border-brand/20">
                        {filteredJobs.length} Jobs
                    </span>
                </div>
                <div className="text-label text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} />Last refreshed: {timeAgo()}
                    {realJobs === null && <span className="ml-1 text-warning">(no data)</span>}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-2/40 text-label font-bold text-text-muted uppercase tracking-widest border-b border-border">
                            {TABLE_HEADERS.map((h, i) => (
                                <th key={h || 'th-chevron'} className={`px-4 py-4 ${i === TABLE_HEADERS.length - 1 ? 'text-right' : ''}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-xs text-text-secondary">
                        {filteredJobs.length > 0 ? filteredJobs.map((job) => {
                            const latestRun = job.runs[0];
                            const isExpanded = expandedJobId === job.jobId;
                            const isHistoryVisible = showHistoryFor === job.jobId;
                            const StatusIcon = latestRun ? (STATUS_ICON[latestRun.status] ?? Activity) : null;

                            return (
                                <React.Fragment key={job.jobId}>
                                    <tr onClick={() => { setExpandedJobId(isExpanded ? null : job.jobId); if (isExpanded) setShowHistoryFor(null); }}
                                        className={`border-b border-border/50 hover:bg-surface-2 transition-colors cursor-pointer ${isExpanded ? 'bg-surface-2' : ''}`}>
                                        <td className="px-4 py-4">
                                            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                                                <ChevronRight size={14} className="text-text-muted" />
                                            </motion.div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-brand">{job.jobId}</div>
                                            <div className="text-label text-text-muted">{job.source}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {job.labels.map((label) => (
                                                    <span key={label} className="px-2 py-0.5 bg-brand/10 text-brand text-label font-bold rounded border border-brand/20">
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-text-muted">{job.namespace}</td>
                                        <td className="px-4 py-4 font-mono text-label text-text-muted">{latestRun?.executedAt ?? '—'}</td>
                                        <td className="px-4 py-4">
                                            {latestRun ? (
                                                <span className={`px-3 py-1 text-label font-bold rounded-lg border ${statusBadgeCls(latestRun.status)}`}>
                                                    {latestRun.status.toUpperCase()}
                                                </span>
                                            ) : <span className="text-text-muted italic">No runs</span>}
                                        </td>
                                        <td className="px-4 py-4"><ExecutionBars runs={job.runs} /></td>
                                        <td className="px-4 py-4">
                                            <div className="text-xs font-semibold text-text-primary">{intervalToHuman(cronToInterval(job.schedule, job.trigger), job.trigger)}</div>
                                            <div className="text-label text-text-muted mt-0.5 uppercase tracking-widest">{job.trigger}</div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button onClick={(e) => { e.stopPropagation(); setShowHistoryFor(isHistoryVisible ? null : job.jobId); }}
                                                className={`px-3 py-1.5 rounded-lg text-label font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${isHistoryVisible ? 'bg-brand/10 text-brand border-brand/30' : 'bg-surface-2 text-text-muted border-border hover:bg-border/40 hover:text-text-primary'}`}>
                                                <History size={12} />{job.runs.length}
                                            </button>
                                        </td>
                                    </tr>

                                    <AnimatePresence>
                                        {isHistoryVisible && (
                                            <tr>
                                                <td colSpan={9} className="p-0">
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                                        <div className="px-8 py-4 bg-surface-2/30 border-b border-border">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                                    <History size={14} />All Runs — {job.jobId}
                                                                </h4>
                                                                <button onClick={(e) => { e.stopPropagation(); setShowHistoryFor(null); }} aria-label="Close history"
                                                                    className="p-1 text-text-muted hover:text-text-primary rounded transition-colors cursor-pointer"><X size={14} /></button>
                                                            </div>
                                                            <div className="bg-surface-2/60 border border-border rounded-xl overflow-hidden">
                                                                <table className="w-full text-left text-xs">
                                                                    <thead>
                                                                        <tr className="text-label font-bold text-text-muted uppercase tracking-widest border-b border-border bg-surface-2">
                                                                            {['Run ID', 'Executed At', 'Status', 'Records', 'Inserts', 'Updates', 'Deletes', 'Duration', 'Time Window'].map(h => (
                                                                                <th key={h} className="px-4 py-3">{h}</th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-text-secondary">
                                                                        {job.runs.map((r, i) => (
                                                                            <tr key={r.id} className={`border-b border-border/50 ${i === 0 ? 'bg-brand/5' : 'hover:bg-surface-2'}`}>
                                                                                <td className="px-4 py-3 font-mono font-bold text-brand">
                                                                                    {r.id}
                                                                                    {i === 0 && <span className="ml-2 text-2xs bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20">LATEST</span>}
                                                                                </td>
                                                                                <td className="px-4 py-3 font-mono text-label text-text-muted">{r.executedAt}</td>
                                                                                <td className="px-4 py-3"><span className={`px-2 py-0.5 text-label font-bold rounded-lg border ${statusBadgeCls(r.status)}`}>{r.status.toUpperCase()}</span></td>
                                                                                <td className="px-4 py-3 text-text-muted">{r.totalRecords.toLocaleString()}</td>
                                                                                <td className="px-4 py-3 text-success">{r.inserts.toLocaleString()}</td>
                                                                                <td className="px-4 py-3 text-warning">{r.updates.toLocaleString()}</td>
                                                                                <td className="px-4 py-3 text-danger">{r.deletes.toLocaleString()}</td>
                                                                                <td className="px-4 py-3 text-text-muted">{r.duration}</td>
                                                                                <td className="px-4 py-3 text-text-muted">{r.timeWindow}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                        {isExpanded && latestRun && (
                                            <tr>
                                                <td colSpan={9} className="p-0">
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                                                        <div className="px-8 py-6 bg-surface-2/40 border-b border-border space-y-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusIconCls(latestRun.status)}`}>
                                                                        {StatusIcon && <StatusIcon size={16} />}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-text-primary">Latest Run — {latestRun.id}</h4>
                                                                        <p className="text-label text-text-muted">{latestRun.executedAt} · Duration: {latestRun.duration}</p>
                                                                    </div>
                                                                </div>
                                                                {/* <button onClick={(e) => e.stopPropagation()}
                                                                    className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer">
                                                                    <RotateCcw size={14} />Re-run
                                                                </button> */}
                                                            </div>
                                                            <RunDetailPanel run={latestRun} job={job} />
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            );
                        }) : (
                            <tr>
                                <td colSpan={9} className="px-6 py-20 text-center text-text-muted italic">
                                    No jobs found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
