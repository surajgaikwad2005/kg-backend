/**
 * objectiveFunctionService.js
 * Pure async functions for the Optimizer "Objective Function" (ModelFactory
 * optimizer/* contract) — CRUD + list of max/min objective definitions
 * (expression + decision variables + optional bounds) used by optimizer
 * experiments. No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. create/modify/delete/getDetail are all POST per the
 * backend contract (not PUT/DELETE) — the id travels in the body.
 *
 * `fn` here maps to the backend's `function` field — `function` is a reserved
 * word so it can't be a destructured parameter name in JS, only an object key.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/optimizer/objective-function';

/** @param {string} plant_code @param {{type: 'max'|'min', fn: {expression: string}, decisionVariable: Record<string, string>, bounds?: Record<string, [number, number]>, description?: string, createdBy?: string}} payload */
export async function createObjectiveFunction(plant_code, { type, fn, decisionVariable, bounds, description, createdBy }) {
    const json = await apiClient.post(`${P}/create-objective-function`, {
        type,
        function: fn,
        decision_variable: decisionVariable,
        bounds,
        description,
        created_by: createdBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to create objective function');
    return json.data;
}

/** @param {string} plant_code @param {number} functionId @param {{type?: 'max'|'min', fn?: {expression: string}, decisionVariable?: Record<string, string>, bounds?: Record<string, [number, number]>, description?: string, updatedBy?: string}} payload */
export async function modifyObjectiveFunction(plant_code, functionId, { type, fn, decisionVariable, bounds, description, updatedBy }) {
    const json = await apiClient.put(`${P}/modify-objective-function`, {
        optimizer_function_id: functionId,
        type,
        function: fn,
        decision_variable: decisionVariable,
        bounds,
        description,
        updated_by: updatedBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to update objective function');
    return json.data;
}

export async function deleteObjectiveFunction(plant_code, functionId) {
    const json = await apiClient.del(`${P}/delete-objective-function`, { params: { optimizer_function_id: functionId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete objective function');
    return json.data;
}

export async function getObjectiveFunctionDetail(plant_code, functionId) {
    const json = await apiClient.get(`${P}/objective-function-detail`, { params: { optimizer_function_id: functionId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load objective function detail');
}

/** Backend doc explicitly notes this list takes no plant_code_id param (global listing, unlike every other *List endpoint here) — plant_code is still sent per CLAUDE.md Rule 0 as a defensive no-op the backend can ignore. */
export async function getObjectiveFunctionList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/objective-function-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}


