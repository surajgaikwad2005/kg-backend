/**
 * configurationService.js
 * Service definitions for Scenario Extractor Configuration.
 * Communicates with Next.js API routes which mock the backend payload.
 */
import { apiClient } from '../apiClient';

const PREFIX = '/api/scenario-extractor/configuration';

export async function getScenarioList(plantCode) {
    const json = await apiClient.get(`${PREFIX}/get-scenario-list`, {
        params: { plant_code_id: plantCode }
    });
    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch scenario list');
    }
    return json.data || [];
}

export async function getScenarioDetail(plantCode, scenarioId) {
    const json = await apiClient.get(`${PREFIX}/get-scenario-detail`, {
        params: { plant_code_id: plantCode, scenario_id: scenarioId }
    });
    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch scenario details');
    }
    return json.data;
}

export async function createScenario(plantCode, payload) {
    const json = await apiClient.post(`${PREFIX}/create-scenario`, {
        ...payload,
        plant_code_id: plantCode
    });
    if (!json.success) {
        throw new Error(json.message || 'Failed to create scenario');
    }
    return json.data;
}

export async function modifyScenario(plantCode, payload) {
    const json = await apiClient.put(`${PREFIX}/modify-scenario`, {
        ...payload,
        plant_code_id: plantCode
    });
    if (!json.success) {
        throw new Error(json.message || 'Failed to modify scenario');
    }
    return json.data;
}

export async function deleteScenario(plantCode, scenarioId) {
    const json = await apiClient.del(`${PREFIX}/delete-scenario`, {
        params: { plant_code_id: plantCode, scenario_id: scenarioId }
    });
    if (!json.success) {
        throw new Error(json.message || 'Failed to delete scenario');
    }
    return json.data;
}

export const configurationService = {
    getScenarioList,
    getScenarioDetail,
    createScenario,
    modifyScenario,
    deleteScenario
};
