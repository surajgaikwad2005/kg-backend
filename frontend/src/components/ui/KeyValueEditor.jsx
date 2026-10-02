'use client';
import { Plus, Trash2 } from 'lucide-react';
import { generateId, cn } from '@/src/lib/utils';

/**
 * KeyValueEditor — edits a dynamic Record<string, Value> as rows of key/value
 * inputs (e.g. optimizer constants, constraints, decision variables, bounds).
 * Fully controlled: the parent owns `rows` (array of {id, key, val}) so keys
 * can be typed/duplicated transiently without colliding as object properties.
 * Convert to/from a plain object with `objectToRows` / `rowsToObject` at the
 * form's load/submit boundary, not on every keystroke.
 *
 * valueType: 'text' (single input) | 'number' (single numeric input) |
 *            'range' (two numeric inputs stored as row.val = [min, max])
 */
export function objectToRows(obj = {}) {
    return Object.entries(obj || {}).map(([key, val]) => ({ id: generateId(), key, val }));
}

export function rowsToObject(rows = []) {
    const obj = {};
    rows.forEach(r => { if (r.key.trim()) obj[r.key.trim()] = r.val; });
    return obj;
}

export function KeyValueEditor({
    rows = [], onChange, valueType = 'text',
    keyPlaceholder = 'key', valuePlaceholder = 'value',
    addLabel = 'Add row', emptyLabel = 'No entries yet.', className = '',
}) {
    const updateRow = (id, patch) => onChange(rows.map(r => (r.id === id ? { ...r, ...patch } : r)));
    const addRow = () => onChange([...rows, { id: generateId(), key: '', val: valueType === 'range' ? [0, 0] : valueType === 'number' ? 0 : '' }]);
    const removeRow = (id) => onChange(rows.filter(r => r.id !== id));

    return (
        <div className={cn('space-y-2', className)}>
            {rows.length === 0 && <p className="text-body-sm text-text-subtle italic">{emptyLabel}</p>}
            {rows.map(row => (
                <div key={row.id} className="flex items-center gap-2">
                    <input
                        type="text" value={row.key} onChange={e => updateRow(row.id, { key: e.target.value })}
                        placeholder={keyPlaceholder} aria-label={keyPlaceholder}
                        className="w-1/3 px-3 py-2 border border-border rounded-lg text-body-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                    {valueType === 'range' ? (
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="number" value={row.val?.[0] ?? 0} placeholder="min" aria-label="Min bound"
                                onChange={e => updateRow(row.id, { val: [Number(e.target.value), row.val?.[1] ?? 0] })}
                                className="w-full px-3 py-2 border border-border rounded-lg text-body-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                            />
                            <span className="text-text-subtle text-body-sm shrink-0">to</span>
                            <input
                                type="number" value={row.val?.[1] ?? 0} placeholder="max" aria-label="Max bound"
                                onChange={e => updateRow(row.id, { val: [row.val?.[0] ?? 0, Number(e.target.value)] })}
                                className="w-full px-3 py-2 border border-border rounded-lg text-body-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                            />
                        </div>
                    ) : (
                        <input
                            type={valueType === 'number' ? 'number' : 'text'} value={row.val ?? ''}
                            placeholder={valuePlaceholder} aria-label={valuePlaceholder}
                            onChange={e => updateRow(row.id, { val: valueType === 'number' ? Number(e.target.value) : e.target.value })}
                            className="flex-1 px-3 py-2 border border-border rounded-lg text-body-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                        />
                    )}
                    <button
                        type="button" onClick={() => removeRow(row.id)} aria-label="Remove row"
                        className="p-2 text-text-subtle hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                type="button" onClick={addRow}
                className="flex items-center gap-1.5 text-body-sm font-medium text-brand hover:text-brand-hover cursor-pointer"
            >
                <Plus className="w-3.5 h-3.5" /> {addLabel}
            </button>
        </div>
    );
}
