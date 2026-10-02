/**
 * deploymentService.js
 * Pure async functions for the Optimizer "Deployment" (ModelFactory
 * optimizer/deployment/* contract) — schedules an optimizer experiment to run
 * in an environment (optionally on a cron schedule). CRUD + list.
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. create/modify/delete/getDetail are all POST per the
 * backend contract (not PUT/DELETE) — the id travels in the body.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/optimizer/deployment';

/** @param {string} plant_code @param {{experimentId: number, environment: string, cronSchedule?: string, createdBy?: string}} payload */
export async function createDeployment(plant_code, { experimentId, environment, cronSchedule, createdBy }) {
    const json = await apiClient.post(`${P}/create-deployment`, {
        experiment_id: experimentId,
        environment,
        cron_schedule: cronSchedule,
        created_by: createdBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to create deployment');
    return json.data;
}

/** @param {string} plant_code @param {number} deploymentId @param {{experimentId?: number, environment?: string, cronSchedule?: string, updatedBy?: string}} payload */
export async function modifyDeployment(plant_code, deploymentId, { experimentId, environment, cronSchedule, updatedBy }) {
    const json = await apiClient.put(`${P}/modify-deployment`, {
        deployment_id: deploymentId,
        experiment_id: experimentId,
        environment,
        cron_schedule: cronSchedule,
        updated_by: updatedBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to update deployment');
    return json.data;
}

export async function deleteDeployment(plant_code, deploymentId) {
    const json = await apiClient.del(`${P}/delete-deployment`, { params: { deployment_id: deploymentId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete deployment');
    return json.data;
}

export async function getDeploymentDetail(plant_code, deploymentId) {
    const json = await apiClient.get(`${P}/deployment-detail`, { params: { deployment_id: deploymentId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load deployment detail');
}

/** Backend doc explicitly notes this list takes no plant_code_id param (global listing, same exception as objectiveFunctionList) — plant_code is still sent per CLAUDE.md Rule 0 as a defensive no-op the backend can ignore. */
export async function getDeploymentList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/deployment-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}


