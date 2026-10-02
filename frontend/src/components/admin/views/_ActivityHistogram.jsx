'use client';
import React, { useMemo } from 'react';
import { cn } from '@/src/lib/utils';

/**
 * ActivityHistogram — a stacked-bar, time-bucketed chart for runs/log events.
 *
 * Generic: give it `items` (each with a timestamp + a series key) and a
 * `seriesAccessor` that maps an item → one of the `series` keys. It buckets the
 * items over their time span and renders stacked bars. Optional `onPick(range)`
 * fires when a bar is clicked (for click-to-filter).
 *
 * Kept deliberately dependency-free (flex/height %, no charting lib) so it stays
 * light and matches the dark theme.
 *
 * @param {Array}  items
 * @param {(it)=>string} tsAccessor      → ISO timestamp string
 * @param {(it)=>string} seriesAccessor  → one of `series` keys
 * @param {Array<{key,label,cls}>} series  stacking order (bottom→top) + bar color class
 * @param {number} buckets
 * @param {string} height  tailwind height class for the chart area
 */
export function ActivityHistogram({
    items = [], tsAccessor, seriesAccessor, series, buckets = 40,
    height = 'h-20',
}) {
    const { grid, max, from, to } = useMemo(() => {
        const epochs = items
            .map(it => { const t = new Date(tsAccessor(it)).getTime(); return Number.isFinite(t) ? t : null; })
            .filter(t => t != null);
        if (epochs.length === 0) return { grid: [], max: 0, from: null, to: null };
        const lo = Math.min(...epochs), hi = Math.max(...epochs);
        const span = Math.max(hi - lo, 1);
        const width = span / buckets;
        const g = Array.from({ length: buckets }, () => {
            const o = { total: 0 }; series.forEach(s => { o[s.key] = 0; }); return o;
        });
        for (const it of items) {
            const t = new Date(tsAccessor(it)).getTime();
            if (!Number.isFinite(t)) continue;
            const idx = Math.min(Math.floor((t - lo) / width), buckets - 1);
            const k = seriesAccessor(it);
            if (g[idx][k] == null) g[idx][k] = 0;
            g[idx][k] += 1;
            g[idx].total += 1;
        }
        return { grid: g, max: Math.max(...g.map(b => b.total), 1), from: lo, to: hi };
    }, [items, tsAccessor, seriesAccessor, series, buckets]);

    if (grid.length === 0) return null;

    const fmt = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="border border-border rounded-2xl bg-surface p-4">
            <div className={cn('flex items-end gap-[2px]', height)}>
                {grid.map((b, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end group relative"
                         title={`${b.total} ${b.total === 1 ? 'item' : 'items'}`}>
                        {series.map(s => {
                            const h = max ? (b[s.key] / max) * 100 : 0;
                            if (!b[s.key]) return null;
                            return <div key={s.key} className={cn('w-full', s.cls)} style={{ height: `${h}%` }} />;
                        })}
                        {b.total === 0 && <div className="w-full h-px bg-border/40" />}
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-2xs text-text-subtle">
                <span>{from != null ? fmt(from) : ''}</span>
                <div className="flex items-center gap-3">
                    {series.filter(s => grid.some(b => b[s.key] > 0)).map(s => (
                        <span key={s.key} className="inline-flex items-center gap-1">
                            <span className={cn('w-2 h-2 rounded-sm', s.cls)} /> {s.label}
                        </span>
                    ))}
                </div>
                <span>{to != null ? fmt(to) : ''}</span>
            </div>
        </div>
    );
}
