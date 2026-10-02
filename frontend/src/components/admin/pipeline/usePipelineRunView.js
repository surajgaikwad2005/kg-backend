'use client';

/**
 * usePipelineRunView — everything the expanded run modal and the minimized dock
 * both need: which stages are in play, how far along the whole batch is, and the
 * cancel/retry handlers.
 *
 * Shared so the two surfaces can't disagree. The modal adds the Continue button
 * and the dock adds the restore button; nothing else differs.
 */
import { useCallback, useMemo } from 'react';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { isTerminalPipelineStatus, isRetryablePipelineStatus } from '@/src/services/domain-configuration/common';
import { PIPELINE_ROWS, derivePipelineProgress } from './pipelineRun.utils';

export function usePipelineRunView() {
    const {
        pipelineStatuses, cancelRun, retryRun, setDeleteConfirm,
        isCancelling, isRetrying,
    } = useAdminEntities();

    /** Stages this batch actually triggered — 'idle' ones were never part of it. */
    const activeRows = useMemo(
        () => PIPELINE_ROWS
            .filter(r => pipelineStatuses[r.key]?.status && pipelineStatuses[r.key].status !== 'idle')
            .map(r => ({ ...r, run: pipelineStatuses[r.key] })),
        [pipelineStatuses]
    );

    const allDone = useMemo(
        () => activeRows.length > 0 && activeRows.every(r => isTerminalPipelineStatus(r.run.status)),
        [activeRows]
    );

    const anyRunning = useMemo(
        () => activeRows.some(r => r.run.status === 'running' || r.run.status === 'queued'),
        [activeRows]
    );

    /**
     * Batch-level percentage: the mean of each stage's own progress, with a
     * terminal stage counted as finished. null when nothing is measurable yet, so
     * callers can fall back to an indeterminate presentation.
     */
    const overallPercent = useMemo(() => {
        if (activeRows.length === 0) return null;
        let sum = 0;
        let counted = 0;
        for (const { run } of activeRows) {
            if (isTerminalPipelineStatus(run.status)) { sum += 100; counted += 1; continue; }
            const pct = derivePipelineProgress(run);
            if (pct !== null) { sum += pct; counted += 1; }
        }
        return counted === 0 ? null : Math.round(sum / counted);
    }, [activeRows]);

    const doneCount = useMemo(
        () => activeRows.filter(r => isTerminalPipelineStatus(r.run.status)).length,
        [activeRows]
    );

    /**
     * Cancelling kills a running extraction, so it always goes through the shared
     * confirm dialog (already mounted via AdminModals) rather than firing on the
     * first click.
     */
    const requestCancel = useCallback((stage, label) => {
        setDeleteConfirm({
            open: true,
            title: `Cancel ${label}?`,
            message: 'This stops the running pipeline process and any AI extraction it started. Work already written stays, but the stage will need to be re-run to finish. Continue?',
            confirmLabel: 'Cancel Pipeline',
            cancelLabel: 'Keep Running',
            intent: 'danger',
            onConfirm: () => {
                setDeleteConfirm(prev => ({ ...prev, open: false }));
                void cancelRun(stage);
            },
        });
    }, [setDeleteConfirm, cancelRun]);

    const requestRetry = useCallback((stage) => { void retryRun(stage, 'failed_only'); }, [retryRun]);

    const canRetryStage = useCallback(
        (stage) => isRetryablePipelineStatus(pipelineStatuses[stage]?.status),
        [pipelineStatuses]
    );

    return {
        activeRows, allDone, anyRunning, overallPercent, doneCount,
        requestCancel, requestRetry, canRetryStage,
        isCancelling, isRetrying,
    };
}
