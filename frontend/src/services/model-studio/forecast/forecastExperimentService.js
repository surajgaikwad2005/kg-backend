/**
 * forecastExperimentService.js
 * Pure async functions for the Forecast "Experiments" (ModelFactory
 * forecasting/experiment contract) — list, detail, model-parameters, and CRUD.
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. Only `status` and `performance` are confirmed mutable via
 * updateExperiment; other fields (name/model/pipeline/parameters/times) are
 * set at creation time only.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/forecast/experiment';

export async function getForecastExperimentList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/experiment-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data?.experiments)) return json.data.experiments;
    } catch { /* fall through */ }
    return [];
}

export async function getForecastExperimentDetails(plant_code, experimentId) {
    const json = await apiClient.get(`${P}/experiment-details`, { params: { experiment_id: experimentId, plant_code_id: plant_code } });
    if (json.success) return json.data?.experiment;
    throw new Error(json.message || 'Failed to load experiment details');
}

/** @returns {Promise<{name:string,label:string,type:string,required?:boolean,nullable?:boolean,placeholder?:string,hint?:string}[]>} */
export async function getForecastModelParams(plant_code, modelId) {
    try {
        const json = await apiClient.get(`${P}/model-parameters`, { params: { model_id: modelId, plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data?.parameters)) return json.data.parameters;
    } catch { /* fall through */ }
    return [];
}

export async function createForecastExperiment(plant_code, payload) {
    const json = await apiClient.post(`${P}/create-experiment`, { ...payload, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to create experiment');
    return json.data;
}

export async function updateForecastExperiment(plant_code, experimentId, { status, performance, parameters, duration, experiment_name, created_by }) {
    const json = await apiClient.put(`${P}/update-experiment`, { 
        experiment_id: experimentId,
        plant_code_id: plant_code,
        status, 
        performance,
        parameters,
        duration,
        experiment_name,
        created_by
    });
    if (!json.success) throw new Error(json.message || 'Failed to update experiment');
    return json.data;
}

export async function deleteForecastExperiment(plant_code, experimentId) {
    const json = await apiClient.del(`${P}/delete-experiment`, { params: { experiment_id: experimentId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete experiment');
    return json.data;
}
