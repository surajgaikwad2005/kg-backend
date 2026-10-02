'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createVisualChart } from '@/src/services/dashboard/dashboardService';
import { formatDateTime } from '@/src/app/(dashboard)/dashboards/_components/helpers';
import { useApp } from '@/src/context/AppContext';
import { useTimeRange } from '@/src/hooks/dashboard/useTimeRange';
import { summarizeDataset, summarizeFleet } from '../_utils/telemetryStats';

/**
 * useTagSeries
 * Step 3 of the data flow: POST /p1/dashboard/createVisual renders real samples
 * for the selected tags over the global time window. `visual_config.y_axis`
 * accepts an array, so every tag on screen is fetched in ONE round trip rather
 * than one request per panel.
 *
 * Re-runs whenever the shared TimeSelector window changes (useTimeRange listens
 * for the `timeRangeChanged` event), so the charts follow the global time range.
 */

/** Keep the point count sane across windows from an hour to a month. */
function pickInterval(startMs, endMs) {
    const hours = (endMs - startMs) / 3_600_000;
    if (hours <= 6) return '5m';
    if (hours <= 24) return '15m';
    if (hours <= 24 * 7) return '1h';
    return '1d';
}

export function useTagSeries(tagIds, { title = 'Compressor Telemetry', equipmentId = '' } = {}) {
    const { plantCode } = useApp();
    const range = useTimeRange();
    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);

    const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

    const startMs = range.start?.getTime?.() ?? 0;
    const endMs = range.end?.getTime?.() ?? 0;
    const tagKey = tagIds.join(',');

    useEffect(() => {
        if (!tagKey) { setChart(null); setError(null); return; }
        let alive = true;
        setLoading(true);
        setError(null);

        createVisualChart({
            visual_type: 'line',
            is_live: false,
            start_time: formatDateTime(new Date(startMs)),
            end_time: formatDateTime(new Date(endMs)),
            aggregation: 'avg',
            interval: pickInterval(startMs, endMs),
            logic_configuration: {},
            // Rule 0 — the plant identifier travels in the request body, sourced
            // from AppContext here and passed down (never read inside a service).
            plant_code_id: plantCode,
            visual_config: {
                title,
                x_axis: 'time',
                y_axis: tagKey.split(','),
                secondary_y_axis: null,
                value_tag: null,
                line_tags: null,
                column_tags: null,
                columns: null,
                equipment: equipmentId,
            },
        })
            .then((res) => {
                if (!alive) return;
                const data = res?.data ?? res;
                if (!data || !Array.isArray(data.datasets) || data.datasets.length === 0) {
                    setChart(null);
                    setError(res?.message || null);
                    return;
                }
                setChart(data);
            })
            .catch((err) => {
                if (!alive) return;
                setChart(null);
                setError(err?.message || 'Unable to load telemetry for this window');
            })
            .finally(() => { if (alive) setLoading(false); });

        return () => { alive = false; };
    }, [tagKey, startMs, endMs, plantCode, title, equipmentId, reloadToken]);

    const summaries = useMemo(
        () => (chart?.datasets || []).map(summarizeDataset),
        [chart]
    );

    const timestamps = useMemo(
        () => chart?.labels?.x?.values || [],
        [chart]
    );

    const fleet = useMemo(() => summarizeFleet(summaries), [summaries]);

    return { chart, summaries, timestamps, fleet, loading, error, refetch };
}
