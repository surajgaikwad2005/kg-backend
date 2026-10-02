/**
 * plantGptService.js
 * PlantGPT / Master Agent API (gateway /api/decisionops-pod2/p1/aivee).
 */
import { apiClient } from '../apiClient';

/**
 * Ask PlantGPT a single query.
 * Backend field name is `plant_code_id` (confirmed live), not the generic
 * `plant_code` convention — kept as `plant_code` param name here since every
 * caller already threads useApp().plantCode under that name.
 * Returns { success, message, data: { query, response, agent_used, timestamp } }.
 */
export const askPlantGpt = (plant_code, payload, options) =>
    apiClient.post('/api/plant-gpt', { plant_code_id: plant_code, ...payload }, options);

/**
 * Root info endpoint — API/version metadata, no plant scoping.
 * Returns { success, message, data: { api, version, endpoint, example } }.
 */
export const getPlantGptInfo = (options) =>
    apiClient.get('/api/plant-gpt/info', options);
