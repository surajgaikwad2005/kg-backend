'use client';
import React from 'react';
import {
  ResponsiveContainer, LineChart, BarChart, AreaChart, ScatterChart,
  Line, Bar, Area, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, RadialBarChart, RadialBar, PolarAngleAxis, ReferenceArea,
} from 'recharts';
import { useChartZoom } from './useChartZoom';

/* ─── Custom tooltip ─── */
function ChartTooltip({ active, payload, label, metricALabel, metricBLabel, colors }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-surface border border-border rounded-[10px] p-[10px_14px] shadow-[0_4px_16px_rgba(15,23,42,0.12)] text-xs min-w-[190px]">
      <div className="font-mono text-[10.5px] text-text-muted mb-2 pb-1.5 border-b border-border">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={`flex items-center gap-2 ${i < payload.length - 1 ? 'mb-[5px]' : ''}`}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="flex-1 text-text-secondary">{p.name}</span>
          <span className="font-bold text-text-primary font-mono text-xs">
            {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main chart renderer ─── */
export function DashboardChart({ data, chartType, showGrid, showLegend, showLabels, crosshair,
  leftAxis, rightAxis, scaleMode, lineThickness, fillOpacity, colors, thresholds,
  stats, metricALabel, metricBLabel, isLoading, interval }) {

  if (isLoading) {
    return (
      <div className="h-[360px] flex flex-col items-center justify-center gap-3 text-text-subtle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7 animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-[13px] font-medium">Loading chart data…</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[360px] flex flex-col items-center justify-center gap-3 text-text-subtle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        <span className="text-[13px] font-medium">Select a metric to render chart</span>
      </div>
    );
  }

  const ct = chartType === 'stacked_area'   ? 'area'
    : chartType === 'combo'          ? 'area'
    : chartType === 'multi_line'     ? 'line'
    : chartType === 'column'         ? 'bar'
    : chartType === 'kpi_card'       ? 'kpi'
    : chartType === 'threshold_line' ? 'threshold'
    : chartType === 'min_max_band'   ? 'area'
    : chartType;

  const { isZoomed, zoomedData, refAreaLeft, refAreaRight, mouseHandlers, resetZoom } = useChartZoom(data);

  const hasB = data.length > 0 && data[0]?.b !== undefined && data[0]?.b !== null;
  const yScale = scaleMode.toLowerCase();
  const tickInterval = Math.max(0, Math.floor(data.length / 8));
  const yDomain = ['auto', 'auto'];

  const makeTooltip = () => (
    <Tooltip active={refAreaLeft ? false : undefined} content={(props) => <ChartTooltip {...props} metricALabel={metricALabel} metricBLabel={metricBLabel} colors={colors} />} />
  );

  const makeAxes = (yIdA = 'left', yIdB = 'right') => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? 'var(--do-border)' : 'transparent'} />
      <XAxis dataKey="label" interval={tickInterval}
        tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }}
        axisLine={{ stroke: 'var(--do-border-2)' }} tickLine={false} />
      <YAxis yAxisId={yIdA} hide={!leftAxis} scale={yScale} domain={yDomain} width={55}
        tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }}
        axisLine={false} tickLine={false} />
      {hasB && <YAxis yAxisId={yIdB} orientation="right" hide={!rightAxis} scale={yScale} domain={yDomain} width={55}
        tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }}
        axisLine={false} tickLine={false} />}
      {crosshair && makeTooltip()}
      {showLegend && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: 12 }} />}
      {thresholds.map((thr, i) => (
        <ReferenceLine key={i} yAxisId={yIdA} y={thr.value} stroke={thr.color} strokeDasharray="4 3"
          label={{ value: thr.label, fill: thr.color, fontSize: 9.5, fontFamily: 'var(--font-mono)' }} />
      ))}
    </>
  );

  const margin = { top: 16, right: hasB && rightAxis ? 60 : 20, left: 0, bottom: 10 };

  const renderReferenceArea = () => {
    if (!refAreaLeft || !refAreaRight) return null;
    return <ReferenceArea yAxisId="left" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="var(--do-brand)" fillOpacity={0.15} />;
  };

  const renderResetButton = () => {
    if (!isZoomed) return null;
    return (
      <button
        onClick={resetZoom}
        className="absolute top-2.5 right-4 z-50 inline-flex items-center gap-1.5 h-6 px-2.5 bg-surface/95 dark:bg-overlay-hover/95 backdrop-blur-sm text-[11px] font-bold text-text-muted border border-border/80 rounded-lg shadow-sm hover:bg-surface-2 cursor-pointer transition-all active:scale-[0.95] select-none hover:text-brand hover:border-brand/30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        Reset Zoom
      </button>
    );
  };

  /* ── Line / Threshold ── */
  if (ct === 'line' || ct === 'threshold') {
    return (
      <div className="relative w-full h-[360px] zoomable-chart-container">
        <style dangerouslySetInnerHTML={{
          __html: `
          .zoomable-chart-container,
          .zoomable-chart-container *:not(button):not(button *):not(.cursor-pointer):not(.cursor-pointer *):not(.recharts-legend-wrapper):not(.recharts-legend-wrapper *):not(.recharts-tooltip-wrapper):not(.recharts-tooltip-wrapper *) {
            cursor: crosshair !important;
          }
        `}} />
        {renderResetButton()}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={zoomedData} margin={margin} {...mouseHandlers}>
            {makeAxes()}
            <Line yAxisId="left" type="monotone" dataKey="a" stroke={colors.a} strokeWidth={lineThickness}
              dot={showLabels ? { r: 2.5, fill: colors.a } : false} activeDot={{ r: 5 }} name={metricALabel} />
            {hasB && <Line yAxisId="right" type="monotone" dataKey="b" stroke={colors.b} strokeWidth={lineThickness}
              dot={false} activeDot={{ r: 4 }} name={metricBLabel} />}
            {renderReferenceArea()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── Area ── */
  if (ct === 'area') {
    const opac = fillOpacity / 100;
    return (
      <div className="relative w-full h-[360px] zoomable-chart-container">
        <style dangerouslySetInnerHTML={{
          __html: `
          .zoomable-chart-container,
          .zoomable-chart-container *:not(button):not(button *):not(.cursor-pointer):not(.cursor-pointer *):not(.recharts-legend-wrapper):not(.recharts-legend-wrapper *):not(.recharts-tooltip-wrapper):not(.recharts-tooltip-wrapper *) {
            cursor: crosshair !important;
          }
        `}} />
        {renderResetButton()}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={zoomedData} margin={margin} {...mouseHandlers}>
            <defs>
              <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.a} stopOpacity={opac} />
                <stop offset="95%" stopColor={colors.a} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.b} stopOpacity={opac} />
                <stop offset="95%" stopColor={colors.b} stopOpacity={0} />
              </linearGradient>
            </defs>
            {makeAxes()}
            <Area yAxisId="left" type="monotone" dataKey="a" stroke={colors.a} fill="url(#gA)"
              strokeWidth={lineThickness} dot={false} activeDot={{ r: 5 }} name={metricALabel} />
            {hasB && <Area yAxisId="right" type="monotone" dataKey="b" stroke={colors.b} fill="url(#gB)"
              strokeWidth={lineThickness} dot={false} activeDot={{ r: 4 }} name={metricBLabel} />}
            {renderReferenceArea()}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── Bar ── */
  if (ct === 'bar') {
    return (
      <div className="relative w-full h-[360px] zoomable-chart-container">
        <style dangerouslySetInnerHTML={{
          __html: `
          .zoomable-chart-container,
          .zoomable-chart-container *:not(button):not(button *):not(.cursor-pointer):not(.cursor-pointer *):not(.recharts-legend-wrapper):not(.recharts-legend-wrapper *):not(.recharts-tooltip-wrapper):not(.recharts-tooltip-wrapper *) {
            cursor: crosshair !important;
          }
        `}} />
        {renderResetButton()}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={zoomedData} margin={margin} barCategoryGap="30%" {...mouseHandlers}>
            {makeAxes()}
            <Bar yAxisId="left" dataKey="a" fill={colors.a} radius={[2, 2, 0, 0]} name={metricALabel} />
            {hasB && <Bar yAxisId="right" dataKey="b" fill={colors.b} radius={[2, 2, 0, 0]} name={metricBLabel} />}
            {renderReferenceArea()}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── Scatter ── */
  if (ct === 'scatter') {
    const scatterData = data.filter(d => d.a !== null && d.b !== null).map(d => ({ x: d.a, y: d.b }));
    return (
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? 'var(--do-border)' : 'transparent'} />
          <XAxis type="number" dataKey="x" name={metricALabel}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }} axisLine={{ stroke: 'var(--do-border-2)' }} tickLine={false} />
          <YAxis type="number" dataKey="y" name={metricBLabel}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }} axisLine={false} tickLine={false} />
          {crosshair && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
          {showLegend && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: 12 }} />}
          <Scatter name={`${metricALabel} vs ${metricBLabel}`} data={scatterData} fill={colors.a} opacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  /* ── Gauge ── */
  if (ct === 'gauge') {
    const avg = stats?.a?.avg ?? 0;
    const maxVal = stats?.a?.max ?? 100;
    const pct = Math.round(Math.min((avg / maxVal) * 100, 100));
    const gaugeData = [{ value: pct, fill: colors.a }];
    return (
      <div className="flex flex-col items-center justify-center h-[360px] gap-2">
        <div className="relative w-[280px] h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="90%"
              startAngle={180} endAngle={0} data={gaugeData} barSize={20}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: 'var(--do-border)' }} dataKey="value" angleAxisId={0}
                cornerRadius={10} fill={colors.a} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-center">
            <div className="text-[38px] font-extrabold text-text-primary tabular-nums leading-none">{avg.toFixed(1)}</div>
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted mt-1">{metricALabel}</div>
          </div>
        </div>
        <div className="flex gap-6">
          {[['Min', stats?.a?.min], ['Avg', avg], ['Max', stats?.a?.max]].map(([lbl, v]) => (
            <div key={lbl} className="text-center">
              <div className="text-[9.5px] font-bold tracking-[0.1em] uppercase text-text-subtle">{lbl}</div>
              <div className="font-mono text-[13px] font-bold text-text-primary">{v?.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── KPI Card ── */
  if (ct === 'kpi') {
    const avg = stats?.a?.avg ?? 0;
    const changePct = ((avg - avg * 0.93) / (avg * 0.93) * 100).toFixed(1);
    return (
      <div className="h-[360px] flex items-center justify-center">
        <div className="text-center p-[32px_48px] bg-surface-2 rounded-[20px] border border-border">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-text-muted mb-3">{metricALabel}</div>
          <div className="text-[72px] font-extrabold leading-none tabular-nums" style={{ color: colors.a }}>{avg.toFixed(1)}</div>
          <div className="text-[11.5px] text-text-muted mt-2.5">
            <span className="text-success font-bold">▲ +{changePct}%</span> vs last period
          </div>
          <div className="flex gap-7 justify-center mt-5 pt-4 border-t border-border">
            {[['Min', stats?.a?.min], ['Max', stats?.a?.max], ['Count', stats?.a?.count]].map(([lbl, v]) => (
              <div key={lbl}>
                <div className="text-[9.5px] font-bold tracking-[0.1em] text-text-subtle uppercase">{lbl}</div>
                <div className="font-mono text-[14px] font-bold text-text-secondary mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── KPI Grid ── */
  if (ct === 'kpigrid') {
    const kpis = [
      { label: metricALabel, value: stats?.a?.avg?.toFixed(2), sub: `unit: ${stats?.a?.unit || '—'}`, colorClass: 'text-brand' },
      { label: metricBLabel || 'Series B', value: stats?.b?.avg?.toFixed(2) ?? '—', sub: `unit: ${stats?.b?.unit || '—'}`, colorClass: 'text-text-primary' },
      { label: 'Peak A', value: stats?.a?.max?.toFixed(2), sub: 'maximum recorded', colorClass: 'text-danger' },
      { label: 'Data Points', value: data.length, sub: `interval: ${interval || '5m'}`, colorClass: 'text-text-muted' },
    ];
    return (
      <div className="grid grid-cols-2 gap-3.5 p-[24px_20px] h-[360px] box-border">
        {kpis.map(k => (
          <div key={k.label} className="bg-surface-2 rounded-[14px] p-[18px_20px] border border-border">
            <div className="text-[10px] font-bold tracking-[0.10em] uppercase text-text-subtle">{k.label}</div>
            <div className={`text-[38px] font-extrabold mt-2 leading-none tabular-nums ${k.colorClass}`} style={k.colorClass.includes('brand') ? {color: colors.a} : {}}>{k.value ?? '—'}</div>
            <div className="text-[11px] text-text-muted mt-1.5">{k.sub}</div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Heatmap ── */
  if (ct === 'heatmap') {
    const cols = Math.min(data.length, 16);
    const rows = 6;
    const slice = data.slice(-cols * rows);
    const vals = slice.map(d => d.a);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const norm = v => (v - minV) / (maxV - minV || 1);
    const cell = 22, gap = 3;
    return (
      <div className="h-[360px] flex items-center justify-center px-5">
        <svg viewBox={`0 0 ${cols * (cell + gap)} ${rows * (cell + gap)}`} className="w-full max-w-[600px] h-auto">
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const idx = r * cols + c;
              if (idx >= slice.length) return null;
              const v = norm(slice[idx].a);
              const opacity = Math.round(15 + v * 85).toString(16).padStart(2, '0');
              return <rect key={`${r}-${c}`} x={c * (cell + gap)} y={r * (cell + gap)} width={cell} height={cell} fill={`${colors.a}${opacity}`} rx="3" />;
            })
          )}
        </svg>
      </div>
    );
  }

  /* ── Table ── */
  if (ct === 'table') {
    return (
      <div className="h-[360px] overflow-y-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {['Time', metricALabel, metricBLabel, 'Min A', 'Max A'].map((h, i) => (
                <th key={h} className={`sticky top-0 bg-surface-2 p-[8px_14px] font-bold text-[10px] tracking-[0.08em] uppercase text-text-subtle border-b border-border ${i > 0 ? 'text-right' : 'text-left'}`}>{h || '—'}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 60).map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-canvas'}>
                <td className="p-[7px_14px] font-mono text-[11px] text-text-muted border-b border-border">{row.label}</td>
                <td className="p-[7px_14px] text-right font-semibold border-b border-border" style={{ color: colors.a }}>{row.a?.toFixed(2) ?? '—'}</td>
                <td className="p-[7px_14px] text-right font-semibold border-b border-border" style={{ color: colors.b }}>{row.b?.toFixed(2) ?? '—'}</td>
                <td className="p-[7px_14px] text-right text-text-muted border-b border-border">{row.min_a?.toFixed(2) ?? '—'}</td>
                <td className="p-[7px_14px] text-right text-text-muted border-b border-border">{row.max_a?.toFixed(2) ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback
  return null;
}
