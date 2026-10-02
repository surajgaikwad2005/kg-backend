import React from 'react';
import { Toggle } from '@/src/components/ui/FormAtoms';
import { MonitorMetricInput } from './MonitorMetricInput';
import { MODAL_CHART_CATEGORIES, CHART_TYPE_TAG_SUGGESTIONS, COLOR_SCHEMES, TIME_PRESETS } from './constants';

export function MonitorConfigPanel({
  chartType,
  setChartType,
  metricA,
  setMetricA,
  metricB,
  setMetricB,
  metricsList,
  timePreset,
  setTimePreset,
  interval,
  setInterval,
  tags,
  setTags,
  tagInput,
  setTagInput,
  tagDropdownOpen,
  setTagDropdownOpen,
  tagDropdownRef,
  addTag,
  selectedChartMeta,
  colorScheme,
  setColorScheme,
  showGrid,
  setShowGrid,
  showLegend,
  setShowLegend,
}) {
  const sectionLabelClass = "text-[10px] font-extrabold text-text-subtle tracking-[0.12em] uppercase block mb-2.5";

  return (
    <div className="flex-[0_0_43%] overflow-y-auto p-[16px_22px]">
      {/* Visualization type */}
      <div className="pb-4 border-b border-border mb-4">
        <label className={sectionLabelClass}>Visualization Type</label>
        <div className="flex flex-col gap-2.5">
          {MODAL_CHART_CATEGORIES.map(cat => (
            <div key={cat.label}>
              <div className="text-[9px] font-extrabold text-text-subtle tracking-[0.12em] uppercase mb-1.5">{cat.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {cat.types.map(ct => (
                  <button key={ct.id} onClick={() => setChartType(ct.id)}
                    className={`inline-flex items-center gap-1.5 p-[5px_10px_5px_7px] border-[1.5px] rounded-[9px] cursor-pointer transition-all duration-120
                      ${chartType === ct.id ? 'border-brand bg-brand-muted/20 shadow-[0_2px_8px_rgba(37,99,235,0.15)]' : 'border-border bg-surface hover:border-text-subtle'}`}>
                    <span className={`w-5 h-5 rounded-[5px] grid place-items-center shrink-0 transition-colors
                      ${chartType === ct.id ? 'bg-brand text-white' : 'bg-surface-2 text-text-secondary'}`}>{ct.icon}</span>
                    <span className={`text-[11px] font-bold whitespace-nowrap transition-colors
                      ${chartType === ct.id ? 'text-brand' : 'text-text-primary'}`}>{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data source */}
      <div className="pb-4 border-b border-border mb-4">
        <label className={sectionLabelClass}>Data Source</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] font-semibold text-text-primary mb-1.5">Series A <span className="text-[9.5px] text-danger font-bold">required</span></div>
            <MonitorMetricInput value={metricA} onChange={setMetricA} metricsList={metricsList} placeholder="Search metric…" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-text-primary mb-1.5">Series B <span className="text-[9.5px] text-text-subtle font-medium">optional</span></div>
            <MonitorMetricInput value={metricB} onChange={setMetricB} metricsList={metricsList} placeholder="Add second metric…" />
          </div>
        </div>
      </div>

      {/* Time range */}
      <div className="pb-4 border-b border-border mb-4">
        <label className={sectionLabelClass}>Time Range</label>
        <div className="flex flex-wrap gap-[7px]">
          {TIME_PRESETS.map(tp => (
            <button key={tp} onClick={() => setTimePreset(tp)}
              className={`h-[30px] px-[13px] rounded-full border-[1.5px] text-[11.5px] font-semibold cursor-pointer transition-all duration-120
                ${timePreset === tp ? 'border-brand bg-brand-muted/20 text-brand' : 'border-border bg-surface text-text-primary hover:border-text-subtle'}`}>
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Interval */}
      <div className="pb-4 border-b border-border mb-4">
        <label className={sectionLabelClass}>Bucket Interval</label>
        <div className="flex flex-wrap gap-[7px]">
          {['1m', '5m', '10m', '15m', '30m', '1h', '6h', '12h', '1d'].map(iv => (
            <button key={iv} onClick={() => setInterval(iv)}
              className={`h-7 px-3 rounded-full border font-mono text-[11px] font-bold cursor-pointer transition-all duration-120
                ${interval === iv ? 'border-text-primary bg-text-primary text-surface' : 'border-border bg-surface text-text-primary hover:border-text-subtle'}`}>
              {iv}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="pb-4 border-b border-border mb-4" ref={tagDropdownRef}>
        <label className="flex items-center gap-2 mb-2 text-[10px] font-extrabold text-text-subtle tracking-[0.12em] uppercase">
          Tags 
          <span className="text-[9.5px] font-medium text-text-subtle normal-case tracking-normal">suggestions based on chart type</span>
        </label>
        <div className={`flex flex-wrap items-center gap-1.5 p-[7px_10px] border-[1.5px] rounded-[10px] bg-canvas min-h-[40px] cursor-text transition-colors duration-120 ${tagDropdownOpen ? 'border-brand' : 'border-border'}`}
          onClick={() => setTagDropdownOpen(true)}>
          {tags.map(t => (
            <span key={t} className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-surface border border-border text-[11.5px] font-semibold text-text-primary">
              {t}
              <svg onClick={e => { e.stopPropagation(); setTags(prev => prev.filter(x => x !== t)); }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[10px] h-[10px] cursor-pointer text-text-subtle hover:text-danger transition-colors"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </span>
          ))}
          <input value={tagInput} onChange={e => { setTagInput(e.target.value); setTagDropdownOpen(true); }} onFocus={() => setTagDropdownOpen(true)}
            onKeyDown={addTag} placeholder={tags.length === 0 ? 'Select or type tags…' : ''}
            className="flex-1 min-w-[80px] border-none outline-none bg-transparent text-xs text-text-primary h-6" />
        </div>
        {tagDropdownOpen && (
          <div className="mt-1.5 border-[1.5px] border-border rounded-[10px] bg-surface shadow-[0_6px_20px_rgba(15,23,42,0.12)] overflow-hidden">
            <div className="p-[7px_12px_5px] text-[9px] font-extrabold text-text-subtle tracking-[0.12em] uppercase border-b border-border">
              Suggested for {selectedChartMeta?.label || chartType}
            </div>
            <div className="max-h-[130px] overflow-y-auto">
              {(CHART_TYPE_TAG_SUGGESTIONS[chartType] || []).filter(s => !tags.includes(s) && s.toLowerCase().includes(tagInput.toLowerCase())).map(s => (
                <div key={s} onClick={() => { setTags(prev => [...new Set([...prev, s])]); setTagInput(''); }}
                  className="p-[7px_12px] cursor-pointer text-[12.5px] text-text-primary flex items-center gap-[7px] border-b border-border hover:bg-surface-2 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[11px] h-[11px] text-text-subtle"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  {s}
                </div>
              ))}
              {tagInput.trim() && !tags.includes(tagInput.trim()) && (
                <div onClick={() => { setTags(prev => [...new Set([...prev, tagInput.trim()])]); setTagInput(''); setTagDropdownOpen(false); }}
                  className="p-[7px_12px] cursor-pointer text-[12.5px] text-brand font-semibold flex items-center gap-[7px] hover:bg-surface-2 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[11px] h-[11px]"><path d="M12 5v14M5 12h14"/></svg>
                  Add &ldquo;{tagInput}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Visual Settings */}
      <div className="pb-4">
        <label className={sectionLabelClass}>Visual Settings</label>
        <div className="mb-3">
          <div className="text-[10px] font-semibold text-text-subtle tracking-[0.06em] uppercase mb-2">Color Scheme</div>
          <div className="flex gap-1.5">
            {COLOR_SCHEMES.map((scheme, i) => (
              <div key={i} onClick={() => setColorScheme(i)}
                className="flex-1 h-[22px] rounded-[5px] cursor-pointer transition-all duration-100"
                style={{ 
                  background: scheme, 
                  border: colorScheme === i ? '2px solid var(--do-text-1)' : '2px solid transparent', 
                  boxShadow: colorScheme === i ? '0 0 0 2px var(--do-surface), 0 0 0 3px var(--do-text-1)' : 'none' 
                }} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0 pt-1">
          {[['Show Grid Lines', showGrid, setShowGrid], ['Show Legend', showLegend, setShowLegend]].map(([label, val, setter]) => (
            <div key={label} className="flex items-center justify-between py-2 text-[12.5px] text-text-primary border-t border-dashed border-border">
              <span>{label}</span>
              <Toggle checked={val} onChange={setter} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
