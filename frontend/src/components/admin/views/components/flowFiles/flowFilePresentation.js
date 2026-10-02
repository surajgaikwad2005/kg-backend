/**
 * flowFilePresentation.js — display vocabulary for the flow-file grid.
 *
 * Pure maps and formatters over a /flow/state row. No React, no hooks, no
 * fetching: everything here is a function of one row, so the grid can memoize
 * against the query cache and this module can be unit-tested without a
 * renderer.
 *
 * The SEMANTIC vocabularies (which stage counts as processed, how lifecycle is
 * derived, whether duplicate_of is real) live in
 * src/components/admin/connectorState.js and are imported, never re-declared —
 * two copies of that logic drifting apart is exactly the bug class the backend
 * removed by computing `lifecycle` server-side.
 */

/**
 * Flow name → the label a human reads. Timeseries owns two flows and the split
 * is meaningful to the user (tag definitions vs. the readings themselves), so
 * each gets its own label rather than both reading "Timeseries".
 */
export const FLOW_LABELS = {
    pnid: 'P&ID',
    docs: 'Documents',
    ts: 'Timeseries · Tags',
    ts_values: 'Timeseries · Values',
    sap: 'SAP',
    aif: 'Asset Integrity Findings',
    gloc: 'Gas Loss of Containment',
    lopc: 'Loss of Primary Containment',
};

/** Compact form for the flow column, where the full label would wrap. */
export const FLOW_SHORT_LABELS = {
    pnid: 'P&ID',
    docs: 'Docs',
    ts: 'TS · Tags',
    ts_values: 'TS · Values',
    sap: 'SAP',
    aif: 'AIF',
    gloc: 'GLOC',
    lopc: 'LOPC',
};

export const flowLabel = (flow) => FLOW_LABELS[flow] || flow || '—';
export const flowShortLabel = (flow) => FLOW_SHORT_LABELS[flow] || flow || '—';

/**
 * Lifecycle bucket → Badge variant + label.
 *
 * Only three buckets are reachable on a row: 'all' is a filter value, never a
 * row's own state, so it deliberately has no entry here.
 */
export const LIFECYCLE_BADGE = {
    processed: { variant: 'success', label: 'Processed' },
    pending: { variant: 'warning', label: 'Pending' },
    failed: { variant: 'critical', label: 'Failed' },
};

/**
 * The lifecycle filter options, in the order the chips render. `all` first
 * because it is the server's default and the state the grid opens in.
 */
export const LIFECYCLE_FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'failed', label: 'Failed' },
];

/**
 * Stage → a short human phrase. Kept separate from the lifecycle badge on
 * purpose: lifecycle answers "can I act on this file yet", stage answers
 * "where exactly is it", and collapsing the two would lose the distinction the
 * backend went out of its way to preserve (a file at `reviewing` and one at
 * `committed` are both processed, but they are not the same thing).
 */
export const STAGE_LABELS = {
    uploaded: 'Uploaded',
    staged: 'Staged',
    processing: 'Processing',
    processed: 'Extracted',
    reviewing: 'In review',
    reviewed: 'Reviewed',
    committing: 'Committing',
    committed: 'Committed',
    superseded: 'Superseded',
};

export const stageLabel = (stage) => STAGE_LABELS[stage] || stage || '—';

/**
 * A file the pipeline is actively touching. Used to disable the row actions:
 * resetting or deleting mid-run races the worker that is writing the same row.
 */
export const TRANSIENT_STAGES = new Set(['processing', 'committing']);

export const isRowBusy = (file) =>
    TRANSIENT_STAGES.has(String(file?.stage || '').toLowerCase())
    || String(file?.status || '').toLowerCase() === 'running';

/**
 * `category` is a taxonomy PATH ('others/compressor_inspection'). The grid
 * shows the leaf, which is the part that identifies the document subtype; the
 * full path stays available as a title attribute.
 */
export const categoryLeaf = (category) => {
    if (!category) return null;
    const parts = String(category).split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
};

/** 'compressor_inspection' → 'Compressor inspection'. */
export const humanizeKey = (key) => {
    if (!key) return '';
    const spaced = String(key).replace(/[_-]+/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * Rows extracted, shown only when the backend actually reported a count.
 * `row_count` is null for plenty of legitimate rows (anything not yet
 * extracted), and rendering that as "0" would read as "extracted nothing"
 * rather than "not extracted yet".
 */
export const rowCountLabel = (file) =>
    file?.row_count == null ? '—' : Number(file.row_count).toLocaleString();
