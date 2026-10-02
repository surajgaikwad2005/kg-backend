import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, Line, ReferenceArea } from 'recharts';
import { useChartZoom } from '@/src/components/charts/useChartZoom';

export default function ModernMinMaxBandWidget({ ws }) {
  const chartPayload = ws?.chartData || ws?.data || ws || {};
  const timestamps = chartPayload?.labels?.x?.values || [];
  const actualDs = chartPayload?.datasets?.[0];
  const band = chartPayload?.bands?.[0];

  const xAxisLabel = chartPayload?.labels?.x?.label || "";
  const primaryYLabel = chartPayload?.labels?.y?.label || chartPayload?.labels?.y?.[0]?.label || "";

  const convertedBandData = useMemo(() => {
    return timestamps.map((timestamp, index) => {
      const formattedTime = timestamp?.includes(" ")
        ? timestamp.split(" ")[1]
        : timestamp;

      const minVal = band?.min ?? 0;
      const maxVal = band?.max ?? 0;

      const bandValues = band?.values || [];
      const actualDsData = actualDs?.data || actualDs?.values || [];
      const actualVal = actualDsData[index] ?? bandValues[index] ?? null;

      return {
        name: formattedTime,
        rawTimestamp: timestamp,
        actualValue: actualVal,
        minBand: minVal,
        bandRange: maxVal - minVal,
        maxBand: maxVal,
        minBandLine: minVal,
      };
    });
  }, [timestamps, actualDs, band]);

  const { isZoomed, zoomedData, refAreaLeft, refAreaRight, mouseHandlers, resetZoom } = useChartZoom(convertedBandData);

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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          Reset Zoom
        </button>
      )}
      <div className="flex h-full w-full flex-1 flex-row min-h-0">
        <div className="flex-1 min-w-0 h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart data={zoomedData} margin={{ top: 15, right: 0, left: 0, bottom: 5 }} {...mouseHandlers}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />

              <XAxis
                dataKey="rawTimestamp"
                tickFormatter={(tick) => (tick?.includes(' ') ? tick.split(' ')[1] : tick)}
                stroke="var(--color-text-muted)"
                fontSize={9}
                tickLine={false}
                tick={{ fontSize: 9, dy: 5, fill: 'var(--color-text-subtle)' }}
                height={25}
              />

              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={45}
                tick={{ dx: -5, fill: 'var(--color-text-subtle)' }}
              />

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
                itemStyle={{
                  padding: 0,
                  marginTop: '2px',
                  marginBottom: '2px'
                }}
                labelStyle={{
                  marginBottom: '4px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)'
                }}
              />

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

              <Area
                dataKey="minBand"
                stackId="band"
                stroke="none"
                fill="transparent"
                legendType="none"
                tooltipType="none"
                isAnimationActive={false}
              />

              <Area
                dataKey="bandRange"
                stackId="band"
                fill="var(--color-chart-3)"
                fillOpacity={0.15}
                stroke="none"
                name={band?.label || "Operating Band"}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="actualValue"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name={actualDs?.label || actualDs?.tag || band?.label || "Actual"}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="maxBand"
                stroke="var(--color-chart-2)"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Maximum Limit"
                legendType="none"
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="minBandLine"
                stroke="var(--color-chart-4)"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Minimum Limit"
                legendType="none"
                isAnimationActive={false}
              />

              {refAreaLeft && refAreaRight ? (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#3b82f6" fillOpacity={0.15} />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}