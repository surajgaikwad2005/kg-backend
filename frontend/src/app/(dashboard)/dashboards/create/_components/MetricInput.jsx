import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/src/components/ui/tokens';

export function MetricInput({ value, onChange, metricsList, placeholder, label }) {
  const [search, setSearch] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ''); }, [value]);

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = search
    ? metricsList.filter(m => m.id.toLowerCase().includes(search.toLowerCase()) || m.label.toLowerCase().includes(search.toLowerCase()))
    : metricsList;

  const selectedMeta = metricsList.find(m => m.id === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: C.slate2 }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Search metric…'}
          style={{ width: '100%', height: 34, padding: '0 10px 0 32px', border: `1px solid ${open ? C.accent : C.border}`, borderRadius: 8, background: C.surface, fontFamily: C.fontMono, fontSize: 11.5, color: C.inkNavy, outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms' }}
        />
        {value && (
          <button onClick={() => { onChange(''); setSearch(''); }}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.slate2, padding: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} style={{ width: 12, height: 12 }}><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 6px 20px rgba(15,23,42,0.12)', zIndex: 200, maxHeight: 220, overflowY: 'auto' }}>
          {filtered.map(m => (
            <div key={m.id}
              onClick={() => { onChange(m.id); setSearch(m.id); setOpen(false); }}
              style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: `1px solid ${C.divider}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.surface2}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: C.fontMono, fontSize: 11, color: C.accent, fontWeight: 600 }}>{m.id}</div>
              <div style={{ fontSize: 10.5, color: C.slate, marginTop: 2 }}>{m.label} · <b>{m.unit}</b></div>
            </div>
          ))}
        </div>
      )}

      {selectedMeta && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
          {selectedMeta.tags.map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 9999, background: 'rgba(37,99,235,0.10)', color: C.blue700, fontFamily: C.fontMono, fontSize: 10, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
