/**
 * connectorState.js — the translation layer between the backend's connector /
 * flow vocabulary and the frontend's source-type vocabulary.
 *
 * Two server reads back the Data Source Integration screen (2026-08-17):
 *
 *   GET /connectors/state  → one lifecycle rollup per connector (tab status,
 *                            counts, *_at timestamps)
 *   GET /flow/state        → one row per FILE (file_name, batch, labels, stage)
 *
 * Everything in this file is a PURE function over those two payloads. It holds
 * no React state and reads no context, so the derivations can be memoized
 * against the query cache (rule 54) and unit-tested without a renderer.
 *
 * Contracts: api-data/cdm-connectors-state.json, api-data/cdm-flow-state.json.
 *
 * ── Why the timestamps and not `status` ──────────────────────────────────────
 * The backend's connector-level `status` RE-OPENS to UPLOADED whenever any file
 * is unprocessed, so a connector that was committed last week reads UPLOADED
 * the moment one new file lands. It answers "what is this connector waiting on
 * right now", NOT "how far has it ever got". Every "has this reached stage X"
 * question here is therefore answered from the `*_at` timestamps, which are
 * monotonic. `status` is used only for the has-failures / not-configured edges.
 */

import { parseUTC } from '@/src/lib/time';
import { SOURCE_TYPES } from './domainSources';
import { FEED_TYPES, DOC_TYPE_CATEGORIES } from './admin.constants';

/**
 * document-type key → label, flattened once from the local DOC_TYPE_CATEGORIES
 * catalog (the same fallback catalog useDocsFormState.js merges the live
 * backend catalog against). Used as flowFilesToSourceEntries' default below
 * so a Documents row reads "Cause & Effect Matrix" instead of the raw key
 * `cause_effect_matrix` whenever a caller doesn't thread its own (possibly
 * backend-merged) map through.
 */
const DOC_LABEL_BY_KEY = DOC_TYPE_CATEGORIES.reduce((acc, cat) => {
    cat.types.forEach((t) => { acc[t.key] = t.label; });
    return acc;
}, {});

// ── Vocabulary maps ──────────────────────────────────────────────────────────

/**
 * Backend `connector` value → frontend source type (the string the whole admin
 * UI keys off: tab rows, configuredSources[].type, the processed/committed
 * Sets). Seven connectors as of 2026-08-17.
 */
export const SOURCE_TYPE_BY_CONNECTOR = {
    pnid:       SOURCE_TYPES.PNID,
    documents:  SOURCE_TYPES.DOCS,
    timeseries: SOURCE_TYPES.TS,
    sap:        SOURCE_TYPES.SAP,
    aif:        'AIF',
    gloc:       'GLOC',
    lopc:       'LOPC',
};

/**
 * Frontend source type → the backend FLOW names it owns.
 *
 * This is the map that stops call sites guessing: the flow name is NOT the
 * connector name ('documents' the connector is 'docs' the flow), and timeseries
 * owns TWO flows, so a full file list for it costs two requests. Both facts are
 * confirmed from connectors/state's own `flow`/`flows` fields.
 *
 * `sap`'s flow name is the one value not confirmed live — it is assumed to
 * equal its connector name, like pnid/aif/gloc/lopc do.
 */
export const FLOWS_BY_SOURCE_TYPE = {
    [SOURCE_TYPES.PNID]: ['pnid'],
    [SOURCE_TYPES.DOCS]: ['docs'],
    [SOURCE_TYPES.TS]:   ['ts', 'ts_values'],
    [SOURCE_TYPES.SAP]:  ['sap'],
    AIF:  ['aif'],
    GLOC: ['gloc'],
    LOPC: ['lopc'],
};

/**
 * Flow name → the CONNECTOR that owns it, for the endpoints keyed by connector
 * rather than by flow (/connectors/{connector}/state).
 *
 * The mapping is many-to-one and NOT an identity: `docs` belongs to connector
 * `documents`, and BOTH `ts` and `ts_values` belong to `timeseries`. Passing a
 * flow name where a connector name is expected — or the reverse — is a 422 on
 * either endpoint, so cross that boundary through this map, never by assuming
 * the two vocabularies share a spelling.
 */
export const CONNECTOR_BY_FLOW = {
    pnid: 'pnid',
    docs: 'documents',
    ts: 'timeseries',
    ts_values: 'timeseries',
    sap: 'sap',
    aif: 'aif',
    gloc: 'gloc',
    lopc: 'lopc',
};

/** Reverse of FLOWS_BY_SOURCE_TYPE — flow name → source type. */
export const SOURCE_TYPE_BY_FLOW = Object.entries(FLOWS_BY_SOURCE_TYPE)
    .reduce((acc, [sourceType, flows]) => {
        flows.forEach((flow) => { acc[flow] = sourceType; });
        return acc;
    }, {});

/**
 * Timeseries splits one connector across two flows and the UI labels them
 * "Metadata" / "Values" (the subtype shown on the configured-source row).
 */
const TS_SUBTYPE_BY_FLOW = { ts: 'Metadata', ts_values: 'Values' };
const TS_ROLE_BY_FLOW    = { ts: 'metadata', ts_values: 'values' };

// ── Row-level vocabularies ───────────────────────────────────────────────────
// FOUR different vocabularies overlap on this data and two of them share the
// name `status`. Keeping them side by side here is the only defence against
// re-conflating them (contract confirmed 2026-08-18):
//
//   stage            — WHERE the file is in the pipeline (row field)
//   status           — OUTCOME of its last operation (row field)
//   lifecycle        — the /flow/state FILTER, derived server-side from the two
//                      above and stored nowhere
//   connector status — UPPERCASE rollup across every file under a connector,
//                      on /connectors/{connector}/state
//
// `pending` appears in both `status` and `lifecycle` and means DIFFERENT things:
// as a filter it is "not yet through extraction"; as a row value it is "reset,
// awaiting reprocess". Only `failed` means the same thing in both.

/** Every `stage` value, in pipeline order. */
export const FLOW_STAGES = [
    'uploaded', 'staged', 'processing', 'processed',
    'reviewing', 'reviewed', 'committing', 'committed', 'superseded',
];

/** Every row-level `status` value. */
export const FILE_STATUSES = ['pending', 'running', 'done', 'ok', 'failed', 'skipped'];

/** The lifecycle FILTER values, as sent to / echoed by /flow/state. */
export const LIFECYCLE_FILTERS = ['all', 'pending', 'processed', 'failed'];

// ── File-level predicates ────────────────────────────────────────────────────

/**
 * Stages that mean "extraction is done" — the exact set the backend's own
 * `lifecycle=processed` filter matches.
 *
 * `reviewing` and `committing` ARE processed stages: a file being reviewed or
 * mid-commit has already been through extraction. Omitting them (as this set
 * did until the 2026-08-18 contract landed) made every file in those two
 * transient stages read as unprocessed, which showed a stale Unprocessed badge
 * and offered an already-extracted file up for reprocessing. `ingested` was in
 * the set and is not a stage at all — the real enum has no such value.
 *
 * Deliberately NOT here: `processing` and `superseded`, which the backend also
 * counts as pending. A file mid-processing is pending, not processed; read
 * `stage === 'processing'` directly if you want a separate in-progress badge.
 */
const PROCESSED_STAGES = new Set(['processed', 'reviewing', 'reviewed', 'committing', 'committed']);

/** Worker outcome that means the file itself failed (as opposed to pending). */
const FAILED_STATUS = 'failed';

const isFileProcessed = (file) => {
    const stage = String(file?.stage || '').toLowerCase();
    return PROCESSED_STAGES.has(stage);
};

const isFileFailed = (file) => String(file?.status || '').toLowerCase() === FAILED_STATUS;

/** A file the pipeline is actively working on right now. */
export const isFileProcessing = (file) => String(file?.stage || '').toLowerCase() === 'processing';

/**
 * The lifecycle bucket ONE row falls into, mirroring the backend's derivation
 * so a client-side filter and a `?lifecycle=` request can never disagree.
 *
 * Order matters and matches the backend's: `failed` is checked FIRST, so a
 * committed file whose last operation failed is 'failed', not 'processed'.
 *
 * @param {object} file  one row from /flow/state
 * @returns {'failed' | 'processed' | 'pending'}
 */
export function deriveFileLifecycle(file) {
    if (isFileFailed(file)) return 'failed';
    return PROCESSED_STAGES.has(String(file?.stage || '').toLowerCase()) ? 'processed' : 'pending';
}

/**
 * The flow_uid this file duplicates, or null when it is not a duplicate.
 *
 * The backend sets `duplicate_of` to the row's OWN flow_uid rather than null
 * for non-duplicates (confirmed: flow_uid 51 carries duplicate_of 51), so a
 * naive truthiness check badges every file as a duplicate of itself. Always go
 * through this helper rather than reading the field directly.
 */
export function duplicateSourceUid(file) {
    const dup = file?.duplicate_of;
    if (dup == null || dup === file?.flow_uid) return null;
    return dup;
}

/**
 * Split one merged /flow/state response (no `flow` param — every flow at once)
 * back into per-flow buckets.
 *
 * Since `flow` is optional, the app reads all flows in ONE request and slices
 * client-side here, instead of paying an eight-way fan-out. Every known flow
 * gets a key even when empty, so consumers can index without a null guard.
 */
export function groupFilesByFlow(files) {
    const byFlow = {};
    for (const flow of Object.keys(SOURCE_TYPE_BY_FLOW)) byFlow[flow] = [];
    for (const file of files || []) {
        const flow = file?.flow;
        if (!flow) continue;
        (byFlow[flow] ||= []).push(file);
    }
    return byFlow;
}

// ── connectors/state → lifecycle sets ────────────────────────────────────────

const toEpoch = (ts) => {
    if (!ts) return 0;
    const ms = parseUTC(ts).getTime();
    return Number.isNaN(ms) ? 0 : ms;
};

/**
 * Turn `connectors/state`'s `connectors[]` into exactly the shape
 * useSourceLifecycle already exposed from localStorage, so no consumer of
 * AdminPanelContext has to change:
 *
 *   { processedSources, validatedSources, committedSources } as Sets of source
 *   type, { processedAt, committedAt } as type → epoch-ms maps, plus
 *   `countsByType` (the real backend counts, which used to be guessed
 *   client-side by comparing upload timestamps against a cutoff).
 *
 * A connector is counted as processed/validated/committed purely on its
 * timestamp being non-null — see the file header for why `status` is not used.
 *
 * @param {Array} connectors  data.connectors[] from GET /connectors/state
 */
export function deriveConnectorLifecycle(connectors) {
    const processedSources = new Set();
    const validatedSources = new Set();
    const committedSources = new Set();
    const configuredTypes  = new Set();
    const processedAt = {};
    const committedAt = {};
    const countsByType = {};

    for (const entry of connectors || []) {
        const type = SOURCE_TYPE_BY_CONNECTOR[entry?.connector];
        if (!type) continue;

        const counts = entry.counts || {};
        const hasUnprocessed = Boolean(entry.has_unprocessed_files)
            || (entry.unprocessed_file_count ?? 0) > 0
            || entry.status === 'UPLOADED'
            || (counts.pending ?? 0) > 0;

        countsByType[type] = {
            filesTotal:  counts.files_total ?? entry.total_file_count ?? 0,
            pending:     counts.pending ?? (hasUnprocessed ? (entry.unprocessed_file_count || 1) : 0),
            processing:  counts.processing ?? 0,
            processed:   counts.processed ?? 0,
            failed:      counts.failed ?? 0,
            skipped:     counts.skipped ?? 0,
            superseded:  counts.superseded ?? 0,
            unprocessed: entry.unprocessed_file_count ?? counts.pending ?? 0,
            hasUnprocessed,
            hasFailures:    Boolean(entry.has_failures),
            lastUploadBatchId: entry.last_upload_batch_id ?? null,
            lastRunId:         entry.last_run_id ?? null,
            status:            entry.status,
        };

        if ((entry.total_file_count ?? counts.files_total ?? 0) > 0 || entry.configured_at) {
            configuredTypes.add(type);
        }

        // Only mark as processed/validated/committed if the connector has NO pending unprocessed files
        if (!hasUnprocessed && (entry.processed_at || entry.committed_at || entry.status === 'PROCESSED' || entry.status === 'COMMITTED')) {
            processedSources.add(type);
            processedAt[type] = toEpoch(entry.processed_at || entry.committed_at);
        }
        if (!hasUnprocessed && (entry.validated_at || entry.status === 'VALIDATED')) {
            validatedSources.add(type);
        }
        if (!hasUnprocessed && (entry.committed_at || entry.status === 'COMMITTED')) {
            committedSources.add(type);
            committedAt[type] = toEpoch(entry.committed_at);
        }
    }

    return { processedSources, validatedSources, committedSources, configuredTypes, processedAt, committedAt, countsByType };
}

// ── flow/state → configuredSources entries ───────────────────────────────────

/**
 * One upload batch becomes one configured-source row, which is exactly how the
 * client used to build them (one entry per modal submit). Documents additionally
 * splits by `category`, because a single batch can carry more than one document
 * subtype and the sidebar needs per-subtype rows.
 */
const groupKeyFor = (file, flow) => {
    const batch = file?.upload_batch_id || `file-${file?.flow_uid}`;
    return flow === 'docs' ? `${batch}::${file?.category || 'uncategorized'}` : batch;
};

/** Match the exact timestamp format the client already writes: "YYYY-MM-DD HH:MM:SS". */
const toEntryTimestamp = (iso) => {
    const d = parseUTC(iso);
    if (Number.isNaN(d.getTime())) return new Date().toISOString().replace('T', ' ').slice(0, 19);
    return d.toISOString().replace('T', ' ').slice(0, 19);
};

/**
 * Convert one flow's `files[]` into configuredSources-shaped entries.
 *
 * The returned objects are structurally identical to the ones the upload
 * handlers build (id/type/name/timestamp/method/status/progress/logs/errors/
 * subtype/filesMeta), plus three server-only fields:
 *
 *   `isProcessed`  — authoritative "a pipeline has consumed this batch", which
 *                    replaces the client-side `parseUTC(timestamp) <= cutoff`
 *                    guess in domainSources.splitSourceEntries (that guess was
 *                    also the home of a naive-UTC parsing bug).
 *   `fromServer`   — marks the entry as reconciled state, so the optimistic
 *                    local entry for the same upload can be dropped.
 *   `labels`       — the use-case labels written at upload time, readable for
 *                    the first time now that flow/state returns them.
 *
 * `status` here describes the UPLOAD, not the pipeline: a file that exists
 * server-side has finished uploading, so the entry is 'completed' unless the
 * file itself is marked failed. Anything else would make pending-but-uploaded
 * files look mid-flight and getUnprocessedTypes would then refuse to offer them
 * for processing.
 *
 * @param {Array}  files                 data.files[] from GET /flow/state
 * @param {string} flow                  the flow those files belong to
 * @param {object} [opts]
 * @param {Record<string,string>} [opts.docLabelByKey]  document-type key → label,
 *        so a Documents row reads "Inspection Reports" rather than the raw key.
 *        Defaults to the local DOC_TYPE_CATEGORIES catalog (DOC_LABEL_BY_KEY);
 *        pass an explicit map to prefer a live, backend-merged catalog instead.
 */
export function flowFilesToSourceEntries(files, flow, { docLabelByKey = DOC_LABEL_BY_KEY } = {}) {
    const type = SOURCE_TYPE_BY_FLOW[flow];
    if (!type || !Array.isArray(files) || files.length === 0) return [];

    const groups = new Map();
    for (const file of files) {
        const key = groupKeyFor(file, flow);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(file);
    }

    const entries = [];
    for (const [key, groupFiles] of groups) {
        const first = groupFiles.reduce(
            (earliest, f) => (toEpoch(f.uploaded_at) < toEpoch(earliest.uploaded_at) ? f : earliest),
            groupFiles[0],
        );

        const subtype = flow === 'docs'
            ? (docLabelByKey?.[first.category] || first.category || undefined)
            : TS_SUBTYPE_BY_FLOW[flow];

        const failed = groupFiles.filter(isFileFailed);
        const status = failed.length === groupFiles.length && failed.length > 0 ? 'failed' : 'completed';
        const label = subtype || type;

        entries.push({
            id: `flow:${flow}:${key}`,
            type,
            name: `${label} (${groupFiles.length} file(s))`,
            timestamp: toEntryTimestamp(first.uploaded_at),
            method: 'device',
            status,
            progress: status === 'failed' ? 0 : 100,
            logs: [],
            errors: failed.map((f) => f.error || `${f.file_name}: processing failed`),
            subtype,
            // Nullable server columns are coerced to the shapes the card
            // renderers already assume. `content_type` in particular is
            // nullable on flow/state but was never null while these rows were
            // built from browser File objects, so consumers default-arg it —
            // and a default only fires for `undefined`, never for `null`.
            filesMeta: groupFiles.map((f) => ({
                name: f.file_name || '',
                size: f.size_bytes ?? 0,
                mimeType: f.content_type || '',
                subtype,
                role: TS_ROLE_BY_FLOW[flow],
                flowUid: f.flow_uid,
                labels: f.labels || [],
            })),
            // Server-only fields — see doc comment above.
            isProcessed: groupFiles.every(isFileProcessed),
            fromServer: true,
            flow,
            batchId: first.upload_batch_id || null,
            labels: [...new Set(groupFiles.flatMap((f) => f.labels || []))],
            // The document-type KEY ('inspection_reports'), not its display
            // label. Matching on the key is what lets this module stay free of
            // the document-type catalog — labels are display text that lives in
            // the form state, keys are stable identifiers the backend returns.
            docTypeKey: flow === 'docs' ? (first.category || null) : null,
        });
    }

    // Newest first, matching the client's `[newSource, ...prev]` insertion.
    return entries.sort((a, b) => parseUTC(b.timestamp) - parseUTC(a.timestamp));
}

/** Every file name a plant has on the server for one flow. */
export function flowFileNames(files) {
    return (files || []).map((f) => f.file_name).filter(Boolean);
}

/**
 * Does a document subtype have at least one non-failed batch?
 *
 * The server-backed counterpart of domainSources.hasActiveDocSubtype, which had
 * to match on the display LABEL because that was all the localStorage entries
 * carried. Server entries carry the document-type key, so this matches on the
 * key — no label lookup, no drift when a label is reworded.
 */
export function hasActiveDocType(entries = [], docKey) {
    return entries.some((e) => e.docTypeKey === docKey && e.status !== 'failed');
}

/**
 * Document file names bucketed by document-type KEY — the server-side
 * replacement for the `uploadedDocFileNames` blob that used to live in
 * sessionStorage under `admin_domain_config`.
 */
export function docFileNamesByType(files) {
    const byType = {};
    for (const file of files || []) {
        const key = file?.category;
        if (!key || !file.file_name) continue;
        (byType[key] ||= []).push(file.file_name);
    }
    return byType;
}

// ── Per-document-subtype lifecycle ───────────────────────────────────────────

/**
 * Every spelling a docs row might use to identify its document subtype.
 *
 * `category` is documented as a taxonomy PATH ('others/compressor_inspection'),
 * which is why categoryLeaf() exists in flowFilePresentation.js — but
 * flowFilesToSourceEntries assigns `docTypeKey: first.category` as though it
 * were a bare key, and DOC_ROW_KEYS holds bare keys ('inspection_reports'). The
 * live shape for a docs upload is NOT confirmed, and the three candidates
 * disagree, so matching is done against all of them rather than betting on one.
 *
 * This is deliberately liberal: a false match would need a plant where one
 * subtype's bare key equals another's path leaf, which the fixed DOC_ROW_KEYS
 * vocabulary makes impossible. A missed match, by contrast, silently empties a
 * sidebar row — the failure mode this whole helper exists to remove.
 */
function docTypeAliases(file) {
    const out = [];
    const push = (v) => {
        const s = String(v ?? '').trim().toLowerCase();
        if (s && !out.includes(s)) out.push(s);
    };
    push(file?.category);
    // The leaf of a 'group/subtype' path.
    const cat = String(file?.category ?? '');
    if (cat.includes('/')) push(cat.split('/').filter(Boolean).pop());
    push(file?.file_type);
    return out;
}

/** Does one docs file row belong to `docKey`? */
export const fileMatchesDocType = (file, docKey) =>
    !!docKey && docTypeAliases(file).includes(String(docKey).trim().toLowerCase());

/**
 * The lifecycle rollup for ONE document subtype, computed from that subtype's
 * own file rows.
 *
 * This exists because /connectors/state cannot answer the question. Its
 * granularity is the CONNECTOR: all 17 document subtypes share a single
 * `committed_at`, and that timestamp is monotonic — it never reopens. Reading a
 * subtype's state off it means "has anything in Documents ever been committed",
 * so one committed subtype marks every other subtype committed too, including
 * ones holding brand-new or failed files. Per-file `stage` is the only signal
 * with the right granularity.
 *
 * `allCommitted` requires at least one file AND every file committed — an empty
 * subtype is not committed, and one straggler is enough to keep the whole
 * subtype out of the committed state.
 *
 * @param {Array} files  the docs flow's file rows (flowFilesByFlow.docs)
 * @param {string} docKey  a DOC_ROW_KEYS entry, e.g. 'inspection_reports'
 */
export function deriveDocTypeLifecycle(files, docKey) {
    const mine = (files || []).filter((f) => fileMatchesDocType(f, docKey));

    let processed = 0;
    let unprocessed = 0;
    let failed = 0;
    let committed = 0;

    for (const file of mine) {
        const bucket = deriveFileLifecycle(file);
        if (bucket === 'failed') failed += 1;
        else if (bucket === 'processed') processed += 1;
        else unprocessed += 1;

        if (String(file?.stage || '').toLowerCase() === 'committed') committed += 1;
    }

    return {
        total: mine.length,
        processed,
        unprocessed,
        failed,
        hasFiles: mine.length > 0,
        hasFailures: failed > 0,
        // Every file committed — see doc comment.
        allCommitted: mine.length > 0 && committed === mine.length,
    };
}

// ── Reconciliation ───────────────────────────────────────────────────────────

/**
 * Merge server-derived entries with the optimistic local ones an in-flight
 * upload creates.
 *
 * A local entry is dropped as soon as the server reports every one of its files
 * under the same source type — that is the moment the server became the better
 * copy of the same upload. Local entries with no filesMeta (cloud connections,
 * which report no file list) are kept until they finish, then dropped on the
 * next refetch once their type has any server entry newer than them.
 *
 * Local entries always sort first: they are the newest activity, and one of
 * them may still be mid-upload with live progress.
 */
export function mergeSourceEntries(serverEntries = [], localEntries = []) {
    if (localEntries.length === 0) return serverEntries;

    const serverNamesByType = new Map();
    for (const entry of serverEntries) {
        if (!serverNamesByType.has(entry.type)) serverNamesByType.set(entry.type, new Set());
        const names = serverNamesByType.get(entry.type);
        (entry.filesMeta || []).forEach((f) => names.add(f.name));
    }

    const stillLocal = localEntries.filter((local) => {
        // A failed upload never reaches the server, so it has to stay local —
        // otherwise the user loses the only record of what went wrong.
        if (local.status === 'failed') return true;
        const names = serverNamesByType.get(local.type);
        if (!names || names.size === 0) return true;
        const localNames = (local.filesMeta || []).map((f) => f.name);
        if (localNames.length === 0) return local.status === 'running';
        return !localNames.every((name) => names.has(name));
    });

    return [...stillLocal, ...serverEntries];
}

/**
 * The plant-scoped localStorage keys this migration retired. Cleared once per
 * plant the first time the server answers for it, so the two sources of truth
 * can never coexist and a stale local copy can never win over fresh server
 * state.
 *
 * NOT included, and deliberately still local: `admin_context_params_<plant>`
 * and `admin_job_ids_<plant>` (crop box, model choice, selected files — no
 * backend endpoint returns these yet, so clearing them would be a data-loss
 * bug), and the in-flight file staging in src/lib/fileStorage.
 */
export const RETIRED_PLANT_KEYS = [
    (plant) => `admin_configured_sources::${plant}`,
    (plant) => `admin_processed_sources::${plant}`,
    (plant) => `admin_validated_sources::${plant}`,
    (plant) => `admin_committed_sources::${plant}`,
    (plant) => `admin_committed_at::${plant}`,
    (plant) => `admin_processed_at::${plant}`,
    (plant) => `admin_pnid_file_names::${plant}`,
    (plant) => `admin_batch_ids_${plant}`,
    (plant) => `admin_job_ids_${plant}`,
    (plant) => `admin_job_ids_${plant.toLowerCase()}`,
    (plant) => `admin_context_params_${plant}`,
    (plant) => `admin_context_params_${plant.toLowerCase()}`,
];

/** Remove every retired key for one plant, plus the global sessionStorage blob. */
export function clearRetiredStorage(plantId) {
    if (typeof window === 'undefined' || !plantId) return;
    RETIRED_PLANT_KEYS.forEach((keyFor) => {
        try { localStorage.removeItem(keyFor(plantId)); } catch { /* quota/private mode */ }
    });
    // `admin_pnid_files_by_batch::<batchId>` is keyed by batch, not plant, so it
    // has to be swept by prefix rather than by name.
    try {
        const stale = Object.keys(localStorage).filter((k) => k.startsWith('admin_pnid_files_by_batch::'));
        stale.forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
    try { sessionStorage.removeItem('admin_domain_config'); } catch { /* ignore */ }
}

/** Every source type the app knows about, in sidebar order. */
export const ALL_SOURCE_TYPES = [
    SOURCE_TYPES.PNID, SOURCE_TYPES.DOCS, SOURCE_TYPES.TS, SOURCE_TYPES.SAP, ...FEED_TYPES,
];
