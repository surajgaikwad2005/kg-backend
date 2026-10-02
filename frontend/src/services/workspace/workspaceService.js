/**
 * workspaceService.js
 * Browser-side calls for the Workspace feature (workspace list/CRUD, per-type
 * analyses, custom tags, multi-chart visualization). Routes through the local
 * /api/workspace/* proxy — components never call fetch directly and never see
 * backend URLs or tokens.
 *
 * Every function takes `plant_code` as its first argument (from useApp() in the
 * calling component/hook — this file never reads AppContext directly) and sends
 * it as `plant_code_id` in the request (body for POST/PUT, query params for
 * GET/DELETE), per CLAUDE.md Rule 0.
 */
import { apiClient } from '../apiClient';

const BASE = '/api/workspace';

// ── Workspace list / CRUD ────────────────────────────────────────────────────

export const listWorkspaces = (plant_code, username) =>
    apiClient.post(`${BASE}/listWorkspaces`, { username, plant_code_id: plant_code });

export const createWorkspace = (plant_code, username, workspace_name) =>
    apiClient.post(`${BASE}/createWorkspace`, { username, workspace_name, plant_code_id: plant_code });

export const deleteWorkspace = (plant_code, username, workspace_name) =>
    apiClient.del(`${BASE}/deleteWorkspace`, {
        params: { username, workspace_name, plant_code_id: plant_code },
    });

// ── Workspace folder / features ───────────────────────────────────────────────

/** Load a workspace's saved analysis results + node configs from the backend. */
export const loadWorkspaceFolder = (plant_code, username, workspace_name) =>
    apiClient.post(`${BASE}/loadWorkspaceFolder`, { username, workspace_name, plant_code_id: plant_code });

/** Fetch supported analysis feature flags for a workspace. */
export const getWorkspaceFeatures = (plant_code, username, workspace_name) =>
    apiClient.get(`${BASE}/workspaceFeatures`, {
        params: { username, workspace_name, plant_code_id: plant_code },
    });

/** Available physical + custom tags for the tag-picker inside workspace nodes. */
export const listAvailableTags = (plant_code, username, workspace_name) =>
    apiClient.get(`${BASE}/listAvailableTags`, {
        params: { username, workspace_name, plant_code_id: plant_code },
    });

// ── Per-type analysis endpoints ───────────────────────────────────────────────
// Each analysis type now has its own dedicated backend endpoint (the previous
// contract fanned all of these out from one generic /workspace/analysis with
// an `analysis_type` body field — the refactored backend split them out).

export const getTimeseriesAnalysis = (plant_code, body) =>
    apiClient.post(`${BASE}/timeseriesAnalysis`, { ...body, plant_code_id: plant_code });

export const getCorrelationAnalysis = (plant_code, body) =>
    apiClient.post(`${BASE}/correlationAnalysis`, { ...body, plant_code_id: plant_code });

export const getEventDetection = (plant_code, body) =>
    apiClient.post(`${BASE}/eventDetection`, { ...body, plant_code_id: plant_code });

export const getRcaAnalysis = (plant_code, body) =>
    apiClient.post(`${BASE}/rcaAnalysis`, { ...body, plant_code_id: plant_code });

export const getKpiMonitoring = (plant_code, body) =>
    apiClient.post(`${BASE}/kpiMonitoring`, { ...body, plant_code_id: plant_code });

export const getMultiChartVisualization = (plant_code, body) =>
    apiClient.post(`${BASE}/multiChartVisualization`, { ...body, plant_code_id: plant_code });

/**
 * Consumed by TrendStatsNode when `data.analysisType === 'trend_analysis'` (that
 * type is produced by useWorkspaceInit's TYPE_MAP for the loadWorkspaceFolder
 * `trend_analysis` bucket) — TrendStatsNode otherwise reuses the same node UI
 * for plain `timeseries` via getTimeseriesAnalysis.
 */
export const getTrendAnalysis = (plant_code, body) =>
    apiClient.post(`${BASE}/trendAnalysis`, { ...body, plant_code_id: plant_code });

// ── Workspace analysis CRUD (shared across all analysis types) ───────────────

/** Update (re-run) an existing analysis record by `analysis_id`. */
export const updateWorkspaceAnalysis = (plant_code, body) =>
    apiClient.post(`${BASE}/updateWorkspaceAnalysis`, { ...body, plant_code_id: plant_code });

/** Delete a workspace analysis record. */
export const deleteWorkspaceAnalysis = (plant_code, body) =>
    apiClient.post(`${BASE}/deleteWorkspaceAnalysis`, { ...body, plant_code_id: plant_code });

// ── Workspace custom tags ─────────────────────────────────────────────────────

/** Create a derived custom tag formula scoped to the workspace. */
export const createCustomTag = (plant_code, body) =>
    apiClient.post(`${BASE}/createCustomTag`, { ...body, plant_code_id: plant_code });
