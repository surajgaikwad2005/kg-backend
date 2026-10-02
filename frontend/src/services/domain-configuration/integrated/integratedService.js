/**
 * domain-configuration/integrated/integratedService.js
 * Service for the CDM Integrated Domain Intelligence View endpoints.
 * Provides cross-domain consolidated intelligence across Integrity,
 * Reliability, Production, and Maintenance layers.
 */
import { apiClient } from '../../apiClient';

const unwrap = (res) => {
    if (!res || typeof res !== 'object') return res;
    if ('data' in res) {
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
            return {
                message: res.message,
                success: res.success,
                ...res.data,
            };
        }
        return res.data;
    }
    return res;
};

/**
 * Fetch label tabs and row counts for the integrated view.
 * GET /p0/cdm/integrated/labels?plant_code_id={plantCode}
 */
export async function getIntegratedLabels(plantCode) {
    if (!plantCode) return null;
    const res = await apiClient.get('/api/domain-configuration/integrated/labels', {
        params: { plant_code_id: plantCode },
    });
    return unwrap(res);
}

/**
 * Fetch layer columns and architectural schema definitions for a label.
 * GET /p0/cdm/integrated/columns?label={label}
 */
export async function getIntegratedColumns(label = 'integrity') {
    if (!label) return null;
    const res = await apiClient.get('/api/domain-configuration/integrated/columns', {
        params: { label },
    });
    return unwrap(res);
}

/**
 * Fetch paginated integrated matrix rows for a label.
 * GET /p0/cdm/integrated/view?label={label}&plant_code_id={plantCode}&include_processed=true&page=1&page_size=50
 */
export async function getIntegratedView(plantCode, {
    label = 'integrity',
    include_processed = true,
    page = 1,
    page_size = 50,
} = {}) {
    if (!plantCode) return null;
    const res = await apiClient.get('/api/domain-configuration/integrated/view', {
        params: {
            plant_code_id: plantCode,
            label,
            include_processed,
            page,
            page_size,
        },
    });
    return unwrap(res);
}

/**
 * Trigger recomputation and save of the integrated view data after table edits.
 * POST /p0/cdm/integrated/recompute
 */
export async function recomputeIntegratedView(plantCode, payload = {}) {
    if (!plantCode) throw new Error('plant_code_id is required to recompute integrated view');
    const res = await apiClient.post('/api/domain-configuration/integrated/recompute', {
        plant_code_id: plantCode,
        ...payload,
    });
    return unwrap(res);
}
