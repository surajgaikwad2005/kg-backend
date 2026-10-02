'use client';

import React from 'react';
import { Select } from '@/src/components/ui/Select';
import PropertyFields from './PropertyFields';

export default function ConnectionFormContent({
    nodeOptions = [],
    srcId,
    onSrcIdChange,
    tgtId,
    onTgtIdChange,
    relType,
    onRelTypeChange,
    properties,
    onPropertiesChange,
    relTypes,
    isEdit = false,
}) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-label font-black text-text-subtle uppercase tracking-widest block">
                        Source Entity
                    </label>
                    <Select
                        disabled={isEdit}
                        value={srcId}
                        onChange={onSrcIdChange}
                        placeholder="-- Choose node --"
                        searchable
                        searchPlaceholder="Search nodes..."
                        options={nodeOptions.map((o) => ({ value: o.id, label: `${o.label} (${o.classification})` }))}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-label font-black text-text-subtle uppercase tracking-widest block">
                        Target Entity
                    </label>
                    <Select
                        disabled={isEdit}
                        value={tgtId}
                        onChange={onTgtIdChange}
                        placeholder="-- Choose node --"
                        searchable
                        searchPlaceholder="Search nodes..."
                        options={nodeOptions.map((o) => ({ value: o.id, label: `${o.label} (${o.classification})` }))}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-label font-black text-text-subtle uppercase tracking-widest block">
                    Relationship Type
                </label>
                <Select
                    value={relType}
                    onChange={onRelTypeChange}
                    options={relTypes.map(t => ({ value: t, label: t }))}
                    searchable
                    searchPlaceholder="Search types..."
                    placeholder="Select..."
                />
            </div>

            <PropertyFields
                value={properties}
                onChange={onPropertiesChange}
                label="Connection Properties & KPIs"
                emptyHint="No connection properties defined yet."
            />
        </div>
    );
}
