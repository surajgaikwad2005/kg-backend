/**
 * domain-configuration/common/connectorsService.js
 * Source connectors — upload from device, connect cloud (S3/ADLS/GCS), job
 * polling, and existing-file listing. Moved here from cdm/connectorsService.js
 * since every function is generic, parameterized by
 * `connector ∈ pnid | documents | sap | timeseries` — none of it is
 * docs-exclusive. OneDrive/SharePoint connect, the connector-agnostic
 * jobs-list, and the RustFS file-URL builder were removed entirely
 * (2026-07-20) — zero consumers anywhere in the app.
 *
 * Spec: Connectors router — backend paths are /api/connectors/<connector>/*.
 * Client paths are /api/domain-configuration/<connector>/* — each connector
 * owns its own feature folder under src/app/api/domain-configuration/, with a
 * dedicated jobs/[...path] route (backend-agnostic job polling lives at
 * /connectors/jobs/*) plus its own catch-all (→ /connectors/<connector>/*).
 * Job polling (getConnectorJob below) is UNCHANGED by the upload migration
 * below — it still goes through each connector's own jobs/[...path] route.
 *
 * Upload transport (2026-08-13 migration): documents, timeseries, and sap
 * were migrated off their old per-connector
 * `/api/domain-configuration/<connector>/upload` route onto ONE unified
 * endpoint, `/api/domain-configuration/connectors/upload` →
 * `<DOMAIN_CONFIGURATION>/connectors/upload`, which takes `connector` as a
 * form field instead of a URL segment (see uploadConnectorFile below).
 * `pnid` was deliberately NOT migrated and still posts to its own
 * `/api/domain-configuration/pnid/upload` route.
 *
 * 2026-08-17 update: the backend's `connector` enum now lists aif/gloc/lopc
 * as first-class values too (confirmed live via the Swagger UI dropdown for
 * POST /p0/cdm/connectors/upload) — the SAP-linked AIF/GLOC/LOPC feeds moved
 * from connector='sap'+file_type=<feed> onto their own native connector
 * value (see useConfigModalActions.handleFeedSubmit). `pnid` stays
 * unmigrated (out of scope — no live-tested request for it on this
 * endpoint yet). Also added: `labels` (required on every connector except
 * pnid — the four fixed use-case values integrity/reliability/maintenance/
 * production, comma-joined or repeated) and `files_meta` (optional
 * per-file JSON `[{file_name, labels}]` override when files in one batch
 * carry different labels) — see buildUploadLabelFields below.
 *
 * The label vocabulary itself is NOT hardcoded anywhere in this app: it is
 * read at runtime from GET /connectors/labels (getConnectorLabels below),
 * which also declares which connectors require a label. The old hardcoded
 * FILE_LABEL_OPTIONS copy in admin.constants.js was deleted with that
 * endpoint's arrival so the two can never drift.
 *
 * The refactored backend wraps every response in {success, message, data};
 * unwrap() strips that envelope so callers keep working with the flat
 * payload (job_id, status, ...) — it's a no-op if a given response isn't
 * wrapped, so this stays safe for endpoints whose envelope shape hasn't been
 * individually reverified yet.
 *
 * Rule 0 (see CLAUDE.md "API & Proxy Architecture"): the caller builds the
 * FormData/body and must include `plant_code_id` — there is no custom header
 * involved.
 */
import { apiClient } from '../../apiClient';

const unwrap = (res) => (res && typeof res === 'object' && 'data' in res && 'success' in res) ? res.data : res;

// pnid stays on its own dedicated per-connector upload route — every other
// connector (documents, timeseries, sap, and the natively-typed AIF/GLOC/LOPC
// feeds) goes through the unified /connectors/upload endpoint, which needs
// `connector` as a form field since there's no longer a per-connector URL
// segment to carry it.
const uploadUrl = (connector) => connector === 'pnid'
    ? '/api/domain-configuration/pnid/upload'
    : '/api/domain-configuration/connectors/upload';

/**
 * The use-case label vocabulary for the upload modals, plus which connectors
 * require a label. Reference data — the shape is:
 *
 *   { labels: [{ key, label, colour, sort_order }],
 *     required_for: ['documents', 'timeseries', 'sap', 'aif', 'gloc', 'lopc'],
 *     not_required_for: ['pnid'],
 *     suggested: { <connector>: [<label key>, ...] } }
 *
 * `suggested` is returned by the backend but deliberately NOT applied in the
 * UI — per product decision the user picks labels themselves for every data
 * source, so nothing is pre-ticked.
 *
 * @param {string} plantCode
 * @param {{ signal?: AbortSignal }} [opts]
 */
export const getConnectorLabels = (plantCode, opts) =>
    apiClient.get('/api/domain-configuration/connectors/labels', {
        params: { plant_code_id: plantCode },
        ...opts,
    }).then(unwrap);

/**
 * Builds the `labels` (comma-joined union across all files) and `files_meta`
 * (per-file JSON `[{file_name, labels}]`) fields for the unified upload
 * endpoint from each file's selected label array. `labels` is required by
 * the backend on every connector except pnid; `files_meta` lets a batch
 * where files carry DIFFERENT labels stay accurate instead of collapsing to
 * one label for the whole batch. Returns null when no file has a label yet
 * (caller should not append either field in that case).
 * @param {File[]} files
 * @param {Record<string, string[]>} fileLabelsMap - filename -> selected label keys (from getConnectorLabels)
 * @returns {{ labels: string, files_meta: string } | null}
 */
export const buildUploadLabelFields = (files, fileLabelsMap) => {
    const perFile = files
        .map((f) => ({ file_name: f.name, labels: fileLabelsMap?.[f.name] || [] }))
        .filter((f) => f.labels.length > 0);
    if (perFile.length === 0) return null;
    const union = [...new Set(perFile.flatMap((f) => f.labels))];
    return { labels: union.join(','), files_meta: JSON.stringify(perFile) };
};

/**
 * True when EVERY queued file carries at least one label — the submit gate for
 * connectors listed in the labels endpoint's `required_for`. Lives next to
 * buildUploadLabelFields because both read the same
 * `filename -> string[]` map, and a submit that passes this check is exactly
 * one that buildUploadLabelFields can describe completely.
 * @param {File[]} files
 * @param {Record<string, string[]>} fileLabelsMap
 */
export const areAllFilesLabeled = (files, fileLabelsMap) =>
    (files?.length ?? 0) > 0 && files.every((f) => (fileLabelsMap?.[f.name]?.length ?? 0) > 0);

/**
 * Upload connector files from device (multipart). The FormData must carry the
 * backend's required fields: `files` (one or more) + `plant_code_id`, plus
 * the type field — NOT the same key name for every connector: `document_type`
 * (the document-type key) for documents — confirmed live via a 422
 * `{"field": "document_type", "message": "document_type is required when
 * uploading documents."}` on 2026-08-13, which is why documents does NOT use
 * `file_type` like the other two — vs. `file_type` for timeseries
 * ('metadata'|'values') and sap ('SAP' only now — AIF/GLOC/LOPC moved to
 * their own native connector value, see admin.constants.js FEED_TYPES).
 * Also required (except pnid): `labels` + optional `files_meta` — see
 * buildUploadLabelFields above. For every connector except pnid, `connector`
 * is injected into the FormData here so callers don't each have to remember
 * it. Returns a job_id to poll.
 * @param {string} connector
 * @param {FormData} formData
 * @param {string} [plantCode]
 */
export const uploadConnectorFile = (connector, formData, plantCode) => {
    if (connector !== 'pnid') formData.append('connector', connector);
    return apiClient.post(uploadUrl(connector), formData).then(unwrap);
};

/**
 * Same as uploadConnectorFile but uses XHR so callers can track byte-level upload
 * progress via onProgress(percent, loaded, total). The src/proxy.js middleware
 * injects the access_token cookie as the Authorization header for every /api/* request,
 * so XHR (which sends same-origin cookies automatically) is authenticated without any
 * extra work here.
 *
 * @param {string} connector  - 'timeseries' | 'sap' | 'pnid' | 'documents'
 * @param {FormData} formData
 * @param {{ onProgress?: (pct: number, loaded: number, total: number) => void, signal?: AbortSignal, plantCode?: string }} [opts]
 */
export const uploadConnectorFileWithProgress = (connector, formData, { onProgress, signal, plantCode } = {}) =>
    new Promise((resolve, reject) => {
        if (connector !== 'pnid') formData.append('connector', connector);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl(connector));

        if (signal) {
            const onAbort = () => xhr.abort();
            signal.addEventListener('abort', onAbort, { once: true });
            xhr.onabort = () => {
                signal.removeEventListener('abort', onAbort);
                reject(new DOMException('Upload aborted', 'AbortError'));
            };
        } else {
            xhr.onabort = () => reject(new DOMException('Upload aborted', 'AbortError'));
        }

        if (onProgress) {
            let lastPct = -1;
            xhr.upload.onprogress = ({ loaded, total, lengthComputable }) => {
                if (!lengthComputable) return;
                const pct = Math.round((loaded / total) * 100);
                if (pct === lastPct) return;
                lastPct = pct;
                onProgress(pct, loaded, total);
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(unwrap(JSON.parse(xhr.responseText))); }
                catch { resolve(xhr.responseText); }
                return;
            }
            let msg = `Upload failed: ${xhr.status}`;
            try {
                const d = JSON.parse(xhr.responseText);
                const detail = Array.isArray(d.detail) ? d.detail.map(e => e.msg || e).join('; ') : d.detail;
                msg = d.message || d.error || detail || msg;
            } catch { /* non-JSON error body */ }
            const err = new Error(msg);
            err.status = xhr.status;
            reject(err);
        };

        xhr.onerror = () => reject(new Error('Upload failed — network error'));

        xhr.send(formData);
    });

/**
 * Connect from cloud storage (CloudConnectorRequest: cloud_type s3|adls|gcs + creds).
 * `params` may carry { document_type } for the documents connector. `body`
 * must include `plant_code_id`.
 * @param {string} connector
 * @param {object} body
 * @param {object} [params]
 * @param {string} [plantCode]
 */
export const connectConnectorCloud = (connector, body, params, plantCode) =>
    apiClient.post(`/api/domain-configuration/${connector}/connect/cloud`, body, {
        ...(params ? { params } : undefined),
    }).then(unwrap);

/**
 * Poll a connector job. The backend job endpoint is connector-agnostic
 * (/api/connectors/jobs/{id}); the `connector` arg only selects the rewrite
 * alias and is otherwise ignored by the backend.
 * @param {string} connector
 * @param {string} jobId
 * @param {string} [plantCode]
 */
export const getConnectorJob = (connector, jobId, plantCode) =>
    apiClient.get(`/api/domain-configuration/${connector}/jobs/${encodeURIComponent(jobId)}`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/** P&ID files already staged for a plant. plant_code is required by the backend. */
export const getExistingPnid = (plantCode) =>
    apiClient.get('/api/domain-configuration/pnid/existing', { params: { plant_code: plantCode } }).then(unwrap);

// ── Server-side lifecycle state (2026-08-17) ─────────────────────────────────
// These two reads are what let the Data Source Integration screen survive a
// hard refresh without localStorage. connectors/state is the per-connector
// rollup (tab status + counts); flow/state is the per-file list (names,
// batches, labels). Both derive from the same backend flow_state table, so
// they cannot disagree. Contracts: api-data/cdm-connectors-state.json and
// api-data/cdm-flow-state.json.

/**
 * Lifecycle rollup for every connector of a plant — one entry per connector in
 * `connectors[]` (seven as of 2026-08-17), each with status, counts,
 * unprocessed-file accounting and lifecycle timestamps.
 *
 * `include_groups` is deliberately NOT sent: it defaults to false server-side,
 * and the per-file detail the app needs comes from getFlowState below rather
 * than from groups[] (whose shape is only confirmed for the pnid connector).
 *
 * NOTE for callers: `status` re-opens to UPLOADED whenever any file is
 * unprocessed, so a committed connector with one new file reads UPLOADED. Use
 * the `*_at` timestamps for "has this ever reached stage X" questions — they
 * are monotonic. See deriveConnectorLifecycle in
 * src/components/admin/connectorState.js, which is the only place that
 * interpretation is allowed to live.
 *
 * @param {string} plantCode
 * @param {{ signal?: AbortSignal }} [opts]
 */
export const getConnectorsState = (plantCode, { signal } = {}) =>
    apiClient.get('/api/domain-configuration/connectors/state', {
        params: { plant_code_id: plantCode },
        signal,
    }).then(unwrap);

// ── flow/state vocabulary ────────────────────────────────────────────────────
// Mirrors the backend's own validators so a bad value is caught here, at the
// call site, instead of costing a round trip that comes back 422. All three
// lists are confirmed from the 2026-08-18 contract (api-data/cdm-flow-state.json).

/** The EIGHT flow names. NOT connector names — 'documents'/'timeseries' are 422. */
export const FLOW_VALUES = ['aif', 'docs', 'gloc', 'lopc', 'pnid', 'sap', 'ts', 'ts_values'];

/** The SEVEN connector names, for /connectors/{connector}/state. */
export const CONNECTOR_VALUES = ['pnid', 'documents', 'timeseries', 'sap', 'aif', 'gloc', 'lopc'];

/**
 * The `lifecycle` FILTER values — computed server-side from stage + status and
 * stored nowhere. Do not confuse with a row's own `stage` or `status` fields,
 * which are different vocabularies that happen to share some spellings (see
 * connectorState.js, which owns the row-level enums and the derivation).
 */
export const LIFECYCLE_VALUES = ['pending', 'processed', 'failed', 'all'];

/** Backend's declared page_size bound: 1–1000, default 100. */
const MAX_PAGE_SIZE = 1000;

/**
 * Rows per request for the merged (all-flows) read. Deliberately well under
 * MAX_PAGE_SIZE so one plant almost always fits in a single round trip while
 * leaving headroom if the cap is ever lowered.
 */
const MERGED_PAGE_SIZE = 500;

/** Hard stop for the paging loop — a backend that never clears has_more must not hang the tab. */
const MAX_PAGES = 40;

const clampPageSize = (n) => Math.min(Math.max(Math.trunc(n) || 1, 1), MAX_PAGE_SIZE);

/**
 * Per-file state for a plant — one row per file, newest first (sorted by
 * `updated_at`). Returns { files, pagination, total, is_empty, flow, lifecycle }.
 *
 * `flow` is OPTIONAL (confirmed 2026-08-18): omit it and every flow for the
 * plant comes back in one response with `data.flow === null`. When passed it
 * must be a FLOW name, not a connector name — 'docs' not 'documents', and
 * timeseries owns two flows ('ts' + 'ts_values'). A connector name is a 422
 * whose message names the flow(s) to use instead. Use FLOWS_BY_SOURCE_TYPE in
 * src/components/admin/connectorState.js rather than spelling flows at call
 * sites. An empty string is NOT the same as omitting it (`flow=` is a 422), so
 * falsy values are dropped rather than forwarded.
 *
 * `lifecycle` replaces the old `status` query param, which the backend now
 * marks DEPRECATED. The two are deliberately not both exposed: sending them
 * together with disagreeing values is a hard 422, and this signature makes
 * that unrepresentable. `lifecycle: 'all'` is the server default.
 *
 * @param {string} plantCode
 * @param {{ flow?: string, lifecycle?: string, page?: number, pageSize?: number, signal?: AbortSignal }} [opts]
 */
export const getFlowState = (plantCode, { flow, lifecycle, page, pageSize, signal } = {}) =>
    apiClient.get('/api/domain-configuration/flow/state', {
        params: {
            plant_code_id: plantCode,
            ...(flow ? { flow } : undefined),
            ...(lifecycle ? { lifecycle } : undefined),
            ...(page ? { page } : undefined),
            ...(pageSize ? { page_size: clampPageSize(pageSize) } : undefined),
        },
        signal,
    }).then(unwrap);

/**
 * Every file for a plant across ALL flows, following pagination to the end.
 *
 * This is the read the Data Source Integration screen runs: since `flow` is
 * optional, one request replaces the eight-way per-flow fan-out this module
 * used to need. Callers that want a single flow's slice should filter the
 * result client-side (see groupFilesByFlow in connectorState.js) rather than
 * issuing a second scoped request — that would refetch data already in hand.
 *
 * Paging is sequential because `page` is only meaningful against a
 * `total_pages` the first response reports; it stops on `has_more === false`,
 * on a short page, or at MAX_PAGES, whichever comes first. The abort signal is
 * threaded into every page so an unmount cancels mid-loop.
 *
 * @param {string} plantCode
 * @param {{ lifecycle?: string, pageSize?: number, signal?: AbortSignal }} [opts]
 * @returns {Promise<{ files: Array, total: number, pagesFetched: number, truncated: boolean }>}
 */
export const getAllFlowFiles = async (plantCode, { lifecycle, pageSize = MERGED_PAGE_SIZE, signal } = {}) => {
    const size = clampPageSize(pageSize);
    const files = [];
    let total = 0;

    for (let page = 1; page <= MAX_PAGES; page += 1) {
        const data = await getFlowState(plantCode, { lifecycle, page, pageSize: size, signal });
        const batch = data?.files || [];
        files.push(...batch);
        total = data?.total ?? files.length;

        const pagination = data?.pagination;
        const hasMore = pagination ? Boolean(pagination.has_more) : batch.length === size;
        if (!hasMore || batch.length === 0) {
            return { files, total, pagesFetched: page, truncated: false };
        }
    }

    return { files, total, pagesFetched: MAX_PAGES, truncated: true };
};

/**
 * ONE file's full row — the same 47 fields as a list row, but `data` IS the row
 * object directly rather than being wrapped in `files[]`.
 *
 * Use after a reset or a commit to refresh a single grid row instead of
 * re-reading the whole list. A `flowUid` <= 0 is rejected by the backend with a
 * 400 (not a 422 — the two validation families genuinely differ here), and an
 * unknown one with a 404.
 *
 * @param {string} plantCode
 * @param {number|string} flowUid
 * @param {{ signal?: AbortSignal }} [opts]
 */
export const getFlowStateRow = (plantCode, flowUid, { signal } = {}) =>
    apiClient.get(`/api/domain-configuration/flow/state/${encodeURIComponent(flowUid)}`, {
        params: { plant_code_id: plantCode },
        signal,
    }).then(unwrap);

/**
 * Reset one file to stage='uploaded', status='pending', error=NULL so the
 * pipeline picks it up again. Returns the updated row (same shape as
 * getFlowStateRow) and bumps the row's `attempt_count`.
 *
 * ⚠ `plant_code_id` goes in the BODY here but in the QUERY STRING for
 * deleteFlowState below. That asymmetry is the backend's, not a mistake in
 * this file — do not "fix" it by aligning the two.
 *
 * No other body field is read: the reset target state is fixed server-side.
 *
 * @param {string} plantCode
 * @param {number|string} flowUid
 */
export const resetFlowState = (plantCode, flowUid) =>
    apiClient.post(
        `/api/domain-configuration/flow/${encodeURIComponent(flowUid)}/reset`,
        { plant_code_id: plantCode },
    ).then(unwrap);

/**
 * Remove one file from the flow entirely. Resolves to `{ deleted: <flow_uid> }`
 * — the deleted id, NOT the row.
 *
 * ⚠ `plant_code_id` is a QUERY param here, unlike resetFlowState above.
 *
 * @param {string} plantCode
 * @param {number|string} flowUid
 */
export const deleteFlowState = (plantCode, flowUid) =>
    apiClient.del(`/api/domain-configuration/flow/${encodeURIComponent(flowUid)}`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/**
 * ONE connector's rollup, optionally with the taxonomy breakdown its card
 * sub-rows render from (`groups[]`, e.g. timeseries → "Metadata Upload" /
 * "Values Upload", each with counts + `file_ids`).
 *
 * getConnectorsState above already returns all seven rollups in a single call,
 * so reach for this ONLY when you need `include_groups` — otherwise you are
 * paying an extra request for a slice of data already in the cache.
 *
 * `connector` is a CONNECTOR name (seven values — see CONNECTOR_VALUES), not a
 * flow name; this endpoint has always 422'd on an unknown one.
 *
 * @param {string} plantCode
 * @param {string} connector
 * @param {{ includeGroups?: boolean, signal?: AbortSignal }} [opts]
 */
export const getConnectorState = (plantCode, connector, { includeGroups = false, signal } = {}) =>
    apiClient.get(`/api/domain-configuration/connectors/${encodeURIComponent(connector)}/state`, {
        params: {
            plant_code_id: plantCode,
            ...(includeGroups ? { include_groups: true } : undefined),
        },
        signal,
    }).then(unwrap);
