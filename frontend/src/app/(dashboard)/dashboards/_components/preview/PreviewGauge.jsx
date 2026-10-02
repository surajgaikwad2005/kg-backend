import React from 'react';

function buildGaugeParams(ds, chartPayload, isMulti) {
  const values = ds?.data || [];
  const latestVal = isMulti
    ? (values.length > 0 ? values[values.length - 1] : 0)
    : (chartPayload.value !== undefined ? chartPayload.value : (values.length > 0 ? values[values.length - 1] : 0));

  const minVal = isMulti
    ? (ds?.min !== undefined && ds?.min !== null ? Number(ds.min) : 0)
    : (chartPayload.min !== undefined && chartPayload.min !== null
        ? Number(chartPayload.min)
        : (ds?.min !== undefined && ds?.min !== null ? Number(ds.min) : 0));

  const maxVal = isMulti
    ? (ds?.max !== undefined && ds?.max !== null ? Number(ds.max) : (values.length > 0 ? Math.max(...values) : (latestVal > 100 ? Math.ceil(latestVal * 1.25) : 100)))
    : (chartPayload.max !== undefined && chartPayload.max !== null
        ? Number(chartPayload.max)
        : (ds?.max !== undefined && ds?.max !== null
            ? Number(ds.max)
            : (values.length > 0 ? Math.max(...values) : (latestVal > 100 ? Math.ceil(latestVal * 1.25) : 100))));

  const scaleMin = latestVal < minVal ? latestVal * 0.95 : minVal;
  const scaleMax = latestVal > maxVal ? latestVal * 1.05 : maxVal;
  const range = scaleMax - scaleMin <= 0 ? 100 : scaleMax - scaleMin;
  const safeValue = Math.max(0, Math.min(latestVal - scaleMin, range));
  const pct = Math.max(0, Math.min(100, (safeValue / range) * 100));

  const unit = isMulti ? (ds?.unit || '') : (chartPayload.unit || ds?.unit || '');
  const label = isMulti ? (ds?.label || ds?.tag || 'Gauge') : (chartPayload.label || chartPayload.title || ds?.label || 'Gauge Metric');

  const viewBoxWidth = 200;
  const viewBoxHeight = 175;
  const strokeWidth = 12;
  const radius = (viewBoxWidth - strokeWidth) / 2;
  const cy = isMulti ? 122 : 122;
  const circumference = Math.PI * radius;
  const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
  const rectWidth = Math.max(isMulti ? 50 : 55, (label || '').length * 5 + 10);

  return { latestVal, minVal, maxVal, unit, label, viewBoxWidth, viewBoxHeight, strokeWidth, radius, cy, strokeDasharray, rectWidth };
}

function GaugeSvg({ gradientId, params, valueY = 116, unitFontSize = '11px', tagPillY = 152, tagTextY = 162 }) {
  const { latestVal, minVal, maxVal, unit, label, viewBoxWidth, viewBoxHeight, strokeWidth, radius, cy, strokeDasharray, rectWidth } = params;

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full max-h-full max-w-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      <text x="100" y="18" textAnchor="middle" className="fill-text-subtle font-black uppercase tracking-widest" style={{ fontSize: '9px' }}>
        {label}
      </text>
      <path d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${viewBoxWidth - strokeWidth / 2} ${cy}`} fill="none" stroke="var(--do-border)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${viewBoxWidth - strokeWidth / 2} ${cy}`} fill="none" stroke={`url(#${gradientId})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={0} className="transition-all duration-1000 ease-out" />
      <text x="100" y={valueY} textAnchor="middle" className="fill-text-primary font-extrabold" style={{ fontSize: '26px', letterSpacing: '-0.02em' }}>
        {latestVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        {unit && <tspan dx="4" className="fill-text-muted font-semibold" style={{ fontSize: unitFontSize }}>{unit}</tspan>}
      </text>
      <text x="6" y="144" textAnchor="start" className="fill-text-subtle font-mono font-bold" style={{ fontSize: '8.5px' }}>Min: {minVal}</text>
      <text x="194" y="144" textAnchor="end" className="fill-text-subtle font-mono font-bold" style={{ fontSize: '8.5px' }}>Max: {maxVal}</text>
      <g>
        <rect x={100 - rectWidth / 2} y={tagPillY} width={rectWidth} height="14" rx="4" className="fill-brand-muted/80 dark:fill-brand-muted/30 stroke-brand/20" strokeWidth="0.5" />
        <text x="100" y={tagTextY} textAnchor="middle" className="fill-brand font-bold uppercase" style={{ fontSize: '7.5px' }}>{label}</text>
      </g>
    </svg>
  );
}

export function PreviewGauge({ datasets, chartColors, chartData }) {
  const chartPayload = chartData || {};

  if (datasets.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-3.5 p-2 h-full w-full overflow-y-auto [container-type:inline-size]">
        {datasets.map((ds, index) => {
          const params = buildGaugeParams(ds, {}, true);
          return (
            <div key={ds.tag || ds.id || index} className="flex flex-col items-center justify-center p-3 bg-surface rounded-xl border border-border shadow-sm min-w-0 h-full overflow-hidden select-none">
              <GaugeSvg gradientId={`gaugeGradient-preview-${index}`} params={params} valueY={100} unitFontSize="8px" tagPillY={152} tagTextY={162} />
            </div>
          );
        })}
      </div>
    );
  }

  const ds = datasets[0];
  const params = buildGaugeParams(ds, chartPayload, false);

  return (
    <div className="flex h-full w-full items-center justify-center bg-surface p-3.5 overflow-hidden select-none">
      <GaugeSvg gradientId="gaugeGradient-single-preview" params={params} valueY={116} unitFontSize="11px" tagPillY={152} tagTextY={162} />
    </div>
  );
}
