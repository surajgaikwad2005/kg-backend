/**
 * visualsService.js
 * Visual-builder APIs: chart/visual CRUD, tag search, time-series data.
 * Each return the parsed JSON body.
 */
import { apiClient } from '../apiClient';

const withPlantCode = (body, plantCode) => {
    if (!plantCode) return body;
    if (body && typeof body === 'object') {
        if (Array.isArray(body)) {
            return body.map(item => {
                if (item && typeof item === 'object' && !item.plant_code_id) {
                    return { ...item, plant_code_id: plantCode };
                }
                return item;
            });
        } else if (!body.plant_code_id) {
            return { ...body, plant_code_id: plantCode };
        }
    }
    return body || { plant_code_id: plantCode };
};

// viewWorkspace / saveVisual / deleteVisual used to live here, pointing at
// /api/visuals/workspace, /api/visuals/save and /api/visuals/{id} — none of which
// have a route handler. They had no importers either: the dashboards feature
// imports its own same-named functions from services/dashboard/dashboardService.js,
// which do resolve. Removed rather than repaired to keep one live implementation.

export const listTags = (params = {}, plantCode = null) => {
    const plant_code_id = params?.plant_code_id || plantCode || undefined;
    const queryParams = typeof params === 'object' ? { ...params } : {};
    if (plant_code_id) queryParams.plant_code_id = plant_code_id;
    return apiClient.get('/api/visuals/list-tags', {
        params: queryParams
    });
};

// industrial-data proxy route removed from cpcp-configuration — disabled until
// this is rewired to a real backend. No current caller.
// /** Time-series data for one or more tags over a window. */
// export const getVisualData = (body) => apiClient.post('/api/cpcp/configuration/industrial-data/get_visual_data/', withPlantCode(body));

// /** Compute a formula / expression over tag data. */
// export const computeFormula = (body) => apiClient.post('/api/cpcp/configuration/industrial-data/compute', withPlantCode(body));

// ── Dashboard visuals APIs (p1_visuals backend) ──────────────────────────────

/**
 * All saved visual dashboards for a user + workspace.
 * @param {{ username: string, dashboard_name?: string }} body
 */
export const getSavedVisuals = (body) => apiClient.post('/api/visuals/get-saved-visuals', withPlantCode(body));

/**
 * Saved visuals time-series data for a configured dashboard.
 * @param {{ username: string, dashboard_name: string, start: string, end: string, tags: string[] }} body
 */
export const getVisualsData = (body) => apiClient.post('/api/visuals/get-visuals-data', withPlantCode(body));

/**
 * List all visual dashboard names for a user.
 * @param {{ username: string }} body
 */
export const listDashboards = (body) => apiClient.post('/api/visuals/list-dashboards', withPlantCode(body));

/**
 * Delete a visual dashboard.
 * @param {{ username: string, dashboard_name: string }} body
 */
export const deleteDashboard = (body) => apiClient.post('/api/visuals/delete-dashboard', withPlantCode(body));

/**
 * Delete a physical or custom tag from a dashboard.
 * @param {{ username: string, dashboard_name: string, tag_name: string }} body
 */
export const deleteTag = (body) => apiClient.post('/api/visuals/delete-tag', withPlantCode(body));

/**
 * Create a derived custom tag formula.
 * @param {{ username: string, dashboard_name: string, tag_name: string, formula: string, start_time?: string, end_time?: string }} body
 */
export const createCustomTag = (body) => apiClient.post('/api/visuals/create-custom-tag', withPlantCode(body));

/**
 * Fetch computed values for all custom tags in a dashboard.
 * @param {{ username: string, dashboard_name: string, start_time?: string, end_time?: string }} body
 */
export const fetchCustomTag = (body) => apiClient.post('/api/visuals/fetch-custom-tag', withPlantCode(body));

/**
 * Delete a custom tag formula — routes to the unified /delete_tag backend endpoint.
 * @param {{ username: string, dashboard_name: string, tag_name: string }} body
 */
export const deleteCustomTag = (body) => apiClient.post('/api/visuals/delete-tag', withPlantCode(body));
