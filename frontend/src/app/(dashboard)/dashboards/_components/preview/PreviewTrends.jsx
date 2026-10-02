import React from 'react';
import {
  ResponsiveContainer, LineChart, AreaChart, ComposedChart,
  Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceArea
} from 'recharts';
import { C } from '../constants';
import { usePreviewZoom } from './_hooks/usePreviewZoom';

export function PreviewTrends({ chartType, data, margin, tickInterval, xAxisLabelConfig, yAxisLabelConfig, secondaryYAxisLabelConfig, datasets, chartColors, miniTooltip }) {
  const gridStroke = 'var(--do-border)';
  const tickColor = 'var(--do-text-4)';
  const axisStroke = 'var(--do-border-2)';

  const z = usePreviewZoom(data);

  const renderReferenceArea = () => {
    if (!z.refAreaLeft || !z.refAreaRight) return null;
    return <ReferenceArea x1={z.refAreaLeft} x2={z.refAreaRight} strokeOpacity={0.3} fill="var(--do-brand)" fillOpacity={0.15} />;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
      case 'multi_line':
        return (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <LineChart data={z.zoomedData} margin={margin} {...z.mouseHandlers}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" interval={z.dynamicTickInterval} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} label={xAxisLabelConfig} />
              <YAxis width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={yAxisLabelConfig} />
              <Tooltip content={miniTooltip} />
              {datasets.map((ds, index) => (
                <Line key={`${ds.tag || ds.id}-${index}`} type="monotone" dataKey={ds.tag} name={ds.label || ds.tag} stroke={chartColors[index % chartColors.length]} strokeWidth={2} dot={false} />
              ))}
              {renderReferenceArea()}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <AreaChart data={z.zoomedData} margin={margin} {...z.mouseHandlers}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" interval={z.dynamicTickInterval} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} label={xAxisLabelConfig} />
              <YAxis width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={yAxisLabelConfig} />
              <Tooltip content={miniTooltip} />
              {datasets.map((ds, index) => {
                const color = chartColors[index % chartColors.length];
                return <Area key={`${ds.tag || ds.id}-${index}`} type="monotone" dataKey={ds.tag} name={ds.label || ds.tag} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={false} />;
              })}
              {renderReferenceArea()}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'stacked_area':
        return (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <AreaChart data={z.zoomedData} margin={margin} {...z.mouseHandlers}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" interval={z.dynamicTickInterval} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} label={xAxisLabelConfig} />
              <YAxis width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={yAxisLabelConfig} />
              <Tooltip content={miniTooltip} />
              {datasets.map((ds, index) => {
                const color = chartColors[index % chartColors.length];
                return <Area key={`${ds.tag || ds.id}-${index}`} type="monotone" dataKey={ds.tag} name={ds.label || ds.tag} stroke={color} fill={color} fillOpacity={0.15} stackId="1" strokeWidth={2} dot={false} />;
              })}
              {renderReferenceArea()}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'combo':
        return (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart data={z.zoomedData} margin={margin} {...z.mouseHandlers}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" interval={z.dynamicTickInterval} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} label={xAxisLabelConfig} />
              <YAxis yAxisId="left" width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={yAxisLabelConfig} />
              <YAxis yAxisId="right" orientation="right" width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={secondaryYAxisLabelConfig} />
              <Tooltip content={miniTooltip} cursor={false} />
              {datasets.map((ds, index) => {
                const color = chartColors[index % chartColors.length];
                const yAxisId = ds.axis === 'secondary' ? 'right' : 'left';
                if (ds.type === 'bar' || ds.type === 'column') return <Bar key={`${ds.tag || ds.id}-${index}`} yAxisId={yAxisId} dataKey={ds.tag} name={ds.label || ds.tag} fill={color} />;
                if (ds.type === 'area') return <Area key={`${ds.tag || ds.id}-${index}`} yAxisId={yAxisId} type="monotone" dataKey={ds.tag} name={ds.label || ds.tag} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={false} />;
                return <Line key={`${ds.tag || ds.id}-${index}`} yAxisId={yAxisId} type="monotone" dataKey={ds.tag} name={ds.label || ds.tag} stroke={color} strokeWidth={2} dot={false} />;
              })}
              {renderReferenceArea()}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'threshold_line': {
        const allValues = datasets.flatMap(ds => ds.data || []);
        const maxVal = allValues.length > 0 ? Math.max(...allValues) : 100;
        const thresholdVal = maxVal * 0.8;
        return (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <LineChart data={z.zoomedData} margin={margin} {...z.mouseHandlers}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" interval={z.dynamicTickInterval} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} label={xAxisLabelConfig} />
              <YAxis width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={yAxisLabelConfig} />
              <Tooltip content={miniTooltip} />
              {datasets.map((ds, index) => (
                <Line key={`${ds.tag || ds.id}-${index}`} type="monotone" dataKey={ds.tag} name={ds.label || ds.tag} stroke={chartColors[index % chartColors.length]} strokeWidth={2} dot={false} />
              ))}
              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 500, paddingTop: '0px', color: 'var(--do-text-3)' }} />
              <ReferenceLine y={thresholdVal} stroke="#EF4444" strokeDasharray="3 3" label={{ value: `Threshold: ${thresholdVal.toFixed(1)}`, fill: '#EF4444', fontSize: 9, position: 'top' }} />
              {renderReferenceArea()}
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case 'min_max_band': {
        const actualDs = datasets.find(d => d.tag.toLowerCase().includes('val') || (!d.tag.toLowerCase().includes('max') && !d.tag.toLowerCase().includes('min'))) || datasets[0];
        const maxDs = datasets.find(d => d.tag.toLowerCase().includes('max')) || datasets[1];
        const minDs = datasets.find(d => d.tag.toLowerCase().includes('min')) || datasets[2];
        const bandData = data.map((row, index) => {
          const minV = minDs?.data?.[index] ?? null;
          const maxV = maxDs?.data?.[index] ?? null;
          const newRow = { ...row };
          if (minV !== null && maxV !== null) newRow['bandRange'] = [minV, maxV];
          return newRow;
        });
        const bandColor = chartColors[0];
        const zoomedBandData = bandData.slice(z.zoomStartIndex, z.zoomedData.length + z.zoomStartIndex);
        return (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <AreaChart data={zoomedBandData} margin={margin} {...z.mouseHandlers}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" interval={z.dynamicTickInterval} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} label={xAxisLabelConfig} />
              <YAxis width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={yAxisLabelConfig} />
              <Tooltip content={miniTooltip} />
              {minDs && maxDs && <Area type="monotone" dataKey="bandRange" stroke="none" fill={bandColor} fillOpacity={0.15} name="Normal Range" />}
              {actualDs && <Line type="monotone" dataKey={actualDs.tag} name={actualDs.label || actualDs.tag} stroke={bandColor} strokeWidth={2} dot={false} />}
              {maxDs && <Line type="monotone" dataKey={maxDs.tag} name={maxDs.label || maxDs.tag} stroke={bandColor} strokeWidth={1} strokeDasharray="3 3" dot={false} />}
              {minDs && <Line type="monotone" dataKey={minDs.tag} name={minDs.label || minDs.tag} stroke={bandColor} strokeWidth={1} strokeDasharray="3 3" dot={false} />}
              {renderReferenceArea()}
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none">
      {z.isZoomed && (
        <button onClick={z.resetZoom} className="absolute top-2.5 right-4 z-50 inline-flex items-center gap-1.5 h-6 px-2.5 bg-surface/95 backdrop-blur-sm text-[10.5px] font-bold text-text-secondary border border-border rounded-lg shadow-sm hover:bg-canvas cursor-pointer transition-all active:scale-[0.95] select-none hover:text-brand hover:border-brand/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          Reset Zoom
        </button>
      )}
      <div className="flex-1 min-h-0 zoomable-chart-container select-none [&_*:not(button):not(button_*):not(.cursor-pointer):not(.cursor-pointer_*):not(.recharts-legend-wrapper):not(.recharts-legend-wrapper_*):not(.recharts-tooltip-wrapper):not(.recharts-tooltip-wrapper_*)]:cursor-crosshair">
        {renderChart()}
      </div>
    </div>
  );
}
