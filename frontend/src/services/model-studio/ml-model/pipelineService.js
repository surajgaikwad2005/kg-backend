/**
 * pipelineService.js
 * Pure async functions for the ml-model "Pipelines" (ModelFactory
 * mlModel/pipeline contract) — code & workflow pipelines: list, detail,
 * available tools, CRUD, and test-run execution.
 * No React state — call these from hooks/components.
 *
 * Response envelope is { success, message, data } — every helper checks
 * `json.success`, except runPipeline/runWorkflow which use `bodyOrErr`:
 * a stage failure (fetch/compile/execute) comes back as an HTTP 400 that
 * still carries a body the console output needs to render, so those two
 * must not lose the body to a thrown ApiError.
 */
import { apiClient, ApiError } from '../../apiClient';

const P = '/api/model-studio/ml-model/pipeline';

/** Return the parsed body even on HTTP error — run endpoints encode stage failures in the body. */
async function bodyOrErr(promise) {
    try {
        return await promise;
    } catch (err) {
        if (err instanceof ApiError) return err.data;
        throw err;
    }
}

export async function getPipelines(plant_code) {
    try {
        const json = await apiClient.get(`${P}/pipeline-list`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function getPipeline(plant_code, pipelineId) {
    const json = await apiClient.get(`${P}/pipeline-details`, { params: { pipeline_id: pipelineId, plant_code_id: plant_code } });
    if (json.success) return json.data;
    throw new Error(json.message || 'Failed to load pipeline details');
}

export async function getAvailableTools(plant_code) {
    try {
        const json = await apiClient.get(`${P}/available-tools`, { params: { plant_code_id: plant_code } });
        if (json.success && Array.isArray(json.data)) return json.data;
    } catch { /* fall through */ }
    return [];
}

export async function uploadPipeline(plant_code, payload) {
    const json = await apiClient.post(`${P}/upload-pipeline`, { ...payload, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to save pipeline');
    return json.data;
}

export async function updatePipeline(plant_code, pipelineId, payload) {
    const json = await apiClient.put(`${P}/update-pipeline`, { ...payload, pipeline_id: Number(pipelineId), plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to update pipeline');
    return json.data;
}

export async function uploadWorkflow(plant_code, payload) {
    const json = await apiClient.post(`${P}/upload-workflow`, { ...payload, plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to save workflow');
    return json.data;
}

export async function updateWorkflow(plant_code, pipelineId, payload) {
    const json = await apiClient.put(`${P}/update-workflow`, { ...payload, pipeline_id: Number(pipelineId), plant_code_id: plant_code });
    if (!json.success) throw new Error(json.message || 'Failed to update workflow');
    return json.data;
}

export async function deletePipeline(plant_code, pipelineId) {
    const json = await apiClient.del(`${P}/delete-pipeline`, { params: { pipeline_id: pipelineId, plant_code_id: plant_code } });
    if (!json.success) throw new Error(json.message || 'Failed to delete pipeline');
    return json.data;
}

/** Preview-runs a code pipeline against live data without saving. Stage failures return 400 with a body — use bodyOrErr so the console can still render them. */
export function runPipeline(plant_code, payload) {
    return bodyOrErr(apiClient.post(`${P}/run-pipeline`, { ...payload, plant_code_id: plant_code }));
}

/** Preview-runs a workflow pipeline against live data without saving. Same stage-failure body contract as runPipeline. */
export function runWorkflow(plant_code, payload) {
    return bodyOrErr(apiClient.post(`${P}/run-workflow`, { ...payload, plant_code_id: plant_code }));
}
