'use client';

/**
 * PropertyFields — reusable key/value list editor for knowledge-graph entity and
 * relationship metadata. Fully controlled: the parent owns the `value` array of
 * `{ key, value }` pairs and receives the next array through `onChange`.
 *
 * @param {{ key: string, value: string }[]} value
 * @param {(next: { key: string, value: string }[]) => void} onChange
 * @param {string} [label]
 * @param {string} [emptyHint]
 */
import React from 'react';
import { Plus, Trash } from 'lucide-react';

export default function PropertyFields({
    value = [],
    onChange,
    label = 'Custom Metadata & Properties',
    emptyHint = 'No custom properties defined yet.',
}) {
    const add = () => onChange([...value, { key: '', value: '' }]);
    const remove = (idx) => onChange(value.filter((_, i) => i !== idx));
    const update = (idx, field, val) =>
        onChange(value.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));

    const fieldCls =
        'flex-1 min-w-0 px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-brand transition-colors text-text-secondary';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-label font-black text-text-subtle uppercase tracking-widest">{label}</span>
                <button
                    type="button"
                    onClick={add}
                    className="flex items-center gap-1 text-label font-bold text-brand hover:text-brand-hover transition-colors cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Field
                </button>
            </div>

            <div className="space-y-2">
                {value.map((prop, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Property Key"
                            value={prop.key}
                            onChange={(e) => update(idx, 'key', e.target.value)}
                            className={fieldCls}
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={prop.value}
                            onChange={(e) => update(idx, 'value', e.target.value)}
                            className={fieldCls}
                        />
                        <button
                            type="button"
                            onClick={() => remove(idx)}
                            aria-label="Remove property"
                            className="p-2 text-text-subtle hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer"
                        >
                            <Trash className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                {value.length === 0 && (
                    <p className="text-center py-4 text-xs font-semibold text-text-subtle italic">{emptyHint}</p>
                )}
            </div>
        </div>
    );
}
