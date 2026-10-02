/**
 * domain-configuration/common/pipelineService.js
 * CDM pipeline router — every endpoint under /p0/cdm/pipeline/*, shared across
 * all stages. Verified 2026-08-17 against the live spec at
 * http://127.0.0.1:8000/openapi.json; see api-data/domain-configuration-pipeline.json.
 *
 * Spec: /api/domain-configuration/pipeline/* (catch-all proxy → DATA_ACTIVITY).
 * The backend wraps every response in {success, message, data}; unwrap() strips
 * that envelope so callers keep working with the flat payload — it's a no-op if
 * a given response isn't wrapped, so this stays safe for endpoints whose
 * envelope shape hasn't been individually reverified yet.
 *
 * Rule 0 (see CLAUDE.md "API & Proxy Architecture"): plant_code_id travels only
 * in the request body/query, never as a header. Placement per the live spec:
 * `run` declares NO query params (body only — RunPipelineRequest); every other
 * endpoint declares plant_code_id as a REQUIRED query param.
 */
import { apiClient } from '../../apiClient';

const BASE = '/api/domain-configuration/pipeline';

const unwrap = (res) => (res && typeof res === 'object' && 'data' in res && 'success' in res) ? res.data : res;

/**
 * Every stage the backend accepts, from RunPipelineRequest's live regex:
 * `^(sap|docs|ts|pnid|aif|gloc|lopc|full)$`. aif/gloc/lopc are the FEED_TYPES
 * (see admin.constants.js) — they upload through the connectors flow but have
 * no review screen wired yet, so no UI triggers those stages today.
 */
export const PIPELINE_STAGES = ['sap', 'docs', 'ts', 'pnid', 'aif', 'gloc', 'lopc', 'full'];

/**
 * A job in any of these states will never change again, so polling must stop.
 * `cancelled` comes from the cancel endpoint; `partial`/`interrupted` are named
 * by the retry endpoint's own description as things it can re-run. Treating
 * only completed/failed as terminal (the previous behaviour) polls a cancelled
 * job forever.
 */
export const TERMINAL_PIPELINE_STATUSES = ['completed', 'failed', 'cancelled', 'partial', 'interrupted'];

/** Terminal states that did NOT fully succeed — the ones retry exists for. */
export const RETRYABLE_PIPELINE_STATUSES = ['failed', 'cancelled', 'partial', 'interrupted'];

const lower = (s) => String(s ?? '').toLowerCase();

export const isTerminalPipelineStatus = (status) => TERMINAL_PIPELINE_STATUSES.includes(lower(status));
export const isRetryablePipelineStatus = (status) => RETRYABLE_PIPELINE_STATUSES.includes(lower(status));

/**
 * Contract-level field aliasing (rule 54): the pipeline endpoints' responses are
 * undocumented in the live spec (`schema: {}` on every 2xx), and observed
 * payloads have used `pipeline_job_id`/`job_id` and `upload_batch_id`/`batch_id`
 * interchangeably across stages. Every caller needs the same reconciliation, so
 * it lives here rather than being re-guessed per consumer. Returns null for a
 * null input so it can wrap a not-yet-loaded poll result.
 */
export function normalizePipelineJob(job) {
    if (!job || typeof job !== 'object') return null;
    return {
        ...job,
        pipeline_job_id: job.pipeline_job_id || job.job_id || job.jobId || job.id || null,
        upload_batch_id: job.upload_batch_id || job.batch_id || job.batchId || null,
        status: lower(job.status) || 'queued',
        // Runtime stage list; falls back to the planned list POST /run returned.
        stages: job.stages || job.stages_planned || null,
    };
}

/**
 * Trigger a pipeline stage (RunPipelineRequest).
 *
 * Returns { pipeline_job_id, upload_batch_id, upload_batch_ids, scoped_to_batch,
 * stage, plant_code_id, industry, stages_planned, is_determinate, files_total,
 * progress_percent } — the last four let a stepper render immediately, before
 * the first getPipelineJob poll.
 *
 * `incremental` defaults to false (the backend's own default) so no caller has
 * to know it exists. Pass the ACTUAL selected plant/industry — never a static
 * default — or the backend falls back to its seed plant (`ARAMCO`).
 *
 * @param {{ stage: 'sap'|'docs'|'ts'|'pnid'|'aif'|'gloc'|'lopc'|'full',
 *           plant_code_id: string, industry?: string, incremental?: boolean,
 *           file_names?: string[], doc_types?: string[], doc_files?: string[],
 *           upload_batch_id?: string }} body
 */
export const runPipeline = ({ plant_code_id, incremental = false, ...body }) =>
    apiClient.post(`${BASE}/run`, { plant_code_id, incremental, ...body }).then(unwrap);

/**
 * Poll one pipeline job. Returns { pipeline_job_id, upload_batch_id, stage,
 * status, output_tables, record_counts, total_records, ... } plus, when the
 * backend supplies them, progress_percent / is_determinate / stages[].
 * Run it through normalizePipelineJob() rather than reading fields raw.
 */
export const getPipelineJob = (jobId, plantCode, opts) =>
    apiClient.get(`${BASE}/jobs/${encodeURIComponent(jobId)}`, {
        ...opts,
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/**
 * Cancel a running job. SIGTERMs the pipeline subprocess and its whole process
 * group (so the LLM extractor / Bedrock calls stop too), SIGKILLs after 5s, and
 * marks the job `cancelled`. A no-op 200 if the job already finished — so a
 * cancel that races a completion is safe, not an error.
 */
export const cancelPipelineJob = (jobId, plantCode) =>
    apiClient.post(`${BASE}/jobs/${encodeURIComponent(jobId)}/cancel`, undefined, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/**
 * Re-run a finished (failed / partial / cancelled / interrupted) job with the
 * same stage and plant. Returns 202 with a NEW pipeline_job_id to poll.
 * @param {'failed_only'|'all'} [scope] failed_only re-runs just the files that
 *   did not succeed; all re-runs everything the original job covered.
 */
export const retryPipelineJob = (jobId, plantCode, { scope = 'failed_only' } = {}) =>
    apiClient.post(`${BASE}/jobs/${encodeURIComponent(jobId)}/retry`, undefined, {
        params: { plant_code_id: plantCode, scope },
    }).then(unwrap);

/** List recent pipeline jobs, newest first, optionally filtered by stage. */
export const listPipelineJobs = (plantCode, { stage, signal } = {}) =>
    apiClient.get(`${BASE}/jobs`, {
        signal,
        params: { plant_code_id: plantCode, ...(stage ? { stage } : {}) },
    }).then(unwrap);

/** List the CDM output CSVs for this plant's cdm_out subtree, grouped by stage. */
export const listPipelineOutputs = (plantCode, { signal } = {}) =>
    apiClient.get(`${BASE}/outputs`, { signal, params: { plant_code_id: plantCode } }).then(unwrap);

/** First N rows of one CDM output table as JSON. */
export const previewPipelineOutput = ({ stage, table, plantCode, limit = 50, offset = 0 }) =>
    apiClient.get(`${BASE}/outputs/${encodeURIComponent(stage)}/${encodeURIComponent(table)}`, {
        params: { plant_code_id: plantCode, limit, offset },
    }).then(unwrap);
