'use client';

import { useCallback } from 'react';
import { slugify } from './cpcpOntologyUtils';
import { cpcpService } from '@/src/services/cpcp/cpcpService';

export function useCpcpColumns({ columns, setColumns, setRows, offline, clientName }) {
    const addColumn = useCallback(
        async (label) => {
            const trimmed = String(label || '').trim();
            const key = slugify(trimmed);
            if (!key) throw new Error('Attribute name is required.');
            if (columns.some((c) => c.key === key)) throw new Error('That attribute already exists.');

            if (!offline) await cpcpService.addAttribute({ key, label: trimmed }, clientName);
            setColumns((prev) => [...prev, { key, label: trimmed }]);
            setRows((prev) => prev.map((r) => ({ ...r, attributes: { ...r.attributes, [key]: '' } })));
        },
        [columns, offline, clientName, setColumns, setRows]
    );

    const removeColumn = useCallback(
        async (key) => {
            if (!offline) await cpcpService.deleteAttribute(key, clientName);
            setColumns((prev) => prev.filter((c) => c.key !== key));
            setRows((prev) =>
                prev.map((r) => {
                    const next = { ...r.attributes };
                    delete next[key];
                    return { ...r, attributes: next };
                })
            );
        },
        [offline, clientName, setColumns, setRows]
    );

    return { addColumn, removeColumn };
}
