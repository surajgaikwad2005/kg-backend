import React, { useState, useRef, useEffect } from 'react';

export function MonitorMetricInput({ value, onChange, metricsList, placeholder }) {
  const [search, setSearch] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ''); }, [value]);

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = search ? metricsList.filter(m => m.id.toLowerCase().includes(search.toLowerCase()) || m.label.toLowerCase().includes(search.toLowerCase())) : metricsList;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-text-subtle pointer-events-none"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          value={search} 
          onChange={e => { setSearch(e.target.value); setOpen(true); }} 
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full h-[38px] px-8 border-[1.5px] rounded-[10px] bg-canvas font-mono text-[11.5px] text-text-primary outline-none box-border transition-colors duration-120 ${open ? 'border-brand' : 'border-border'}`}
        />
        {value && (
          <button onClick={() => { onChange(''); setSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-subtle p-0 leading-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[11px] h-[11px]"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface border-[1.5px] border-border rounded-[10px] shadow-[0_6px_20px_rgba(15,23,42,0.12)] z-[400] max-h-[200px] overflow-y-auto">
          {filtered.slice(0, 10).map(m => (
            <div key={m.id} 
              onClick={() => { onChange(m.id); setSearch(m.id); setOpen(false); }}
              className="px-3 py-2 cursor-pointer border-b border-border hover:bg-surface-2 transition-colors">
              <div className="font-mono text-[11px] text-brand font-semibold">{m.id}</div>
              <div className="text-[10.5px] text-text-secondary mt-px">{m.label} · <b>{m.unit}</b></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
