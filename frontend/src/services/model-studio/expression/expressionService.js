/**
 * expressionService.js
 * Pure async functions for the Model Studio "Expression Builder" (refactored
 * ModelFactory `expression` contract) — list/detail/CRUD, test, pause/resume,
 * cron validation, and tag search. No React state — call these from hooks.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`. Auth is handled globally by the proxy layer (Bearer +
 * Cookie access_token), so no manual Authorization header is sent here.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/expression';

export async function getExpressionList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/expression-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function getExpressionDetail(plant_code, expressionId) {
    const json = await apiClient.get(`${P}/expression-detail`, { 
        params: { plant_code_id: plant_code, expression_id: expressionId } 
    });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load expression detail');
}

export async function createExpression(plant_code, payload) {
    const json = await apiClient.post(`${P}/create-expression`, { ...payload, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to create expression');
    return json.data;
}

export async function modifyExpression(plant_code, expressionId, payload) {
    const json = await apiClient.put(`${P}/modify-expression`, { ...payload, expression_id: expressionId, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to update expression');
    return json.data;
}

export async function deleteExpression(plant_code, expressionId) {
    const json = await apiClient.del(`${P}/delete-expression`, { 
        params: { plant_code_id: plant_code, expression_id: expressionId } 
    });
    if (!json.success) throw new Error(json.message || 'Failed to delete expression');
    return json.data;
}

export async function pauseResumeExpression(plant_code, expressionId, action) {
    const json = await apiClient.post(`${P}/pause-resume-expression`, { plant_code_id: plant_code, expression_id: expressionId, action });
    if (!json.success) throw new Error(json.message || `Failed to ${action} expression`);
    return json.data;
}

export async function testExpression(plant_code, expression) {
    const json = await apiClient.post(`${P}/test-expression`, { plant_code_id: plant_code, expression });
    if (!json.success) throw new Error(json.message || 'Expression test failed');
    return json.data;
}

export async function validateCron(plant_code, cronSchedule) {
    const json = await apiClient.get(`${P}/validate-cron`, { 
        params: { plant_code_id: plant_code, cron_schedule: cronSchedule } 
    });
    if (!json.success) throw new Error(json.message || 'Invalid cron schedule');
    return json.data;
}

export async function searchTags(plant_code, query) {
    try {
        const json = await apiClient.get(`${P}/search-tags`, { 
            params: { plant_code_id: plant_code, query } 
        });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}
