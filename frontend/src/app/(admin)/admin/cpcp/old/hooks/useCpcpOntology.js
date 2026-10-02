'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cpcpService } from '@/src/services/cpcp/cpcpService';
import {
    useCpcpOntologyQuery,
    useCpcpMatrixQuery,
    useAddAttributeMutation,
    useDeleteAttributeMutation,
} from '../../_queries/useCpcpQueries';

import { SEED_COLUMNS, SEED_EQUIPMENT, equipmentToRow, normalizeColumns } from './cpcpOntologyUtils';
import { useCpcpColumns } from './useCpcpColumns';
import { useCpcpWorkspaces } from './useCpcpWorkspaces';

export function useCpcpOntology() {
    const { clientName, availableWorkspaces, switchWorkspace } = useCpcpWorkspaces();
    const [columns, setColumns] = useState(SEED_COLUMNS);
    const [rows, setRows] = useState([]);
    const [offline, setOffline] = useState(false);
    const [search, setSearch] = useState('');
    const [isAgentRunning, setIsAgentRunning] = useState(false);

    const { addColumn, removeColumn } = useCpcpColumns({ columns, setColumns, setRows, offline, clientName });

    const { data: matrixRes, isLoading: matrixLoading, isError: matrixError, refetch: refetchMatrix } = useCpcpMatrixQuery(clientName, {
        enabled: Boolean(clientName),
    });

    const { data: ontologyRes, isLoading: ontologyLoading, isError: ontologyError, refetch: refetchOntology } = useCpcpOntologyQuery({
        enabled: !clientName,
    });

    const loading = clientName ? matrixLoading : ontologyLoading;
    const load = clientName ? refetchMatrix : refetchOntology;

    // Sync query results into local component state
    useEffect(() => {
        if (clientName) {
            if (matrixRes) {
                const list = matrixRes?.data || [];
                setColumns(SEED_COLUMNS);
                setRows(list.map((it) => equipmentToRow(it, SEED_COLUMNS)));
                setOffline(false);
            } else if (matrixError) {
                setColumns(SEED_COLUMNS);
                setRows(SEED_EQUIPMENT.map((it) => equipmentToRow(it, SEED_COLUMNS)));
                setOffline(true);
            }
        } else {
            if (ontologyRes) {
                const cols = normalizeColumns(ontologyRes) || SEED_COLUMNS;
                const list = Array.isArray(ontologyRes?.equipment) ? ontologyRes.equipment : Array.isArray(ontologyRes) ? ontologyRes : null;
                if (list) {
                    setColumns(cols);
                    setRows(list.map((it) => equipmentToRow(it, cols)));
                    setOffline(false);
                } else {
                    setColumns(SEED_COLUMNS);
                    setRows(SEED_EQUIPMENT.map((it) => equipmentToRow(it, SEED_COLUMNS)));
                    setOffline(true);
                }
            } else if (ontologyError) {
                setColumns(SEED_COLUMNS);
                setRows(SEED_EQUIPMENT.map((it) => equipmentToRow(it, SEED_COLUMNS)));
                setOffline(true);
            }
        }
    }, [clientName, matrixRes, matrixError, ontologyRes, ontologyError]);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) => r.tag.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const addRow = useCallback(() => {
        setRows((prev) => [{ ...equipmentToRow({}, columns), isEditing: true }, ...prev]);
    }, [columns]);

    const updateField = useCallback((key, field, value) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
    }, []);

    const setFlag = useCallback((key, attrKey, value) => {
        setRows((prev) =>
            prev.map((r) =>
                r.key === key ? { ...r, attributes: { ...r.attributes, [attrKey]: value } } : r
            )
        );
    }, []);

    const toggleEdit = useCallback((key) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, isEditing: !r.isEditing } : r)));
    }, []);

    const setRowFlag = useCallback((key, flagKey, value) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [flagKey]: value } : r)));
    }, []);

    const saveRow = useCallback(
        async (key) => {
            const row = rows.find((r) => r.key === key);
            if (!row) return;

            const isDraft = key.startsWith('draft-');
            setRowFlag(key, 'isSaving', true);
            try {
                if (clientName) {
                    const fields = {};
                    columns.forEach((col) => {
                        const val = row.attributes[col.key];
                        fields[col.key] = val === 'Y' ? 'yes' : val === 'N' ? 'no' : '';
                    });
                    if (isDraft) {
                        await cpcpService.addTag(clientName, row.pageNumber || '1', row.tag.trim(), row.description.trim(), fields);
                    } else {
                        const originalTag = key.startsWith('eq-') ? key.substring(3) : row.tag.trim();
                        if (row.tag.trim() !== originalTag) {
                            await cpcpService.addTag(clientName, row.pageNumber || '1', row.tag.trim(), row.description.trim(), fields);
                            await cpcpService.deleteTag(clientName, row.pageNumber || '1', originalTag);
                        } else {
                            await cpcpService.updateTag(clientName, row.pageNumber || '1', originalTag, fields);
                        }
                    }
                } else {
                    const persist = !offline;
                    if (persist) {
                        await cpcpService.saveEquipment({
                            tag: row.tag.trim(),
                            description: row.description.trim(),
                            attributes: row.attributes,
                        }, clientName);
                    }
                }
                setRows((prev) =>
                    prev.map((r) =>
                        r.key === key
                            ? { ...r, tag: r.tag.trim(), key: `eq-${r.tag.trim()}`, isEditing: false, isSaving: false }
                            : r
                    )
                );
            } catch (err) {
                setRowFlag(key, 'isSaving', false);
                throw err;
            }
        },
        [rows, clientName, columns, offline, setRowFlag]
    );

    const deleteRow = useCallback(
        async (key) => {
            const row = rows.find((r) => r.key === key);
            if (!row) return;
            const isDraft = key.startsWith('draft-');
            if (isDraft) {
                setRows((prev) => prev.filter((r) => r.key !== key));
                return;
            }
            setRowFlag(key, 'isDeleting', true);
            try {
                if (clientName) {
                    const originalTag = key.startsWith('eq-') ? key.substring(3) : row.tag;
                    await cpcpService.deleteTag(clientName, row.pageNumber || '1', originalTag);
                } else if (!offline) {
                    await cpcpService.deleteEquipment(row.tag, clientName);
                }
                setRows((prev) => prev.filter((r) => r.key !== key));
            } catch (err) {
                setRowFlag(key, 'isDeleting', false);
                throw err;
            }
        },
        [rows, clientName, offline, setRowFlag]
    );

    const verifyRow = useCallback(
        async (key) => {
            const row = rows.find((r) => r.key === key);
            if (!row || !clientName) return;

            const originalTag = key.startsWith('eq-') ? key.substring(3) : row.tag;
            const nextStatus = row.status === 'Human Verified' ? 'AI Pending' : 'Human Verified';

            setRowFlag(key, 'isSaving', true);
            try {
                await cpcpService.verifyTag(clientName, row.pageNumber || '1', originalTag, nextStatus);
                setRows((prev) =>
                    prev.map((r) =>
                        r.key === key ? { ...r, status: nextStatus, isSaving: false } : r
                    )
                );
            } catch (err) {
                setRowFlag(key, 'isSaving', false);
                throw err;
            }
        },
        [rows, clientName, setRowFlag]
    );

    const runAgent = useCallback(async () => {
        if (!clientName) return;
        setIsAgentRunning(true);
        try {
            await cpcpService.runPnidAgent(clientName);
            await load();
        } finally {
            setIsAgentRunning(false);
        }
    }, [clientName, load]);

    return {
        columns,
        rows,
        filteredRows,
        loading,
        offline,
        search,
        setSearch,
        reload: load,
        addRow,
        updateField,
        setFlag,
        toggleEdit,
        saveRow,
        deleteRow,
        addColumn,
        removeColumn,
        clientName,
        availableWorkspaces,
        isAgentRunning,
        switchWorkspace,
        verifyRow,
        runAgent,
    };
}
