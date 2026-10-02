'use client';

/**
 * FlowFilesPanel — the per-file grid behind GET /flow/state.
 *
 * The screen's source CARDS are grouped by upload batch; this is the row-level
 * view underneath them: every file the plant has, with its real pipeline stage,
 * and the two per-file actions the backend added on 2026-08-18 (reset →
 * reprocess, delete → remove).
 *
 * ── Where the filtering happens, and why it is split ─────────────────────────
 * `lifecycle` is a SERVER filter and goes in the request: the backend derives
 * it from stage + status, applies it BEFORE pagination, and owns the precedence
 * rule (failed beats processed). Re-deriving it client-side over one page of
 * rows would quietly disagree with the server the moment a plant outgrows a
 * page. `flow` is filtered CLIENT-side instead, because the whole plant already
 * arrives in one payload — spending a request to narrow data we are holding
 * would be strictly worse.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileStack, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { timeAgo } from '@/src/lib/time';
import { Badge } from '@/src/components/ui/Badge';
import { DataTable } from '@/src/components/ui/DataTable';
import { Select } from '@/src/components/ui/Select';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { formatFileSize } from '@/src/components/admin/views/utils/sourceUtils';
import { deriveFileLifecycle, duplicateSourceUid } from '@/src/components/admin/connectorState';
import { useFlowFilesQuery } from '@/src/components/admin/_queries/useFlowFiles';
import { useDeleteFlowState, useResetFlowState } from '@/src/components/admin/_queries/useDsiQueries';
import {
    LIFECYCLE_BADGE, LIFECYCLE_FILTER_OPTIONS, categoryLeaf, flowLabel,
    flowShortLabel, humanizeKey, rowCountLabel, stageLabel,
} from './flowFilePresentation';
import { FlowFileRowActions } from './FlowFileRowActions';
import { FlowFileDetailModal } from './FlowFileDetailModal';
import { ConnectorGroupsSummary } from './ConnectorGroupsSummary';

const ALL_FLOWS_OPTION = 'all';
const CLOSED_CONFIRM = { open: false, mode: null, file: null };

/** Flow options are derived from what the plant actually has, not the full
 *  eight — offering a filter that can only ever return nothing is a dead end. */
function buildFlowOptions(files) {
    const seen = new Map();
    for (const file of files) {
        if (!file?.flow || seen.has(file.flow)) continue;
        seen.set(file.flow, true);
    }
    return [
        { value: ALL_FLOWS_OPTION, label: 'All sources' },
        ...[...seen.keys()].sort().map((flow) => ({ value: flow, label: flowLabel(flow) })),
    ];
}

export function FlowFilesPanel({ plantCode, className }) {
    const [lifecycle, setLifecycle] = useState('all');
    const [flowFilter, setFlowFilter] = useState(ALL_FLOWS_OPTION);
    const [confirm, setConfirm] = useState(CLOSED_CONFIRM);
    // The row whose full 47-field detail is open. Local UI state, never lifted
    // into context (rule 39).
    const [detailFile, setDetailFile] = useState(null);

    // 'all' is the server default, so it is sent as undefined rather than as a
    // literal — fewer query-string permutations means fewer cache entries for
    // what is the same response.
    const query = useFlowFilesQuery(plantCode, {
        lifecycle: lifecycle === 'all' ? undefined : lifecycle,
    });
    const { data, isLoading, isError, error, isFetching, refetch } = query;

    const resetMutation = useResetFlowState(plantCode);
    const deleteMutation = useDeleteFlowState(plantCode);

    const files = data?.files;
    const flowOptions = useMemo(() => buildFlowOptions(files || []), [files]);

    const rows = useMemo(() => {
        const source = flowFilter === ALL_FLOWS_OPTION
            ? (files || [])
            : (data?.filesByFlow?.[flowFilter] || []);
        // DataTable keys off row.id; flow_uid is the stable server primary key,
        // so the list never falls back to an array index (rule 35).
        return source.map((file) => ({ ...file, id: file.flow_uid }));
    }, [files, data, flowFilter]);

    const openReprocess = useCallback((file) => setConfirm({ open: true, mode: 'reset', file }), []);
    const openDelete = useCallback((file) => setConfirm({ open: true, mode: 'delete', file }), []);
    const closeConfirm = useCallback(() => setConfirm(CLOSED_CONFIRM), []);
    const closeDetail = useCallback(() => setDetailFile(null), []);

    const pendingUid = resetMutation.isPending
        ? resetMutation.variables
        : deleteMutation.isPending ? deleteMutation.variables : null;
    const pendingKind = resetMutation.isPending ? 'reset' : deleteMutation.isPending ? 'delete' : null;

    const handleConfirm = useCallback(async () => {
        const { mode, file } = confirm;
        if (!file) return;
        const mutation = mode === 'delete' ? deleteMutation : resetMutation;
        try {
            await mutation.mutateAsync(file.flow_uid);
            closeConfirm();
        } catch {
            // The global MutationCache handler toasts the failure (rule 52);
            // the dialog stays open so the user can retry without re-finding
            // the row in a list that may have just refetched under them.
        }
    }, [confirm, deleteMutation, resetMutation, closeConfirm]);

    const columns = useMemo(() => [
        {
            key: 'file_name',
            label: 'File',
            render: (file) => {
                const leaf = categoryLeaf(file.category);
                const dupOf = duplicateSourceUid(file);
                return (
                    <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate max-w-[22ch] sm:max-w-[34ch]" title={file.file_name}>
                            {file.file_name || `#${file.flow_uid}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            {leaf && (
                                <span className="text-tiny text-text-subtle" title={file.category}>
                                    {humanizeKey(leaf)}
                                </span>
                            )}
                            {dupOf && (
                                <span className="text-tiny text-warning" title={`Duplicate of file #${dupOf}`}>
                                    Duplicate of #{dupOf}
                                </span>
                            )}
                            {(file.labels || []).map((label) => (
                                <span key={label} className="text-tiny text-text-subtle bg-surface-2 rounded px-1.5 py-px">
                                    {humanizeKey(label)}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'flow',
            label: 'Source',
            className: 'hidden sm:table-cell',
            cellClassName: 'hidden sm:table-cell whitespace-nowrap',
            render: (file) => (
                <span className="text-text-secondary" title={flowLabel(file.flow)}>
                    {flowShortLabel(file.flow)}
                </span>
            ),
        },
        {
            key: 'lifecycle',
            label: 'State',
            cellClassName: 'whitespace-nowrap',
            render: (file) => {
                const bucket = deriveFileLifecycle(file);
                const badge = LIFECYCLE_BADGE[bucket];
                return (
                    <div className="flex flex-col items-start gap-1">
                        <Badge variant={badge.variant} pulse={bucket === 'pending'} className="!text-2xs !px-2 !py-0.5">
                            {badge.label}
                        </Badge>
                        <span className="text-tiny text-text-subtle">{stageLabel(file.stage)}</span>
                    </div>
                );
            },
        },
        {
            key: 'row_count',
            label: 'Rows',
            className: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell whitespace-nowrap tabular-nums',
            render: rowCountLabel,
        },
        {
            key: 'size_bytes',
            label: 'Size',
            className: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell whitespace-nowrap tabular-nums',
            render: (file) => (file.size_bytes == null ? '—' : formatFileSize(file.size_bytes)),
        },
        {
            key: 'updated_at',
            label: 'Updated',
            className: 'hidden md:table-cell',
            cellClassName: 'hidden md:table-cell whitespace-nowrap',
            render: (file) => (
                <span title={file.updated_at || ''}>{file.updated_at ? timeAgo(file.updated_at) : '—'}</span>
            ),
        },
        {
            key: 'actions',
            label: '',
            className: 'w-20 text-right',
            cellClassName: 'text-right',
            render: (file) => (
                // Stops the row's own click handler from also opening the
                // detail modal behind the confirm dialog.
                <div onClick={(e) => e.stopPropagation()}>
                    <FlowFileRowActions
                        file={file}
                        onReprocess={openReprocess}
                        onDelete={openDelete}
                        pendingAction={pendingUid === file.flow_uid ? pendingKind : null}
                    />
                </div>
            ),
        },
    ], [openReprocess, openDelete, pendingUid, pendingKind]);

    if (!plantCode) return null;

    const isDeleteMode = confirm.mode === 'delete';
    const confirmFileName = confirm.file?.file_name || `file #${confirm.file?.flow_uid}`;

    return (
        <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn('space-y-3', className)}
        >
            <header className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="flex items-baseline gap-2.5">
                    <h3 className="text-label font-bold text-text-muted uppercase tracking-widest">Files</h3>
                    {!isLoading && (
                        <span className="text-caption text-text-subtle">
                            {rows.length} of {data?.total ?? rows.length} file{(data?.total ?? rows.length) !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div
                        role="tablist"
                        aria-label="Filter files by lifecycle"
                        className="flex items-center gap-0.5 p-0.5 rounded-(--do-radius) bg-surface-2 border border-border"
                    >
                        {LIFECYCLE_FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                role="tab"
                                aria-selected={lifecycle === opt.value}
                                onClick={() => setLifecycle(opt.value)}
                                className={cn(
                                    'px-2.5 py-1 rounded-(--do-radius) text-tiny font-bold uppercase tracking-wider',
                                    'transition-all duration-200 cursor-pointer',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                                    lifecycle === opt.value
                                        ? 'bg-surface text-text-primary shadow-sm'
                                        : 'text-text-subtle hover:text-text-secondary',
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <Select
                        ariaLabel="Filter files by source"
                        value={flowFilter}
                        onChange={setFlowFilter}
                        options={flowOptions}
                        size="sm"
                        className="min-w-40"
                    />

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        aria-busy={isFetching}
                        aria-label="Refresh file list"
                        className={cn(
                            'inline-flex items-center justify-center h-9 w-9 rounded-(--do-radius)',
                            'border border-border bg-surface text-text-muted',
                            'hover:text-text-primary hover:border-border-strong transition-all duration-200 cursor-pointer',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} aria-hidden="true" />
                    </button>
                </div>
            </header>

            {flowFilter !== ALL_FLOWS_OPTION && !isError && (
                <ConnectorGroupsSummary plantCode={plantCode} flow={flowFilter} />
            )}

            {/* Queries render an inline error with a retry control; only mutations
                toast (rule 52). */}
            {isError ? (
                <div className="flex flex-col items-center gap-3 py-12 px-4 text-center rounded-(--do-radius) border border-danger/20 bg-danger/5">
                    <AlertTriangle size={22} className="text-danger" aria-hidden="true" />
                    <div>
                        <p className="text-body-sm font-semibold text-text-primary">Could not load files</p>
                        <p className="text-caption text-text-muted mt-0.5">
                            {error?.message || 'The file list could not be read for this plant.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className={cn(
                            'py-1.5 px-4 rounded-(--do-radius) text-label font-bold',
                            'bg-danger/10 text-danger border border-danger/20',
                            'hover:bg-danger/15 transition-all duration-200 cursor-pointer',
                        )}
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <div className="rounded-(--do-radius) border border-border bg-surface overflow-hidden">
                    {data?.truncated && (
                        <p className="px-4 py-2 text-caption text-warning bg-warning/10 border-b border-warning/20">
                            Showing the first {data.files.length} files — this plant has more than one full page of history.
                        </p>
                    )}
                    <DataTable
                        columns={columns}
                        rows={rows}
                        loading={isLoading}
                        onRowClick={setDetailFile}
                        emptyIcon={<FileStack size={28} aria-hidden="true" />}
                        emptyTitle={lifecycle === 'all' ? 'No files yet' : `No ${lifecycle} files`}
                        emptyDescription={
                            lifecycle === 'all'
                                ? 'Files appear here as soon as a source finishes uploading.'
                                : 'Try a different filter to see the rest of this plant’s files.'
                        }
                    />
                </div>
            )}

            <FlowFileDetailModal
                open={!!detailFile}
                onClose={closeDetail}
                plantCode={plantCode}
                file={detailFile}
            />

            <ConfirmDialog
                open={confirm.open}
                onClose={closeConfirm}
                onConfirm={handleConfirm}
                isPending={resetMutation.isPending || deleteMutation.isPending}
                intent={isDeleteMode ? 'danger' : 'warning'}
                title={isDeleteMode ? 'Delete this file?' : 'Reprocess this file?'}
                confirmLabel={isDeleteMode ? 'Delete' : 'Reprocess'}
                description={
                    isDeleteMode
                        ? `${confirmFileName} will be removed from the flow. Anything already committed to CDM from it stays, but the file will no longer be listed or reprocessable.`
                        : `${confirmFileName} will be reset to Uploaded and picked up by the next pipeline run. Its current extraction results are discarded.`
                }
            />
        </motion.section>
    );
}
