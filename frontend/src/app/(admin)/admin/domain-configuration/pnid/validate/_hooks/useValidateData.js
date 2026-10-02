'use client';

/**
 * useValidateData — loads the active plant's P&ID file/page options and the
 * highlight-options source (connection list, line-list, or flat OCR tags).
 * Owns the connection list + search, and the shared errorMessage.
 *
 * File/page data is sourced from two confirmed-live endpoints (2026-07-28):
 *   - checkExtractionFiles -> per-file { file_name, ocr_excel, status } drives
 *     the "P&ID Source Document" dropdown and the ocr_excel_filename field
 *     required by highlightComponents/validateConnection.
 *   - getImagesList(doc_type='pnid') -> per-file { pdf, folder_name, images[] }
 *     drives the "Active P&ID Page/Sheet" dropdown and the image path used to
 *     load the canvas drawing.
 * Both replace an earlier guess at GET /clients/files's response shape, which
 * was never confirmed against a live response and left dropdowns/connections
 * silently empty (fetchHighlightOptions never ran because pdfName never
 * resolved, and errors were swallowed instead of surfaced).
 *
 * Reactive to useApp().plantCode changing (the global Plant Selector can
 * change without a page navigation, unlike the old per-workspace URL model).
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { deDuplicate } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_lib/utils';
import { extractErrorDetail } from '@/src/services/apiClient';
import { useApp } from '@/src/context/AppContext';

const basename = (p) => (p || '').split('/').pop().split('\\').pop();

export function useValidateData({ setSelectedPageFile }) {
    const { plantCode } = useApp();
    const [pnidUploads, setPnidUploads] = useState([]); // [{ name, ocrExcel, status }] — from checkExtractionFiles
    const [imagesByPdf, setImagesByPdf] = useState([]); // [{ pdf, doc_type, folder_name, images }] — from getImagesList
    const [pdfName, setPdfName] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [highlightSource, setHighlightSource] = useState('');
    const [connections, setConnections] = useState([]);
    const [fallbackTags, setFallbackTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    // Flattened page/image list for the currently-selected source PDF.
    const preprocessedFiles = useMemo(() => {
        const entry = imagesByPdf.find((e) => e.pdf === pdfName);
        if (!entry) return [];
        return (entry.images || []).map((img) => ({
            name: img,
            path: `${entry.folder_name}/${img}`,
            is_image: true,
        }));
    }, [imagesByPdf, pdfName]);

    // ocr_excel_filename required by highlightComponents/validateConnection —
    // backend sample sends the bare filename (e.g. "ocr_result.xlsx"), while
    // checkExtractionFiles' ocr_excel field is a full backend-relative path.
    const ocrExcelFilename = useMemo(() => {
        const file = pnidUploads.find((f) => f.name === pdfName);
        return file?.ocrExcel ? basename(file.ocrExcel) : undefined;
    }, [pnidUploads, pdfName]);

    const fetchFileOptions = useCallback(async (plant) => {
        try {
            const [extractionFiles, imagesList] = await Promise.all([
                pnidService.checkExtractionFiles(plant),
                pnidService.getImagesList(plant, 'pnid'),
            ]);
            const uploads = (extractionFiles || [])
                .filter(f => f.status === 'extracted' || f.status === 'ocr_done')
                .map((f) => ({
                    name: f.file_name, ocrExcel: f.ocr_excel, status: f.status,
                }));
            setPnidUploads(uploads);
            setImagesByPdf(imagesList || []);
            if (uploads[0]?.name) {
                setPdfName(uploads[0].name);
            } else {
                // Nothing extracted yet for this plant — no highlightOptions
                // fetch will fire, so stop the loading state here instead of
                // leaving the connection sidebar spinning forever.
                setIsLoading(false);
            }
        } catch (err) {
            setErrorMessage(extractErrorDetail(err?.data?.detail) ?? 'Failed to load P&ID files for this plant.');
            setIsLoading(false);
        }
    }, []);

    const fetchHighlightOptions = useCallback(async (plant, pdf) => {
        setIsLoading(true);
        try {
            const data = await pnidService.getHighlightOptions(plant, pdf);
            setHighlightSource(data.source);
            if (data.connections) {
                setConnections(deDuplicate(data.connections.map((c) => ({
                    from: c.from, to: c.to, verified: c.verified ?? false, wrong: c.wrong ?? false,
                }))));
            } else if (data.tags) {
                setFallbackTags(data.tags);
            }
        } catch (err) {
            setErrorMessage(extractErrorDetail(err?.data?.detail) ?? 'Failed to load connections list.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!plantCode) {
            setIsLoading(false);
            return;
        }
        fetchFileOptions(plantCode);
    }, [plantCode, fetchFileOptions]);

    // Highlight options need pdf_name, only known once fetchFileOptions resolves it.
    useEffect(() => {
        if (plantCode && pdfName) fetchHighlightOptions(plantCode, pdfName);
    }, [plantCode, pdfName, fetchHighlightOptions]);

    // Default the page/image selector to the active pdf's first image —
    // only re-fires when the pdf selection (or its image list) actually
    // changes, so it never clobbers a manual in-file page pick.
    useEffect(() => {
        if (preprocessedFiles[0]) setSelectedPageFile(preprocessedFiles[0]);
    }, [preprocessedFiles, setSelectedPageFile]);

    const filteredConnections = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return connections.filter((c) => c.from.toLowerCase().includes(q) || c.to.toLowerCase().includes(q));
    }, [connections, searchQuery]);

    // Same search box drives both lists — only one of filteredConnections /
    // filteredFallbackTags is ever rendered at a time, depending on highlightSource.
    const filteredFallbackTags = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return fallbackTags.filter((tag) => tag.toLowerCase().includes(q));
    }, [fallbackTags, searchQuery]);

    return {
        plantCode, pdfName, setPdfName, pnidUploads, preprocessedFiles, ocrExcelFilename, isLoading,
        highlightSource, connections, setConnections, fallbackTags, filteredFallbackTags,
        searchQuery, setSearchQuery, filteredConnections,
        errorMessage, setErrorMessage,
    };
}
