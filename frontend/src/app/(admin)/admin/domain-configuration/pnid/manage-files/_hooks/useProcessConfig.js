'use client';

/**
 * useProcessConfig — drives the Process Configuration modal: open/close, mode +
 * model selection, crop box, and lazily fetching the first selected PDF's page
 * preview image (for defining the usable area).
 */
import { useState, useCallback } from 'react';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';

export function useProcessConfig() {
    const [open, setOpen] = useState(false);
    const [processMode, setProcessMode] = useState(null);
    const [selectedLlm, setSelectedLlm] = useState('vllm');
    const [previewImageSrc, setPreviewImageSrc] = useState(null);
    const [cropBoxCoordinates, setCropBoxCoordinates] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [previewParams, setPreviewParams] = useState(null);

    const fetchPreview = useCallback(async ({ plantCode, pnidFiles = [], pfdFiles = [] }) => {
        const firstPdf = pnidFiles[0] || pfdFiles[0];
        if (!firstPdf) {
            setPreviewImageSrc(null);
            setPreviewError(null);
            return;
        }

        const docType = pnidFiles[0] ? 'pnid' : 'pfd';
        setPreviewParams({ plantCode, pnidFiles, pfdFiles, filename: firstPdf.name, docType });
        setIsPreviewLoading(true);
        setPreviewError(null);
        setPreviewImageSrc(null);

        try {
            // images/images_folder are nested under .results per the doc's
            // response sample: { workspaceName, results: { images, images_folder } }.
            const data = await pnidService.convertPdfPreview(plantCode, {
                docType,
                filename: firstPdf.name,
            });
            const results = data?.results;
            if (results?.images?.length > 0 && results?.images_folder) {
                setPreviewImageSrc(pnidService.fileUrl(plantCode, `${results.images_folder}/${results.images[0]}`));
                setPreviewError(null);
            } else {
                setPreviewImageSrc(null);
                setPreviewError('No preview images could be extracted from this document.');
            }
        } catch (err) {
            console.error('Failed to convert PDF preview:', err);
            const errMsg = err?.message || err?.data?.message || 'Failed to generate page preview';
            setPreviewError(errMsg);
            setPreviewImageSrc(null);
        } finally {
            setIsPreviewLoading(false);
        }
    }, []);

    const retryPreview = useCallback(() => {
        if (previewParams) {
            fetchPreview(previewParams);
        }
    }, [fetchPreview, previewParams]);

    /** Open the modal and fetch a page preview for the first selected PDF. */
    const openModal = useCallback(({ plantCode, pnidFiles = [], pfdFiles = [] }) => {
        setOpen(true);
        setProcessMode(null);
        setSelectedLlm('');
        setPreviewImageSrc(null);
        setCropBoxCoordinates(null);
        setPreviewError(null);
        fetchPreview({ plantCode, pnidFiles, pfdFiles });
    }, [fetchPreview]);

    const closeModal = useCallback(() => setOpen(false), []);

    return {
        open, processMode, setProcessMode, selectedLlm, setSelectedLlm,
        previewImageSrc, cropBoxCoordinates, setCropBoxCoordinates, isPreviewLoading,
        previewError, previewTargetFileName: previewParams?.filename || null, retryPreview,
        openModal, closeModal,
    };
}
