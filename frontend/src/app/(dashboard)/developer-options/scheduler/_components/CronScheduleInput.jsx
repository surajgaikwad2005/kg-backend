'use client';
import { CRON_FIELD_LABELS } from '../_lib/cron';

export function CronScheduleInput({ fields, onFieldChange }) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {fields.map((value, i) => (
                <div key={CRON_FIELD_LABELS[i]} className="flex flex-col gap-1.5">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onFieldChange(i, e.target.value)}
                        placeholder="*"
                        aria-label={CRON_FIELD_LABELS[i]}
                        className="w-full text-center py-2.5 rounded-lg bg-canvas border border-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand transition-colors"
                    />
                    <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider text-center">
                        {CRON_FIELD_LABELS[i]}
                    </span>
                </div>
            ))}
        </div>
    );
}
