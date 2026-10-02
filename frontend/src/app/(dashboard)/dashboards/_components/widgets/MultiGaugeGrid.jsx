'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function MultiGaugeGrid({ datasets, isMini = false }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 h-full w-full bg-transparent overflow-y-auto min-h-0 [container-type:inline-size]">
      {datasets.map((dataset, idx) => {
        const datasetData = dataset?.data || dataset?.values || [];
        const rawValue = datasetData[datasetData.length - 1];
        const value = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;

        const min = dataset?.min !== undefined && dataset?.min !== null ? Number(dataset.min) : 0;
        const max = dataset?.max !== undefined && dataset?.max !== null ? Number(dataset.max) : (value > 100 ? Math.ceil(value * 1.25) : 100);

        const scaleMin = value < min ? value * 0.95 : min;
        const scaleMax = value > max ? value * 1.05 : max;

        const range = scaleMax - scaleMin <= 0 ? 100 : scaleMax - scaleMin;
        const safeValue = Math.max(0, Math.min(value - scaleMin, range));
        const percentage = Math.max(0, Math.min(100, (safeValue / range) * 100));

        const viewBoxWidth = 200;
        const viewBoxHeight = isMini ? 135 : 175;
        const strokeWidth = isMini ? 14 : 12;
        const radius = (viewBoxWidth - strokeWidth) / 2;
        const cy = isMini ? 105 : 122;
        const circumference = Math.PI * radius;

        const needleLength = isMini ? 58 : 68;
        const needleRad = Math.PI - (percentage / 100) * Math.PI;
        const needleX = 100 + needleLength * Math.cos(needleRad);
        const needleY = cy - needleLength * Math.sin(needleRad);

        return (
          <div key={idx} className="flex flex-col items-center justify-center p-2 bg-surface-2/40 rounded-xl border border-border/50 shadow-sm min-w-0 h-full overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              className="w-full h-full max-h-full max-w-full overflow-hidden"
            >
              <defs>
                <linearGradient id={`gaugeGradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
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
                stroke={`url(#gaugeGradient-${idx})`}
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
            </svg>
          </div>
        );
      })}
    </div>
  );
}
