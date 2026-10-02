'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SingleGaugeMeter({ ws, isMini = false }) {
  const chartPayload = ws?.chartData || ws?.data || ws || {};
  const datasets = chartPayload?.datasets || [];
  const dataset = datasets[0] || {};
  const datasetData = dataset?.data || dataset?.values || [];
  const rawValue = typeof chartPayload.value === 'number' ? chartPayload.value : datasetData[datasetData.length - 1];
  const value = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;

  const min = chartPayload.min !== undefined && chartPayload.min !== null
    ? Number(chartPayload.min)
    : (dataset?.min !== undefined && dataset?.min !== null ? Number(dataset.min) : 0);
  const max = chartPayload.max !== undefined && chartPayload.max !== null
    ? Number(chartPayload.max)
    : (dataset?.max !== undefined && dataset?.max !== null
      ? Number(dataset.max)
      : (value > 100 ? Math.ceil(value * 1.25) : 100));

  const scaleMin = value < min ? value * 0.95 : min;
  const scaleMax = value > max ? value * 1.05 : max;

  const unitStr = chartPayload.unit || dataset?.unit || '';
  const label = chartPayload.label || dataset?.label || 'No tag';

  const range = scaleMax - scaleMin <= 0 ? 100 : scaleMax - scaleMin;
  const safeValue = Math.max(0, Math.min(value - scaleMin, range));
  const percentage = Math.max(0, Math.min(100, (safeValue / range) * 100));

  const viewBoxWidth = 200;
  const viewBoxHeight = isMini ? 135 : 175;
  const strokeWidth = isMini ? 14 : 14;
  const radius = (viewBoxWidth - strokeWidth) / 2;
  const cy = isMini ? 105 : 122;
  const circumference = Math.PI * radius;

  const needleLength = isMini ? 60 : 70;
  const needleRad = Math.PI - (percentage / 100) * Math.PI;
  const needleX = 100 + needleLength * Math.cos(needleRad);
  const needleY = cy - needleLength * Math.sin(needleRad);

  const rectWidth = Math.max(55, (label || '').length * 5 + 10);

  return (
    <div className={`flex h-full w-full items-center justify-center overflow-hidden select-none bg-transparent ${!isMini && 'p-3.5'}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full max-h-full max-w-full overflow-hidden"
      >
        <defs>
          <linearGradient id={isMini ? "gaugeGradient-mini" : "gaugeGradient-single"} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-chart-3)" />
            <stop offset="50%" stopColor="var(--color-chart-4)" />
            <stop offset="100%" stopColor="var(--color-chart-2)" />
          </linearGradient>
        </defs>

        {/* Meter Radial Ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const rad = Math.PI - pct * Math.PI;
          const rInner = radius - (strokeWidth / 2) - 2;
          const rOuter = radius + (strokeWidth / 2) + 2;
          return (
            <line
              key={i}
              x1={100 + rInner * Math.cos(rad)}
              y1={cy - rInner * Math.sin(rad)}
              x2={100 + rOuter * Math.cos(rad)}
              y2={cy - rOuter * Math.sin(rad)}
              stroke="var(--color-border-strong)"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
            />
          );
        })}

        {/* Title */}
        {!isMini && (
          <text
            x="100"
            y="18"
            textAnchor="middle"
            className="fill-text-muted font-black uppercase tracking-widest"
            style={{ fontSize: '9px' }}
          >
            {label}
          </text>
        )}

        {/* Background Arc */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${viewBoxWidth - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress Arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${viewBoxWidth - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke={`url(#${isMini ? "gaugeGradient-mini" : "gaugeGradient-single"})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${(percentage / 100) * circumference} ${circumference}` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Needle Pointer */}
        <motion.line
          x1="100"
          y1={cy}
          initial={{ x2: 100 - needleLength, y2: cy }}
          animate={{ x2: needleX, y2: needleY }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          stroke="var(--color-chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy={cy} r="4.5" className="fill-chart-1 stroke-surface stroke-[1.5]" />

        {/* Value Text */}
        {!isMini && (
          <text
            x="100"
            y="116"
            textAnchor="middle"
            className="fill-chart-1 font-extrabold drop-shadow-[0_0_12px_var(--color-chart-1)]"
            style={{ fontSize: '26px', letterSpacing: '-0.02em' }}
          >
            {value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            {unitStr && (
              <tspan dx="4" className="fill-text-muted font-semibold" style={{ fontSize: '11px' }}>
                {unitStr}
              </tspan>
            )}
          </text>
        )}

        {/* Min label */}
        <motion.text
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          x={isMini ? '22' : '6'}
          y={isMini ? '122' : '144'}
          textAnchor="start"
          className="fill-text-muted font-extrabold uppercase tracking-wider"
          style={{ fontSize: isMini ? '9.5px' : '8.5px' }}
        >
          MIN: {min}
        </motion.text>

        {/* Max label */}
        <motion.text
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          x={isMini ? '178' : '194'}
          y={isMini ? '122' : '144'}
          textAnchor="end"
          className="fill-text-muted font-extrabold uppercase tracking-wider"
          style={{ fontSize: isMini ? '9.5px' : '8.5px' }}
        >
          MAX: {max}
        </motion.text>

        {/* Tag pill */}
        {!isMini && (
          <g>
            <rect
              x={100 - rectWidth / 2}
              y="152"
              width={rectWidth}
              height="14"
              rx="4"
              className="fill-chart-1/10 stroke-chart-1/30"
              strokeWidth="0.5"
            />
            <text
              x="100"
              y="162"
              textAnchor="middle"
              className="fill-chart-1 font-bold uppercase"
              style={{ fontSize: '7.5px' }}
            >
              {label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
