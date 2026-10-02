/**
 * telemetryStats.js
 * Pure derivations over the datasets returned by POST /p1/dashboard/createVisual.
 *
 * The backend hands back `{ labels: { x: { values: [...] } }, datasets: [{ tag,
 * label, unit, data: [...] }] }` — raw numbers only, no summary statistics. Every
 * headline figure this page shows (latest reading, movement across the window,
 * whether a signal sits inside its own normal band) is computed here from those
 * real samples, so nothing on screen is invented.
 *
 * "In band" is a stated, defensible rule rather than a health score pulled from
 * thin air: a tag is in band when its latest sample lies within ±2σ of the mean
 * over the selected window. Anything outside that is flagged as deviating.
 */

const SIGMA_LIMIT = 2;

/** Drop nulls/NaNs the backend may emit for gaps in a tag's history. */
const finiteOnly = (values) =>
    (Array.isArray(values) ? values : []).filter((v) => typeof v === 'number' && Number.isFinite(v));

/**
 * Summarize one dataset into the figures the KPI tiles and health gauge use.
 *
 * `values` is gap-free and drives every statistic; `raw` keeps the original
 * array (gaps included) so charts can still line each point up with its
 * timestamp in `labels.x.values` — filtering would shift the indices.
 *
 * @param {{ tag?: string, label?: string, unit?: string, data?: number[] }} dataset
 * @returns {{
 *   id: string, tag: string, label: string, unit: string,
 *   values: number[], raw: (number|null)[], latest: number|null, first: number|null,
 *   min: number|null, max: number|null, avg: number|null,
 *   delta: number|null, deltaPct: number|null,
 *   stdDev: number, inBand: boolean, hasData: boolean
 * }}
 */
export function summarizeDataset(dataset) {
    const tag = String(dataset?.tag ?? dataset?.id ?? '');
    const raw = Array.isArray(dataset?.data) ? dataset.data : [];
    const values = finiteOnly(raw);
    const base = {
        id: String(dataset?.id ?? tag),
        tag,
        label: String(dataset?.label || tag),
        unit: String(dataset?.unit || ''),
        values,
        raw,
        hasData: values.length > 0,
    };

    if (values.length === 0) {
        return { ...base, latest: null, first: null, min: null, max: null, avg: null, delta: null, deltaPct: null, stdDev: 0, inBand: true };
    }

    const first = values[0];
    const latest = values[values.length - 1];
    const sum = values.reduce((acc, v) => acc + v, 0);
    const avg = sum / values.length;
    const variance = values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const delta = latest - first;

    return {
        ...base,
        latest,
        first,
        min: Math.min(...values),
        max: Math.max(...values),
        avg,
        delta,
        deltaPct: first !== 0 ? (delta / Math.abs(first)) * 100 : null,
        stdDev,
        // A flat signal has σ = 0 and can never deviate — treat it as in band.
        inBand: stdDev === 0 || Math.abs(latest - avg) <= SIGMA_LIMIT * stdDev,
    };
}

/**
 * Fleet-level roll-up across every summarized tag.
 * `healthPct` is the share of tags currently inside their own ±2σ band.
 */
export function summarizeFleet(summaries) {
    const withData = summaries.filter((s) => s.hasData);
    if (withData.length === 0) {
        return { total: summaries.length, tracked: 0, inBand: 0, deviating: 0, healthPct: null };
    }
    const inBand = withData.filter((s) => s.inBand).length;
    return {
        total: summaries.length,
        tracked: withData.length,
        inBand,
        deviating: withData.length - inBand,
        healthPct: (inBand / withData.length) * 100,
    };
}

/** Compact display for readings that span wildly different magnitudes. */
export function formatReading(value, digits = 2) {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—';
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
    if (abs >= 100) return value.toFixed(0);
    return value.toFixed(digits);
}

/** Signed percentage with a leading +/- for movement badges. */
export function formatDeltaPct(deltaPct) {
    if (deltaPct === null || deltaPct === undefined || !Number.isFinite(deltaPct)) return null;
    const rounded = Math.abs(deltaPct) < 0.05 ? 0 : deltaPct;
    return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}%`;
}
