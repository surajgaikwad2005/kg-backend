'use client';
import React, { useId } from 'react';
import { Select } from '@/src/components/ui/Select';
import { CheckboxDropdown } from './CheckboxDropdown';

/**
 * Renders one schema-driven config field (dropdown/text-field/numeric-field/
 * checkbox) — the same field-type contract used by the ReactFlow node
 * Properties sidebar, the Asset Configuration modal and the /asset-config
 * page. Pure/presentational: callers own the value and pass it back through
 * onChange.
 *
 * Shared (src/components/config-fields/) rather than colocated in a route
 * folder because three unrelated features render the same contract.
 */
const KNOWN_TYPES = ['text-field', 'numeric-field', 'dropdown', 'checkbox'];

const INPUT_CLASS =
    'w-full bg-surface border border-border rounded-(--do-radius) px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder:text-text-secondary/60 transition-all';

export function ConfigFieldRenderer({ config, value, onChange }) {
    // Rule 32: every input needs a real label association, and these fields are
    // rendered in a loop where the schema's `name` is not guaranteed unique.
    const fieldId = useId();

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={fieldId} className="text-xs font-semibold text-text-primary" title={config.description}>
                {config.name || 'Value'}
                {config.description && (
                    <span className="ml-1 text-text-secondary font-normal">— {config.description}</span>
                )}
            </label>

            {config.type === 'text-field' && (
                <textarea
                    id={fieldId}
                    rows={2}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={config.default?.toString() || config.placeholder?.toString() || 'Enter value...'}
                    className={`${INPUT_CLASS} resize-y`}
                />
            )}

            {config.type === 'numeric-field' && (
                <input
                    id={fieldId}
                    type="number"
                    value={value !== '' && value !== undefined ? value : ''}
                    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={config.default?.toString() || '0'}
                    className={INPUT_CLASS}
                />
            )}

            {config.type === 'dropdown' && (
                <Select
                    id={fieldId}
                    value={value || config.default || ''}
                    onChange={onChange}
                    options={config.value || []}
                />
            )}

            {config.type === 'checkbox' && (
                <CheckboxDropdown
                    config={{ ...config, default: value ?? config.default }}
                    onUpdate={onChange}
                />
            )}

            {!KNOWN_TYPES.includes(config.type) && (
                <input
                    id={fieldId}
                    type="text"
                    value={value ?? (typeof config.default === 'string' || typeof config.default === 'number' ? config.default : '')}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter value..."
                    className={INPUT_CLASS}
                />
            )}
        </div>
    );
}
