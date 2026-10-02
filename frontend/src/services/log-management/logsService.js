/**
 * log-management/logsService.js
 * CDM Logs router — /api/log-management (list servable log files),
 * /api/log-management/{logKey} (tail N lines), /api/log-management/activity,
 * /api/log-management/events, /api/log-management/summary.
 * Refactored contract: every response is a JSON envelope
 * { success, message, data: {...} }; unwrap() strips it so callers keep
 * working with the flat payload.
 *
 * Rule 0 (see CLAUDE.md "API & Proxy Architecture"): every endpoint here is a
 * GET, so plant_code_id travels only in query params, never as a header.
 * Callers must pass the real value from useApp().plantCode — this file never
 * reads AppContext itself.
 *
 * Previously split across cdm/logsService.js (core impl) + this file (thin
 * wrapper for the admin Pipeline Logs viewer) — consolidated here to match
 * the rest of the domain-folder restructure (pipeline/connectors/health
 * already moved off cdm/ the same way).
 */
import { apiClient } from '../apiClient';

const unwrap = (res) => (res && typeof res === 'object' && 'data' in res && 'success' in res) ? res.data : res;

/** Tail the last `lines` lines of one log file. */
export const getLogs = (logKey, lines = 500, plantCodeId) =>
    apiClient.get(`/api/log-management/${encodeURIComponent(logKey)}`, {
        params: { lines, plant_code_id: plantCodeId },
    }).then(unwrap);

// ── Structured observability (admin) ────────────────────────────────────────
// These return backend-aggregated/parsed data so the UI stays a thin viewer.

/** Who-did-what activity feed (commits + pipeline runs), newest first. */
export const getActivity = ({ plantCodeId, limit = 100 } = {}) =>
    apiClient.get('/api/log-management/activity', { params: { plant_code_id: plantCodeId, limit } }).then(unwrap);

/** Server-parsed log events: {ts, level, source, message}, backend-filtered. */
export const getLogEvents = ({ plantCodeId, source, level, q, limit = 500 } = {}) =>
    apiClient.get('/api/log-management/events', {
        params: { plant_code_id: plantCodeId, source, level, q, limit },
    }).then(unwrap);

/** Pre-aggregated summary counts (events by level, job/commit outcomes). */
export const getLogsSummary = ({ plantCodeId } = {}) =>
    apiClient.get('/api/log-management/summary', { params: { plant_code_id: plantCodeId } }).then(unwrap);

// ── Admin Pipeline Logs viewer (raw tail, non-structured keys) ──────────────

/** All log keys surfaced in the admin Pipeline Logs viewer. */
export const PIPELINE_LOG_KEYS = [
    'pnid_pipeline',
    'docs_pipeline',
    'pnid',
    'docs',
    'sap',
    'timeseries',
    'connectors',
    'api',
];

/** Tail multiple log keys in parallel; returns allSettled results. */
export const fetchMultipleLogs = (keys, lines = 500, plantCodeId) =>
    Promise.allSettled(keys.map((k) => getLogs(k, lines, plantCodeId)));
