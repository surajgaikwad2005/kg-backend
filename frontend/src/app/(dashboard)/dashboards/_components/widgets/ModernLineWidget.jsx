import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceArea } from 'recharts';
import { prepareChartData } from '../helpers';
import { useChartZoom } from '@/src/components/charts/useChartZoom';

export default function ModernLineWidget({ ws, isMini = false }) {
  const chartPayload = ws?.chartData || ws?.data || ws || {};
  const datasets = chartPayload?.datasets || [];
  
  const chartData = useMemo(() => prepareChartData(ws), [ws]);
  const { isZoomed, zoomedData, refAreaLeft, refAreaRight, mouseHandlers, resetZoom } = useChartZoom(chartData);

  const hasSecondary = datasets.some(ds => ds.axis === 'secondary');
  const xAxisLabel = chartPayload?.labels?.x?.label || "";
  const primaryYLabel = chartPayload?.labels?.y?.[0]?.label || chartPayload?.labels?.y?.label || "";
  const secondaryYLabel = chartPayload?.labels?.y?.[1]?.label || "";
  const colorPalette = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

  const MAX_X_CHARS = 40;
  const safeXLabel = xAxisLabel.length > MAX_X_CHARS
    ? `${xAxisLabel.substring(0, MAX_X_CHARS)}...`
    : xAxisLabel;

  return (
    <div className="flex h-full w-full min-h-[140px] min-w-0 flex-col pb-1 pr-2 [container-type:inline-size] relative">


      {isZoomed && (
        <button
          onClick={resetZoom}
          className="absolute top-2.5 right-2.5 z-50 inline-flex items-center gap-1.5 h-6 px-2.5 bg-surface/95 backdrop-blur-sm text-[10.5px] font-bold text-text-secondary border border-border rounded-lg shadow-sm hover:bg-canvas cursor-pointer transition-all active:scale-[0.95] select-none hover:text-brand hover:border-brand/30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          Reset Zoom
        </button>
      )}

      {/* Added zoomable-chart-container class here */}
      <div className="flex h-full w-full flex-1 flex-row min-h-0 zoomable-chart-container [&_*:not(button):not(button_*):not(.cursor-pointer):not(.cursor-pointer_*):not(.recharts-legend-wrapper):not(.recharts-legend-wrapper_*):not(.recharts-tooltip-wrapper):not(.recharts-tooltip-wrapper_*)]:cursor-crosshair">
        <div className="flex-1 min-w-0 h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            {/* Pass mouseHandlers and zoomedData here */}
            <LineChart data={zoomedData} margin={{ top: isMini ? 5 : 15, right: 0, left: 0, bottom: isMini ? 0 : 5 }} {...mouseHandlers}>
              {!isMini && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />}

              {!isMini && (
                <XAxis
                  dataKey="rawTimestamp"
                  tickFormatter={(tick) => (tick?.includes(' ') ? tick.split(' ')[1] : tick)}
                  stroke="var(--color-text-muted)"
                  fontSize={9}
                  tickLine={false}
                  tick={{ fontSize: 9, dy: 5, fill: 'var(--color-text-subtle)' }}
                  height={25}
                />
              )}

              {!isMini && (
                <YAxis
                  yAxisId="left"
                  stroke="var(--color-text-muted)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tick={{ dx: -5, fill: 'var(--color-text-subtle)' }}
                />
              )}

              {!isMini && hasSecondary && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--color-chart-3)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tick={{ dx: 5, fill: 'var(--color-chart-3)' }}
                />
              )}

              {!isMini && (
                <Tooltip
                  active={refAreaLeft ? false : undefined}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    fontSize: '11px',
                    padding: '6px 10px',
                    lineHeight: '1.2',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'color-mix(in srgb, var(--color-surface) 90%, transparent)',
                    color: 'var(--color-text-primary)',
                    backdropFilter: 'blur(4px)'
                  }}
                  itemStyle={{ padding: 0, marginTop: '2px', marginBottom: '2px' }}
                  labelStyle={{ marginBottom: '4px', fontWeight: 600, color: 'var(--color-text-primary)' }}
                />
              )}

              {!isMini && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '10px',
                    fontWeight: 500,
                    paddingBottom: '10px',
                    color: 'var(--color-text-subtle)'
                  }}
                />
              )}

              {datasets.map((dataset, idx) => {
                const isSecondary = dataset.axis === 'secondary';
                const dataKey = dataset.tag || dataset.label || `series_${dataset.id || idx}`;

                return (
                  <Line
                    key={dataset.id || idx}
                    yAxisId={isSecondary ? 'right' : 'left'}
                    type="monotone"
                    dataKey={dataKey}
                    name={dataset.label || dataset.tag || `Series ${idx + 1}`}
                    stroke={isSecondary ? 'var(--color-chart-3)' : colorPalette[idx % colorPalette.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                );
              })}
              
              {/* ReferenceArea used to draw the highlight box */}
              {refAreaLeft && refAreaRight ? (
                <ReferenceArea yAxisId="left" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#3b82f6" fillOpacity={0.15} />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 