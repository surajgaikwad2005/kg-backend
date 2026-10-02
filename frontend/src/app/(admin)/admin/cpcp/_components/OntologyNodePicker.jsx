'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
/** Searchable single-select dropdown used for the ontology From/To pickers. */
export function OntologyNodePicker({ label, value, onSelect, placeholder, options = [] }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const matches = options.filter((node) => String(node).toLowerCase().includes(query.toLowerCase()));

    return (
        <div>
            <label className="block text-sm font-bold text-text-primary mb-3">{label}</label>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        aria-label={label}
                        value={open ? query : value || query}
                        onFocus={() => { setOpen(true); setQuery(''); }}
                        onBlur={() => setTimeout(() => setOpen(false), 200)}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-3.5 text-sm font-medium text-text-primary transition-all focus:bg-surface focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                    <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>

                {open && (
                    <div className="absolute z-20 w-full mt-2 bg-surface rounded-xl shadow-modal border border-border overflow-hidden max-h-60 overflow-y-auto">
                        {matches.map((node) => (
                            <button
                                key={node}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-brand-muted hover:text-brand transition-colors border-b border-border/60 last:border-0 cursor-pointer"
                                onClick={() => { onSelect(node); setQuery(node); setOpen(false); }}
                            >
                                {node}
                            </button>
                        ))}
                        {matches.length === 0 && (
                            <div className="px-4 py-3 text-sm text-text-muted text-center">No matches found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
