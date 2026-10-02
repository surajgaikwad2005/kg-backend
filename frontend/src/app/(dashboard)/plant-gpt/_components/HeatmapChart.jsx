import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Linear interpolation between two rgb tuples
function lerpColor(a, b, t) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

// Maps 0–1 to a blue → amber → red gradient
function heatColor(t) {
  const blue   = [59,  130, 246];
  const amber  = [245, 158, 11];
  const red    = [239, 68,  68];
  if (t <= 0.5) return lerpColor(blue, amber, t * 2);
  return lerpColor(amber, red, (t - 0.5) * 2);
}

export function HeatmapChart({ data, isDark }) {
  const [hovered, setHovered] = useState(null);

  const sharedLabels = data.labels || null;
  const xLabels = sharedLabels || data.x || data.x_labels || data.columns || [];
  const yLabels = sharedLabels || data.y || data.y_labels || data.rows    || [];
  const matrix  = data.z       || data.values || data.matrix              || [];

  if (!xLabels.length || !yLabels.length || !matrix.length) {
    return (
      <p className="text-xs text-text-subtle px-4 py-3">
        No heatmap data available.
      </p>
    );
  }

  const allValues = matrix.flat().filter(v => v != null && !isNaN(v));
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range  = maxVal - minVal || 1;

  const isCorrelation = minVal >= -1 && maxVal <= 1 && !!sharedLabels;

  const getCellColor = (val) => {
    if (val == null || isNaN(val)) return 'var(--color-surface-2)';
    if (isCorrelation) {
      const neutral = isDark ? [30, 30, 40] : [248, 250, 252];
      const pos = [59, 130, 246];   // blue
      const neg = [239, 68, 68];    // red
      if (val >= 0) return lerpColor(neutral, pos, val);
      return lerpColor(neutral, neg, -val);
    }
    return heatColor((val - minVal) / range);
  };

  const n = Math.max(xLabels.length, yLabels.length);
  const cellW = n <= 4 ? 80 : n <= 8 ? 52 : Math.max(14, Math.min(36, Math.floor(480 / xLabels.length)));
  const cellH = n <= 4 ? 60 : n <= 8 ? 44 : Math.max(14, Math.min(32, Math.floor(220 / yLabels.length)));
  const showCellValue = cellW >= 44;

  const yLabelW = Math.min(140, Math.max(40, Math.max(...yLabels.map(l => String(l).length)) * 6.5));

  const legendGradient = isCorrelation
    ? 'linear-gradient(to right, var(--color-danger), var(--color-surface-2), var(--color-info))'
    : 'linear-gradient(to right, var(--color-info), var(--color-warning), var(--color-danger))';

  return (
    <div className="px-3.5 pt-2.5 pb-3.5 overflow-x-auto relative">
      <div className="inline-flex flex-col">
        {/* X-axis labels */}
        <div className="flex" style={{ marginLeft: yLabelW + 8 }}>
          {xLabels.map((label, ci) => {
            const lStr = String(label);
            const short = lStr.length > 12 ? lStr.slice(0, 10) + '…' : lStr;
            return (
              <div
                key={ci}
                title={lStr}
                className="text-[9px] font-bold text-text-subtle text-center pb-[5px] leading-[1.3] overflow-hidden whitespace-nowrap"
                style={{ width: cellW }}
              >
                {short}
              </div>
            );
          })}
        </div>

        {/* Rows */}
        {matrix.map((row, ri) => (
          <div key={ri} className="flex items-center mb-[3px]">
            {/* Y label */}
            <div
              title={String(yLabels[ri])}
              className="text-[9px] font-bold text-text-subtle text-right pr-2 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ width: yLabelW }}
            >
              {String(yLabels[ri]).length > 18 ? String(yLabels[ri]).slice(0, 16) + '…' : yLabels[ri]}
            </div>

            {/* Cells */}
            {row.map((val, ci) => {
              const isHov = hovered?.ri === ri && hovered?.ci === ci;
              const bg = getCellColor(val);
              const isDiag = isCorrelation && ri === ci;
              const txtColor = isDiag
                ? (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)')
                : (val > (minVal + range * 0.5) ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)');

              return (
                <div
                  key={ci}
                  onMouseEnter={e => setHovered({ ri, ci, val, rect: e.currentTarget.getBoundingClientRect() })}
                  onMouseLeave={() => setHovered(null)}
                  className="rounded-[5px] mr-[3px] cursor-crosshair relative flex items-center justify-center transition-all duration-[var(--duration-fast,120ms)]"
                  style={{
                    width: cellW, height: cellH, background: bg,
                    filter: isHov ? 'brightness(1.15)' : 'brightness(1)',
                    transform: isHov ? 'scale(1.06)' : 'scale(1)',
                    zIndex: isHov ? 2 : 1,
                    boxShadow: isHov ? 'var(--shadow-card)' : 'none',
                  }}
                >
                  {showCellValue && val != null && !isNaN(val) && (
                    <span className="font-extrabold select-none" style={{ fontSize: cellW >= 70 ? 13 : 10, color: txtColor }}>
                      {val.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3" style={{ marginLeft: yLabelW + 8 }}>
          <span className="text-[9px] font-bold text-text-subtle whitespace-nowrap">
            {isCorrelation ? '-1' : (typeof minVal === 'number' ? minVal.toFixed(2) : minVal)}
          </span>
          <div className="w-[100px] h-1.5 rounded-[3px] shrink-0" style={{ background: legendGradient }} />
          <span className="text-[9px] font-bold text-text-subtle whitespace-nowrap">
            {isCorrelation ? '+1' : (typeof maxVal === 'number' ? maxVal.toFixed(2) : maxVal)}
          </span>
          {isCorrelation && (
            <span className="text-[9px] font-semibold text-text-subtle ml-1">
              Pearson r
            </span>
          )}
        </div>
      </div>

      {/* Floating tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 4 }}
            transition={{ duration: 0.12 }}
            className="fixed rounded-[10px] px-3 py-2 z-[9999] shadow-panel pointer-events-none bg-surface border border-border"
            style={{
              left: (hovered.rect?.right ?? 0) + 8,
              top:  (hovered.rect?.top  ?? 0) - 8,
            }}
          >
            <p className="m-0 text-[10px] font-bold text-text-subtle whitespace-nowrap">
              {yLabels[hovered.ri]}
            </p>
            <p className="mt-[1px] mb-1 mx-0 text-[10px] font-bold text-text-subtle whitespace-nowrap">
              vs {xLabels[hovered.ci]}
            </p>
            <p className="m-0 text-[15px] font-black text-text-secondary">
              {typeof hovered.val === 'number' ? hovered.val.toFixed(4) : (hovered.val ?? 'N/A')}
            </p>
            {isCorrelation && typeof hovered.val === 'number' && (
              <p className={`mt-0.5 mb-0 mx-0 text-[9px] font-bold ${Math.abs(hovered.val) >= 0.7 ? 'text-success' : Math.abs(hovered.val) >= 0.4 ? 'text-warning' : 'text-danger'}`}>
                {Math.abs(hovered.val) >= 0.9 ? 'Very strong' : Math.abs(hovered.val) >= 0.7 ? 'Strong' : Math.abs(hovered.val) >= 0.4 ? 'Moderate' : 'Weak'}
                {hovered.val >= 0 ? ' positive' : ' negative'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
