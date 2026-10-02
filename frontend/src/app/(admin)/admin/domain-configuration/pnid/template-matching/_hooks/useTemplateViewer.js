'use client';

/**
 * useTemplateViewer — the drawing canvas: image loading, zoom/pan, crop + manual
 * mark draw modes, the cropped-symbol thumbnail, and the match-focus animation.
 * Match rendering reads shared state; committing a crop/manual box notifies the
 * actions layer via the onCropCommit / onManualCommit callbacks.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { drawTemplateMatches } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_lib/drawTemplateMatches';

export function useTemplateViewer({
    plantCode, activeDrawing, libraryMatches, selectedTab, activeMatchHighlight,
    savedCropBox3x, setSavedCropBox3x, setErrorMessage, onCropCommit, onManualCommit,
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const [imageObj, setImageObj] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isCropMode, setIsCropMode] = useState(false);
    const [isDrawingCrop, setIsDrawingCrop] = useState(false);
    const [cropBox, setCropBox] = useState(null);
    const [isManualMatchMode, setIsManualMatchMode] = useState(false);
    const [isDrawingManual, setIsDrawingManual] = useState(false);
    const [manualMatchBox, setManualMatchBox] = useState(null);
    const [pulseFactor, setPulseFactor] = useState(0);

    // Load active drawing image.
    // IMPORTANT: depend only on the PATH string, not the whole activeDrawing object.
    // If we depend on activeDrawing (object reference), any parent re-render that
    // recreates the context value gives it a new reference and re-triggers this
    // effect even though the path hasn't changed — causing an infinite fetch loop.
    const activeDrawingPath = activeDrawing?.path ?? null;
    const activeDrawingName = activeDrawing?.name ?? null;
    useEffect(() => {
        if (!activeDrawingPath) { setImageObj(null); return; }
        let cancelled = false;
        let blobUrl = null;

        const loadImg = async () => {
            try {
                const buffer = await pnidService.getFileArrayBuffer(plantCode, activeDrawingPath);
                if (cancelled) return;
                const ext = (activeDrawingName || activeDrawingPath).split('.').pop().toLowerCase();
                const mimes = { svg: 'image/svg+xml', gif: 'image/gif', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
                blobUrl = URL.createObjectURL(new Blob([buffer], { type: mimes[ext] || 'image/*' }));

                const img = new Image();
                img.onload = () => { if (!cancelled) { setImageObj(img); setZoom(1); setPan({ x: 0, y: 0 }); setCropBox(null); } };
                img.onerror = () => { if (!cancelled) { setErrorMessage('Failed to load drawing page image.'); setImageObj(null); } };
                img.src = blobUrl;
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage('Failed to load drawing page image.');
                    setImageObj(null);
                }
            }
        };

        loadImg();

        return () => {
            cancelled = true;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [plantCode, activeDrawingPath, activeDrawingName, setErrorMessage]);

    // Pulse loop for match highlight.
    useEffect(() => {
        let id;
        const tick = () => { setPulseFactor(0.5 + 0.5 * Math.sin(Date.now() / 150)); id = requestAnimationFrame(tick); };
        id = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(id);
    }, []);

    // Render loop.
    useEffect(() => {
        if (!imageObj) return;
        let id;
        const loop = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && container && ctx) {
                drawTemplateMatches(ctx, {
                    canvas, container, imageObj, zoom, pan,
                    matches: libraryMatches[selectedTab] || [], activeDrawing, activeMatchHighlight, pulseFactor,
                    cropBox, manualMatchBox,
                });
            }
            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [imageObj, zoom, pan, libraryMatches, selectedTab, activeDrawing, activeMatchHighlight, pulseFactor, cropBox, manualMatchBox]);

    // Cropped symbol thumbnail.
    useEffect(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas || !imageObj || !savedCropBox3x) return;
        const ctx = canvas.getContext('2d');
        const [x1, y1, x2, y2] = savedCropBox3x;
        const cw = x2 - x1, ch = y2 - y1;
        canvas.width = 120;
        canvas.height = 120 * (ch / cw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageObj, x1, y1, cw, ch, 0, 0, canvas.width, canvas.height);
    }, [imageObj, savedCropBox3x]);

    const toContent = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        return { x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom };
    };

    const handleMouseDown = useCallback((e) => {
        if (!imageObj || !containerRef.current) return;
        const p = toContent(e);
        if (isCropMode) { setIsDrawingCrop(true); setCropBox({ x1: p.x, y1: p.y, x2: p.x, y2: p.y }); }
        else if (isManualMatchMode) { setIsDrawingManual(true); setManualMatchBox({ x1: p.x, y1: p.y, x2: p.x, y2: p.y }); }
        else { setIsDragging(true); dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }
    }, [imageObj, isCropMode, isManualMatchMode, pan, zoom]);

    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;
        const p = toContent(e);
        if (isDrawingCrop && cropBox) setCropBox({ ...cropBox, x2: p.x, y2: p.y });
        else if (isDrawingManual && manualMatchBox) setManualMatchBox({ ...manualMatchBox, x2: p.x, y2: p.y });
        else if (isDragging) setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
    }, [isDrawingCrop, cropBox, isDrawingManual, manualMatchBox, isDragging, pan, zoom]);

    const toImageBox = (box) => {
        const canvas = canvasRef.current;
        const x1 = Math.min(box.x1, box.x2), x2 = Math.max(box.x1, box.x2);
        const y1 = Math.min(box.y1, box.y2), y2 = Math.max(box.y1, box.y2);
        const sx = imageObj.naturalWidth / canvas.width;
        const sy = imageObj.naturalHeight / canvas.height;
        return { x1, y1, x2, y2, b3x: [x1 * sx, y1 * sy, x2 * sx, y2 * sy] };
    };

    const handleMouseUpOrLeave = useCallback(() => {
        if (isDrawingCrop && cropBox) {
            setIsDrawingCrop(false);
            setIsCropMode(false);
            const { x1, x2, y1, y2, b3x } = toImageBox(cropBox);
            if (x2 - x1 > 10 && y2 - y1 > 10 && imageObj && canvasRef.current) {
                setSavedCropBox3x(b3x);
                onCropCommit?.(b3x);
            } else { setCropBox(null); setSavedCropBox3x(null); }
        } else if (isDrawingManual && manualMatchBox) {
            setIsDrawingManual(false);
            const { x1, x2, y1, y2, b3x } = toImageBox(manualMatchBox);
            if (x2 - x1 > 5 && y2 - y1 > 5 && imageObj && canvasRef.current && activeDrawing) {
                onManualCommit?.(b3x, b3x.map((v) => v / 3));
            }
            setManualMatchBox(null);
        }
        setIsDragging(false);
    }, [isDrawingCrop, cropBox, isDrawingManual, manualMatchBox, imageObj, activeDrawing, setSavedCropBox3x, onCropCommit, onManualCommit]);

    const focusOnMatch = useCallback((match) => {
        setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas || !imageObj) return;
            const [mx1, my1, mx2, my2] = match.bbox_3x;
            const cx = ((mx1 + mx2) / 2) * (canvas.width / imageObj.naturalWidth);
            const cy = ((my1 + my2) / 2) * (canvas.height / imageObj.naturalHeight);
            const targetZoom = 2.5;
            setZoom(targetZoom);
            setPan({ x: canvas.width / 2 - cx * targetZoom, y: canvas.height / 2 - cy * targetZoom });
        }, 150);
    }, [imageObj]);

    const handleResetZoomPan = useCallback(() => {
        setZoom(1); setPan({ x: 0, y: 0 }); setCropBox(null); setManualMatchBox(null); setIsManualMatchMode(false);
    }, []);

    return {
        canvasRef, containerRef, previewCanvasRef, imageObj, zoom, setZoom, pan, setPan,
        isCropMode, setIsCropMode, isManualMatchMode, setIsManualMatchMode,
        handleMouseDown, handleMouseMove, handleMouseUpOrLeave, focusOnMatch, handleResetZoomPan,
        clearCropBox: () => setCropBox(null),
    };
}
