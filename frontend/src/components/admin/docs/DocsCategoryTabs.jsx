'use client';
import React from 'react';
import { cn } from '@/src/lib/utils';

export function DocsCategoryTabs({ displayCategories, selectedDocCategory, onSelectCategory }) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {displayCategories.map((cat, idx) => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id, idx)}
                    className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-xl text-caption font-bold transition-all cursor-pointer',
                        selectedDocCategory === cat.id
                            ? 'bg-brand text-white shadow-sm'
                            : 'bg-surface border border-border text-text-muted hover:text-text-primary hover:bg-surface-2',
                    )}
                >
                    {cat.icon && (React.isValidElement(cat.icon)
                        ? React.cloneElement(cat.icon, { size: 13, className: 'shrink-0' })
                        : <span>{cat.icon}</span>
                    )}
                    {cat.label}
                </button>
            ))}
        </div>
    );
}
