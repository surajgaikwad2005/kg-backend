/**
 * experimentService.js
 * Pure async functions for the Optimizer "Experiment" (ModelFactory
 * optimizer/* contract) — links an objective function, optional constraint,
 * optional constants, and a solver into a runnable experiment. CRUD + list.
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. create/modify/delete/getDetail are all POST per the
 * backend contract (not PUT/DELETE) — the id travels in the body.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/optimizer/experiment';

/** @param {string} plant_code @param {{optimizerFunctionId: number, constraintId?: number, constantsId?: number, solver: string, description?: string, createdBy?: string}} payload */
export async function createExperiment(plant_code, { optimizerFunctionId, constraintId, constantsId, solver, description, createdBy }) {
    const json = await apiClient.post(`${P}/create-experiment`, {
        optimizer_function_id: optimizerFunctionId,
        constraint_id: constraintId,
        constants_id: constantsId,
        solver,
        description,
        created_by: createdBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to create experiment');
    return json.data;
}

/** @param {string} plant_code @param {number} experimentId @param {{optimizerFunctionId?: number, constraintId?: number, constantsId?: number, solver?: string, description?: string, updatedBy?: string}} payload */
export async function modifyExperiment(plant_code, experimentId, { optimizerFunctionId, constraintId, constantsId, solver, description, updatedBy }) {
    const json = await apiClient.put(`${P}/modify-experiment`, {
        experiment_id: experimentId,
        optimizer_function_id: optimizerFunctionId,
        constraint_id: constraintId,
        constants_id: constantsId,
        solver,
        description,
        updated_by: updatedBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to update experiment');
    return json.data;
}

export async function deleteExperiment(plant_code, experimentId) {
    const json = await apiClient.del(`${P}/delete-experiment`, { params: { experiment_id: experimentId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete experiment');
    return json.data;
}

export async function getExperimentDetail(plant_code, experimentId) {
    const json = await apiClient.get(`${P}/experiment-detail`, { params: { experiment_id: experimentId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load experiment detail');
}

export async function getExperimentList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/experiment-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}


