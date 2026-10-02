'use client';

/**
 * useConnections — connection list management + the highlight/validate flow.
 * Triggers a highlight (resolving the right page image), validates the
 * connection (optionally constrained to the active filter region), and persists
 * verify/wrong/swap edits. Also handles bulk verify, manual tag verify, and the
 * editable connection table.
 */
import { useState, useCallback } from 'react';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { deDuplicate, makePickBbox, baseDimensions } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_lib/utils';
import { extractErrorDetail } from '@/src/services/apiClient';
import { toast } from '@/src/components/ui/toast/toastApi';

const cleanPath = (p) => p?.replace(/\\/g, '/').replace(/^\//, '');

export function useConnections(ctx) {
    const {
        plantCode, pdfName, preprocessedFiles, ocrExcelFilename, connections, setConnections, setErrorMessage,
        selectedPageFile, setSelectedPageFile, highlightData, setHighlightData,
        setValidationResult, setIsHighlightLoading, setIsValidationLoading,
        activeConnection, setActiveConnection, filterBox, canvasRef, setZoom, setPan,
    } = ctx;

    const [selectedFromTag, setSelectedFromTag] = useState('');
    const [selectedToTag, setSelectedToTag] = useState('');
    const [pageNoInput, setPageNoInput] = useState('');
    const [isEditingList, setIsEditingList] = useState(false);
    const [isSavingList, setIsSavingList] = useState(false);
    const [editableConnections, setEditableConnections] = useState([]);
    const [isVerifyingAll, setIsVerifyingAll] = useState(false);
    const [verifyAllProgress, setVerifyAllProgress] = useState(null);

    const scale = useCallback((hlData) => {
        const { width, height } = baseDimensions(hlData);
        const cw = canvasRef.current?.width || 1000;
        const ch = canvasRef.current?.height || 600;
        return makePickBbox(cw / width, ch / height);
    }, [canvasRef]);

    const validate = useCallback(async (fromTag, toTag, hlData, filter) => {
        const pick = scale(hlData);
        return pnidService.validateConnection(plantCode, {
            from_tag: fromTag, to_tag: toTag, page_no: hlData.page_no,
            ocr_excel_filename: ocrExcelFilename, document_path: selectedPageFile?.path,
            from_bbox: pick(hlData.from_bboxes, filter), to_bbox: pick(hlData.to_bboxes, filter),
        });
    }, [plantCode, scale, ocrExcelFilename, selectedPageFile]);

    const revalidateConnection = useCallback(async (filter) => {
        if (!plantCode || !activeConnection || !highlightData) return;
        setIsValidationLoading(true);
        setErrorMessage(null);
        try {
            setValidationResult(await validate(activeConnection.from, activeConnection.to, highlightData, filter));
        } catch (err) {
            setErrorMessage(extractErrorDetail(err?.data?.detail) ?? 'Failed to re-validate connection with filter.');
        } finally {
            setIsValidationLoading(false);
        }
    }, [plantCode, activeConnection, highlightData, validate, setValidationResult, setErrorMessage, setIsValidationLoading]);

    const resolvePageFile = useCallback((hlData) => {
        let matched = null;
        if (hlData.pnid_image_path) {
            const norm = cleanPath(hlData.pnid_image_path);
            matched = preprocessedFiles.find((f) => f.is_image && cleanPath(f.path) === norm);
        }
        if (!matched) matched = preprocessedFiles.find((f) => f.name === hlData.pnid_image && f.is_image);
        if (matched) return matched;
        if (hlData.pnid_image_path) return { name: hlData.pnid_image, path: hlData.pnid_image_path, is_image: true };
        return null;
    }, [preprocessedFiles]);

    const triggerHighlightAndValidate = useCallback(async (fromTag, toTag, customPage) => {
        if (!plantCode) return;
        setIsHighlightLoading(true);
        setErrorMessage(null);
        try {
            const hlData = await pnidService.highlightComponents(plantCode, {
                from_tag: fromTag, to_tag: toTag, page_no: customPage || null,
                ocr_excel_filename: ocrExcelFilename, document_path: selectedPageFile?.path, pdf_name: pdfName,
            });
            setHighlightData(hlData);

            const pageFile = resolvePageFile(hlData);
            if (pageFile) {
                if (selectedPageFile?.path === pageFile.path) setIsHighlightLoading(false);
                else setSelectedPageFile(pageFile);
            } else {
                setErrorMessage(`Drawing image ${hlData.pnid_image} is not resolved for this plant.`);
                setIsHighlightLoading(false);
            }

            setIsValidationLoading(true);
            setValidationResult(await validate(fromTag, toTag, hlData, filterBox));
            setIsValidationLoading(false);
        } catch (err) {
            setErrorMessage(extractErrorDetail(err?.data?.detail) ?? err?.message ?? 'An error occurred during verification.');
            setIsHighlightLoading(false);
            setIsValidationLoading(false);
        }
    }, [plantCode, pdfName, selectedPageFile, filterBox, ocrExcelFilename, resolvePageFile, validate, setHighlightData, setSelectedPageFile, setValidationResult, setIsHighlightLoading, setIsValidationLoading, setErrorMessage]);

    const resetView = () => { setHighlightData(null); setValidationResult(null); setErrorMessage(null); setZoom(1); setPan({ x: 0, y: 0 }); };

    const handleSelectConnection = useCallback((conn) => {
        setActiveConnection(conn);
        resetView();
        triggerHighlightAndValidate(conn.from, conn.to);
    }, [triggerHighlightAndValidate]);

    const handlePageChange = useCallback((fileName) => {
        const file = preprocessedFiles.find((f) => f.name === fileName && f.is_image);
        if (file) { setSelectedPageFile(file); setHighlightData(null); setValidationResult(null); setActiveConnection(null); }
    }, [preprocessedFiles, setSelectedPageFile, setHighlightData, setValidationResult, setActiveConnection]);

    // ── Persistence + status edits ───────────────────────────────────────────
    const saveConnectionsToBackend = useCallback(async (updated) => {
        if (!plantCode) return;
        try {
            await pnidService.saveHighlightOptions(plantCode, updated.map((c) => ({
                from: c.from, to: c.to, verified: c.verified ?? false, wrong: c.wrong ?? false,
                page: c.page ?? '',
            })), pdfName);
        } catch (err) { }
    }, [plantCode, pdfName]);

    const setStatus = useCallback(async (conn, patch) => {
        const next = connections.map((c) => (c.from === conn.from && c.to === conn.to ? { ...c, ...patch } : c));
        setConnections(next);
        return next;
    }, [connections, setConnections]);

    const markActiveConnectionAsVerified = useCallback(async () => {
        if (!activeConnection) return;
        const next = await setStatus(activeConnection, { verified: true, wrong: false });
        setActiveConnection((p) => (p ? { ...p, verified: true, wrong: false } : null));
        await saveConnectionsToBackend(next);
    }, [activeConnection, setStatus, setActiveConnection, saveConnectionsToBackend]);

    const markActiveConnectionAsWrong = useCallback(async () => {
        if (!activeConnection) return;
        const next = await setStatus(activeConnection, { verified: false, wrong: true });
        setActiveConnection((p) => (p ? { ...p, verified: false, wrong: true } : null));
        await saveConnectionsToBackend(next);
    }, [activeConnection, setStatus, setActiveConnection, saveConnectionsToBackend]);

    const handleSwapConnection = useCallback(async (conn) => {
        const next = connections.map((c) => (c.from === conn.from && c.to === conn.to ? { from: conn.to, to: conn.from, verified: false, wrong: false } : c));
        setConnections(next);
        await saveConnectionsToBackend(next);
        if (activeConnection?.from === conn.from && activeConnection?.to === conn.to) {
            setActiveConnection({ from: conn.to, to: conn.from, verified: false, wrong: false });
            resetView();
            triggerHighlightAndValidate(conn.to, conn.from, pageNoInput);
        }
    }, [connections, activeConnection, setConnections, setActiveConnection, saveConnectionsToBackend, triggerHighlightAndValidate, pageNoInput]);

    const handleVerifyAll = useCallback(async () => {
        const unverified = connections.filter((c) => !c.verified && !c.wrong);
        if (unverified.length === 0) return;
        setIsVerifyingAll(true);
        setVerifyAllProgress({ done: 0, total: unverified.length });
        let updated = [...connections];
        for (let i = 0; i < unverified.length; i++) {
            const conn = unverified[i];
            setVerifyAllProgress({ done: i, total: unverified.length });
            setActiveConnection(conn);
            setHighlightData(null); setZoom(1); setPan({ x: 0, y: 0 });
            try {
                await triggerHighlightAndValidate(conn.from, conn.to, pageNoInput);
                updated = updated.map((c) => (c.from === conn.from && c.to === conn.to ? { ...c, verified: true, wrong: false } : c));
                setConnections(updated);
                await saveConnectionsToBackend(updated);
            } catch { /* skip */ }
            await new Promise((r) => setTimeout(r, 400));
        }
        setIsVerifyingAll(false);
        setVerifyAllProgress(null);
    }, [connections, pageNoInput, triggerHighlightAndValidate, saveConnectionsToBackend, setActiveConnection, setConnections, setHighlightData, setZoom, setPan]);

    const handleManualVerify = useCallback(() => {
        if (!selectedFromTag || !selectedToTag) return;
        setActiveConnection({ from: selectedFromTag, to: selectedToTag });
        resetView();
        triggerHighlightAndValidate(selectedFromTag, selectedToTag, pageNoInput);
    }, [selectedFromTag, selectedToTag, pageNoInput, triggerHighlightAndValidate, setActiveConnection]);

    // ── Editable table ───────────────────────────────────────────────────────
    const handleStartEditing = () => { setEditableConnections(JSON.parse(JSON.stringify(connections))); setIsEditingList(true); };
    const handleCancelEditing = () => { setIsEditingList(false); setEditableConnections([]); };
    const handleEditCell = (index, field, value) => setEditableConnections((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
    const handleDeleteConnection = (index) => setEditableConnections((prev) => prev.filter((_, i) => i !== index));
    const handleAddConnection = () => setEditableConnections((prev) => [...prev, { from: '', to: '', verified: false, wrong: false }]);

    const handleSaveEditing = useCallback(async () => {
        if (!plantCode) return;
        setIsSavingList(true);
        setErrorMessage(null);
        const cleaned = editableConnections.filter((c) => (c.from && c.from.trim()) || (c.to && c.to.trim()));
        try {
            await pnidService.saveHighlightOptions(plantCode, cleaned.map((c) => ({
                from: c.from?.trim() || '',
                to: c.to?.trim() || '',
                verified: c.verified ?? false,
                wrong: c.wrong ?? false,
                page: c.page ?? '',
            })), pdfName);

            const deduplicated = deDuplicate(cleaned.map((c) => ({
                ...c,
                from: c.from?.trim() || '',
                to: c.to?.trim() || '',
                verified: c.verified ?? false,
                wrong: c.wrong ?? false,
            })));

            setConnections(deduplicated);
            setIsEditingList(false);
            setEditableConnections([]);
            toast.success('Saved', 'Connection list updated successfully.');
        } catch (err) {
            const msg = extractErrorDetail(err?.data?.detail) ?? err?.message ?? 'Failed to save updated connections.';
            setErrorMessage(msg);
            toast.error('Save Failed', msg);
        } finally {
            setIsSavingList(false);
        }
    }, [plantCode, pdfName, editableConnections, setConnections, setErrorMessage]);

    const handleDownloadExcel = useCallback(async () => {
        if (!plantCode) return;
        const link = document.createElement('a');
        link.href = pnidService.exportExcelUrl(plantCode);
        link.setAttribute('download', `${plantCode}_final_pnid_data.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    }, [plantCode]);

    const handleClearFilter = useCallback(() => revalidateConnection(null), [revalidateConnection]);

    return {
        selectedFromTag, setSelectedFromTag, selectedToTag, setSelectedToTag, pageNoInput, setPageNoInput,
        isEditingList, isSavingList, editableConnections, setEditableConnections, isVerifyingAll, verifyAllProgress,
        triggerHighlightAndValidate, revalidateConnection, handleSelectConnection, handlePageChange,
        saveConnectionsToBackend, markActiveConnectionAsVerified, markActiveConnectionAsWrong, handleSwapConnection,
        handleVerifyAll, handleManualVerify,
        handleStartEditing, handleCancelEditing, handleEditCell, handleDeleteConnection, handleAddConnection, handleSaveEditing,
        handleDownloadExcel, handleClearFilter,
    };
}
