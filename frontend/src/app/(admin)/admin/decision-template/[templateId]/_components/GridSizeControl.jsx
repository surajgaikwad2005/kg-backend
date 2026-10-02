'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LayoutGrid, Minus, Plus, Check } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { GRID_SIZE_BOUNDS } from '../_lib/gridConfig';

function Stepper({ label, value, onChange, min, max }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-text-secondary">{label}</span>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    aria-label={`Decrease ${label.toLowerCase()}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-fast cursor-pointer"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-text-primary tabular-nums">{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                    aria-label={`Increase ${label.toLowerCase()}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-fast cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

/** Lets the admin resize the ACTIVE category's grid (rows x cols) — each
 *  category can have its own size, persisted alongside its widgets (see
 *  useTemplateDesigner's saveSnapshot). `onResize` returns { ok, reason }
 *  and rejects shrinks that would orphan an already-placed widget. */
export function GridSizeControl({ rows, cols, onResize }) {
    const [open, setOpen] = useState(false);
    const [draftRows, setDraftRows] = useState(rows);
    const [draftCols, setDraftCols] = useState(cols);
    const containerRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        if (open) {
            setDraftRows(rows);
            setDraftCols(cols);
        }
    }, [open, rows, cols]);

    useEffect(() => {
        if (!open) return;
        function onDocMouseDown(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        }
        function onKeyDown(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const handleApply = useCallback(() => {
        const result = onResize(draftRows, draftCols);
        if (result?.ok) {
            setOpen(false);
        } else {
            toast.error(result?.reason || 'Could not resize the grid.');
        }
    }, [draftRows, draftCols, onResize, toast]);

    const unchanged = draftRows === rows && draftCols === cols;

    return (
        <div ref={containerRef} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-2 hover:text-text-primary transition-colors duration-fast cursor-pointer whitespace-nowrap"
            >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid: {rows} x {cols}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Grid size"
                    className="absolute right-0 top-full mt-2 z-30 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-time-selector-in"
                >
                    <div className="px-3.5 py-2.5 border-b border-border bg-surface-2/60">
                        <span className="text-[11px] font-black text-text-secondary uppercase tracking-wider">Grid Size</span>
                    </div>
                    <div className="p-3.5 space-y-3">
                        <Stepper
                            label="Rows"
                            value={draftRows}
                            onChange={setDraftRows}
                            min={GRID_SIZE_BOUNDS.minRows}
                            max={GRID_SIZE_BOUNDS.maxRows}
                        />
                        <Stepper
                            label="Columns"
                            value={draftCols}
                            onChange={setDraftCols}
                            min={GRID_SIZE_BOUNDS.minCols}
                            max={GRID_SIZE_BOUNDS.maxCols}
                        />
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={unchanged}
                            aria-label="Apply grid size"
                            className="w-full flex items-center justify-center gap-1.5 mt-1 px-3 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-fast cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" /> Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
