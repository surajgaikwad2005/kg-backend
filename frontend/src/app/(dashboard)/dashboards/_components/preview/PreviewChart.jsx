import React from 'react';
import { C } from '../constants';
import { PreviewTrends } from './PreviewTrends';
import { PreviewComparisons } from './PreviewComparisons';
import { PreviewAdvanced } from './PreviewAdvanced';
import { useTheme } from '@/src/context/visuals/ThemeContext';

export default function PreviewChart({ chartData, chartType, colors, isLoading }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const labelColor = isDark ? '#94A3B8' : '#64748B';

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5.5 h-5.5 animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  const datasets = chartData?.datasets || [];
  const labels = chartData?.labels?.x?.values || [];

  const isHeatmapValid = chartType === 'heatmap' && chartData?.data?.length && chartData?.x_axis?.values?.length && chartData?.y_axis?.values?.length;
  const isKpiOrGaugeValid = (chartType === 'kpi' || chartType === 'kpi_card' || chartType === 'gauge') && (chartData?.value !== undefined);
  const isTableValid = chartType === 'table' && chartData?.columns?.length && chartData?.rows?.length;

  if (!isHeatmapValid && !isKpiOrGaugeValid && !isTableValid && (!datasets.length || !labels.length)) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-text-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7.5 h-7.5 opacity-40"><path d="M3 3v18h18" /><polyline points="7 14 11 10 14 13 21 6" /></svg>
        <span className="text-xs">Select an Equipment to Configure Chart</span>
      </div>
    );
  }

  const data = labels.map((label, index) => {
    const row = { label };
    datasets.forEach(ds => {
      row[ds.tag] = ds.data?.[index] ?? null;
    });
    return row;
  });

  const seriesKeys = datasets.map(ds => ds.tag);
  const chartColors = [
    colors?.a || '#2563EB',
    colors?.b || '#10B981',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EF4444'
  ];

  const margin = { top: 12, right: 20, left: 12, bottom: 12 };
  const tickInterval = Math.max(0, Math.floor(data.length / 5));

  const miniTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-2 text-[11px] shadow-lg">
          <div className="text-text-secondary mb-1">{label}</div>
          {payload.map((p, i) => {
            const ds = datasets.find(d => d.tag === p.dataKey);
            const displayName = ds?.label || p.name || p.dataKey;
            let displayVal = '';
            if (Array.isArray(p.value)) {
              displayVal = `${p.value[0]?.toFixed(2)} - ${p.value[1]?.toFixed(2)}`;
            } else if (typeof p.value === 'number') {
              displayVal = p.value.toFixed(2);
            } else {
              displayVal = p.value;
            }
            return (
              <div key={i} style={{ color: p.color }} className="font-semibold">
                {displayName}: {displayVal}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const xAxisLabelConfig = chartData?.labels?.x?.label ? {
    value: chartData.labels.x.label,
    position: 'insideBottom',
    offset: -5,
    style: { fontSize: 10, fill: labelColor, fontFamily: C.fontSans }
  } : undefined;

  const yAxisLabelConfig = chartData?.labels?.y?.label || datasets[0]?.label ? {
    value: chartData?.labels?.y?.label || datasets[0]?.label,
    angle: -90,
    position: 'insideLeft',
    offset: 10,
    style: { fontSize: 10, fill: labelColor, fontFamily: C.fontSans }
  } : undefined;

  const secondaryYAxisLabelConfig = (() => {
    if (Array.isArray(chartData?.labels?.y)) {
      const found = chartData.labels.y.find(y => y.position === 'right' || y.id === 'y_secondary');
      if (found) return {
        value: found.label,
        angle: 90,
        position: 'insideRight',
        offset: 10,
        style: { fontSize: 10, fill: labelColor, fontFamily: C.fontSans }
      };
    }
    const secondaryDs = datasets.find(d => d.axis === 'secondary');
    if (secondaryDs) return {
      value: secondaryDs.label,
      angle: 90,
      position: 'insideRight',
      offset: 10,
      style: { fontSize: 10, fill: labelColor, fontFamily: C.fontSans }
    };
    return undefined;
  })();

  const trends = ['line', 'multi_line', 'area', 'stacked_area', 'combo', 'threshold_line', 'min_max_band'];
  const comparisons = ['bar', 'column'];
  const advanced = ['kpi', 'kpi_card', 'gauge', 'table', 'heatmap'];

  const renderContent = () => {
    if (trends.includes(chartType)) {
      return (
        <PreviewTrends
          chartType={chartType}
          data={data}
          margin={margin}
          tickInterval={tickInterval}
          xAxisLabelConfig={xAxisLabelConfig}
          yAxisLabelConfig={yAxisLabelConfig}
          secondaryYAxisLabelConfig={secondaryYAxisLabelConfig}
          datasets={datasets}
          chartColors={chartColors}
          miniTooltip={miniTooltip}
        />
      );
    }
    if (comparisons.includes(chartType)) {
      return (
        <PreviewComparisons
          chartType={chartType}
          data={data}
          margin={margin}
          tickInterval={tickInterval}
          xAxisLabelConfig={xAxisLabelConfig}
          yAxisLabelConfig={yAxisLabelConfig}
          datasets={datasets}
          chartColors={chartColors}
          miniTooltip={miniTooltip}
        />
      );
    }
    if (advanced.includes(chartType)) {
      return (
        <PreviewAdvanced
          chartType={chartType}
          data={data}
          datasets={datasets}
          seriesKeys={seriesKeys}
          chartColors={chartColors}
          chartData={chartData}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {chartData?.title && (
        <div className="text-[13px] font-bold text-text-primary mb-2 text-center">
          {chartData.title}
        </div>
      )}
      <div className="flex-1 min-h-0">
        {renderContent()}
      </div>
      {datasets.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {datasets.map((ds, index) => (
            <div key={`${ds.tag || ds.id}-${index}`} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
              <span>{ds.label || ds.tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
