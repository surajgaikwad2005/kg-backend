'use client';
import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { useAdminEntities, useAdminNav, useDocsForm } from '@/src/components/admin/AdminPanelContext';
import { removeRowByIdentity } from '@/src/components/admin/admin.utils';

const PAGE_SIZE = 50;

const docRowId = (row) => row?.document_id ?? row?.id;

/**
 * A browser-openable URL for a row's source file, or null when nothing
 * confirmed can produce one.
 *
 * `file_reference` on GET /context/get?connector=documents is only ever an
 * `s3://` object-store URI (confirmed live 2026-08-18, e.g.
 * "s3://staging-pt/p0/staging-pt/Test_Plant_1/documents/equipment_datasheets/…pdf")
 * — no browser can fetch or navigate to that scheme, and there is no signed-URL
 * / file-serving endpoint documented anywhere for the documents domain (unlike
 * src/services/domain-configuration/pnid, whose dedicated `/getFile` route
 * serves an entirely different backend). Returning null rather than handing the
 * s3:// URI straight to `window.open` is deliberate: that would produce a
 * button that looks live but silently fails or errors, which is worse than one
 * that is honestly disabled with a tooltip explaining why. Once a real endpoint
 * is confirmed, this is the one place to wire it — DocsReviewTable already
 * reads row.fileHref and enables its button whenever this stops returning null.
 */
function resolveFileHref(_fileReference) {
    return null;
}

function normaliseRow(row) {
    return {
        id:         row.id       || row.document_id    || '',
        type:       row.type     || row.document_type  || row.category || '',
        title:      row.title    || row.source_file    || '',
        equip:      row.equip    || row.equipment_tag  || row.equipment_label || '',
        entities:   row.entities || row.extracted_entities || '',
        confidence: row.asset_match_confidence ?? null,
        sourceFile: row.source_file || '',
        fileReference: row.file_reference || '',
        fileHref: resolveFileHref(row.file_reference),
        _raw: row,
    };
}

export function useDocsReview() {
    const {
        editingRow, setEditingRow, editingRowData, setEditingRowData,
        setDeleteConfirm, commitDocsContext, committedSources,
        processedSources, validatedSources, selectedPlantId, pipelineStatuses,
        saveContextRow, deleteContextRow, savingRowKey, deletingRowKey,
    } = useAdminEntities();
    const {
        docCategories, docReviewCategories, selectedDocCategory,
        setSelectedDocCategory, docCategoryStep, setDocCategoryStep,
        docDataByCategory, setDocDataByCategory, docsTruncation,
    } = useDocsForm();
    const { setView } = useAdminNav();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [page, setPage] = useState(0);
    const [pendingEdits, setPendingEdits] = useState({});
    const [originalSnapshot, setOriginalSnapshot] = useState(null);

    const plantId = selectedPlantId?.id;
    useEffect(() => {
        setPendingEdits({});
        setOriginalSnapshot(null);
        setEditingRow(null);
    }, [plantId, setEditingRow]);

    const isCommitted = committedSources.has('Documents');
    const isProcessed = processedSources.has('Documents') || validatedSources.has('Documents') || committedSources.has('Documents');

    // The docs pipeline job can still be extracting later files in this same
    // batch while earlier ones are already reviewable here — confirmed live
    // 2026-08-18 (a GET /pipeline/jobs/{id} poll read status:'running',
    // progress_percent:5 for the exact upload_batch_id a concurrent
    // GET /context/get call was already returning rows for).
    const docsRun = pipelineStatuses?.docs;
    const isDocsRunActive = docsRun?.status === 'running' || docsRun?.status === 'queued';

    const unsavedCount = Object.keys(pendingEdits).length;
    const hasUnsavedEdits = unsavedCount > 0;
    const isSavingBatch = savingRowKey === 'batch:docs';

    const displayCategories = useMemo(() => (
        (docReviewCategories?.length > 0 ? docReviewCategories : Object.keys(docDataByCategory)).map(catItem => {
            const id = typeof catItem === 'object'
                ? (catItem.id || catItem.key || catItem.category)
                : catItem;
            const standard = docCategories.find(c => c.id === id);
            const baseLabel = typeof catItem === 'object' && catItem.label
                ? catItem.label
                : (id && typeof id === 'string'
                    ? id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : 'Unknown');
            return {
                id,
                label: standard ? standard.label : baseLabel,
                icon: standard
                    ? standard.icon
                    : <FileText size={24} className="text-text-muted" />,
            };
        })
    ), [docReviewCategories, docDataByCategory, docCategories]);

    const rawRows = useMemo(
        () => docDataByCategory[selectedDocCategory] || [],
        [docDataByCategory, selectedDocCategory],
    );

    const normalisedRows = useMemo(() => rawRows.map(normaliseRow), [rawRows]);

    const filteredRows = useMemo(() => {
        if (!deferredSearch.trim()) return normalisedRows;
        const q = deferredSearch.toLowerCase();
        return normalisedRows.filter(r =>
            r.id.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.equip.toLowerCase().includes(q) ||
            r.entities.toLowerCase().includes(q),
        );
    }, [normalisedRows, deferredSearch]);

    const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
    const pagedRows = useMemo(
        () => filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
        [filteredRows, page],
    );

    const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };

    const handleSaveRow = (idx) => {
        const cat = selectedDocCategory;
        const nd = [...(docDataByCategory[cat] || [])];
        const pageOffset = page * PAGE_SIZE;
        const rawIdx = normalisedRows.findIndex((_, i) => {
            const filtered = filteredRows;
            const pagedIdx = pageOffset + idx;
            return filtered[pagedIdx] === normalisedRows[i];
        });
        const actualIdx = rawIdx >= 0 ? rawIdx : pageOffset + idx;
        const currentRaw = nd[actualIdx] || {};

        const updatedRaw = {
            ...currentRaw,
            id: editingRowData.id ?? currentRaw.id ?? currentRaw.document_id ?? '',
            document_id: editingRowData.id ?? currentRaw.document_id ?? currentRaw.id ?? '',
            type: editingRowData.type ?? currentRaw.type ?? '',
            document_type: editingRowData.type ?? currentRaw.document_type ?? '',
            title: editingRowData.title ?? currentRaw.title ?? '',
            equip: editingRowData.equip ?? currentRaw.equip ?? '',
            equipment_tag: editingRowData.equip ?? currentRaw.equipment_tag ?? '',
            entities: editingRowData.entities ?? currentRaw.entities ?? '',
            extracted_entities: editingRowData.entities ?? currentRaw.extracted_entities ?? '',
        };

        const targetRow = pagedRows[idx];
        const stableId = targetRow?.id || updatedRaw.document_id || updatedRaw.id || actualIdx;
        const pendingKey = `${cat}:${stableId}`;

        setPendingEdits(prev => ({ ...prev, [pendingKey]: updatedRaw }));
        nd[actualIdx] = updatedRaw;
        setDocDataByCategory({ ...docDataByCategory, [cat]: nd });
        setEditingRow(null);
    };

    const handleSaveAllDirtyRows = async () => {
        if (!hasUnsavedEdits || !saveContextRow) return;
        const cat = selectedDocCategory;
        const allRows = (docDataByCategory[cat] || []).map((r) => ({
            ...r,
            plant_code_id: plantId,
            plant_code: plantId,
        }));

        await saveContextRow({
            connector: 'documents',
            rowData: allRows,
            plantCode: plantId,
            batchId: pipelineStatuses?.docs?.batchId,
            rowKey: 'batch:docs',
            onSuccess: () => {
                setPendingEdits({});
                setEditingRow(null);
            },
        });
    };

    const handleDiscardAllEdits = () => {
        if (originalSnapshot) {
            setDocDataByCategory(originalSnapshot);
        }
        setPendingEdits({});
        setEditingRow(null);
    };

    const handleDeleteRow = (pagedIdx) => {
        const cat = selectedDocCategory;
        const pageOffset = page * PAGE_SIZE;
        const globalIdx = pageOffset + pagedIdx;
        const targetRow = filteredRows[globalIdx];
        const rawIdx = normalisedRows.indexOf(targetRow);
        const row = pagedRows[pagedIdx];
        const rawItem = (docDataByCategory[cat] || [])[rawIdx] || row?._raw || row;
        const stableId = targetRow?.id || rawItem?.document_id || rawItem?.id || globalIdx;
        const rowKey = `doc:${cat}:${stableId}`;

        const dropRow = () => {
            setDocDataByCategory(prev => ({
                ...prev,
                [cat]: removeRowByIdentity(prev[cat] || [], rawItem, docRowId),
            }));
            setDeleteConfirm(prev => ({ ...prev, open: false }));
        };

        setDeleteConfirm({
            open: true,
            title: 'Delete Document Row',
            message: `Delete "${row.title || row.id}"?`,
            onConfirm: async () => {
                if (deleteContextRow) {
                    await deleteContextRow({
                        connector: 'documents',
                        rowData: rawItem,
                        plantCode: selectedPlantId?.id,
                        batchId: pipelineStatuses?.docs?.batchId,
                        rowKey,
                        onSuccess: dropRow,
                    });
                } else {
                    dropRow();
                }
            },
        });
    };

    return {
        selectedDocCategory, setSelectedDocCategory,
        docCategoryStep, setDocCategoryStep,
        docsTruncation, setView, router,
        search, setSearch, handleSearchChange,
        page, setPage, PAGE_SIZE,
        isCommitted, isProcessed,
        docsRun, isDocsRunActive,
        unsavedCount, hasUnsavedEdits, isSavingBatch,
        displayCategories, filteredRows, totalPages, pagedRows,
        editingRow, setEditingRow, editingRowData, setEditingRowData,
        savingRowKey, deletingRowKey,
        commitDocsContext,
        handleSaveRow, handleSaveAllDirtyRows, handleDiscardAllEdits, handleDeleteRow,
    };
}
