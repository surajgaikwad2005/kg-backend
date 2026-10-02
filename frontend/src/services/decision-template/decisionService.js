/**
 * decisionService.js
 * Browser-side calls to the Decision Engine, routed through the local
 * /api/decision-template/* proxy → <gateway>/p1/decisionModel/decisionworkflow/*.
 * Components/hooks import these functions — never call fetch directly.
 * Leaf op names and plant_code_id placement confirmed live 2026-07-15 against
 * http://172.16.0.12/api/decisionops-pod2/openapi.json.
 *
 * Every response is wrapped in { success, message, data } (confirmed via a
 * pasted contract table with real samples, 2026-08-03 — see
 * api-data/decision-template.json). apiClient does not auto-unwrap that
 * envelope (other domains on this app use different conventions), so this
 * service unwraps `data` once here — matching the precedent in
 * plantCodeIdService.js — instead of every consumer guessing `res?.data ?? res`.
 */
import { apiClient } from '../apiClient';

const BASE = '/api/decision-template';

const unwrap = (res) => res?.data ?? res;

export const decisionService = {
    async getWorkflows(plant_code) {
        const res = await apiClient.get(`${BASE}/getWorkflowList`, { params: { plant_code_id: plant_code } });
        return unwrap(res);
    },

    async getTemplateOptions(plant_code) {
        const res = await apiClient.get(`${BASE}/templateOptionList`, { params: { plant_code_id: plant_code } });
        return unwrap(res);
    },

    async createWorkflow(plant_code, payload) {
        const res = await apiClient.post(`${BASE}/configWorkflow`, { ...payload, plant_code_id: plant_code });
        return unwrap(res);
    },

    async updateWorkflow(plant_code, payload) {
        const res = await apiClient.put(`${BASE}/configWorkflow`, { ...payload, plant_code_id: plant_code });
        return unwrap(res);
    },

    async deleteWorkflow(plant_code, templateId) {
        const res = await apiClient.del(`${BASE}/configWorkflow`, {
            params: { plant_code_id: plant_code },
            body: { template_id: templateId },
        });
        return unwrap(res);
    },

    async viewWorkflow(plant_code, templateId) {
        const res = await apiClient.post(`${BASE}/viewWorkflow`, { template_id: templateId, plant_code_id: plant_code });
        return unwrap(res);
    },

    async getSnapshotFeatures(plant_code) {
        const res = await apiClient.get(`${BASE}/snapshotFeatureList`, { params: { plant_code_id: plant_code } });
        return unwrap(res);
    },

    async getSnapshotOptions(plant_code, templateId) {
        const res = await apiClient.post(`${BASE}/snapshotOptionList`, { template_id: templateId, plant_code_id: plant_code });
        return unwrap(res);
    },

    async viewSnapshot(plant_code, templateId) {
        const res = await apiClient.post(`${BASE}/viewSnapshot`, { template_id: templateId, plant_code_id: plant_code });
        return unwrap(res);
    },

    async updateSnapshot(plant_code, templateId, snapshot) {
        const res = await apiClient.put(`${BASE}/configSnapshot`, { template_id: templateId, snapshot, plant_code_id: plant_code });
        return unwrap(res);
    },

    async deleteSnapshot(plant_code, templateId) {
        const res = await apiClient.del(`${BASE}/configSnapshot`, {
            params: { plant_code_id: plant_code },
            body: { template_id: templateId },
        });
        return unwrap(res);
    },
};
