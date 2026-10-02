/**
 * expressionService.js
 * Async service functions for Dashboard Custom Calculation Expression API requests.
 */
import { apiClient } from '../apiClient';

export const DASHBOARD_PREFIX = '/api/dashboards';

export async function testExpression(expression, plantCode) {
    const body = {
        plant_code_id: plantCode,
        expression,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/test-expression`, body);
}

export async function createExpression(payload, plantCode) {
    const body = {
        plant_code_id: plantCode,
        ...payload,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/create-expression`, body);
}

export async function modifyExpression(payload, plantCode) {
    const body = {
        plant_code_id: plantCode,
        ...payload,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/modify-expression`, body);
}

export async function deleteExpression(expressionId, plantCode) {
    const body = {
        plant_code_id: plantCode,
        expression_id: expressionId,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/delete-expression`, body);
}

export async function pauseResumeExpression(expressionId, action, plantCode) {
    const body = {
        plant_code_id: plantCode,
        expression_id: expressionId,
        action,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/pause-resume-expression`, body);
}

export async function getExpressionList(equipment, plantCode) {
    const params = { plant_code_id: plantCode };
    if (equipment) params.equipment = equipment;
    return apiClient.get(`${DASHBOARD_PREFIX}/expression/expression-list`, { params });
}

export async function getExpressionDetail(expressionId, plantCode) {
    const body = {
        plant_code_id: plantCode,
        expression_id: expressionId,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/get-expression-detail`, body);
}

export async function validateCron(cronSchedule, plantCode, { signal } = {}) {
    const body = {
        plant_code_id: plantCode,
        cron_schedule: cronSchedule,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/validate-cron`, body, { signal });
}

export async function searchExpressionTags(query, equipment, plantCode) {
    const body = {
        plant_code_id: plantCode,
        query,
        equipment,
    };
    return apiClient.post(`${DASHBOARD_PREFIX}/expression/search-tags`, body);
}
