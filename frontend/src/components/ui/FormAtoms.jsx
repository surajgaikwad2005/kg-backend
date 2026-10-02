'use client';
import React from 'react';
import { C } from './tokens';

/* ─── Toggle switch ─── */
export function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-block w-8 h-[18px] shrink-0">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="opacity-0 w-0 h-0" />
      <span
        className={`absolute inset-0 rounded-[9px] cursor-pointer transition-colors duration-[120ms] ease-linear ${
          checked ? 'bg-brand' : 'bg-border-strong'
        }`}
      >
        <span
          className={`absolute w-3.5 h-3.5 rounded-full bg-white top-0.5 left-0.5 shadow-[0_1px_2px_rgba(15,23,42,0.20)] transition-transform duration-[120ms] ease-linear ${
            checked ? 'translate-x-3.5' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  );
}

/* ─── Toggle row (label + toggle) ─── */
export function TogRow({ icon, label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12.5px] text-text-secondary border-t border-dashed border-surface-2">
      <span className="flex items-center gap-2">
        {icon && <span className="text-text-subtle">{icon}</span>}
        {label}
        {sub && <span className="text-[10.5px] text-text-muted font-medium">{sub}</span>}
      </span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ─── Slider row ─── */
export function SliderRow({ label, value, min, max, step, unit, ticks, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
        <span>{label}</span>
        <span className="font-mono text-[11.5px] font-semibold text-text-primary bg-surface-2 px-[7px] py-px rounded">{value}{unit}</span>
      </div>
      {/* appearance:none + dynamic gradient must stay inline */}
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full outline-none cursor-pointer"
        style={{ height: 4, appearance: 'none', WebkitAppearance: 'none', background: `linear-gradient(to right, ${C.accent} ${pct}%, ${C.surface2} ${pct}%)`, borderRadius: 2 }} />
      {ticks && (
        <div className="flex justify-between font-mono text-[9.5px] text-text-subtle mt-1">
          {ticks.map(t => <span key={t}>{t}</span>)}
        </div>
      )}
    </div>
  );
}

/* ─── Segmented control ─── */
export function SegControl({ options, value, onChange }) {
  return (
    <div className="flex bg-surface-2 rounded-lg p-[3px] w-full">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 h-7 text-[11px] font-semibold border-none rounded-[5px] cursor-pointer tracking-[0.02em] transition-all ${
            value === opt
              ? 'text-text-primary bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
              : 'text-text-muted bg-transparent'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Form field wrapper ─── */
export function Field({ label, note, children }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-caption font-semibold text-text-secondary mb-[5px]">
        <span>{label}</span>
        {note && <span className="text-label text-text-subtle font-medium">{note}</span>}
      </div>
      {children}
    </div>
  );
}
