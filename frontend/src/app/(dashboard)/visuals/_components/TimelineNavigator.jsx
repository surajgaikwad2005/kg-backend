'use client';
import React from 'react';
import { fmtTs, fmtShort, TAG_COLORS, WINDOW_PRESETS } from '@/src/lib/dashboards.utils';

/**
 * The timeline navigator bar (mini overview + drag window controls).
 *
 * @param {{
 *   tagData: object[],
 *   dataStart: number,
 *   dataEnd: number,
 *   totalDur: number,
 *   windowStart: number,
 *   clampedEnd: number,
 *   navLeft: number,
 *   navWidth: number,
 *   windowHours: number,
 *   onGoFirst: () => void,
 *   onGoBack: () => void,
 *   onGoFwd: () => void,
 *   onGoLast: () => void,
 *   onWindowPreset: (hours: number) => void,
 *   onNavigatorClick: (e: MouseEvent) => void,
 *   onNavigatorMouseDown: (e: MouseEvent, type: string) => void,
 * }} props
 */
export function TimelineNavigator({
  tagData,
  dataStart,
  dataEnd,
  totalDur,
  windowStart,
  clampedEnd,
  navLeft,
  navWidth,
  windowHours,
  onGoFirst,
  onGoBack,
  onGoFwd,
  onGoLast,
  onWindowPreset,
  onNavigatorClick,
  onNavigatorMouseDown,
}) {
  if (tagData.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-border bg-canvas">
      {/* Controls row — horizontally scrollable on small screens */}
      <div className="overflow-x-auto scrollbar-hide px-3 py-1">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="hidden sm:inline text-[8px] font-bold text-text-muted font-mono whitespace-nowrap">◀ {fmtTs(windowStart)}</span>
          <div className="flex bg-surface border border-border rounded-[5px] overflow-hidden shadow-card">
            {[['⏮', onGoFirst], ['◀', onGoBack]].map(([lbl, fn]) => (
              <button key={lbl} onClick={fn} className="px-1.5 py-0.5 text-label font-black text-text-muted cursor-pointer bg-transparent border-none border-r border-surface-2">{lbl}</button>
            ))}
            {WINDOW_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => onWindowPreset(p.hours)}
                className={`px-2 py-0.5 text-2xs font-black cursor-pointer border-none border-r border-surface-2 ${windowHours === p.hours ? 'bg-highlight text-white' : 'bg-transparent text-text-muted'}`}
              >
                {p.label}
              </button>
            ))}
            {[['▶', onGoFwd], ['⏭', onGoLast]].map(([lbl, fn]) => (
              <button key={lbl} onClick={fn} className="px-1.5 py-0.5 text-label font-black text-text-muted cursor-pointer bg-transparent border-none border-l border-surface-2">{lbl}</button>
            ))}
          </div>
          <span className="hidden sm:inline text-[8px] font-bold text-text-muted font-mono whitespace-nowrap">{fmtTs(clampedEnd)} ▶</span>
        </div>
      </div>

      {/* Navigator bar */}
      <div className="px-3 pb-1.5">
        <div
          id="timeline-navigator-bar"
          className="relative h-6.5 bg-surface-2 rounded border border-border overflow-hidden cursor-pointer"
          onClick={onNavigatorClick}
        >
          {/* Polyline sparklines */}
          <div className="absolute inset-0">
            {tagData.slice(0, 6).map((tag, i) => {
              const vs = tag.data.map(([, v]) => v);
              const minV = Math.min(...vs), maxV = Math.max(...vs), rng = maxV - minV || 1;
              return (
                <svg key={tag.name} className="absolute inset-0 w-full h-full" viewBox="0 0 1000 26" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke={TAG_COLORS[i % TAG_COLORS.length]}
                    strokeWidth="1.2"
                    strokeOpacity="0.5"
                    points={tag.data.map(([t, v]) => `${((t - dataStart) / totalDur) * 1000},${24 - ((v - minV) / rng) * 20}`).join(' ')}
                  />
                </svg>
              );
            })}
          </div>

          {/* Window selection overlay */}
          <div
            className="absolute top-0 bottom-0 bg-white/35 border-l-[2.5px] border-r-[2.5px] border-overlay cursor-grab"
            style={{ left: `${Math.max(0, Math.min(navLeft, 100 - navWidth))}%`, width: `${Math.min(navWidth, 100)}%` }}
            onMouseDown={e => onNavigatorMouseDown(e, 'center')}
          >
            {/* Left drag handle */}
            <div
              className="absolute top-0 bottom-0 -left-1.5 w-3 cursor-col-resize z-10"
              onMouseDown={e => onNavigatorMouseDown(e, 'left')}
            />
            {/* Right drag handle */}
            <div
              className="absolute top-0 bottom-0 -right-1.5 w-3 cursor-col-resize z-10"
              onMouseDown={e => onNavigatorMouseDown(e, 'right')}
            />
          </div>
        </div>
        <div className="flex justify-between mt-0.5 text-[7px] font-bold text-text-subtle">
          <span>{fmtShort(dataStart)}</span>
          <span>{fmtShort(dataEnd)}</span>
        </div>
      </div>
    </div>
  );
}
