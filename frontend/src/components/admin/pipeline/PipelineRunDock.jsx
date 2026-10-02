'use client';
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Maximize2, Server } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAdminNav } from '@/src/components/admin/AdminPanelContext';
import { PipelineRunRow } from './PipelineRunRow';
import { usePipelineRunView } from './usePipelineRunView';

/**
 * The minimized form of the run modal, docked under the Data Configuration
 * heading. Renders only while a run is minimized — the run itself keeps polling
 * either way (the poller lives in usePipelineRuns, in the layout-level provider),
 * so minimizing is purely a presentation change and never pauses the pipeline.
 *
 * Collapsed by default to a single summary bar; expanding it in place shows the
 * same per-stage rows the modal does, via the shared PipelineRunRow.
 */
export function PipelineRunDock() {
    const { multiPipelineOpen, multiPipelineMinimized, setMultiPipelineMinimized, setMultiPipelineOpen } = useAdminNav();
    const [expanded, setExpanded] = useState(false);
    const {
        activeRows, allDone, anyRunning, overallPercent, doneCount,
        requestCancel, requestRetry, canRetryStage, isCancelling, isRetrying,
    } = usePipelineRunView();

    const restore = useCallback(() => {
        setMultiPipelineMinimized(false);
        setMultiPipelineOpen(true);
    }, [setMultiPipelineMinimized, setMultiPipelineOpen]);

    // Dock whenever a run exists but isn't on screen as a modal — either the user
    // minimized it, or usePipelineRuns re-attached to a run that was still in
    // flight when the page reloaded (both modal flags reset on mount). Without
    // the second case a resumed run would poll invisibly.
    const shouldDock = multiPipelineMinimized || (anyRunning && !multiPipelineOpen);
    if (!shouldDock || activeRows.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            aria-label="Pipeline run progress"
            className="overflow-hidden rounded-2xl border border-brand/25 bg-brand/5 shadow-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="relative w-9 h-9 shrink-0 rounded-xl bg-surface border border-brand/20 flex items-center justify-center shadow-sm">
                        <Server size={16} className={cn('text-brand', anyRunning && 'animate-pulse')} />
                    </span>

                    <div className="min-w-0">
                        <p className="text-body-sm font-bold text-text-primary truncate">
                            {allDone ? 'Pipelines finished' : 'Running data pipelines'}
                            {overallPercent !== null && !allDone && (
                                <span className="ml-2 font-extrabold text-brand tabular-nums">{overallPercent}%</span>
                            )}
                        </p>
                        <p className="text-caption text-text-muted truncate">
                            {doneCount} of {activeRows.length} stage{activeRows.length === 1 ? '' : 's'} complete
                            {allDone ? ' — review the results to continue' : ' — this keeps running in the background'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setExpanded(v => !v)}
                        aria-expanded={expanded}
                        aria-label={expanded ? 'Hide stage details' : 'Show stage details'}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-label font-bold text-text-secondary bg-surface border border-border hover:border-border-strong hover:text-text-primary transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {expanded ? 'Hide' : 'Details'}
                    </button>
                    <button
                        type="button"
                        onClick={restore}
                        aria-label="Expand pipeline run to full view"
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-label font-bold text-brand bg-brand/10 border border-brand/25 hover:bg-brand/15 hover:border-brand/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                        <Maximize2 size={13} />
                        Expand
                    </button>
                </div>
            </div>

            {/* Slim batch-level bar, always visible while collapsed. */}
            {!expanded && !allDone && (
                <div className="relative h-1 w-full bg-surface/60 overflow-hidden">
                    {overallPercent === null ? (
                        <motion.div
                            className="absolute top-0 h-full w-1/3 bg-brand/70"
                            animate={{ x: ['-100%', '300%'] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    ) : (
                        <motion.div
                            animate={{ width: `${overallPercent}%` }}
                            transition={{ duration: 0.6, type: 'spring', bounce: 0 }}
                            className="absolute top-0 left-0 h-full bg-brand"
                        />
                    )}
                </div>
            )}

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                    >
                        <div className="grid gap-2.5 p-3.5 pt-0 sm:grid-cols-2">
                            {activeRows.map(({ key, label, icon, run }) => (
                                <PipelineRunRow
                                    key={key}
                                    label={label}
                                    icon={icon}
                                    run={run}
                                    compact
                                    onCancel={() => requestCancel(key, label)}
                                    onRetry={canRetryStage(key) ? () => requestRetry(key) : undefined}
                                    isCancelling={isCancelling}
                                    isRetrying={isRetrying}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}
