'use client';
import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';

/**
 * FileLabelSelect — the per-file use-case label picker used by every connector
 * upload modal (documents, SAP, timeseries, and the AIF/GLOC/LOPC feeds).
 *
 * Purely presentational and fully controlled: the options, loading and error
 * states are passed in by whoever owns the `useConnectorLabels` query, so the
 * same component works anywhere and the query stays deduped across the dozens
 * of rows a batch upload can render.
 *
 * Three states, because the vocabulary is remote (there is no hardcoded
 * fallback list any more):
 *   loading → shimmer skeleton matching the trigger's size
 *   error   → inline retry, since a failed vocabulary blocks the upload
 *   ready   → multi-select with search + a colour dot per label
 */
export function FileLabelSelect({
    value,
    onChange,
    options,
    isLoading = false,
    isError = false,
    onRetry,
    fileName,
    disabled = false,
    className = '',
    triggerClassName = 'h-8 py-1 text-xs bg-surface',
    placeholder = 'Select label(s)…',
}) {
    if (isLoading) {
        return <Skeleton className="h-8 w-full rounded-xl" />;
    }

    if (isError) {
        return (
            <button
                type="button"
                onClick={onRetry}
                aria-label="Retry loading labels"
                className="flex items-center gap-1.5 w-full h-8 px-2.5 rounded-xl border border-danger/40 bg-danger/5 text-danger text-[11px] font-bold hover:bg-danger/10 transition-colors cursor-pointer"
            >
                <AlertCircle size={12} className="shrink-0" />
                <span className="truncate flex-1 text-left">Labels unavailable</span>
                <RotateCcw size={12} className="shrink-0" />
            </button>
        );
    }

    return (
        <Select
            value={value || []}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            ariaLabel={fileName ? `Labels for ${fileName}` : 'File labels'}
            size="sm"
            searchable
            multiple
            disabled={disabled}
            searchPlaceholder="Search…"
            emptyMessage="No labels found"
            className={cn('text-xs', className)}
            triggerClassName={triggerClassName}
        />
    );
}
