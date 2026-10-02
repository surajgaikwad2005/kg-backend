'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Modal } from '@/src/components/ui/Modal';
import { ScoreRing, MiniBar, StatusPill, StatCard, FindingsTable, ShimmerBlock } from '@/src/components/admin/dataquality/DataQualityParts';
import {
    toSummaryCards, checkTone, fmtInt, fmtDuration, fmtDateTime,
    FINDING_SECTIONS,
} from '@/src/components/admin/dataquality/qualityUtils';

// ── CheckCard (one entry in the quality-checks grid) ──────────────────────────
function CheckCard({ card }) {
    const tone = checkTone({ affectedPct: card.affectedPct, status: card.status });
    return (
        <div className={cn('rounded-xl border bg-surface p-3.5 space-y-2', tone.border)}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{card.label}</p>
                    <p className="text-label text-text-subtle truncate">{card.desc}</p>
                </div>
                <StatusPill status={card.status} />
            </div>
            <p className="text-caption font-semibold text-text-secondary tabular-nums">
                {card.metric}
                {card.extra != null && <span className="text-text-subtle"> · {fmtInt(card.extra)} spikes</span>}
            </p>
            <MiniBar pct={card.affectedPct} />
        </div>
    );
}

// ── Refresh skeleton overlay ──────────────────────────────────────────────────
function RefreshSkeleton() {
    return (
        <div className="space-y-7">
            {/* Hero skeleton */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <ShimmerBlock className="h-33 w-33 rounded-full shrink-0" style={{ '--sk-delay': '0s' }} />
                <div className="flex-1 w-full space-y-3">
                    <ShimmerBlock className="h-4 w-56" style={{ '--sk-delay': '0.05s' }} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        {[0, 0.1, 0.2, 0.3].map((d, i) => (
                            <ShimmerBlock key={i} className="h-16 rounded-xl" style={{ '--sk-delay': `${d}s` }} />
                        ))}
                    </div>
                </div>
            </div>
            {/* Checks grid skeleton */}
            <div className="space-y-3">
                <ShimmerBlock className="h-3 w-28" style={{ '--sk-delay': '0.1s' }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[0, 0.07, 0.14, 0.21, 0.28, 0.35].map((d, i) => (
                        <ShimmerBlock key={i} className="h-24 rounded-xl" style={{ '--sk-delay': `${d}s` }} />
                    ))}
                </div>
            </div>
            {/* Findings skeleton */}
            <div className="space-y-3">
                <ShimmerBlock className="h-3 w-20" style={{ '--sk-delay': '0.2s' }} />
                <ShimmerBlock className="h-48 rounded-xl" style={{ '--sk-delay': '0.25s' }} />
            </div>
        </div>
    );
}

// ── DataQualityModal ──────────────────────────────────────────────────────────
export function DataQualityModal({ isOpen, onClose, data, runAt, onRefresh, refreshing }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        if (isOpen) {
            document.addEventListener('keydown', onKey);
            return () => document.removeEventListener('keydown', onKey);
        }
    }, [isOpen, onClose]);

    const overview = data?.dataset_overview || {};
    const sensors = data?.sensor_count || {};
    const summaryCards = data ? toSummaryCards(data.checks_summary) : [];
    const flagged = summaryCards.filter((c) => c.status === 'FAIL' || c.affectedPct > 0).length;
    const sections = FINDING_SECTIONS
        .map((s) => ({ ...s, rows: Array.isArray(data?.[s.dataKey]) ? data[s.dataKey] : [] }))
        .filter((s) => s.rows.length > 0);

    return (
        <Modal open={Boolean(isOpen && data)} onClose={onClose} size="full" className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center">
                                    <Activity size={20} className="text-brand" />
                                </div>
                                <div>
                                    <h3 id="dq-title" className="text-base font-extrabold text-text-primary">Data Quality Analysis</h3>
                                    <p className="text-label text-text-subtle">
                                        {runAt ? `Last run ${fmtDateTime(runAt)}` : 'Timeseries health report'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {onRefresh && (
                                    <button
                                        type="button" onClick={onRefresh} disabled={refreshing}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary border border-border hover:bg-surface-2 hover:text-text-primary transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <RefreshCw size={13} className={cn(refreshing && 'animate-spin')} />
                                        {refreshing ? 'Analyzing…' : 'Re-run'}
                                    </button>
                                )}
                                <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-lg text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto px-6 py-5 thin-scrollbar">
                            <AnimatePresence mode="wait">
                                {refreshing ? (
                                    <motion.div
                                        key="skeleton"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <RefreshSkeleton />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-7"
                                    >
                                        {/* Hero: score + dataset overview */}
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <ScoreRing value={data.quality_score} />
                                            <div className="flex-1 w-full space-y-3">
                                                <p className="text-sm text-text-secondary">
                                                    <span className="font-bold text-text-primary">{flagged}</span> of{' '}
                                                    <span className="font-bold text-text-primary">{summaryCards.length}</span> checks flagged across{' '}
                                                    <span className="font-bold text-text-primary">{fmtInt(sensors.numeric ?? overview.numeric_sensors)}</span> numeric sensors.
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                                    <StatCard label="Rows" value={fmtInt(overview.rows)} />
                                                    <StatCard label="Sensors" value={fmtInt(sensors.total_signal_columns ?? overview.columns)} sub={`${fmtInt(sensors.numeric ?? overview.numeric_sensors)} numeric · ${fmtInt(sensors.categorical ?? overview.categorical_sensors)} categorical`} />
                                                    <StatCard label="Interval" value={overview.data_interval_minutes != null ? `${overview.data_interval_minutes} min` : '—'} />
                                                    <StatCard label="Duration" value={fmtDuration(overview.duration_minutes)} sub={overview.start_time ? `${fmtDateTime(overview.start_time)} →` : undefined} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quality checks grid */}
                                        <section className="space-y-3">
                                            <h4 className="text-label font-bold uppercase tracking-widest text-text-subtle">Quality Checks</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                                {summaryCards.map((card) => <CheckCard key={card.key} card={card} />)}
                                            </div>
                                        </section>

                                        {/* Findings */}
                                        <section className="space-y-5">
                                            <h4 className="text-label font-bold uppercase tracking-widest text-text-subtle">Findings</h4>
                                            {sections.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                                    <ShieldCheck size={32} className="text-success" />
                                                    <p className="text-sm font-bold text-text-primary">No issues detected</p>
                                                    <p className="text-xs text-text-muted">Every quality check passed for this dataset.</p>
                                                </div>
                                            ) : (
                                                sections.map((section) => (
                                                    <div key={section.key} className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-text-primary">{section.title}</span>
                                                            <span className="text-label font-bold text-text-subtle bg-surface-2 rounded-full px-2 py-0.5">{section.rows.length}</span>
                                                        </div>
                                                        <FindingsTable columns={section.columns} rows={section.rows} defaultStatus={section.defaultStatus} />
                                                    </div>
                                                ))
                                            )}
                                        </section>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
        </Modal>
    );
}
