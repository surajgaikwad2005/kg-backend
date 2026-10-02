/**
 * developer-options/schedulerService.js
 * Hidden Developer Options → Scheduler tab. Real backend contract confirmed
 * 2026-07-27 (Swagger at http://172.16.0.12/api/dev-option/swagger) — see
 * api-data/developer-options.json for the full endpoint-by-endpoint contract.
 *
 * Schedules ARE plant-scoped: every schedule object returned by the backend
 * carries a `plant_code_id`, so every call below except getSchedulerHealth()
 * sends it per Rule 0 (body for POST/PUT, query for GET/DELETE — never a
 * header). getSchedulerHealth() is the one exception: it reports the
 * scheduler process's own run-state, not plant data.
 */
import { apiClient } from '../apiClient';

const BASE = '/api/developer-options/scheduler';

const unwrap = (res) => (res && typeof res === 'object' && 'data' in res && 'success' in res) ? res.data : res;

/** Scheduler process health — not plant-scoped. */
export const getSchedulerHealth = () =>
    apiClient.get(`${BASE}/health`).then(unwrap);

/** List every schedule for the given plant. */
export const listSchedules = (plant_code_id) =>
    apiClient.get(`${BASE}/schedule`, { params: { plant_code_id } })
        .then(unwrap)
        .then((data) => data?.schedules ?? []);

/** Fetch one schedule's full detail. */
export const getSchedule = (plant_code_id, scheduleId) =>
    apiClient.get(`${BASE}/schedule/${scheduleId}`, { params: { plant_code_id } })
        .then(unwrap)
        .then((data) => data?.schedule ?? null);

/**
 * Create a new cron-scheduled job.
 * LIVE-CONFIRMED (2026-07-27): the doc's "body" placement guess for
 * plant_code_id was wrong — the live backend 422'd with
 * {errors:[{field:"plant_code_id", message:"Field required"}]} even though
 * the body already carried it, meaning this endpoint's Pydantic model
 * declares plant_code_id as a Query() param, not a body field (same class of
 * mismatch as symbolic-ai's multipart endpoints — see CLAUDE.md). Sent as a
 * query param now; kept in the body too since extra JSON fields are typically
 * harmless.
 * @param {string} plant_code_id
 * @param {{ jobName: string, cronExpression: string, method: string, url: string, payload?: object, headers?: object }} job
 */
export const createSchedule = (plant_code_id, { jobName, cronExpression, method, url, payload, headers }) =>
    apiClient.post(`${BASE}/schedule`, {
        plant_code_id,
        job_name: jobName,
        cron_expression: cronExpression,
        method,
        url,
        payload: payload ?? {},
        headers: headers ?? {},
    }, { params: { plant_code_id } }).then(unwrap);

/** Update an existing schedule's fields. Same query-param fix as createSchedule — see note above. */
export const updateSchedule = (plant_code_id, scheduleId, { jobName, cronExpression, method, url, payload, headers }) =>
    apiClient.put(`${BASE}/schedule/${scheduleId}`, {
        plant_code_id,
        job_name: jobName,
        cron_expression: cronExpression,
        method,
        url,
        payload: payload ?? {},
        headers: headers ?? {},
    }, { params: { plant_code_id } }).then(unwrap);

/** Permanently delete a schedule. */
export const deleteSchedule = (plant_code_id, scheduleId) =>
    apiClient.del(`${BASE}/schedule/${scheduleId}`, { params: { plant_code_id } }).then(unwrap);

/** Re-enable a previously disabled schedule. */
export const enableSchedule = (plant_code_id, scheduleId) =>
    apiClient.post(`${BASE}/schedule/${scheduleId}/enable`, undefined, { params: { plant_code_id } }).then(unwrap);

/** Pause an active schedule without deleting it. */
export const disableSchedule = (plant_code_id, scheduleId) =>
    apiClient.post(`${BASE}/schedule/${scheduleId}/disable`, undefined, { params: { plant_code_id } }).then(unwrap);

/** Reload all schedules from the database into the running scheduler process. */
export const reloadSchedules = (plant_code_id) =>
    apiClient.get(`${BASE}/reload`, { params: { plant_code_id } }).then(unwrap);
