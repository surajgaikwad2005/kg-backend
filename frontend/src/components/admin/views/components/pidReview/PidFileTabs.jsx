'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function PidFileTabs({ pids, pidStep, onSelect }) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {pids.map((pid, idx) => (
                <button
                    key={pid.id}
                    type="button"
                    onClick={() => onSelect(idx)}
                    className={cn(
                        'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        idx === pidStep
                            ? 'bg-brand text-white shadow-xs'
                            : idx < pidStep
                            ? 'bg-success/10 border border-success/30 text-success hover:bg-success/20'
                            : 'bg-surface hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary',
                    )}
                >
                    {idx < pidStep && <CheckCircle2 size={12} className="inline mr-1" />}
                    {pid.name}
                </button>
            ))}
        </div>
    );
}
