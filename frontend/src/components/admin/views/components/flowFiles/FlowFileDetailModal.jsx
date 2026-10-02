'use client';

/**
 * FlowFileDetailModal — the full row behind GET /flow/state/{flowUid}.
 *
 * The grid shows the seven fields that fit on a line; a file row actually
 * carries 47. This is where the rest live: the error text when something
 * failed, the two job ids that link the file to a pipeline run, the extraction
 * counts, the object-store paths, and the full lifecycle timeline.
 *
 * It deliberately RE-FETCHES the single row rather than reading the one already
 * in the list payload. That is the endpoint's stated purpose — the list may be
 * seconds stale while a worker is advancing this exact file, and a detail view
 * that contradicts itself the moment you open it is worse than one extra
 * request. The list row is used as instant placeholder content so the modal
 * never opens empty.
 */
import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fmtTime } from '@/src/lib/time';
import { Modal, ModalBody } from '@/src/components/ui/Modal';
import { Badge } from '@/src/components/ui/Badge';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { formatFileSize } from '@/src/components/admin/views/utils/sourceUtils';
import { deriveFileLifecycle, duplicateSourceUid } from '@/src/components/admin/connectorState';
import { useFlowStateRow } from '@/src/components/admin/_queries/useDsiQueries';
import { LIFECYCLE_BADGE, flowLabel, humanizeKey, stageLabel } from './flowFilePresentation';

/** Rendered in order; a field whose value resolves to null is skipped entirely
 *  rather than shown as an empty row — 47 fields of mostly "—" is noise. */
const TIMELINE_FIELDS = [
    ['uploaded_at', 'Uploaded'],
    ['processing_started_at', 'Processing started'],
    ['processed_at', 'Extracted'],
    ['reviewed_at', 'Reviewed'],
    ['committed_at', 'Committed'],
    ['last_error_at', 'Last error'],
    ['created_at', 'Row created'],
    ['updated_at', 'Row updated'],
];

const IDENTITY_FIELDS = [
    ['upload_batch_id', 'Upload batch'],
    ['upload_job_id', 'Upload job'],
    ['process_job_id', 'Pipeline job'],
    ['commit_uid', 'Commit'],
    ['content_hash', 'Content hash'],
    ['rustfs_path', 'Storage path'],
    ['processed_parquet', 'Extracted output'],
    ['iotdb_path', 'Time-series path'],
];

const COUNT_FIELDS = [
    ['row_count', 'Rows extracted'],
    ['rows_in', 'Rows read'],
    ['rows_rejected', 'Rows rejected'],
    ['rows_committed', 'Rows committed'],
    ['rows_ingested', 'Rows ingested'],
    ['review_patches', 'Review edits'],
    ['review_deletes', 'Review deletes'],
    ['attempt_count', 'Attempts'],
    ['page_count', 'Pages'],
];

function Field({ label, value, mono }) {
    if (value == null || value === '') return null;
    return (
        <div className="min-w-0">
            <dt className="text-2xs uppercase tracking-wider text-text-subtle">{label}</dt>
            <dd className={cn('text-caption text-text-secondary break-all', mono && 'font-mono')}>{value}</dd>
        </div>
    );
}

function Section({ title, children }) {
    // An entirely-null section renders nothing rather than a bare heading.
    const hasContent = React.Children.toArray(children).some(Boolean);
    if (!hasContent) return null;
    return (
        <section className="space-y-2">
            <h4 className="text-2xs font-bold uppercase tracking-widest text-text-muted">{title}</h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">{children}</dl>
        </section>
    );
}

export function FlowFileDetailModal({ open, onClose, plantCode, file }) {
    const flowUid = file?.flow_uid;

    const { data, isLoading, isError, error } = useFlowStateRow(plantCode, flowUid, { enabled: open });

    // Fresh row wins; the list row stands in until it lands so the modal never
    // opens blank on a slow connection.
    const row = data || file;

    const lifecycle = row ? deriveFileLifecycle(row) : null;
    const badge = lifecycle ? LIFECYCLE_BADGE[lifecycle] : null;
    const dupOf = row ? duplicateSourceUid(row) : null;

    const sheetNames = useMemo(
        () => (Array.isArray(row?.sheet_names) && row.sheet_names.length ? row.sheet_names.join(', ') : null),
        [row],
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={row?.file_name || (flowUid ? `File #${flowUid}` : 'File')}
        >
            <ModalBody className="space-y-6">
                {isError && (
                    <div className="flex items-start gap-2.5 p-3 rounded-(--do-radius) bg-danger/10 border border-danger/20">
                        <AlertTriangle size={15} className="text-danger shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-caption text-text-secondary">
                            {error?.message || 'Could not refresh this file.'}
                            {file ? ' Showing the last known values from the list.' : ''}
                        </p>
                    </div>
                )}

                {!row ? (
                    <div className="space-y-3" aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={`detail-skeleton-${i}`} delay={i * 0.06} className="h-4 w-full" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2">
                            {badge && (
                                <Badge variant={badge.variant} pulse={lifecycle === 'pending'} className="!text-2xs">
                                    {badge.label}
                                </Badge>
                            )}
                            <span className="text-caption text-text-muted">{stageLabel(row.stage)}</span>
                            <span className="text-text-subtle" aria-hidden="true">·</span>
                            <span className="text-caption text-text-muted">{flowLabel(row.flow)}</span>
                            {isLoading && <span className="text-2xs text-text-subtle">Refreshing…</span>}
                        </div>

                        {/* The single most useful field on a failed row, so it
                            is not buried in the field grid below.

                            Two things this has to get right. (1) The backend
                            puts the pipeline's whole log dump in `error`, not a
                            one-line message — hundreds of lines, mostly [INFO].
                            It is capped and scrolls; unbounded it grew the modal
                            past the viewport on its own. (2) `error` is a
                            LEFTOVER once a row moves off `failed` — a reset file
                            reads PENDING while still carrying the previous
                            attempt's text. Presenting that as a live error under
                            a PENDING badge reads as a contradiction, so a
                            non-failed row labels it as history and drops the
                            danger styling. */}
                        {row.error && (() => {
                            const isLive = lifecycle === 'failed';
                            return (
                                <div className={cn(
                                    'p-3 rounded-(--do-radius) border',
                                    isLive ? 'bg-danger/5 border-danger/20' : 'bg-surface-2 border-border',
                                )}>
                                    <p className={cn(
                                        'text-2xs uppercase tracking-wider mb-1',
                                        isLive ? 'text-danger' : 'text-text-muted',
                                    )}>
                                        {isLive ? 'Error' : 'Last error — from a previous attempt'}
                                    </p>
                                    <pre className="text-2xs font-mono text-text-secondary whitespace-pre-wrap break-words max-h-40 overflow-y-auto thin-scrollbar m-0">
                                        {row.error}
                                    </pre>
                                </div>
                            );
                        })()}

                        <Section title="File">
                            <Field label="Type" value={row.file_type ? humanizeKey(row.file_type) : null} />
                            <Field label="Category" value={row.category} />
                            <Field label="Content type" value={row.content_type} />
                            <Field label="Size" value={row.size_bytes == null ? null : formatFileSize(row.size_bytes)} />
                            <Field label="Sheets" value={sheetNames} />
                            <Field
                                label="Text layer"
                                value={row.has_text_layer == null ? null : (row.has_text_layer ? 'Yes' : 'No — scanned, needed OCR')}
                            />
                            <Field label="Labels" value={(row.labels || []).map(humanizeKey).join(', ') || null} />
                            <Field label="Duplicate of" value={dupOf ? `#${dupOf}` : null} />
                            <Field label="Uploaded by" value={row.uploaded_by} />
                            <Field label="Schema version" value={row.schema_version} />
                        </Section>

                        <Section title="Counts">
                            {COUNT_FIELDS.map(([key, label]) => (
                                <Field
                                    key={key}
                                    label={label}
                                    value={row[key] == null ? null : Number(row[key]).toLocaleString()}
                                />
                            ))}
                        </Section>

                        <Section title="Timeline">
                            {TIMELINE_FIELDS.map(([key, label]) => (
                                <Field key={key} label={label} value={row[key] ? fmtTime(row[key]) : null} />
                            ))}
                        </Section>

                        <Section title="Identifiers">
                            <Field label="Flow UID" value={row.flow_uid != null ? `#${row.flow_uid}` : null} mono />
                            {IDENTITY_FIELDS.map(([key, label]) => (
                                <Field key={key} label={label} value={row[key]} mono />
                            ))}
                        </Section>
                    </>
                )}
            </ModalBody>
        </Modal>
    );
}
