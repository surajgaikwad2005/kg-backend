'use client';

/**
 * useFilePreview — drives the FilePreviewModal: spreadsheet parsing (lazy xlsx),
 * PDF loading (arraybuffer + pdf.js doc + page count), and per-page deletion.
 *
 * blobUrl: an object URL created from the fetched bytes so the modal's <iframe>
 * and <img> never hit the backend URL directly (which has no auth headers and
 * would 401). All revocation is handled here; callers just read blobUrl.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { useToast } from '@/src/components/ui/Toast';
import { usePdfjs, countPdfPages } from '@/src/app/(admin)/admin/domain-configuration/pnid/_hooks/usePdfjs';

const isSpreadsheet = (name) => /\.(csv|xlsx|xls)$/i.test(name);
const isPdf = (name) => /\.pdf$/i.test(name);
const isImage = (name) => /\.(png|jpe?g|gif|svg)$/i.test(name);

const IMAGE_MIMES = { svg: 'image/svg+xml', gif: 'image/gif', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

export function useFilePreview({ plantCode, onPageCountUpdate } = {}) {
    const { error: errorToast, success: successToast } = useToast();
    const isPdfjsLoaded = usePdfjs();

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const fileQueryParam = searchParams.get('file');

    const [previewFile, setPreviewFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [pdfPageCount, setPdfPageCount] = useState(1);
    const [pdfVersion, setPdfVersion] = useState(1);
    const [isDeletingPage, setIsDeletingPage] = useState(false);
    const [pdfData, setPdfData] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [blobUrl, setBlobUrl] = useState(null);
    const [selectedPages, setSelectedPages] = useState([]);

    // Track the active blob URL so we can revoke it when replaced or unmounted.
    const blobUrlRef = useRef(null);

    const updateBlobUrl = useCallback((url) => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = url;
        setBlobUrl(url);
    }, []);

    // Revoke on unmount.
    useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

    // Parse the pdf.js document whenever bytes / readiness change.
    useEffect(() => {
        if (!isPdfjsLoaded || !pdfData) {
            setPdfDoc(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const task = window.pdfjsLib.getDocument({ data: new Uint8Array(pdfData) });
                const doc = await task.promise;
                if (cancelled) return;
                setPdfDoc(doc);
                setPdfPageCount(doc.numPages);
            } catch (err) {
                if (!cancelled) setPdfDoc(null);
            }
        })();
        return () => { cancelled = true; };
    }, [isPdfjsLoaded, pdfData]);

    const resetState = useCallback(() => {
        setPreviewFile(null);
        setPreviewData(null);
        setPdfData(null);
        setPdfDoc(null);
        setSelectedPages([]);
        updateBlobUrl(null);
    }, [updateBlobUrl]);

    const loadFile = useCallback(async (file) => {
        if (!plantCode || !file) return;
        setPreviewFile(file);
        setPreviewData(null);
        setSelectedPageIndex(0);
        setPdfPageCount(1);
        setPdfData(null);
        setPdfDoc(null);
        setSelectedPages([]);
        updateBlobUrl(null);

        if (isSpreadsheet(file.name)) {
            setIsPreviewLoading(true);
            try {
                const buffer = await pnidService.getFileArrayBuffer(plantCode, file.path);
                const XLSX = await import('xlsx').catch(() => null);
                if (!XLSX) {
                    errorToast('Preview Unavailable', 'Spreadsheet preview needs the xlsx package (see INTEGRATION.md).');
                    return;
                }
                const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                setPreviewData(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
            } catch (err) {
                errorToast('Preview Error', 'Could not parse spreadsheet data.');
            } finally {
                setIsPreviewLoading(false);
            }
        } else if (isPdf(file.name)) {
            setIsPreviewLoading(true);
            try {
                const buffer = await pnidService.getFileArrayBuffer(plantCode, file.path, { bust: true });
                const count = countPdfPages(buffer);
                setPdfPageCount(count);
                setPdfData(buffer);
                onPageCountUpdate?.(file.path, count);
                updateBlobUrl(URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' })));
            } catch (err) {
            } finally {
                setIsPreviewLoading(false);
            }
        } else if (isImage(file.name)) {
            setIsPreviewLoading(true);
            try {
                const buffer = await pnidService.getFileArrayBuffer(plantCode, file.path);
                const ext = file.name.split('.').pop().toLowerCase();
                updateBlobUrl(URL.createObjectURL(new Blob([buffer], { type: IMAGE_MIMES[ext] || 'image/*' })));
            } catch (err) {
                errorToast('Preview Error', 'Could not load image.');
            } finally {
                setIsPreviewLoading(false);
            }
        }
    }, [plantCode, errorToast, onPageCountUpdate, updateBlobUrl]);

    // Sync preview state with URL search param "?file=..."
    useEffect(() => {
        if (fileQueryParam && plantCode) {
            if (!previewFile || previewFile.path !== fileQueryParam) {
                const fileName = fileQueryParam.split('/').pop();
                loadFile({ name: fileName, path: fileQueryParam });
            }
        } else if (!fileQueryParam && previewFile) {
            resetState();
        }
    }, [fileQueryParam, plantCode, previewFile, loadFile, resetState]);

    const openFile = useCallback((file) => {
        if (!file?.path) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set('file', file.path);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    const closePreview = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('file');
        const nextQuery = params.toString();
        const targetUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.push(targetUrl, { scroll: false });
    }, [searchParams, pathname, router]);

    const togglePageSelection = useCallback((pageIndex) => {
        console.log('[useFilePreview] togglePageSelection called for pageIndex:', pageIndex, 'pdfPageCount:', pdfPageCount);
        setSelectedPages((prev) => {
            if (prev.includes(pageIndex)) {
                const next = prev.filter((p) => p !== pageIndex);
                console.log('[useFilePreview] Deselected page:', pageIndex, 'new selectedPages:', next);
                return next;
            }
            // Validation: Cannot select all pages
            if (prev.length + 1 >= pdfPageCount) {
                console.warn('[useFilePreview] Prevented selecting all pages. prev:', prev, 'pdfPageCount:', pdfPageCount);
                errorToast('Action Not Allowed', 'At least 1 page must remain in the document. You cannot select all pages.');
                return prev;
            }
            const next = [...prev, pageIndex];
            console.log('[useFilePreview] Selected page:', pageIndex, 'new selectedPages:', next);
            return next;
        });
    }, [pdfPageCount, errorToast]);

    const clearPageSelection = useCallback(() => {
        setSelectedPages([]);
    }, []);

    const deletePage = useCallback(async (pageIndex) => {
        if (!previewFile) return;
        if (pdfPageCount <= 1) {
            errorToast('Action Not Allowed', 'At least 1 page must remain in the document.');
            return;
        }
        setIsDeletingPage(true);
        try {
            await pnidService.deletePdfPage(plantCode, previewFile.path, pageIndex);
            successToast('Page Deleted', `Successfully deleted page ${pageIndex + 1}.`);
            setSelectedPages([]);
            setPdfVersion((v) => v + 1);

            const buffer = await pnidService.getFileArrayBuffer(plantCode, previewFile.path, { bust: true });
            const count = countPdfPages(buffer);
            setPdfPageCount(count);
            setPdfData(buffer);
            setSelectedPageIndex((prev) => (prev >= count ? Math.max(0, count - 1) : prev));
            onPageCountUpdate?.(previewFile.path, count);
            updateBlobUrl(URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' })));
        } catch (err) {
            errorToast('Delete Error', err?.data?.detail || 'Could not delete the selected page.');
        } finally {
            setIsDeletingPage(false);
        }
    }, [plantCode, previewFile, pdfPageCount, successToast, errorToast, onPageCountUpdate, updateBlobUrl]);

    const deleteSelectedPages = useCallback(async (targetPages) => {
        const pagesToDelete = Array.isArray(targetPages) && targetPages.length > 0 ? targetPages : selectedPages;
        console.log('[useFilePreview] deleteSelectedPages called. targetPages arg:', targetPages, 'selectedPages state:', selectedPages, 'resolved pagesToDelete:', pagesToDelete);
        if (!previewFile || !pagesToDelete || pagesToDelete.length === 0) {
            console.warn('[useFilePreview] deleteSelectedPages returning early: missing previewFile or empty pagesToDelete');
            return;
        }
        if (pagesToDelete.length >= pdfPageCount) {
            console.warn('[useFilePreview] deleteSelectedPages returning early: pagesToDelete.length >= pdfPageCount');
            errorToast('Action Not Allowed', 'At least 1 page must remain in the document. You cannot delete all pages.');
            return;
        }
        setIsDeletingPage(true);
        try {
            console.log('[useFilePreview] Invoking pnidService.deletePdfPages. plantCode:', plantCode, 'path:', previewFile.path, 'pagesToDelete:', pagesToDelete);
            await pnidService.deletePdfPages(plantCode, previewFile.path, pagesToDelete);
            console.log('[useFilePreview] deletePdfPages API call succeeded!');
            successToast('Pages Deleted', `Successfully deleted ${pagesToDelete.length} ${pagesToDelete.length === 1 ? 'page' : 'pages'}.`);
            setSelectedPages([]);
            setPdfVersion((v) => v + 1);

            const buffer = await pnidService.getFileArrayBuffer(plantCode, previewFile.path, { bust: true });
            const count = countPdfPages(buffer);
            setPdfPageCount(count);
            setPdfData(buffer);
            setSelectedPageIndex((prev) => (prev >= count ? Math.max(0, count - 1) : prev));
            onPageCountUpdate?.(previewFile.path, count);
            updateBlobUrl(URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' })));
        } catch (err) {
            console.error('[useFilePreview] deletePdfPages API call failed:', err);
            errorToast('Delete Error', err?.data?.detail || 'Could not delete the selected pages.');
        } finally {
            setIsDeletingPage(false);
        }
    }, [plantCode, previewFile, pdfPageCount, selectedPages, successToast, errorToast, onPageCountUpdate, updateBlobUrl]);

    return {
        previewFile, previewData, isPreviewLoading,
        selectedPageIndex, setSelectedPageIndex,
        pdfPageCount, pdfVersion, pdfDoc, isDeletingPage,
        selectedPages, togglePageSelection, clearPageSelection,
        blobUrl,
        openFile, closePreview, deletePage, deleteSelectedPages,
    };
}
