/**
 * assetConfigService.js
 * Browser-side calls to the Decision Engine's asset-configuration resource,
 * routed through the local /api/decision-template/asset-config/* proxy →
 * <gateway>/p1/decisionModel/assetconfig/*.
 * Asset-centric (asset_id + plant_code_id only) — there is no template_id
 * input; the template is chosen via a dropdown embedded in the config
 * schema itself (see assetConfigOption's response). Confirmed live 2026-07-28
 * against the pasted decision-template API contract table.
 *
 * Every response is wrapped in { success, message, data } (confirmed via a
 * pasted contract table with real samples, 2026-08-03 — see
 * api-data/decision-template.json). Unwrapped once here rather than in every
 * consumer — see decisionService.js for the same convention.
 */
import { apiClient } from '../apiClient';

const BASE = '/api/decision-template/asset-config';

const unwrap = (res) => res?.data ?? res;

export const assetConfigService = {
    async checkAssetConfig(plant_code, assetId) {
        const res = await apiClient.post(`${BASE}/checkConfig`, { asset_id: assetId, plant_code_id: plant_code });
        return unwrap(res);
    },

    async getAssetConfigOptions(plant_code, assetId) {
        const res = await apiClient.post(`${BASE}/assetConfigOption`, { asset_id: assetId, plant_code_id: plant_code });
        return unwrap(res);
    },

    async createAssetConfig(plant_code, { assetId, createdBy, config }) {
        const res = await apiClient.post(`${BASE}/assetConfig`, {
            data: config,
            asset_id: assetId,
            created_by: createdBy,
            plant_code_id: plant_code,
        });
        return unwrap(res);
    },
};
