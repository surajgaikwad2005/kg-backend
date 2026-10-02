import React, { useState } from 'react';
import { Toggle, TogRow, SliderRow, SegControl } from '@/src/components/ui/FormAtoms';
import { COLOR_SCHEMES } from './constants';

export function RightPanel({ scaleMode, setScaleMode, showLabels, setShowLabels, showGrid, setShowGrid, showLegend, setShowLegend, crosshair, setCrosshair, autoScale, setAutoScale, leftAxis, setLeftAxis, rightAxis, setRightAxis, lineThickness, setLineThickness, fillOpacity, setFillOpacity, colorScheme, setColorScheme, thresholds, setThresholds }) {
  const [activeTab, setActiveTab] = useState('Display');
  const tabs = ['Annotations', 'Display', 'Advanced', 'Data'];
  const addThreshold = () => setThresholds(prev => [...prev, { value: 50, color: '#94A3B8', label: 'New' }]);
  const removeThreshold = (i) => setThresholds(prev => prev.filter((_, idx) => idx !== i));
  const updateThreshold = (i, key, val) => setThresholds(prev => prev.map((t, idx) => idx === i ? { ...t, [key]: val } : t));

  return (
    <aside className="w-[320px] bg-surface border-l border-border overflow-y-auto shrink-0 custom-scrollbar">
      <div className="flex items-center px-4 border-b border-border">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`flex-1 bg-transparent border-none py-3.5 text-xs font-semibold relative cursor-pointer transition-colors
              ${activeTab === tab ? 'text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary'}`}>
            {tab}
            {activeTab === tab && <span className="absolute left-[10%] right-[10%] -bottom-px h-0.5 bg-brand rounded-t-sm block" />}
          </button>
        ))}
      </div>

      {/* Scale & Axis */}
      <div className="p-[16px_18px] border-b border-border">
        <div className="flex items-center justify-between text-[10px] font-extrabold tracking-[0.14em] uppercase text-text-secondary mb-3">
          <span>Scale &amp; Axis</span>
          <span onClick={() => { setAutoScale(true); setScaleMode('Linear'); }} 
            className="text-[10px] font-semibold text-text-subtle normal-case tracking-normal cursor-pointer hover:text-brand transition-colors">Reset</span>
        </div>
        <div className="pt-1.5">
          <TogRow label="Auto Scale" checked={autoScale} onChange={setAutoScale} />
        </div>
        <div className="mt-3.5">
          <TogRow icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]"><path d="M4 4v16M4 4h6M4 12h4M4 20h6" /></svg>} label="Left Y-Axis" checked={leftAxis} onChange={setLeftAxis} />
          <TogRow icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]"><path d="M20 4v16M20 4h-6M20 12h-4M20 20h-6" /></svg>} label="Right Y-Axis" checked={rightAxis} onChange={setRightAxis} />
        </div>
        <div className="mt-3.5">
          <div className="text-[10px] font-semibold text-text-subtle tracking-[0.06em] uppercase mb-1">Scale Mode</div>
          <SegControl options={['Linear', 'Log', 'Sqrt']} value={scaleMode} onChange={setScaleMode} />
        </div>
      </div>

      {/* Visual */}
      <div className="p-[16px_18px] border-b border-border">
        <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-text-secondary mb-3">Visual</div>
        <div className="pt-1.5">
          <TogRow label="Show Data Labels" checked={showLabels} onChange={setShowLabels} />
          <TogRow label="Show Grid Lines" checked={showGrid} onChange={setShowGrid} />
          <TogRow label="Show Legend" checked={showLegend} onChange={setShowLegend} />
          <TogRow label="Crosshair Tooltip" checked={crosshair} onChange={setCrosshair} />
        </div>
        <div className="mt-2.5">
          <SliderRow label="Line Thickness" value={lineThickness} min={1} max={5} step={0.5} unit=" px" ticks={['1', '2', '3', '4', '5']} onChange={setLineThickness} />
          <SliderRow label="Fill Opacity" value={fillOpacity} min={0} max={100} step={1} unit="%" ticks={['0%', '50%', '100%']} onChange={setFillOpacity} />
        </div>
        <div className="mt-3">
          <div className="text-[10px] font-semibold text-text-subtle tracking-[0.06em] uppercase mb-2">Color Scheme</div>
          <div className="flex gap-1.5">
            {COLOR_SCHEMES.map((scheme, i) => (
              <div key={i} onClick={() => setColorScheme(i)} 
                className={`flex-1 h-6 rounded-[5px] cursor-pointer transition-all duration-100 ease-in-out`}
                style={{ 
                  background: scheme, 
                  border: colorScheme === i ? '2px solid var(--color-text-primary)' : '2px solid transparent', 
                  boxShadow: colorScheme === i ? '0 0 0 2px var(--color-surface), 0 0 0 3px var(--color-text-primary)' : 'none',
                  transform: colorScheme === i ? 'scale(1.05)' : 'scale(1)'
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* Thresholds */}
      <div className="p-[16px_18px]">
        <div className="flex items-center justify-between text-[10px] font-extrabold tracking-[0.14em] uppercase text-text-secondary mb-3">
          <span>Thresholds</span>
          <span onClick={() => setThresholds([])} className="text-[10px] font-semibold text-text-subtle normal-case tracking-normal cursor-pointer hover:text-danger transition-colors">Clear all</span>
        </div>
        <div className="flex flex-col gap-2">
          {thresholds.map((thr, i) => (
            <div key={i} className="grid grid-cols-[64px_24px_1fr_24px] gap-2 items-center p-[8px_10px] bg-surface-2 rounded-lg border border-border/50">
              <input
                value={thr.value}
                onChange={e => updateThreshold(i, 'value', parseFloat(e.target.value) || 0)}
                type="number"
                className="h-[26px] font-mono text-[11.5px] font-semibold text-text-primary bg-surface border border-border rounded-[5px] px-1.5 outline-none text-center focus:border-brand" />
              <input
                value={thr.color}
                onChange={e => updateThreshold(i, 'color', e.target.value)}
                type="color"
                className="w-6 h-6 rounded-md border-none p-0 cursor-pointer bg-transparent" />
              <input
                value={thr.label}
                onChange={e => updateThreshold(i, 'label', e.target.value)}
                className="h-[26px] text-[11.5px] text-text-primary bg-surface border border-border rounded-[5px] px-2 outline-none focus:border-brand" />
              <button onClick={() => removeThreshold(i)} className="w-6 h-6 grid place-items-center bg-transparent border-none text-text-subtle rounded-[5px] cursor-pointer hover:bg-danger/10 hover:text-danger transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={addThreshold} className="mt-2.5 inline-flex items-center gap-1.5 h-[30px] px-2.5 border-[1.5px] border-dashed border-border/70 rounded-lg bg-transparent text-text-secondary text-[11.5px] font-semibold cursor-pointer hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]"><path d="M12 5v14M5 12h14" /></svg>
          Add threshold
        </button>
      </div>
    </aside>
  );
}
