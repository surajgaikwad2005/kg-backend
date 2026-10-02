'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

/**
 * MultiSelectDropdown — reusable multi-select dropdown component.
 *
 * Props:
 * - label: string (optional field label above trigger, e.g. "FILTER USERS")
 * - options: Array<{ value: string|number, label: string }>
 * - value: Array<string|number> (array of selected values)
 * - onChange: (newValues: Array<string|number>) => void
 * - onRemoveItem: (value: string|number) => void
 * - placeholder: string
 * - searchable: boolean
 * - showPills: boolean (default true)
 */
export function MultiSelectDropdown({
    label,
    options = [],
    value = [],
    onChange,
    onRemoveItem,
    placeholder = 'None selected',
    searchable = false,
    showPills = true,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedValues = useMemo(() => (Array.isArray(value) ? value : []), [value]);

    const isAllSelected = options.length > 0 && selectedValues.length === options.length;

    const triggerLabel = useMemo(() => {
        if (selectedValues.length === 0) return placeholder;
        if (isAllSelected) return `All selected (${options.length})`;
        return `${selectedValues.length} selected`;
    }, [selectedValues.length, isAllSelected, options.length, placeholder]);

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase().trim();
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, searchable, searchQuery]);

    const selectedOptionsList = useMemo(
        () => options.filter((opt) => selectedValues.includes(opt.value)),
        [options, selectedValues]
    );

    const handleToggleOption = (optValue) => {
        const exists = selectedValues.includes(optValue);
        const next = exists
            ? selectedValues.filter((v) => v !== optValue)
            : [...selectedValues, optValue];
        onChange?.(next);
    };

    const handleSelectAll = () => {
        onChange?.(options.map((opt) => opt.value));
    };

    const handleClearAll = () => {
        onChange?.([]);
    };

    return (
        <div className={`space-y-2.5 ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                    {label}
                </label>
            )}

            {/* Trigger Container */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-surface hover:bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-left text-sm font-medium text-text-primary flex items-center justify-between transition-colors shadow-xs cursor-pointer focus:outline-none focus:border-brand"
                    aria-expanded={isOpen}
                >
                    <span className="truncate">{triggerLabel}</span>
                    <ChevronDown
                        size={16}
                        className={`text-text-muted transition-transform duration-200 shrink-0 ml-2 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {/* Dropdown Panel attached directly under trigger */}
                {isOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-72">
                        {/* Header: Select All / Clear */}
                        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between text-xs bg-surface-2/60">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-brand font-semibold hover:underline cursor-pointer"
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-text-muted hover:text-text-primary font-medium cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Search Bar (if searchable) */}
                        {searchable && options.length > 5 && (
                            <div className="p-2 border-b border-border relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-surface-2 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand"
                                />
                            </div>
                        )}

                        {/* Options List */}
                        <div className="overflow-y-auto p-1 divide-y divide-border/20">
                            {filteredOptions.length === 0 ? (
                                <div className="p-3 text-xs text-text-muted text-center">No options found</div>
                            ) : (
                                filteredOptions.map((opt) => {
                                    const isSelected = selectedValues.includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleToggleOption(opt.value)}
                                            className="w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between hover:bg-surface-2/70 rounded-xl transition-colors cursor-pointer group"
                                        >
                                            <span className="font-medium text-text-primary truncate pr-2">
                                                {opt.label}
                                            </span>
                                            <div
                                                className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                                                    isSelected
                                                        ? 'bg-brand border-brand text-white shadow-xs'
                                                        : 'border-border bg-surface group-hover:border-brand/40'
                                                }`}
                                            >
                                                {isSelected && <Check size={12} strokeWidth={3} />}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Dismissible Tag Pills */}
            {showPills && selectedOptionsList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {selectedOptionsList.map((opt) => (
                        <span
                            key={opt.value}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-muted text-brand border border-brand/20 shadow-xs"
                        >
                            <span>{opt.label}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    if (onRemoveItem) {
                                        onRemoveItem(opt.value);
                                    } else {
                                        handleToggleOption(opt.value);
                                    }
                                }}
                                className="hover:bg-brand/10 p-0.5 rounded-full transition-colors cursor-pointer text-brand"
                                aria-label={`Remove ${opt.label}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MultiSelectDropdown;
