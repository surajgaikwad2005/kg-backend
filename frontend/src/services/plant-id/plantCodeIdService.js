/**
 * plantCodeIdService.js
 * Plant Code ID registry CRUD via the local /api/plant-id proxy.
 *
 * Refactored backend contract (configRouter/plants): request/response fields
 * are plant_code_id / label / industry, and every response is wrapped in
 * { success, message, data }. apiClient does not auto-unwrap that envelope,
 * so this service unwraps `data` and re-shapes items to the internal
 * { id, name, industry } contract the UI (PlantIdSelector, DeletePlantModal)
 * already consumes.
 */
import { apiClient } from '../apiClient';

const BASE_URL = '/api/plant-id';

const toPlant = (p) => ({
    id: p?.plant_code_id,
    name: p?.label,
    industry: p?.industry,
    ...p,
});

export const plantCodeIdService = {
    /** List all registered plants. Throws ApiError on non-2xx. */
    async getPlantIds() {
        const res = await apiClient.get(BASE_URL);
        const items = res?.data?.plants ?? [];
        return { plant_ids: items.map(toPlant) };
    },

    /**
     * Register a new plant (admin only).
     * @param {string} plantCodeId  1-50 chars, becomes the plant's identity key.
     * @param {string} [label]      Display label. Defaults to plantCodeId.
     * @param {string} industry     Backend industry enum (e.g. oil_gas, cement) — required.
     */
    async createPlantId(plantCodeId, label, industry) {
        const res = await apiClient.post(BASE_URL, {
            plant_code_id: plantCodeId,
            label: label || plantCodeId,
            industry,
        });
        return { plant_id: toPlant({ ...res?.data, plant_code_id: res?.data?.plant_code_id || plantCodeId }) };
    },

    /** Preview cascade-purge impact for a plant (admin only). */
    async getPurgePreview(plantCodeId) {
        const res = await apiClient.get(`${BASE_URL}/${encodeURIComponent(plantCodeId)}/purge-preview`, {
            params: { plant_code_id: plantCodeId },
        });
        return res?.data ?? {};
    },

    /** Delete a plant. Pass cascade=true + confirm=plantCodeId to purge all data. */
    async deletePlantId(plantCodeId, { cascade = false, confirm = null } = {}) {
        const params = { plant_code_id: plantCodeId };
        if (cascade) params.cascade = 'true';
        if (confirm) params.confirm = confirm;
        return apiClient.del(`${BASE_URL}/${encodeURIComponent(plantCodeId)}`, {
            params,
        });
    },

    /**
     * Remove all localStorage keys scoped to a plant_code_id after deletion.
     * Handles three key patterns observed in the app:
     *   admin_committed_sources::PLANT_02   (double-colon suffix)
     *   admin_job_ids_PLANT_02              (underscore suffix)
     *   pnid_validated_workspace:Plant_1    (single-colon suffix)
     * Also clears admin_plant_id if it matches the deleted plant.
     */
    clearPlantLocalStorage(plantCodeId) {
        const toRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (
                key.endsWith(`::${plantCodeId}`) ||
                key.endsWith(`_${plantCodeId}`) ||
                key.endsWith(`:${plantCodeId}`)
            ) {
                toRemove.push(key);
            }
        }

        // Clear the active plant selection if it pointed to the deleted plant
        try {
            const raw = localStorage.getItem('admin_plant_id');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.id === plantCodeId || parsed?.plant_code_id === plantCodeId) {
                    toRemove.push('admin_plant_id');
                }
            }
        } catch { /* malformed JSON — skip */ }

        toRemove.forEach(k => localStorage.removeItem(k));
    },
};
