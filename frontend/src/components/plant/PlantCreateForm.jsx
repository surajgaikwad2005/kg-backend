'use client';
import React from 'react';
import { AlertCircle, Loader2, Plus, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Select } from '@/src/components/ui/Select';
import { INDUSTRY_OPTIONS } from './constants';

/**
 * Inline "create a new plant" form body, shared by every plant dropdown's
 * create mode (admin PlantIdSelector + header PlantSwitcher). Pair with
 * useCreatePlantForm for the underlying state/validation/submit logic.
 */
export function PlantCreateForm({
    value,
    onValueChange,
    industry,
    onIndustryChange,
    error,
    submitting,
    onSubmit,
    onBack,
    inputRef,
}) {
    return (
        <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    aria-label="Back"
                >
                    <X size={13} />
                </button>
                <span className="text-label font-bold text-text-muted uppercase tracking-wider">New Plant ID</span>
            </div>

            <div className="space-y-1">
                <label htmlFor="new-plant-id-input" className="sr-only">Plant ID</label>
                <input
                    id="new-plant-id-input"
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value.replace(/\s+/g, '-'))}
                    onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                    placeholder="e.g. PLANT-01"
                    className={cn(
                        'w-full px-3 py-2 text-body-sm bg-surface-2 border rounded-lg',
                        'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all',
                        error ? 'border-danger/50 bg-danger/5' : 'border-border',
                    )}
                />
            </div>

            {/* Industry — required by the backend on create */}
            <div className="space-y-1">
                <label htmlFor="new-plant-industry-select" className="text-2xs font-bold text-text-muted uppercase tracking-wider">
                    Industry
                </label>
                <Select
                    id="new-plant-industry-select"
                    value={industry}
                    onChange={onIndustryChange}
                    placeholder="Choose an industry..."
                    options={INDUSTRY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                    error={error && !industry ? 'Industry is required' : undefined}
                />
            </div>

            {error && (
                <p className="text-caption text-danger flex items-center gap-1">
                    <AlertCircle size={11} />
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || !value.trim() || !industry}
                aria-busy={submitting}
                className={cn(
                    'w-full flex items-center justify-center gap-2 py-2 rounded-lg text-body-sm font-bold transition-all cursor-pointer',
                    'bg-brand text-white hover:bg-brand-hover',
                    (submitting || !value.trim() || !industry) && 'opacity-50 cursor-not-allowed',
                )}
            >
                {submitting
                    ? <><Loader2 size={13} className="animate-spin" /> Creating...</>
                    : <><Plus size={13} /> Create Plant ID</>
                }
            </button>
        </div>
    );
}
