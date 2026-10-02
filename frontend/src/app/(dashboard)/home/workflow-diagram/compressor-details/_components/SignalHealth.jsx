'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/src/lib/utils';
import { ChartSkeleton } from './PanelState';
import { useChartTheme } from '../_hooks/useChartTheme';
import { formatReading } from '../_utils/telemetryStats';

const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), {
    ssr: false,
    loading: () => <ChartSkeleton bars={6} />,
});

/**
 * SignalHealth — a half-donut showing how many of the equipment's tags are
 * currently sitting inside their own normal operating band.
 *
 * This deliberately replaces the old fabricated "Integrity 8.4 / Reliability
 * 7.2 / Process 9.1" gauges. The number here is defined and reproducible: a tag
 * is in band when its latest sample lies within ±2σ of its mean over the
 * selected window (see `_utils/telemetryStats.js`), and the gauge is simply the
 * share of tracked tags meeting that test.
 */

const toneFor = (pct) => {
    if (pct === null) return 'muted';
    if (pct >= 90) return 'success';
    if (pct >= 70) return 'warning';
    return 'danger';
};

export function SignalHealth({ fleet, summaries }) {
    const { palette, ready } = useChartTheme();
    const tone = toneFor(fleet.healthPct);

    const options = useMemo(() => {
        if (!ready || fleet.healthPct === null) return null;
        const accent = { success: palette.success, warning: palette.warning, danger: palette.danger }[tone] || palette.brand;

        return {
            chart: { type: 'pie', backgroundColor: 'transparent', margin: [0, 0, 0, 0], height: 150 },
            title: { text: undefined },
            credits: { enabled: false },
            legend: { enabled: false },
            tooltip: { enabled: false },
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 90,
                    innerSize: '78%',
                    size: '170%',
                    center: ['50%', '100%'],
                    borderWidth: 0,
                    dataLabels: { enabled: false },
                    states: { hover: { halo: null, brightness: 0 } },
                    enableMouseTracking: false,
                },
            },
            series: [{
                type: 'pie',
                data: [
                    { y: fleet.inBand, color: accent },
                    { y: fleet.deviating, color: palette.surface2 },
                ],
            }],
        };
    }, [ready, palette, fleet, tone]);

    const deviating = useMemo(
        () => summaries.filter((s) => s.hasData && !s.inBand).slice(0, 4),
        [summaries]
    );

    return (
        <div className="flex h-full flex-col gap-3 p-4">
            <div className="relative h-37.5 shrink-0">
                {/* Only shimmer while the theme tokens resolve — once ready with no
                    computable percentage, the centred "—" below is the answer. */}
                {options ? <HighchartsChart options={options} /> : !ready ? <ChartSkeleton bars={6} /> : null}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
                    <span
                        className={cn(
                            'text-3xl font-black leading-none tabular-nums tracking-tighter',
                            { success: 'text-success', warning: 'text-warning', danger: 'text-danger', muted: 'text-text-muted' }[tone]
                        )}
                    >
                        {fleet.healthPct === null ? '—' : `${Math.round(fleet.healthPct)}%`}
                    </span>
                    <span className="mt-1 text-tiny font-black uppercase tracking-widest text-text-subtle">
                        signals in band
                    </span>
                </div>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-canvas px-3 py-2 text-center">
                    <div className="text-lg font-black tabular-nums text-success">{fleet.inBand}</div>
                    <div className="text-tiny font-bold uppercase tracking-wider text-text-subtle">Stable</div>
                </div>
                <div className="rounded-lg border border-border bg-canvas px-3 py-2 text-center">
                    <div className={cn('text-lg font-black tabular-nums', fleet.deviating > 0 ? 'text-warning' : 'text-text-muted')}>
                        {fleet.deviating}
                    </div>
                    <div className="text-tiny font-bold uppercase tracking-wider text-text-subtle">Deviating</div>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {deviating.length === 0 ? (
                    <p className="px-1 py-3 text-center text-xs font-medium leading-relaxed text-text-muted">
                        Every tracked signal is within ±2σ of its own mean for this window.
                    </p>
                ) : (
                    <ul className="space-y-1.5">
                        {deviating.map((s) => (
                            <li
                                key={s.id || s.tag}
                                className="flex items-center justify-between gap-2 rounded-lg border border-warning/20 bg-warning/5 px-2.5 py-1.5"
                            >
                                <span className="min-w-0 truncate text-tiny font-bold text-text-secondary" title={s.label}>
                                    {s.label}
                                </span>
                                <span className="shrink-0 text-tiny font-black tabular-nums text-warning">
                                    {formatReading(s.latest)}{s.unit ? ` ${s.unit}` : ''}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
