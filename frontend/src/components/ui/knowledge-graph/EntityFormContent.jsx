'use client';

import React from 'react';
import { Select } from '@/src/components/ui/Select';
import PropertyFields from './PropertyFields';

const inputCls =
    'w-full px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-semibold outline-none focus:bg-surface focus:border-brand transition-colors text-text-secondary';

export default function EntityFormContent({
    isEdit,
    nodeKey,
    onNodeKeyChange,
    nodeLabel,
    onNodeLabelChange,
    properties,
    onPropertiesChange,
    labels,
}) {
    return (
        <div className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-label font-black text-text-subtle uppercase tracking-widest block">
                    Unique Key Identifier
                </label>
                <input
                    type="text"
                    required
                    placeholder="e.g. PUMP-101"
                    value={nodeKey}
                    onChange={(e) => onNodeKeyChange?.(e.target.value)}
                    disabled={isEdit}
                    className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                {isEdit && (
                    <span className="text-2xs font-medium text-text-subtle block italic leading-none">
                        Primary identifier key cannot be modified.
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label className="text-label font-black text-text-subtle uppercase tracking-widest block">
                    Entity Classification Label
                </label>
                <Select
                    value={nodeLabel}
                    onChange={onNodeLabelChange}
                    options={nodeLabel && !labels.includes(nodeLabel) ? [...labels, nodeLabel] : labels}
                />
            </div>

            <PropertyFields value={properties} onChange={onPropertiesChange} />
        </div>
    );
}
