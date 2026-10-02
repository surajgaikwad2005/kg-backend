/**
 * ml-model/modelService.js
 * Pure async functions for the ML Model Factory Overview tab.
 * No React state — call these from hooks or components.
 *
 * All network goes through `apiClient` (no bare `fetch`). apiClient throws
 * `ApiError` on non-2xx and returns the parsed JSON body on success.
 */
import { apiClient } from '../../apiClient';

// Refactored ModelFactory Overview contract: response is now { success, message,
// data: [{ name, counts, info }] }, not { statusCode, data }.
export async function getOverviewStats(plant_code) {
    const json = await apiClient.get('/api/model-studio/ml-model/overview', { params: { plant_code_id: plant_code } });
    if ((json.success || json.statusCode === 200) && Array.isArray(json.data)) return json.data;
    throw new Error(json.message || 'Failed to load overview stats');
}
