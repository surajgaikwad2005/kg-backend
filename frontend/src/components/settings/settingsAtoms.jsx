'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

// Shared building blocks used across every SettingsModal tab, so each tab
// stays visually consistent without re-implementing the same tile/segment
// chrome per section.

export const SPRING = { type: 'spring', stiffness: 420, damping: 30 };

export function SectionLabel({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-subtle">{children}</p>
      {hint && <span className="text-[10px] text-text-subtle">{hint}</span>}
    </div>
  );
}

export function ActiveTick() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING}
      className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center shadow-sm shadow-brand/40 z-10"
    >
      <Check className="w-3 h-3 text-white" strokeWidth={3} />
    </motion.span>
  );
}

/** Card frame shared by every selectable tile so states stay consistent. */
export const tileCls = (active) =>
  `relative w-full rounded-xl border-2 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-surface ${
    active
      ? 'border-brand bg-brand-muted shadow-brand'
      : 'border-border bg-surface-2 hover:border-border-strong hover:bg-surface hover:shadow-card'
  }`;

/** iOS-style toggle switch shared by every on/off Settings row. */
export function ToggleSwitch({ checked, onChange, labelOn, labelOff }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={checked ? labelOn : labelOff}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        checked ? 'bg-brand' : 'bg-border-strong'
      }`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
    </button>
  );
}

/**
 * Continuous intensity slider with optional quick-select presets — used for
 * Blur & Glass intensity, and reusable for any future 0–N% Settings control.
 * The gradient track fill is computed per-render, so it must stay inline
 * (same documented exception as the dashboard SliderRow atom); everything
 * else — thumb, focus ring, preset chips — is Tailwind utilities driven by
 * semantic tokens so it stays theme-reactive.
 */
export function IntensitySlider({ label, hint, value, min = 0, max = 100, step = 5, unit = '%', presets, onChange, preview }) {
  const labelId = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="p-3 bg-surface-2/60 border border-border rounded-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p id={labelId} className="text-xs font-semibold text-text-primary">{label}</p>
          {hint && <p className="text-[11px] text-text-muted mt-0.5">{hint}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {preview}
          <span className="text-[11px] font-bold text-brand bg-brand-muted px-2 py-0.5 rounded-full tabular-nums min-w-13 text-center">
            {value}{unit}
          </span>
        </div>
      </div>

      <input
        type="range"
        aria-labelledby={labelId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border [&::-webkit-slider-thumb]:shadow-card
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95
          [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border [&::-moz-range-thumb]:shadow-card [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-track]:appearance-none [&::-moz-range-track]:bg-transparent"
        style={{ background: `linear-gradient(to right, var(--do-brand) ${pct}%, var(--do-border-2) ${pct}%)` }}
      />

      {presets && (
        <div className="flex items-center gap-1.5 mt-3">
          {presets.map(p => {
            const active = value === p.value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.value)}
                aria-pressed={active}
                className={`flex-1 py-1 rounded-lg text-[10.5px] font-semibold transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  active ? 'bg-brand text-white' : 'bg-surface text-text-muted hover:text-text-primary border border-border'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SegmentControl({ options, value, onChange, renderOption }) {
  return (
    <div className="relative flex gap-1 p-1 bg-surface-2 border border-border rounded-xl">
      {options.map(opt => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={`relative flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {active && (
              <span className="absolute inset-0 bg-surface shadow-sm ring-1 ring-border rounded-lg" />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {renderOption ? renderOption(opt, active) : opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
