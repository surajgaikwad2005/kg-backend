'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from './PanelState';
import { useChartTheme } from '../_hooks/useChartTheme';

const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), {
    ssr: false,
    loading: () => <ChartSkeleton />,
});

/**
 * TrendChart — the multi-tag trend for the selected compressor.
 *
 * Renders whatever POST /createVisual returned: one series per dataset, plotted
 * against the timestamps in `labels.x.values`. Colors come from the runtime
 * chart tokens (`useChartTheme`), so the chart follows every theme variant and
 * the accent color rather than a frozen palette.
 */

/** Backend timestamps are `YYYY-MM-DD HH:mm:ss`; Safari needs the T separator. */
const toEpoch = (stamp) => {
    const ms = new Date(String(stamp).replace(' ', 'T')).getTime();
    return Number.isFinite(ms) ? ms : null;
};

export function TrendChart({ timestamps, summaries, showLegend = true }) {
    const { palette, baseOptions, ready } = useChartTheme();

    const options = useMemo(() => {
        if (!ready || !baseOptions) return null;

        const xValues = timestamps.map(toEpoch);
        const useDatetime = xValues.every((v) => v !== null);

        return {
            ...baseOptions,
            chart: { ...baseOptions.chart, type: 'areaspline', zooming: { type: 'x' } },
            xAxis: {
                ...baseOptions.xAxis,
                type: useDatetime ? 'datetime' : 'category',
                categories: useDatetime ? undefined : timestamps,
                crosshair: { color: palette.border, dashStyle: 'Dash' },
            },
            yAxis: { ...baseOptions.yAxis, softMin: undefined },
            legend: {
                enabled: showLegend,
                align: 'left',
                verticalAlign: 'bottom',
                itemStyle: { color: palette.textMuted, fontSize: '10px', fontWeight: '700' },
                itemHoverStyle: { color: palette.textPrimary },
                symbolRadius: 3,
                symbolHeight: 8,
                symbolWidth: 8,
            },
            tooltip: { ...baseOptions.tooltip, shared: true, xDateFormat: '%e %b, %H:%M' },
            plotOptions: {
                ...baseOptions.plotOptions,
                areaspline: {
                    lineWidth: 2,
                    fillOpacity: 0.08,
                    marker: { enabled: false, symbol: 'circle', states: { hover: { enabled: true, radius: 4 } } },
                    states: { hover: { lineWidth: 2.5 } },
                },
            },
            series: summaries.map((summary, idx) => ({
                type: 'areaspline',
                name: summary.unit ? `${summary.label} (${summary.unit})` : summary.label,
                color: palette.series[idx % palette.series.length] || palette.brand,
                // `raw` (not the gap-filtered `values`) keeps point i aligned with
                // timestamp i — dropping nulls first would shift every later point.
                data: useDatetime
                    ? summary.raw.map((v, i) => [xValues[i] ?? i, Number.isFinite(v) ? v : null])
                    : summary.raw.map((v) => (Number.isFinite(v) ? v : null)),
                connectNulls: false,
            })),
        };
    }, [ready, baseOptions, palette, timestamps, summaries, showLegend]);

    if (!options) return <ChartSkeleton />;

    return (
        <div className="h-full w-full p-1">
            <HighchartsChart options={options} />
        </div>
    );
}
