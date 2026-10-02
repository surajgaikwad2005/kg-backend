/**
 * artifactService.js
 * Pure async functions for the ml-model "Artifacts" (ModelFactory
 * mlModel/artifacts contract) — list, detail, upload, and CRUD.
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/ml-model/artifacts';

export async function getArtifactList(plant_code) {
    const json = await apiClient.get(`${P}/artifact-list`, { params: { plant_code_id: plant_code } });
    if (json.success && Array.isArray(json.data)) return json.data;
    throw new Error(json.message || 'Failed to load artifacts');
}

export async function getArtifactDetails(plant_code, artifactId) {
    const json = await apiClient.get(`${P}/artifact-details`, { params: { artifact_id: artifactId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load artifact detail');
}

/** plant_code_id is a multipart FORM field here (confirmed by the backend's own
 * sample form-data), not a query param — unlike every other endpoint in this file. */
export async function uploadArtifactFile(plant_code, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('plant_code_id', plant_code);
    const json = await apiClient.post(`${P}/upload`, formData, { params: { plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Upload failed');
    return json.data.model_path;
}

export async function createArtifact(plant_code, { artifactName, createdBy, assetIds, tagIds, modelPath }) {
    const json = await apiClient.post(`${P}/create-artifact`, {
        artifact_name: artifactName,
        created_by: createdBy,
        asset_ids: assetIds,
        tag_ids: tagIds,
        model_path: modelPath,
        plant_code_id: plant_code,
    }, { params: { plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to create artifact');
    return json.data;
}

export async function updateArtifact(plant_code, artifactId, { artifactName, createdBy, assetIds, tagIds }) {
    const json = await apiClient.put(`${P}/update-artifact`, {
        artifact_name: artifactName,
        created_by: createdBy,
        asset_ids: assetIds,
        tag_ids: tagIds,
        plant_code_id: plant_code,
    }, { params: { artifact_id: artifactId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to update artifact');
    return json.data;
}

export async function deleteArtifact(plant_code, artifactId) {
    const json = await apiClient.del(`${P}/delete-artifact`, { params: { artifact_id: artifactId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete artifact');
    return json.data;
}
