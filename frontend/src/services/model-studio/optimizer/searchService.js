/**
 * searchService.js
 * Pure async function for the Optimizer "Search Tags" (ModelFactory
 * optimizer/searchTags contract) — searches active timeseries tags plus
 * active ML model outputs and expressions by name/description, for populating
 * decision-variable / expression pickers. Empty query returns a full listing.
 * No React state — call this from hooks/components.
 *
 * Response envelope is { success, message, data }.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/optimizer/search-tags';

/** @returns {Promise<{description: string, iotdb_tag_id: string, path: string}[]>} */
export async function searchOptimizerTags(plant_code, query) {
    try {
        const json = await apiClient.get(P, { params: { query, plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}
