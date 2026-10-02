import React, { useState, useRef, useEffect } from 'react';

export default function CustomLogicMetricInput({ value, onChange, metricsList, placeholder, idKey = 'id', labelKey = 'label', onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (value === 'CREATE_NEW') {
      setSearch('Create New Custom Logic...');
    } else if (value) {
      const selectedItem = metricsList.find(m => m[idKey] === value);
      setSearch(selectedItem ? (selectedItem[labelKey] || selectedItem.name || value) : value);
    } else {
      setSearch('');
    }
  }, [value, metricsList, idKey, labelKey]);

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = search && open
    ? metricsList.filter(m => String(m[idKey] || '').toLowerCase().includes(search.toLowerCase()) || String(m[labelKey] || m.name || '').toLowerCase().includes(search.toLowerCase()))
    : metricsList;

  // Deduplicate items by idKey to prevent React duplicate keys and redundant options
  const uniqueFiltered = [];
  const seenIds = new Set();
  for (const m of filtered) {
    const id = m[idKey];
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      uniqueFiltered.push(m);
    }
  }

  const isCustomSelected = value && value !== 'CREATE_NEW' && metricsList.some(m => m[idKey] === value && m[idKey] !== 'CREATE_NEW');

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => { setSearch(''); setOpen(true); }}
          placeholder={placeholder}
          className={`w-full h-8 pl-[30px] ${isCustomSelected ? 'pr-[76px]' : 'pr-8'} border-[1.5px] rounded-md bg-canvas font-mono text-[11px] text-text-primary outline-none transition-colors duration-120 ${open ? 'border-brand' : 'border-border'}`}
        />

        {/* INLINE ACTION BUTTONS */}
        <div className="absolute right-[9px] top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isCustomSelected && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEdit(value); }} title="Edit Logic" className="bg-transparent border-none cursor-pointer text-text-muted hover:text-brand p-1 flex">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(value); }} title="Delete Logic" className="bg-transparent border-none cursor-pointer text-danger hover:text-danger/80 p-1 flex">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
              </button>
              <div className="w-px h-3.5 bg-border-strong mx-0.5" />
            </>
          )}
          {value && (
            <button onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); setOpen(false); }} className="bg-transparent border-none cursor-pointer text-text-subtle p-1 flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {open && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 bg-surface border-[1.5px] border-border rounded-xl shadow-2xl z-[400] max-h-[200px] overflow-y-auto">
          {uniqueFiltered.length > 0 ? (
            uniqueFiltered.map((m, idx) => (
              <div key={`${m[idKey]}-${idx}`}
                onClick={() => { onChange(m[idKey]); setOpen(false); }}
                className="px-3.5 py-2.5 cursor-pointer border-b border-border/40 hover:bg-canvas flex items-center justify-between gap-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className={`font-mono text-[11.5px] font-semibold truncate ${m[idKey] === 'CREATE_NEW' ? 'text-brand' : 'text-text-primary'}`}>
                    {m[labelKey] || m.name || m[idKey]}
                  </div>
                  {m.description && <div className="text-[10px] text-text-muted mt-0.5 truncate">{m.description}</div>}
                </div>
                {m[idKey] !== 'CREATE_NEW' && (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (onEdit) onEdit(m[idKey]);
                        setOpen(false);
                      }}
                      title="Edit Logic"
                      className="bg-transparent border-none cursor-pointer text-text-muted hover:text-brand hover:bg-canvas p-1 flex rounded transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (onDelete) onDelete(m[idKey]);
                        setOpen(false);
                      }}
                      title="Delete Logic"
                      className="bg-transparent border-none cursor-pointer text-danger hover:bg-danger/10 p-1 flex rounded transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-3.5 py-3 text-[11px] text-text-subtle text-center italic font-sans">
              No custom logic options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
