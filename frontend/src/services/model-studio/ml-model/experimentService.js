/**
 * experimentService.js
 * Pure async functions for the ml-model "Experiments" (ModelFactory
 * mlModel/experiment contract) — list, detail, options, CRUD, and training.
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. createExperiment only creates the experiment record
 * (status "created"); runTrainingContainer is a separate call that starts
 * the actual background training run (see useExperimentsTab.js, which
 * chains the two after a successful create).
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/ml-model/experiment';

export async function getExperimentList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/experiment-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function getExperimentDetails(plant_code, experimentId) {
    const json = await apiClient.get(`${P}/experiment-details`, { params: { experiment_id: experimentId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load experiment details');
}

/** @returns {Promise<{name:string,label:string,type:string,required?:boolean,nullable?:boolean,placeholder?:string,hint?:string}[]>} */
export async function getModelParams(plant_code, modelId) {
    try {
        const json = await apiClient.get(`${P}/model-parameters`, { params: { model_id: modelId, plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data?.parameters)) return json.data.parameters;
    } catch { /* fall through */ }
    return [];
}

/** Populates the Primary Metric dropdown for a given model. @returns {Promise<{label:string,value:string}[]>} */
export async function getMetricOptions(plant_code, modelId) {
    try {
        const json = await apiClient.get(`${P}/metric-options`, { params: { model_id: modelId, plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function createExperiment(plant_code, payload) {
    const json = await apiClient.post(`${P}/create-experiment`, { ...payload, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to create experiment');
    return json.data;
}

export async function updateExperiment(plant_code, experimentId, payload) {
    const json = await apiClient.put(`${P}/update-experiment`, { ...payload, experiment_id: experimentId, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to update experiment');
    return json.data;
}

export async function deleteExperiment(plant_code, experimentId) {
    const json = await apiClient.del(`${P}/delete-experiment`, { params: { experiment_id: experimentId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete experiment');
    return json.data;
}

/** Starts the background training run for an already-created experiment. */
export async function runTrainingContainer(plant_code, experimentId) {
    const json = await apiClient.post(`${P}/run-training`, { experiment_id: experimentId, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to start training');
    return json.data;
}
