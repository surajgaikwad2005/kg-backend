/**
 * pipelineCtxParams.js
 * localStorage persistence for the handful of pipeline-run parameters the
 * context-review APIs need later (batchId, jobId, the file/doc-type lists).
 *
 * These are written the moment a run STARTS, not when it finishes, so a hard
 * reload mid-run can still resume and review the right batch. Nothing else in
 * the app remembers them — the run response is the only place they appear.
 *
 * Pure module-scope functions (rule 22); extracted out of
 * usePipelineOrchestration.js so the run registry and the commit flow can share
 * them without either importing the other.
 */

const SESSION_CTX_PARAMS = new Map();

function getStorageKey(plantId) {
    return `pipeline_session_ctx_${plantId}`;
}

/** Persist context params in memory and sessionStorage for the active browser session. */
export function saveCtxParams(plantId, stage, params) {
    if (!plantId) return;
    const current = loadCtxParams(plantId);
    current[stage] = { ...(current[stage] || {}), ...params };
    SESSION_CTX_PARAMS.set(plantId, current);

    if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
            window.sessionStorage.setItem(getStorageKey(plantId), JSON.stringify(current));
        } catch (_) {}
    }
}

/** Load session context params for a plant. */
export function loadCtxParams(plantId) {
    if (!plantId) return {};
    if (SESSION_CTX_PARAMS.has(plantId)) {
        return SESSION_CTX_PARAMS.get(plantId) || {};
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
            const raw = window.sessionStorage.getItem(getStorageKey(plantId));
            if (raw) {
                const parsed = JSON.parse(raw);
                SESSION_CTX_PARAMS.set(plantId, parsed);
                return parsed;
            }
        } catch (_) {}
    }
    return {};
}

/** Extract the context-API-relevant params from a pipeline trigger body. */
export function extractCtxParams(stage, body, jobId, batchId) {
    const params = {};
    if (jobId)   params.jobId   = jobId;
    if (batchId) params.batchId = batchId;
    if (stage === 'pnid') {
        const fn = body?.file_names;
        if (Array.isArray(fn) && fn.length > 0) params.files = fn.join(',');
    } else if (stage === 'docs') {
        const dt = body?.doc_types;
        if (dt?.length) params.docTypes = Array.isArray(dt) ? dt.join(',') : String(dt);
        const df = body?.doc_files;
        if (df?.length) params.files = Array.isArray(df) ? df.join(',') : String(df);
    }
    return params;
}
