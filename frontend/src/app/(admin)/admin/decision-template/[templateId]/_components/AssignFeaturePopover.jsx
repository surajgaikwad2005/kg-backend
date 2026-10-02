'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';

export function AssignFeaturePopover({ onSelect, placedTypeIds, align = 'left', openUp = false, widgetTypes = [], sizeLabel }) {
    return (
        <div
            role="menu"
            aria-label="Assign feature"
            className={`absolute z-30 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-time-selector-in
                ${align === 'right' ? 'right-0' : 'left-0'}
                ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border bg-surface-2/60">
                <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="text-[11px] font-black text-text-secondary uppercase tracking-wider flex-1 min-w-0 truncate">Assign Feature</span>
                {sizeLabel && (
                    <span className="text-[10px] font-bold text-brand bg-brand-muted px-2 py-0.5 rounded-full shrink-0">
                        {sizeLabel}
                    </span>
                )}
            </div>
            <div className="py-1 max-h-72 overflow-y-auto thin-scrollbar">
                {widgetTypes.length === 0 && (
                    <p className="px-3.5 py-3 text-sm text-text-secondary italic">No widget types available.</p>
                )}
                {widgetTypes.map((type) => {
                    const Icon = type.icon;
                    const isPlaced = placedTypeIds?.has(type.id);
                    return (
                        <button
                            key={type.id}
                            type="button"
                            role="menuitem"
                            disabled={isPlaced}
                            aria-disabled={isPlaced}
                            onClick={() => !isPlaced && onSelect(type)}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                                isPlaced ? 'cursor-not-allowed opacity-50' : 'hover:bg-surface-2 cursor-pointer'
                            }`}
                        >
                            <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${isPlaced ? 'bg-surface-2 text-text-subtle' : type.badgeClass}`}>
                                <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className={`text-sm font-semibold flex-1 min-w-0 truncate ${isPlaced ? 'text-text-subtle' : 'text-text-primary'}`}>
                                {type.label}
                            </span>
                            {isPlaced && (
                                <span className="text-[10px] font-semibold text-text-subtle bg-surface-2 px-2 py-0.5 rounded-full shrink-0">
                                    Placed
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
