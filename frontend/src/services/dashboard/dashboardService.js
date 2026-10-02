/**
 * dashboardService.js
 * Async service functions for P1 Dashboard API requests.
 */
import { apiClient } from '../apiClient';

export const DASHBOARD_PREFIX = '/api/dashboards';

/**
 * 1. Create a new dashboard
 * Endpoint: POST /api/dashboards/create-dashboard
 */
export async function createDashboard(dashboardData, plantCode) {
    const body = {
        dashboard_name: dashboardData.name || dashboardData.dashboard_name,
        plant_code_id: plantCode,
        description: dashboardData.description || 'Custom monitoring dashboard.',
        color: dashboardData.theme || dashboardData.color || 'blue',
    };
    const json = await apiClient.post(`${DASHBOARD_PREFIX}/create-dashboard`, body);
    return json?.data || json;
}

/**
 * 2. Get list of dashboards
 * Endpoint: GET /api/dashboards/dashboard-list
 */
export async function listDashboards(plantCode, { signal } = {}) {
    const json = await apiClient.get(`${DASHBOARD_PREFIX}/dashboard-list`, {
        params: { plant_code_id: plantCode },
        signal,
    });
    if (json?.data?.dashboards && Array.isArray(json.data.dashboards)) {
        return json.data.dashboards.map(d => ({
            ...d,
            id: d.dashboard_id || d.id,
            name: d.dashboard_name || d.name,
            theme: d.color || d.theme || 'blue',
            color: d.color || 'blue',
            total_visuals: d.total_visuals ?? d.visuals?.length ?? 0,
        }));
    }
    return [];
}
export const listDashboardGroups = listDashboards;
export const saveDashboardGroup = createDashboard;

/**
 * 3. Delete dashboard
 * Endpoint: DELETE /api/dashboards/delete-dashboard/{dashboard_id}
 */
export async function deleteDashboard(dashboardId, plantCode) {
    return apiClient.del(`${DASHBOARD_PREFIX}/delete-dashboard/${dashboardId}`, {
        params: { plant_code_id: plantCode }
    });
}
export const deleteDashboardGroup = deleteDashboard;

/**
 * 4. View dashboard details and visuals
 * Endpoint: GET /api/dashboards/view-dashboard/{dashboard_id}
 */
export async function viewDashboard(dashboardId, plantCode, { signal } = {}) {
    const json = await apiClient.get(`${DASHBOARD_PREFIX}/view-dashboard/${dashboardId}`, {
        params: { plant_code_id: plantCode },
        signal,
    });

    const rawDash = json?.data?.dashboard || null;
    if (!rawDash) return null;

    return {
        ...rawDash,
        id: rawDash.dashboard_id || rawDash.id,
        name: rawDash.dashboard_name || rawDash.name,
        visuals: (rawDash.visuals || []).map(v => ({
            ...v,
            id: v.visual_id || v.id,
            name: v.visual_name || v.name || v.title,
            chartType: v.visual_type || v.chartType,
            chartData: v.visual_config?.data || v.chartData || v.data
        }))
    };
}
export const viewWorkspace = viewDashboard;

/**
 * 5. Get equipment list
 * Endpoint: GET /api/dashboards/equipment-list
 */
export async function listEquipment(dashboardId, plantCode, { signal } = {}) {
    const params = { plant_code_id: plantCode };
    if (dashboardId) params.dashboard_id = dashboardId;

    const json = await apiClient.get(`${DASHBOARD_PREFIX}/equipment-list`, { params, signal });
    if (json?.data && Array.isArray(json.data)) {
        return json.data;
    }
    return json?.equipment || [];
}

/**
 * 6. Get equipment tags
 * Endpoint: GET /api/dashboards/equipment/{equipment_id}/tags
 */
export async function getTagsByEquipment(equipmentId, dashboardId, plantCode, { signal } = {}) {
    const params = { plant_code_id: plantCode };
    if (dashboardId) params.dashboard_id = dashboardId;

    return apiClient.get(`${DASHBOARD_PREFIX}/equipment/${equipmentId}/tags`, { params, signal });
}

/**
 * 7. Create visual chart rendering
 * Endpoint: POST /api/dashboards/create-visual
 */
export async function createVisualChart(payload, plantCode, { signal } = {}) {
    const finalPlantCode = payload?.plant_code_id || plantCode;
    const dashboardId = payload?.dashboard_id || "";

    const body = {
        plant_code_id: finalPlantCode,
        ...payload
    };

    const params = {
        plant_code_id: finalPlantCode,
        dashboard_id: dashboardId
    };

    return apiClient.post(`${DASHBOARD_PREFIX}/create-visual`, body, { params, signal });
}

/**
 * 8. Save visual chart
 * Endpoint: POST /api/dashboards/save-visual
 */
export async function createVisual(visualName, savedChart, plantCode) {
    const finalPlantCode = savedChart?.plant_code_id || savedChart?.data?.plant_code_id || plantCode || "";
    const dashboardId = savedChart?.dashboard_id || savedChart?.data?.dashboard_id || "";

    const body = {
        visual_name: visualName,
        plant_code_id: finalPlantCode,
        saved_chart: savedChart,
    };

    const params = {
        plant_code_id: finalPlantCode
    };
    if (dashboardId) params.dashboard_id = dashboardId;

    return apiClient.post(`${DASHBOARD_PREFIX}/save-visual`, body, { params });
}

/**
 * 9. Delete visual chart
 * Endpoint: DELETE /api/dashboards/delete-visual/{dashboard_id}/{visual_id}
 */
export async function deleteVisual(visualId, dashboardId, plantCode) {
    const params = { plant_code_id: plantCode };
    if (dashboardId) params.dashboard_id = dashboardId;

    return apiClient.del(`${DASHBOARD_PREFIX}/delete-visual/${dashboardId}/${visualId}`, { params });
}

/**
 * 10. Edit visual chart
 * Endpoint: PUT /api/dashboards/edit-visual/{visual_id}
 */
export async function editVisual(visualId, visualName, visualConfigPayload, dashboardId, plantCode) {
    const finalPlantCode = visualConfigPayload?.plant_code_id || plantCode || "";
    const dId = dashboardId || visualConfigPayload?.dashboard_id || "";

    const body = {
        plant_code_id: finalPlantCode,
        visual_name: visualName,
        visual_config: visualConfigPayload,
        dashboard_id: dId
    };

    const params = {
        plant_code_id: finalPlantCode
    };
    if (dId) params.dashboard_id = dId;

    return apiClient.put(`${DASHBOARD_PREFIX}/edit-visual/${visualId}`, body, { params });
}
