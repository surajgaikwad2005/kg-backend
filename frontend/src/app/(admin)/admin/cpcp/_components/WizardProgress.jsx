'use client';

import { Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { WIZARD_STEPS } from '../_lib/constants';

function activeIndex(step) {
    const idx = WIZARD_STEPS.findIndex((s) => s.id === step || s.matches?.includes(step));
    return idx === -1 ? 0 : idx;
}

/** Slim horizontal stepper showing progress through the CPCP template wizard. */
export function WizardProgress({ step }) {
    const current = activeIndex(step);

    return (
        <ol className="flex items-center w-full mb-10 overflow-x-auto thin-scrollbar pb-1">
            {WIZARD_STEPS.map((s, i) => {
                const isDone = i < current;
                const isCurrent = i === current;
                return (
                    <li key={s.id} className="flex items-center shrink-0 last:flex-1">
                        <div className="flex items-center gap-2.5">
                            <span
                                className={cn(
                                    'flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold shrink-0 transition-colors duration-300',
                                    isDone && 'bg-brand text-white',
                                    isCurrent && 'bg-brand-muted text-brand ring-2 ring-brand',
                                    !isDone && !isCurrent && 'bg-surface-2 text-text-subtle'
                                )}
                            >
                                {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                            </span>
                            <span
                                className={cn(
                                    'text-xs font-semibold whitespace-nowrap transition-colors duration-300',
                                    isCurrent ? 'text-text-primary' : 'text-text-subtle'
                                )}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < WIZARD_STEPS.length - 1 && (
                            <div
                                className={cn(
                                    'h-px flex-1 min-w-8 mx-3 transition-colors duration-300',
                                    isDone ? 'bg-brand' : 'bg-border'
                                )}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
