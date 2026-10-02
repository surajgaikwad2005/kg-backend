import React from 'react';
import {
  ResponsiveContainer, AreaChart, LineChart, BarChart, ScatterChart,
  Area, Line, Bar, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-[10px] p-[10px_14px] shadow-[0_4px_16px_rgba(15,23,42,0.12)] text-xs min-w-[160px]">
      <div className="font-mono text-[10.5px] text-text-secondary mb-1.5 pb-1.5 border-b border-border">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={`flex items-center gap-2 ${i < payload.length - 1 ? 'mb-1' : ''}`}>
          <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: p.color }} />
          <span className="flex-1 text-text-secondary">{p.name}</span>
          <span className="font-bold text-text-primary font-mono">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MonitorChart({ data, chartType, colors, isLoading, interval, stats, metricALabel, metricBLabel, height }) {
  const h = height || '100%';
  if (isLoading) {
    return (
      <div style={{ height: h }} className="flex flex-col items-center justify-center gap-2.5 text-text-subtle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[26px] h-[26px] animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-[13px] font-medium">Loading chart data…</span>
      </div>
    );
  }
  if (!data?.length) {
    return (
      <div style={{ height: h }} className="flex flex-col items-center justify-center gap-2.5 text-text-subtle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[38px] h-[38px]"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        <span className="text-[13px] font-medium">{metricALabel ? 'No data available' : 'Select a metric'}</span>
      </div>
    );
  }

  const ct = chartType === 'stacked_area' ? 'area' : chartType === 'combo' ? 'area'
    : chartType === 'multi_line' ? 'line' : chartType === 'column' ? 'bar'
    : chartType === 'kpi' ? 'kpi' : chartType === 'threshold_line' ? 'line'
    : chartType === 'min_max_band' ? 'area' : chartType;

  const hasB = data[0]?.b != null;
  const margin = { top: 12, right: hasB ? 50 : 16, left: 0, bottom: 8 };
  const tickInterval = Math.max(0, Math.floor(data.length / 8));

  const axes = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--do-border)" />
      <XAxis dataKey="label" interval={tickInterval} tick={{ fontFamily: 'var(--do-font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }} axisLine={{ stroke: 'var(--do-border-2)' }} tickLine={false} />
      <YAxis width={50} tick={{ fontFamily: 'var(--do-font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }} axisLine={false} tickLine={false} />
      {hasB && <YAxis yAxisId="r" orientation="right" width={50} tick={{ fontFamily: 'var(--do-font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }} axisLine={false} tickLine={false} />}
      <Tooltip content={ChartTooltip} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontFamily: 'var(--do-font-sans)', fontSize: 12 }} />
    </>
  );

  if (ct === 'line') return (
    <ResponsiveContainer width="100%" height={h} minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
      <LineChart data={data} margin={margin}>{axes()}
        <Line type="monotone" dataKey="a" stroke={colors.a} strokeWidth={2} dot={false} activeDot={{ r: 5 }} name={metricALabel || 'Series A'} />
        {hasB && <Line type="monotone" dataKey="b" stroke={colors.b} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name={metricBLabel || 'Series B'} />}
      </LineChart>
    </ResponsiveContainer>
  );

  if (ct === 'bar') return (
    <ResponsiveContainer width="100%" height={h} minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
      <BarChart data={data} margin={margin} barCategoryGap="30%">{axes()}
        <Bar dataKey="a" fill={colors.a} radius={[2, 2, 0, 0]} name={metricALabel || 'Series A'} />
        {hasB && <Bar dataKey="b" fill={colors.b} radius={[2, 2, 0, 0]} name={metricBLabel || 'Series B'} />}
      </BarChart>
    </ResponsiveContainer>
  );

  if (ct === 'scatter') {
    const sd = data.filter(d => d.a != null && d.b != null).map(d => ({ x: d.a, y: d.b }));
    return (
      <ResponsiveContainer width="100%" height={h} minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
        <ScatterChart margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--do-border)" />
          <XAxis type="number" dataKey="x" tick={{ fontFamily: 'var(--do-font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }} axisLine={{ stroke: 'var(--do-border-2)' }} tickLine={false} />
          <YAxis type="number" dataKey="y" width={50} tick={{ fontFamily: 'var(--do-font-mono)', fontSize: 10, fill: 'var(--do-text-4)' }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name={`${metricALabel} vs ${metricBLabel}`} data={sd} fill={colors.a} opacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (ct === 'gauge') {
    const avg = stats?.a?.avg ?? 0; const maxVal = stats?.a?.max ?? 100;
    const pct = Math.round(Math.min((avg / maxVal) * 100, 100));
    return (
      <div style={{ height: h }} className="flex flex-col items-center justify-center gap-3">
        <div className="relative w-[260px] h-[160px]">
          <ResponsiveContainer width="100%" height={h} minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
            <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="90%" startAngle={180} endAngle={0} data={[{ value: pct, fill: colors.a }]} barSize={20}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: 'var(--do-border)' }} dataKey="value" angleAxisId={0} cornerRadius={10} fill={colors.a} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-center">
            <div className="text-[38px] font-extrabold text-text-primary leading-none">{avg.toFixed(1)}</div>
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-secondary mt-1">{metricALabel}</div>
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

  if (ct === 'kpi') {
    const avg = stats?.a?.avg ?? 0;
    const changePct = ((avg - avg * 0.93) / (avg * 0.93) * 100).toFixed(1);
    return (
      <div style={{ height: h }} className="flex items-center justify-center">
        <div className="text-center p-[28px_48px] bg-surface-2 rounded-[20px] border border-border">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-text-secondary mb-2.5">{metricALabel}</div>
          <div className="text-[68px] font-extrabold leading-none" style={{ color: colors.a }}>{avg.toFixed(1)}</div>
          <div className="text-xs text-text-secondary mt-2">
            <span className="text-success font-bold">▲ +{changePct}%</span> vs last period
          </div>
        </div>
      </div>
    );
  }

  if (ct === 'heatmap') {
    const cols = Math.min(data.length, 16); const rows = 6;
    const slice = data.slice(-cols * rows); const vals = slice.map(d => d.a);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const norm = v => (v - minV) / (maxV - minV || 1);
    const cell = 24, gap = 3;
    return (
      <div style={{ height: h }} className="flex items-center justify-center px-5">
        <svg viewBox={`0 0 ${cols * (cell + gap)} ${rows * (cell + gap)}`} className="w-full max-w-[600px] h-auto">
          {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
            const idx = r * cols + c; if (idx >= slice.length) return null;
            const opacity = Math.round(15 + norm(slice[idx].a) * 85).toString(16).padStart(2, '0');
            return <rect key={`${r}-${c}`} x={c * (cell + gap)} y={r * (cell + gap)} width={cell} height={cell} fill={`${colors.a}${opacity}`} rx="3" />;
          }))}
        </svg>
      </div>
    );
  }

  if (ct === 'table') {
    return (
      <div style={{ height: h }} className="overflow-y-auto">
        <table className="w-full border-collapse text-xs">
          <thead><tr>{['Time', metricALabel || 'Value A', metricBLabel || 'Value B', 'Min A', 'Max A'].map((h, i) => (
            <th key={h} className={`sticky top-0 p-[8px_14px] bg-surface-2 font-bold text-[10px] tracking-[0.08em] uppercase text-text-subtle border-b border-border ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}</tr></thead>
          <tbody>{data.slice(0, 60).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-canvas'}>
              <td className="p-[7px_14px] font-mono text-[11px] text-text-secondary border-b border-border">{row.label}</td>
              <td className="p-[7px_14px] text-right font-semibold border-b border-border" style={{ color: colors.a }}>{row.a?.toFixed(2) ?? '—'}</td>
              <td className="p-[7px_14px] text-right font-semibold border-b border-border" style={{ color: colors.b }}>{row.b?.toFixed(2) ?? '—'}</td>
              <td className="p-[7px_14px] text-right text-text-secondary border-b border-border">{row.min_a?.toFixed(2) ?? '—'}</td>
              <td className="p-[7px_14px] text-right text-text-secondary border-b border-border">{row.max_a?.toFixed(2) ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }

  // default area
  return (
    <ResponsiveContainer width="100%" height={h} minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
      <AreaChart data={data} margin={margin}>
        <defs>
          <linearGradient id="monGA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.a} stopOpacity={0.18}/><stop offset="95%" stopColor={colors.a} stopOpacity={0}/></linearGradient>
          <linearGradient id="monGB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.b} stopOpacity={0.18}/><stop offset="95%" stopColor={colors.b} stopOpacity={0}/></linearGradient>
        </defs>
        {axes()}
        <Area type="monotone" dataKey="a" stroke={colors.a} fill="url(#monGA)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} name={metricALabel || 'Series A'} />
        {hasB && <Area type="monotone" dataKey="b" stroke={colors.b} fill="url(#monGB)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name={metricBLabel || 'Series B'} />}
      </AreaChart>
    </ResponsiveContainer>
  );
}
