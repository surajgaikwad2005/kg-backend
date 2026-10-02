'use client';
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Clock, RotateCcw, X, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
    derivePipelineProgress,
    fileCaption,
    isIndeterminate,
    statusPresentation,
} from './pipelineRun.utils';

/**
 * One stage's live progress. Rendered by BOTH the expanded run modal and its
 * minimized dock — `compact` is the only difference between the two, so the
 * statuses, progress maths, and cancel/retry affordances can never drift apart.
 *
 * Progress comes from the server (`progress_percent`, or a weighted roll-up of
 * `stages[]`). When the server reports nothing measurable the bar animates as an
 * indeterminate stripe rather than showing an invented number.
 */
function StatusIcon({ status, size = 12 }) {
    if (status === 'completed') return <CheckCircle2 size={size} className="text-success" />;
    if (status === 'failed') return <AlertTriangle size={size} className="text-danger" />;
    if (status === 'cancelled') return <XCircle size={size} className="text-text-muted" />;
    if (status === 'partial' || status === 'interrupted') return <AlertTriangle size={size} className="text-warning" />;
    if (status === 'running') return <Activity size={size} className="text-brand animate-pulse" />;
    return <Clock size={size} className="text-warning" />;
}

export function PipelineRunRow({
    label,
    icon,
    run,
    compact = false,
    onCancel,
    onRetry,
    isCancelling = false,
    isRetrying = false,
    className,
}) {
    const status = run?.status ?? 'idle';
    const presentation = statusPresentation(status);
    const percent = useMemo(() => derivePipelineProgress(run), [run]);
    const indeterminate = useMemo(() => isIndeterminate(run), [run]);
    const files = useMemo(() => fileCaption(run), [run]);

    const isActive = status === 'running' || status === 'queued';
    // currentLabel is the human phrase the backend sends for the active phase
    // ("Extracting documents"); currentStage is its raw key ("extract"), kept
    // as the fallback for a job that hasn't reported a label yet.
    const stageDetail = run?.currentLabel || (run?.currentStage ? `Stage: ${run.currentStage}` : null);
    const detail = run?.currentItem || stageDetail;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className={cn(
                'bg-surface-2/50 border border-border/50 rounded-xl transition-colors shadow-sm hover:border-brand/30',
                compact ? 'p-3' : 'p-4',
                className,
            )}
        >
            <div className={cn('flex items-center justify-between gap-3', compact ? 'mb-2' : 'mb-3')}>
                <span className={cn(
                    'font-bold text-text-primary flex items-center gap-2.5 min-w-0',
                    compact ? 'text-caption' : 'text-body-sm',
                )}>
                    {icon && (
                        <span className={cn(
                            'rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 shadow-sm',
                            compact ? 'w-6 h-6 text-[9px]' : 'w-7 h-7 text-[10px]',
                        )}>
                            {icon}
                        </span>
                    )}
                    <span className="truncate">{label}</span>
                </span>

                <div className="flex items-center gap-2 shrink-0">
                    {percent !== null && isActive && (
                        <span className="text-caption font-bold text-text-muted tabular-nums">{percent}%</span>
                    )}
                    <div className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest',
                        'bg-surface border border-border/50 shadow-sm',
                        presentation.text,
                    )}>
                        <StatusIcon status={status} size={compact ? 11 : 12} />
                        {presentation.label}
                    </div>

                    {isActive && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isCancelling}
                            aria-busy={isCancelling}
                            aria-label={`Cancel ${label}`}
                            title="Cancel this stage"
                            className={cn(
                                'p-1.5 rounded-md text-text-muted transition-all cursor-pointer',
                                'hover:bg-danger/10 hover:text-danger',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40',
                                isCancelling && 'opacity-50 cursor-not-allowed',
                            )}
                        >
                            <X size={compact ? 12 : 13} />
                        </button>
                    )}

                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            disabled={isRetrying}
                            aria-busy={isRetrying}
                            aria-label={`Retry ${label}`}
                            title="Retry the files that did not succeed"
                            className={cn(
                                'p-1.5 rounded-md text-text-muted transition-all cursor-pointer',
                                'hover:bg-brand/10 hover:text-brand',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                                isRetrying && 'opacity-50 cursor-not-allowed',
                            )}
                        >
                            <RotateCcw size={compact ? 12 : 13} />
                        </button>
                    )}
                </div>
            </div>

            <div className={cn(
                'relative w-full bg-surface border border-border/30 rounded-full overflow-hidden shadow-inner',
                compact ? 'h-1.5' : 'h-2',
            )}>
                {indeterminate ? (
                    // No measurable progress from the server — show motion, not a number.
                    <motion.div
                        className={cn('absolute top-0 h-full w-1/3 rounded-full', presentation.bar)}
                        animate={{ x: ['-100%', '300%'] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ) : (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent ?? 0}%` }}
                        transition={{ duration: 0.8, type: 'spring', bounce: 0 }}
                        className={cn('absolute top-0 left-0 h-full rounded-full', presentation.bar)}
                    />
                )}
            </div>

            {(files || detail) && (
                <p className="mt-2 text-caption text-text-subtle truncate">
                    {[detail, files].filter(Boolean).join(' · ')}
                </p>
            )}

            <AnimatePresence>
                {(status === 'failed' || status === 'partial') && run?.error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-2.5 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-2 overflow-hidden"
                    >
                        <AlertTriangle size={14} className="text-danger shrink-0 mt-0.5" />
                        <p className="text-caption text-danger/90 font-mono leading-relaxed wrap-break-word whitespace-pre-wrap max-h-28 overflow-y-auto thin-scrollbar pr-1 min-w-0">
                            {typeof run.error === 'string' ? run.error : run.error?.message || 'Pipeline failed'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
