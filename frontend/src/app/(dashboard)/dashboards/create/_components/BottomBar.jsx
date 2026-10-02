import React, { useState } from 'react';

function Metric({ label, value, valueColorClass }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[64px]">
      <span className="text-[9.5px] font-bold tracking-[0.10em] uppercase text-text-subtle">{label}</span>
      <span className={`font-mono text-[13px] font-bold tabular-nums ${valueColorClass || 'text-text-primary'}`}>{value}</span>
    </div>
  );
}

function Divider() { 
  return <div className="w-px h-7 bg-border shrink-0" />; 
}

export function BottomBar({ tags, setTags, onSave, saveStatus, stats }) {
  const [tagInput, setTagInput] = useState('');
  
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));
  
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(prev => [...new Set([...prev, tagInput.trim()])]);
      setTagInput('');
    }
  };

  const currentVal = stats?.a?.avg;
  const minVal = stats?.a?.min;
  const maxVal = stats?.a?.max;
  const unit = stats?.a?.unit || '';

  const getSaveBtnClass = () => {
    let base = "inline-flex items-center gap-1.5 h-8 px-3.5 border-none rounded-lg text-xs font-bold shadow-[0_2px_6px_rgba(15,23,42,0.22)] transition-colors duration-200 ";
    if (saveStatus === 'saving') return base + "bg-brand text-white opacity-75 cursor-not-allowed";
    if (saveStatus === 'saved') return base + "bg-success text-white cursor-pointer";
    return base + "bg-brand hover:bg-brand-hover text-white cursor-pointer";
  };

  return (
    <div className="sticky bottom-0 grid grid-cols-[280px_1fr_320px] bg-surface border-t border-border shadow-[0_-4px_16px_rgba(15,23,42,0.06)] z-5 shrink-0">
      {/* Tag input */}
      <div className="p-[10px_18px] border-r border-border">
        <div className="text-[9.5px] font-bold tracking-[0.10em] uppercase text-text-subtle mb-1.5">Tags</div>
        <div className="flex items-center flex-wrap gap-1.5 w-full min-h-[32px] p-[4px_8px] border border-border rounded-full bg-surface-2">
          {tags.map(t => (
            <span key={t} className="inline-flex items-center gap-1 h-[22px] px-2 bg-surface border border-border rounded-full text-[11px] font-semibold text-text-secondary">
              {t}
              <svg onClick={() => removeTag(t)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[9px] h-[9px] text-text-subtle hover:text-danger cursor-pointer transition-colors"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </span>
          ))}
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add tag…"
            className="flex-1 min-w-[60px] border-none outline-none bg-transparent text-[11.5px] text-text-primary h-[22px]" />
        </div>
      </div>

      {/* Live stats */}
      <div className="p-[10px_18px] flex items-center gap-3.5">
        <Metric label="Current" value={currentVal != null ? `${currentVal.toFixed(2)} ${unit}` : '—'} />
        <Divider />
        <Metric label="Min" value={minVal != null ? minVal.toFixed(2) : '—'} valueColorClass="text-brand" />
        <Metric label="Max" value={maxVal != null ? maxVal.toFixed(2) : '—'} valueColorClass="text-danger" />
        <Divider />
        <div className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-bold tracking-[0.10em] uppercase text-text-subtle">Unit</span>
          <span className="font-mono text-[13px] font-bold text-text-primary">{unit || '—'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-[10px_18px] flex items-center gap-2 border-l border-border justify-end">
        <button className="inline-flex items-center gap-1.5 h-8 px-3 bg-surface hover:bg-surface-2 text-text-secondary border border-border rounded-lg text-xs font-semibold cursor-pointer transition-colors">Apply</button>
        <button onClick={onSave} disabled={saveStatus === 'saving'} className={getSaveBtnClass()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          {saveStatus === 'saving' ? '…Saving' : saveStatus === 'saved' ? '✓ Saved' : 'Save Dashboard'}
        </button>
      </div>
    </div>
  );
}
