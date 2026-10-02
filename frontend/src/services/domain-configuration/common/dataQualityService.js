/**
 * domain-configuration/common/dataQualityService.js
 * Timeseries data-quality analysis. Talks to the dedicated p0/dataQuality
 * backend (separate from the CDM API) via the
 * /api/domain-configuration/timeseries/data-quality/* proxy route.
 *
 * Response envelope: { success, message, data: { meta, analysis } } where
 * `analysis` holds quality_score, dataset_overview, checks_summary, and the
 * per-check finding arrays (missing_values, frozen_signals, spikes, …), and
 * `meta` holds { rowsFetched, sensorsFound }. Flattened here into a single
 * object (analysis fields + meta) so callers keep working with one flat shape.
 */
import { apiClient } from '../../apiClient';

/** Fetch all numeric IoTDB data and run the quality analysis for a plant. */
export const analyzeDataQuality = (plant_code) =>
    apiClient
        .get('/api/domain-configuration/timeseries/data-quality/analyze', {
            params: { plant_code_id: plant_code },
        })
        .then((res) => {
            const payload = res?.data;
            if (!payload?.analysis) return null;
            return { ...payload.analysis, meta: payload.meta };
        });
