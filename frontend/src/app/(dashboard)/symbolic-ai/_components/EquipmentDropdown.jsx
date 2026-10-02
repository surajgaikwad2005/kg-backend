'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function EquipmentDropdown({ value, options, onChange, invalid }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer',
            invalid
              ? 'bg-danger/10 text-danger border-danger/30 ring-1 ring-danger/20'
              : 'bg-success/10 text-success border-success/30 hover:bg-success/20',
        )}
      >
        <span className="truncate max-w-32">
          {value || <span className="italic opacity-60">Select…</span>}
        </span>
        <ChevronDown
          className={cn('w-3 h-3 shrink-0 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-surface border border-border rounded-xl shadow-modal z-50 py-1 min-w-40 max-h-48 overflow-y-auto thin-scrollbar animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted italic">No options available</div>
          ) : (
            options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  'w-full px-3 py-2 text-left text-xs font-medium text-text-primary hover:bg-surface-2 transition-colors cursor-pointer',
                  value === opt && 'bg-success/10 text-success font-bold',
                )}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
