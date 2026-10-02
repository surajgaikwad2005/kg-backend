/**
 * constantsService.js
 * Pure async functions for the Optimizer "Constants" (ModelFactory
 * optimizer/* contract) — CRUD + list of named numeric constants used by
 * optimizer experiments (e.g. { k1: 1.25, k2: 0.98 }).
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. create/modify/delete/getDetail are all POST per the
 * backend contract (not PUT/DELETE) — the id travels in the body.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/optimizer/constants';

/** @param {string} plant_code @param {{constants: Record<string, number>, description?: string, createdBy?: string}} payload */
export async function createConstants(plant_code, { constants, description, createdBy }) {
    const json = await apiClient.post(`${P}/create-constants`, {
        constants,
        description,
        created_by: createdBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to create constants');
    return json.data;
}

/** @param {string} plant_code @param {number} constantId @param {{constants?: Record<string, number>, description?: string, updatedBy?: string}} payload */
export async function modifyConstants(plant_code, constantId, { constants, description, updatedBy }) {
    const json = await apiClient.put(`${P}/modify-constants`, {
        constant_id: constantId,
        constants,
        description,
        updated_by: updatedBy,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to update constants');
    return json.data;
}

export async function deleteConstants(plant_code, constantId) {
    const json = await apiClient.del(`${P}/delete-constants`, { params: { constant_id: constantId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete constants');
    return json.data;
}

export async function getConstantsDetail(plant_code, constantId) {
    const json = await apiClient.get(`${P}/constants-detail`, { params: { constant_id: constantId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load constants detail');
}

export async function getConstantsList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/constants-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}


