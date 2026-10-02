/**
 * modelRegistryService.js
 * Pure async functions for the ml-model "Model Registry" (ModelFactory
 * mlModel/modelRegistry contract) — asset/tag lookups, list, detail, options,
 * and CRUD. No React state — call these from hooks/components.
 *
 * getAssetList / getAssetTags are used by BOTH the Models tab (Register/Modify
 * modal's Equipment + Tags/Target Tag pickers) and the Artifacts tab (Associate
 * Asset + Version Tag pickers) — kept here since they're all part of the same
 * mlModel/modelRegistry contract, just consumed from two tabs.
 *
 * Response envelope is { success, message, data } (not the older { statusCode,
 * data } shape) — every helper checks `json.success`.
 */
import { apiClient, ApiError } from '../../apiClient';

const P = '/api/model-studio/ml-model/model-registry';

/** Used by: Models tab (Equipment select) + Artifacts tab (Associate Asset select). */
export async function getAssetList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/asset-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

/**
 * Used by: Models tab (Register/Modify modal's Select Tags + Target Tag dropdowns)
 * + Artifacts tab (Version Tag picker, fanned out per selected asset).
 * @returns {Promise<{description: string, iotdb_tag_id: string, path: string}[]>}
 */
export async function getAssetTags(plant_code, assetId) {
    try {
        const json = await apiClient.get(`${P}/asset-has-tags`, { 
            params: { asset_id: assetId, plant_code_id: plant_code } 
        });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function getModelList(plant_code) {
    try {
        const json = await apiClient.get(`${P}/model-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
        throw new Error(json.message || 'Failed to load models');
    } catch (e) {
        // Confirmed live (2026-08-10): this backend signals "no models registered
        // yet" as a 404 with message "Models not found" — a normal empty state,
        // not a failure — instead of 200 + []. Only swallow that specific shape;
        // any other error (500, network, auth) still throws so the real error UI
        // (not a blank list) surfaces it.
        if (e instanceof ApiError && e.status === 404) return [];
        throw e;
    }
}

export async function getModelOptions(plant_code) {
    try {
        const json = await apiClient.get(`${P}/model-options`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function getModelDetail(plant_code, modelId) {
    const json = await apiClient.get(`${P}/model-detail`, { 
        params: { model_id: modelId, plant_code_id: plant_code } 
    });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load model detail');
}

/**
 * @param {string} plant_code
 * @param {{name: string, modelSelection: string, modelType: string, equipment: string,
 *   description: string, tags: string[], targetTag: string|null}} payload
 */
export async function createModel(plant_code, { name, modelSelection, modelType, equipment, description, tags, targetTag }) {
    const json = await apiClient.post(`${P}/create-model`, {
        model_name: name,
        model_selection: modelSelection,
        description,
        assets: [equipment],
        tags,
        target_tag: targetTag || null,
        model_type: modelType,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to create model');
    return json.data;
}

/**
 * NOTE: the backend contract's modifyModel request body has no `model_name`
 * field (rename isn't supported via this endpoint) — the Name input is locked
 * in the Modify Model form (see ModelsTab.jsx).
 * @param {string} plant_code
 * @param {{modelId: number, modelSelection: string, modelType: string, equipment: string,
 *   description: string, tags: string[], targetTag: string|null}} payload
 */
export async function modifyModel(plant_code, { modelId, modelSelection, modelType, equipment, description, tags, targetTag }) {
    const json = await apiClient.put(`${P}/modify-model`, {
        model_id: modelId,
        model_selection: modelSelection,
        description,
        assets: [equipment],
        tags,
        target_tag: targetTag || null,
        model_type: modelType,
        plant_code_id: plant_code,
    });
    if (!json.success) throw new Error(json.message || 'Failed to update model');
    return json.data;
}

export async function deleteModel(plant_code, modelId) {
    const json = await apiClient.del(`${P}/delete-model`, { 
        params: { model_id: modelId, plant_code_id: plant_code } 
    });
    if (!json.success) throw new Error(json.message || 'Failed to delete model');
    return json.data;
}
