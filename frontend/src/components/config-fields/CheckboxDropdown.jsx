'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Multi-select dropdown for a schema field of `type: 'checkbox'`.
 * Presentational — the caller owns the value and receives the new array
 * through onUpdate. Consumed via ConfigFieldRenderer, never directly.
 */
export const CheckboxDropdown = ({ config, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selected = Array.isArray(config.default)
        ? config.default
        : typeof config.default === 'string' && config.default
            ? [config.default]
            : [];

    const toggleSelection = (val) => {
        const newSelected = selected.includes(val)
            ? selected.filter((item) => item !== val)
            : [...selected, val];
        onUpdate?.(newSelected);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="w-full bg-surface border border-border rounded-(--do-radius) px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand text-left flex justify-between items-center cursor-pointer hover:bg-border/20 transition-colors"
            >
                <span className="truncate pr-2 text-text-primary">
                    {selected.length > 0 ? selected.join(', ') : 'Select options...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-secondary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div role="listbox" className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-(--do-radius) shadow-lg max-h-48 overflow-y-auto thin-scrollbar">
                    {config.value?.map((opt) => (
                        <label
                            key={opt}
                            className="flex items-center px-3 py-2 hover:bg-border/30 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                onChange={() => toggleSelection(opt)}
                                className="mr-2 rounded border-border text-brand focus:ring-brand cursor-pointer"
                            />
                            <span className="text-sm text-text-primary truncate">{opt}</span>
                        </label>
                    ))}
                    {!config.value?.length && (
                        <p className="px-3 py-2 text-sm text-text-secondary italic">No options available.</p>
                    )}
                </div>
            )}
        </div>
    );
};
