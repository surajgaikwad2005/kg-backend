'use client';
import { useState, useCallback, useMemo } from 'react';
import * as cdm from '@/src/services/domain-configuration/common';
import { useToast } from '@/src/components/ui/Toast';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';

/**
 * Reusable hook to handle row-level persistence (PATCH /context/rows)
 * across all four connectors (pnid, documents, timeseries, sap).
 */
export function useContextRowPersistence() {
    const [savingRowKey, setSavingRowKey] = useState(null);
    const [deletingRowKey, setDeletingRowKey] = useState(null);
    const { success: toastSuccess, error: toastError } = useToast();
    const invalidateConnectorState = useInvalidateConnectorState();

    const saveContextRow = useCallback(async ({
        connector,
        rowData,
        plantCode,
        batchId,
        rowKey,
        onSuccess,
    }) => {
        if (!rowKey || savingRowKey === rowKey) return;
        setSavingRowKey(rowKey);

        const rawRows = Array.isArray(rowData) ? rowData : [rowData];
        const normalizedRows = rawRows.map((r) => (
            r && typeof r === 'object'
                ? { ...r, plant_code: plantCode, plant_code_id: plantCode }
                : r
        ));

        const payload = {
            plant_code: plantCode,
            plant_code_id: plantCode,
            ...(batchId ? { batch_id: batchId } : {}),
            rows: normalizedRows,
        };

        try {
            await cdm.patchContextRows(connector, payload);
            toastSuccess('Row saved successfully');
            invalidateConnectorState(plantCode);
            if (onSuccess) {
                onSuccess(rowData);
            }
        } catch (err) {
            toastError(err?.message || 'Failed to save row edits');
        } finally {
            setSavingRowKey(null);
        }
    }, [savingRowKey, toastSuccess, toastError, invalidateConnectorState]);

    const deleteContextRow = useCallback(async ({
        connector,
        rowData,
        plantCode,
        batchId,
        rowKey,
        onSuccess,
    }) => {
        if (!rowKey || deletingRowKey === rowKey) return;
        setDeletingRowKey(rowKey);

        const payload = {
            plant_code: plantCode,
            plant_code_id: plantCode,
            action: 'delete',
            ...(batchId ? { batch_id: batchId } : {}),
            rows: Array.isArray(rowData) ? rowData : [rowData],
        };

        try {
            await cdm.patchContextRows(connector, payload);
            toastSuccess('Row deleted successfully');
            invalidateConnectorState(plantCode);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            toastError(err?.message || 'Failed to delete row');
        } finally {
            setDeletingRowKey(null);
        }
    }, [deletingRowKey, toastSuccess, toastError, invalidateConnectorState]);

    // Memoized so this hook's return value is only a new reference when one of
    // its own values actually changes — otherwise a fresh object literal on
    // every render defeats useAdminContextValues.js's entityValue useMemo,
    // forcing every useAdminEntities() consumer to re-render on every
    // AdminPanelProvider render.
    return useMemo(() => ({
        savingRowKey,
        deletingRowKey,
        saveContextRow,
        deleteContextRow,
    }), [savingRowKey, deletingRowKey, saveContextRow, deleteContextRow]);
}
