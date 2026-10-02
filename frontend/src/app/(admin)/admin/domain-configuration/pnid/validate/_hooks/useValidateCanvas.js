'use client';

/**
 * useValidateCanvas — owns the diagram viewport: image loading, zoom/pan,
 * region-filter drawing, and the RAF render loop. Highlight data is read-only
 * here (supplied by the connections layer); committing a filter box notifies the
 * parent via onFilterCommit so the active connection can be re-validated.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { drawHighlights } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_lib/drawHighlights';
import { extractErrorDetail } from '@/src/services/apiClient';

export function useValidateCanvas({
    plantCode, selectedPageFile, highlightData, filterBox, setFilterBox,
    setIsHighlightLoading, setErrorMessage, onFilterCommit,
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const [imageObj, setImageObj] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isFilterMode, setIsFilterMode] = useState(false);
    const [isDrawingFilter, setIsDrawingFilter] = useState(false);

    // Load the selected page image.
    useEffect(() => {
        if (!selectedPageFile?.name) { setImageObj(null); return; }
        let cancelled = false;
        let blobUrl = null;

        const loadImg = async () => {
            setIsHighlightLoading(true);
            setErrorMessage(null);
            try {
                const buffer = await pnidService.getClientImageArrayBuffer(plantCode, {
                    pageName: selectedPageFile.name,
                    path: selectedPageFile.path,
                    pdfName: selectedPageFile.pdfName || selectedPageFile.pdf,
                    docType: 'pnid'
                });
                if (cancelled) return;
                const ext = (selectedPageFile.name || selectedPageFile.path).split('.').pop().toLowerCase();
                const mimes = { svg: 'image/svg+xml', gif: 'image/gif', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
                blobUrl = URL.createObjectURL(new Blob([buffer], { type: mimes[ext] || 'image/*' }));
                
                const img = new Image();
                img.onload = () => { if (!cancelled) { setImageObj(img); setIsHighlightLoading(false); } };
                img.onerror = () => { if (!cancelled) { setErrorMessage('Failed to load selected page image.'); setIsHighlightLoading(false); } };
                img.src = blobUrl;
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage(extractErrorDetail(err?.data?.detail) ?? err?.message ?? 'Failed to load selected page image.');
                    setIsHighlightLoading(false);
                }
            }
        };

        loadImg();

        return () => {
            cancelled = true;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [plantCode, selectedPageFile, setIsHighlightLoading, setErrorMessage]);

    // Render loop.
    useEffect(() => {
        if (!imageObj) return;
        let animId;
        const loop = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && container && ctx) {
                drawHighlights(ctx, { canvas, container, imageObj, highlightData, filterBox, zoom, pan });
            }
            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [imageObj, highlightData, filterBox, zoom, pan]);

    // Zoom / pan controls.
    const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.2, 10)), []);
    const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.2, 0.5)), []);
    const handleResetZoom = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);
    const handleWheel = useCallback((e) => {
        if (!imageObj) return;
        e.preventDefault();
        setZoom((z) => (e.deltaY < 0 ? Math.min(z * 1.1, 10) : Math.max(z / 1.1, 0.5)));
    }, [imageObj]);

    const pointer = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom };
    };

    const handleMouseDown = useCallback((e) => {
        if (!imageObj || !canvasRef.current) return;
        if (isFilterMode) {
            const p = pointer(e);
            setIsDrawingFilter(true);
            setFilterBox({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
        } else {
            setIsDragging(true);
            dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        }
    }, [imageObj, isFilterMode, pan, zoom, setFilterBox]);

    const handleMouseMove = useCallback((e) => {
        if (!canvasRef.current) return;
        if (isDrawingFilter && filterBox) {
            const p = pointer(e);
            setFilterBox({ ...filterBox, x2: p.x, y2: p.y });
        } else if (isDragging) {
            setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
        }
    }, [isDrawingFilter, filterBox, isDragging, pan, zoom, setFilterBox]);

    const handleMouseUpOrLeave = useCallback(() => {
        if (isDrawingFilter && filterBox) {
            setIsDrawingFilter(false);
            const x1 = Math.min(filterBox.x1, filterBox.x2), x2 = Math.max(filterBox.x1, filterBox.x2);
            const y1 = Math.min(filterBox.y1, filterBox.y2), y2 = Math.max(filterBox.y1, filterBox.y2);
            const valid = Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5;
            const next = valid ? { x1, y1, x2, y2 } : null;
            setFilterBox(next);
            onFilterCommit?.(next);
            setIsFilterMode(false);
        }
        setIsDragging(false);
    }, [isDrawingFilter, filterBox, setFilterBox, onFilterCommit]);

    return {
        canvasRef, containerRef, imageObj, zoom, setZoom, pan, setPan, isDragging, dragStartRef,
        isFilterMode, setIsFilterMode, isDrawingFilter,
        handleZoomIn, handleZoomOut, handleResetZoom, handleWheel,
        handleMouseDown, handleMouseMove, handleMouseUpOrLeave,
    };
}
