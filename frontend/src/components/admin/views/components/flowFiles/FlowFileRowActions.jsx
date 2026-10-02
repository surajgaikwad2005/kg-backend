'use client';

/**
 * FlowFileRowActions — the per-file reprocess / delete controls.
 *
 * Presentational only: it raises intent and renders pending state, but owns no
 * mutation and no dialog. The panel keeps ONE confirm dialog for the whole
 * grid rather than mounting one per row — a dialog per row would put N copies
 * of the same modal in the tree for a list that can run to hundreds of files.
 */
import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { isRowBusy } from './flowFilePresentation';

const ICON_BUTTON = [
    'inline-flex items-center justify-center h-7 w-7 rounded-(--do-radius)',
    'border border-transparent transition-all duration-200 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
].join(' ');

export function FlowFileRowActions({ file, onReprocess, onDelete, pendingAction }) {
    // A file the worker is actively writing must not be reset or deleted —
    // both race the pipeline for the same row.
    const busy = isRowBusy(file);
    const isResetting = pendingAction === 'reset';
    const isDeleting = pendingAction === 'delete';
    const anyPending = isResetting || isDeleting;

    const disabledReason = busy
        ? 'Unavailable while this file is being processed'
        : null;

    return (
        <div className="flex items-center justify-end gap-1">
            <Tooltip label={disabledReason || 'Reset this file so the pipeline reprocesses it'} side="top">
                <button
                    type="button"
                    onClick={() => onReprocess(file)}
                    disabled={busy || anyPending}
                    aria-busy={isResetting}
                    aria-label={`Reprocess ${file.file_name || `file ${file.flow_uid}`}`}
                    className={cn(
                        ICON_BUTTON,
                        'text-text-muted hover:text-brand hover:bg-brand/10 hover:border-brand/20',
                        'focus-visible:ring-brand/50',
                    )}
                >
                    <RotateCcw size={14} className={cn(isResetting && 'animate-spin')} aria-hidden="true" />
                </button>
            </Tooltip>

            <Tooltip label={disabledReason || 'Remove this file from the flow'} side="top">
                <button
                    type="button"
                    onClick={() => onDelete(file)}
                    disabled={busy || anyPending}
                    aria-busy={isDeleting}
                    aria-label={`Delete ${file.file_name || `file ${file.flow_uid}`}`}
                    className={cn(
                        ICON_BUTTON,
                        'text-text-muted hover:text-danger hover:bg-danger/10 hover:border-danger/20',
                        'focus-visible:ring-danger/50',
                    )}
                >
                    <Trash2 size={14} className={cn(isDeleting && 'animate-pulse')} aria-hidden="true" />
                </button>
            </Tooltip>
        </div>
    );
}
