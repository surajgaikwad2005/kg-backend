'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { ChevronRight, AlertTriangle, RotateCw, WifiOff } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ScoreRing, ShimmerBlock } from '@/src/components/admin/dataquality/DataQualityParts';
import { DataQualityModal } from '@/src/components/admin/dataquality/DataQualityModal';
import { toSummaryCards, scoreTone, fmtInt } from '@/src/components/admin/dataquality/qualityUtils';
import { useDataQuality } from '@/src/components/admin/_queries/useDsiQueries';

export function DataQualitySummary({ plantCode }) {
    const [open, setOpen] = useState(false);

    const query = useDataQuality(plantCode);

    // This component already had a proper loading/error/empty/ready state
    // machine — the best-behaved consumer in the DSI area — so the migration
    // preserves those four states exactly and only changes where they come from.
    // `isFetching && data` is the refresh case: keep the report on screen and
    // spin the button rather than dropping back to the shimmer.
    const state = useMemo(() => {
        if (!plantCode) return { status: 'empty', data: null };
        if (query.isLoading) return { status: 'loading', data: null };
        if (query.isError) return { status: 'error', data: null, message: query.error?.message };
        if (query.data && typeof query.data.quality_score === 'number') {
            return { status: 'ready', data: query.data };
        }
        return { status: 'empty', data: null };
    }, [plantCode, query.isLoading, query.isError, query.error, query.data]);

    const refreshing = query.isFetching && !query.isLoading;
    const load = useCallback(() => { query.refetch(); }, [query]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (state.status === 'loading') {
        return (
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                <ShimmerBlock className="h-16 w-16 rounded-full shrink-0" style={{ '--sk-delay': '0s' }} />
                <div className="flex-1 space-y-2 min-w-0">
                    <ShimmerBlock className="h-3.5 w-32" style={{ '--sk-delay': '0.1s' }} />
                    <ShimmerBlock className="h-3 w-48" style={{ '--sk-delay': '0.2s' }} />
                    <div className="flex gap-2 pt-1">
                        <ShimmerBlock className="h-2.5 w-20" style={{ '--sk-delay': '0.3s' }} />
                        <ShimmerBlock className="h-2.5 w-16" style={{ '--sk-delay': '0.35s' }} />
                        <ShimmerBlock className="h-2.5 w-24" style={{ '--sk-delay': '0.4s' }} />
                    </div>
                </div>
                <ShimmerBlock className="h-3 w-20 shrink-0" style={{ '--sk-delay': '0.15s' }} />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (state.status === 'error') {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4">
                <AlertTriangle size={18} className="text-danger shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary">Couldn't load data quality</p>
                    <p className="text-xs text-text-muted truncate">{state.message || 'The analysis service is unreachable.'}</p>
                </div>
                <button
                    type="button" onClick={() => load()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-danger border border-danger/20 hover:bg-danger/20 transition-all cursor-pointer"
                >
                    <RotateCw size={13} /> Retry
                </button>
            </div>
        );
    }

    // ── Empty ─────────────────────────────────────────────────────────────────
    if (state.status === 'empty') {
        return (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <p className="text-sm text-text-muted">No data-quality analysis available yet for this dataset.</p>
                <button
                    type="button" onClick={() => load()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary border border-border hover:bg-surface-2 transition-all cursor-pointer"
                >
                    <RotateCw size={13} /> Refresh
                </button>
            </div>
        );
    }

    // ── Ready ─────────────────────────────────────────────────────────────────
    const { data } = state;
    const cards = toSummaryCards(data.checks_summary);
    const flagged = cards.filter((c) => c.status === 'FAIL' || c.affectedPct > 0).length;
    const tone = scoreTone(data.quality_score);

    return (
        <>
            <button
                type="button" onClick={() => setOpen(true)}
                className={cn(
                    'group flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left',
                    'transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
                    tone.border,
                )}
            >
                <ScoreRing value={data.quality_score} size={72} stroke={7} label="Score" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-text-primary">Data Quality</h4>
                        <span className={cn('text-label font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', tone.bg, tone.text)}>
                            {data.quality_score >= 80 ? 'Healthy' : data.quality_score >= 60 ? 'Fair' : 'Poor'}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                        <span className={cn('font-bold', flagged ? 'text-warning' : 'text-success')}>{flagged}</span>
                        {` of ${cards.length} checks flagged · `}
                        <span className="font-semibold text-text-secondary">{fmtInt(data.sensor_count?.numeric)}</span>
                        {' numeric sensors'}
                    </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-brand shrink-0">
                    View details
                    <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
            </button>

            <DataQualityModal
                isOpen={open}
                onClose={() => setOpen(false)}
                data={data}
                runAt={data.run_at}
                onRefresh={() => load(true)}
                refreshing={refreshing}
            />
        </>
    );
}
