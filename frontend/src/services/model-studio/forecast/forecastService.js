/**
 * forecastService.js
 * Pure async functions for the Forecast feature: model registry
 * and pipelines. Mirrors modelService but targets /api/model-studio/forecast/*.
 * Experiment endpoints live in forecastExperimentService.js (ModelFactory
 * forecasting/experiment contract, { success, data } envelope).
 *
 * GET/CRUD helpers return the parsed JSON body (callers inspect `statusCode`/`data`).
 * run-* helpers return the raw Response so callers can read text/status as before.
 */
import { apiClient } from '../../apiClient';

const P = '/api/model-studio/forecast';

// ── Overview + Model registry ───────────────────────────────────────────────
// Overview refactored to the ModelFactory Forecasting contract — response is now
// { success, message, data: { kpis: [{ metric_name, value }] } }, not { statusCode, data }.
export const getForecastOverview = (plant_code) =>
    apiClient.get(`${P}/overview`, { params: { plant_code_id: plant_code } });
export const getForecastModelList = (plant_code) => apiClient.get(`${P}/model/modelList`, { params: { plant_code_id: plant_code } });
export const getForecastAssetList = (plant_code) => apiClient.get(`${P}/model/assetList`, { params: { plant_code_id: plant_code } });
export const getForecastModelOptions = (plant_code) => apiClient.get(`${P}/model/modelOptions`, { params: { plant_code_id: plant_code } });
export const getForecastAssetTags = (plant_code, assetId) => apiClient.get(`${P}/model/assetTags`, { params: { asset_id: assetId, plant_code_id: plant_code } });
export const createForecastModel = (plant_code, body) => apiClient.post(`${P}/model/createModel`, { ...body, plant_code_id: plant_code });
export const modifyForecastModel = (plant_code, body) => apiClient.put(`${P}/model/modifyModel`, { ...body, plant_code_id: plant_code });
export const deleteForecastModel = (plant_code, modelId) => apiClient.del(`${P}/model/deleteModel`, { params: { model_id: modelId, plant_code_id: plant_code } });

export const getForecastModelDetail = (plant_code, modelId) => apiClient.get(`${P}/model/getModelDetail`, { params: { model_id: modelId, plant_code_id: plant_code } });

// ── Pipelines ───────────────────────────────────────────────────────────────
export const getForecastPipelineList = (plant_code) => apiClient.get(`${P}/pipeline/pipelineList`, { params: { plant_code_id: plant_code } });
export const getForecastPipelineDetails = (plant_code, pipelineId) =>
    apiClient.get(`${P}/pipeline/pipelineDetails`, { params: { pipeline_id: pipelineId, plant_code_id: plant_code } });
export const getForecastAvailableTools = (plant_code) => apiClient.get(`${P}/pipeline/availableTools`, { params: { plant_code_id: plant_code } });
export const uploadForecastPipeline = (plant_code, body) => apiClient.post(`${P}/pipeline/upload`, { ...body, plant_code_id: plant_code });
export const updateForecastPipeline = (plant_code, pipelineId, body) =>
    apiClient.put(`${P}/pipeline/updatePipeline`, { ...body, pipeline_id: pipelineId, plant_code_id: plant_code });
export const deleteForecastPipeline = (plant_code, pipelineId) =>
    apiClient.del(`${P}/pipeline/deletePipeline`, { params: { pipeline_id: pipelineId, plant_code_id: plant_code } });
export const uploadForecastWorkflow = (plant_code, body) => apiClient.post(`${P}/pipeline/uploadWorkflow`, { ...body, plant_code_id: plant_code });
export const updateForecastWorkflow = (plant_code, pipelineId, body) =>
    apiClient.put(`${P}/pipeline/updateWorkflow`, { ...body, pipeline_id: pipelineId, plant_code_id: plant_code });

/** Returns the raw Response — caller reads .text()/.status (run output is parsed manually). */
export const runForecastWorkflow = (plant_code, body) =>
    apiClient.raw(`${P}/pipeline/run_workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, plant_code_id: plant_code }),
    });
export const runForecastPipeline = (plant_code, body) =>
    apiClient.raw(`${P}/pipeline/run_pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, plant_code_id: plant_code }),
    });
