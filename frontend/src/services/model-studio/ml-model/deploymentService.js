/**
 * deploymentService.js
 * Pure async functions for the ML Model "Deployment" (ModelFactory
 * mlModel/deployment contract) — create, modify, delete, pause/unpause,
 * list, detail, and run inference execution.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/ml-model/deployment';

export async function getDeploymentList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/deployment-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
        if (json.statusCode === 200 && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function getDeploymentDetail(plant_code, deploymentId) {
    const json = await apiClient.get(`${P}/get-deployment-detail`, {
        params: { deployment_id: deploymentId, plant_code_id: plant_code }
    });
    if (json.success || json.statusCode === 200) return json.data;
    throw new Error(json.message || 'Failed to load deployment details');
}

export async function createDeployment(plant_code, { experimentId, environment, cronSchedule, createdBy }) {
    const json = await apiClient.post(`${P}/create-deployment`, {
        experiment_id: Number(experimentId),
        environment,
        cron_schedule: cronSchedule,
        created_by: createdBy,
        plant_code_id: plant_code,
    });
    if (!json.success && json.statusCode !== 200) {
        throw new Error(json.message || 'Failed to create deployment');
    }
    return json.data;
}

export async function modifyDeployment(plant_code, { deploymentId, experimentId, environment, cronSchedule, status, updatedBy }) {
    const json = await apiClient.put(`${P}/modify-deployment`, {
        deployment_id: Number(deploymentId),
        experiment_id: Number(experimentId),
        environment,
        cron_schedule: cronSchedule,
        status,
        plant_code_id: plant_code,
        updated_by: updatedBy,
    });
    if (!json.success && json.statusCode !== 200) {
        throw new Error(json.message || 'Failed to update deployment');
    }
    return json.data;
}

export async function deleteDeployment(plant_code, deploymentId) {
    const json = await apiClient.del(`${P}/delete-deployment`, {
        params: {
            deployment_id: Number(deploymentId),
            plant_code_id: plant_code,
        }
    });
    if (!json.success && json.statusCode !== 200) {
        throw new Error(json.message || 'Failed to delete deployment');
    }
    return json.data;
}

export async function pauseUnpauseDeployment(plant_code, deploymentId, action, updatedBy) {
    const json = await apiClient.post(`${P}/pause-unpause-deployment`, {
        deployment_id: Number(deploymentId),
        action,
        plant_code_id: plant_code,
        updated_by: updatedBy,
    });
    if (!json.success && json.statusCode !== 200) {
        throw new Error(json.message || 'Failed to pause/resume deployment');
    }
    return json.data;
}

export async function runInferenceContainer(plant_code, deploymentId) {
    const json = await apiClient.post(`${P}/run-inference-container`, {
        deployment_id: Number(deploymentId),
        plant_code_id: plant_code,
    });
    if (!json.success && json.statusCode !== 200) {
        throw new Error(json.message || 'Failed to start inference task');
    }
    return json.data;
}
