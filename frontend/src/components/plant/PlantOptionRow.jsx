'use client';
import React from 'react';
import { Building2, Check, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

/**
 * One plant row inside a plant dropdown list. `onDelete` is optional — pass
 * it only where delete should be offered. Both the admin PlantIdSelector and
 * the header PlantSwitcher pass it, gated to admin-role users only.
 */
export function PlantOptionRow({ plant, isSelected, onClick, onDelete }) {
    return (
        <div className="group relative flex items-center">
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'flex-1 flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 cursor-pointer',
                    'hover:bg-brand-muted/60',
                    onDelete && 'pr-10',
                    isSelected && 'bg-brand-muted',
                )}
            >
                <Building2
                    size={14}
                    className={cn('shrink-0', isSelected ? 'text-brand' : 'text-text-muted')}
                />
                <div className="flex-1 min-w-0">
                    <p className={cn('text-body-sm font-semibold', isSelected ? 'text-brand' : 'text-text-primary')}>
                        {plant.id}
                    </p>
                    <div className="flex items-center gap-1.5 min-w-0">
                        {plant.name && plant.name !== plant.id && (
                            <p className="text-xs text-text-muted truncate">{plant.name}</p>
                        )}
                        {plant.industry && (
                            <span className="shrink-0 text-tiny font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-surface-2 text-text-subtle">
                                {plant.industry}
                            </span>
                        )}
                    </div>
                </div>
                {isSelected && <Check size={13} className="text-brand shrink-0" />}
            </button>

            {onDelete && (
                <button
                    type="button"
                    aria-label={`Delete plant ${plant.id}`}
                    onClick={(e) => { e.stopPropagation(); onDelete(plant); }}
                    className={cn(
                        'absolute right-2 p-1.5 rounded-lg cursor-pointer transition-all duration-150',
                        'opacity-0 group-hover:opacity-100',
                        'text-text-muted hover:text-danger hover:bg-danger/10',
                    )}
                >
                    <Trash2 size={13} />
                </button>
            )}
        </div>
    );
}
