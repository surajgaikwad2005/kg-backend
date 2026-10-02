/**
 * constraintsService.js
 * Pure async functions for the Optimizer "Constraints" (ModelFactory
 * optimizer/* contract) — CRUD + list of equality/inequality constraint sets
 * used by optimizer experiments.
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. create/modify/delete/getDetail are all POST per the
 * backend contract (not PUT/DELETE) — the id travels in the body.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/optimizer/constraints';

/** @param {string} plant_code @param {{equalityConstraint?: Record<string, string>, inequalityConstraint?: Record<string, string>, description?: string, createdBy?: string}} payload */
export async function createConstraints(plant_code, { equalityConstraint, inequalityConstraint, description, createdBy }) {
    const json = await apiClient.post(`${P}/create-constraints`, {
        equality_constraint: equalityConstraint,
        inequality_constraint: inequalityConstraint,
        description,
        created_by: createdBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to create constraints');
    return json.data;
}

/** @param {string} plant_code @param {number} constraintId @param {{equalityConstraint?: Record<string, string>, inequalityConstraint?: Record<string, string>, description?: string, updatedBy?: string}} payload */
export async function modifyConstraints(plant_code, constraintId, { equalityConstraint, inequalityConstraint, description, updatedBy }) {
    const json = await apiClient.put(`${P}/modify-constraints`, {
        constraint_id: constraintId,
        equality_constraint: equalityConstraint,
        inequality_constraint: inequalityConstraint,
        description,
        updated_by: updatedBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to update constraints');
    return json.data;
}

export async function deleteConstraints(plant_code, constraintId) {
    const json = await apiClient.del(`${P}/delete-constraints`, { params: { constraint_id: constraintId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete constraints');
    return json.data;
}

export async function getConstraintsDetail(plant_code, constraintId) {
    const json = await apiClient.get(`${P}/constraints-detail`, { params: { constraint_id: constraintId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load constraints detail');
}

export async function getConstraintsList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/constraints-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}


