import React, { useState, useRef, useEffect, forwardRef } from 'react';

const ModalMetricInput = forwardRef(({ value, onChange, metricsList, placeholder, idKey = 'id', labelKey = 'label', unitKey = 'unit', tagsKey = 'tags', clearOnSelect = false, onEdit, onDelete }, ref) => {
  const [search, setSearch] = useState(typeof value === 'string' ? value : (value?.[idKey] || ''));
  const [open, setOpen] = useState(false);
  const localRef = useRef(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setSearch(value || '');
  }
  useEffect(() => {
    const close = e => { if (localRef.current && !localRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = search
    ? metricsList.filter(m => String(m[idKey] || '').toLowerCase().includes(search.toLowerCase()) || String(m[labelKey] || '').toLowerCase().includes(search.toLowerCase()))
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

  return (
    <div ref={localRef} className="relative">
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          ref={ref}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full h-8 pl-[30px] pr-8 border-[1.5px] rounded-md bg-surface-2 font-mono text-[11px] text-text-primary outline-none transition-colors duration-120 ${open ? 'border-brand' : 'border-border'}`}
        />
        {value && (
          <button onClick={() => { onChange(''); setSearch(''); }} className="absolute right-[9px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-subtle p-0 flex items-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 bg-surface border-[1.5px] border-border rounded-xl shadow-2xl z-[400] max-h-[200px] overflow-y-auto">
          {uniqueFiltered.length > 0 ? (
            uniqueFiltered.slice(0, 15).map((m, idx) => {
              if (m[idKey] === 'CREATE_NEW') {
                return (
                  <div key={`${m[idKey]}-${idx}`}
                    onClick={() => { 
                      onChange(m[idKey]); 
                      setSearch(''); 
                      setOpen(false); 
                    }}
                    className="px-3.5 py-2.5 cursor-pointer border-b border-border/40 hover:bg-brand-muted/50 bg-brand-muted/20 transition-colors"
                  >
                    <div className="font-sans text-[11.5px] text-brand font-extrabold tracking-wide flex items-center gap-1.5">
                      <span>✨</span>
                      <span>{m[labelKey] || 'Create New Custom Logic...'}</span>
                    </div>
                  </div>
                );
              }
              const isCustom = m.isCustom;
              if (isCustom) {
                return (
                  <div key={`${m[idKey]}-${idx}`}
                    onClick={() => { 
                      onChange(m[idKey]); 
                      setSearch(clearOnSelect ? '' : String(m[idKey])); 
                      setOpen(false); 
                    }}
                    className="px-3.5 py-2.5 cursor-pointer border-b border-border/40 hover:bg-canvas flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] font-semibold truncate text-text-primary">
                        {m[labelKey] || m[idKey]}
                      </div>
                      {m.description && (
                        <div className="text-[9.5px] text-text-muted mt-0.5 truncate">
                          {m.description}
                        </div>
                      )}
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
                );
              }
              return (
                <div key={`${m[idKey]}-${idx}`}
                  onClick={() => { 
                    onChange(m[idKey]); 
                    setSearch(clearOnSelect ? '' : String(m[idKey])); 
                    setOpen(false); 
                  }}
                  className="px-3.5 py-2.5 cursor-pointer border-b border-border/50 hover:bg-surface-2 transition-colors"
                >
                  <div className={`font-mono text-[10px] font-semibold truncate ${isCustom ? 'text-warning' : 'text-brand'}`}>
                    {m[idKey]}
                  </div>
                  <div className="text-[9.5px] text-text-muted mt-0.5 truncate">
                    {m[labelKey] || ''}
                    {isCustom ? (
                      <span className="ml-1.5 text-[8.5px] font-bold text-warning uppercase tracking-wider bg-warning/10 border border-warning/20 px-1 py-0.5 rounded">custom logic</span>
                    ) : (
                      <>
                        {unitKey && m[unitKey] ? ` · ` : ''}
                        <b className="font-bold text-text-primary">{m[unitKey] || ''}</b>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3.5 py-3 text-[11.5px] text-text-secondary text-center italic font-sans">
              No tags found for this equipment
            </div>
          )}
        </div>
      )}

      {value && metricsList.find(m => m[idKey] === value) && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {(metricsList.find(m => m[idKey] === value)?.[tagsKey] || []).map((t, idx) => (
            <span key={`${t}-${idx}`} className="h-5 px-2 rounded-full bg-brand-muted/20 text-brand font-mono text-[10px] font-bold inline-flex items-center">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
});

ModalMetricInput.displayName = 'ModalMetricInput';

export default ModalMetricInput;
