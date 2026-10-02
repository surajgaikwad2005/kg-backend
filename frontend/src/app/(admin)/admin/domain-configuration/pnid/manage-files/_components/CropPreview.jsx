'use client';

/**
 * CropPreview — draws a page preview image on a canvas and lets the user drag a
 * crop box. Emits the box in unscaled (1x) image coordinates via onCropChange.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

const CANVAS_W = 1100;
const CANVAS_H = 660;
const SCALE_TO_1X = 1 / 3; // preview images are rendered at 3x

export default function CropPreview({ imageSrc, onCropChange }) {
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [cropBox, setCropBox] = useState(null);
    const [hasError, setHasError] = useState(false);

    const cropBoxRef = useRef(null);
    const imageRef = useRef(null);
    const scrollRef = useRef(null);
    const lastMouseRef = useRef(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        cropBoxRef.current = cropBox;
    }, [cropBox]);

    useEffect(() => {
        imageRef.current = image;
    }, [image]);

    useEffect(() => {
        setImage(null);
        setCropBox(null);
        setHasError(false);
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => setImage(img);
        img.onerror = () => setHasError(true);
    }, [imageSrc]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !image) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        if (cropBox) {
            const { x1, y1, x2, y2 } = cropBox;
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
    }, [image, cropBox]);

    const stopAutoScroll = useCallback(() => {
        if (scrollRef.current) {
            clearInterval(scrollRef.current);
            scrollRef.current = null;
        }
    }, []);

    const updateCropBox = useCallback(() => {
        if (!lastMouseRef.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        // Canvas is CSS-scaled to fit its container (see className below), so mouse
        // coordinates (in CSS pixel space) must be rescaled into the fixed
        // CANVAS_W x CANVAS_H drawing-buffer space before clamping.
        const scaleX = CANVAS_W / rect.width;
        const scaleY = CANVAS_H / rect.height;
        const x = Math.max(0, Math.min(CANVAS_W, (lastMouseRef.current.clientX - rect.left) * scaleX));
        const y = Math.max(0, Math.min(CANVAS_H, (lastMouseRef.current.clientY - rect.top) * scaleY));
        setCropBox(prev => prev ? { ...prev, x2: x, y2: y } : null);
    }, []);

    const handleAutoScroll = useCallback((clientX, clientY) => {
        const margin = 60;
        const scrollContainer = canvasRef.current?.closest('.overflow-y-auto');
        if (!scrollContainer) return;

        const rect = scrollContainer.getBoundingClientRect();
        let scrollDir = 0;

        if (clientY > rect.bottom - margin) {
            scrollDir = 1;
        } else if (clientY < rect.top + margin) {
            scrollDir = -1;
        }

        if (scrollDir !== 0) {
            if (!scrollRef.current) {
                scrollRef.current = setInterval(() => {
                    scrollContainer.scrollBy(0, scrollDir * 25);
                    updateCropBox();
                }, 30);
            }
        } else {
            stopAutoScroll();
        }
    }, [stopAutoScroll, updateCropBox]);

    const handleGlobalMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        lastMouseRef.current = { clientX: e.clientX, clientY: e.clientY };
        updateCropBox();
        handleAutoScroll(e.clientX, e.clientY);
    }, [updateCropBox, handleAutoScroll]);

    const handleGlobalMouseUp = useCallback((e) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        stopAutoScroll();

        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);

        const currentCropBox = cropBoxRef.current;
        const currentImage = imageRef.current;

        if (!currentCropBox || !currentImage) return;

        const x1 = Math.min(currentCropBox.x1, currentCropBox.x2);
        const x2 = Math.max(currentCropBox.x1, currentCropBox.x2);
        const y1 = Math.min(currentCropBox.y1, currentCropBox.y2);
        const y2 = Math.max(currentCropBox.y1, currentCropBox.y2);

        if (x2 - x1 > 5 && y2 - y1 > 5) {
            const canvas = canvasRef.current;
            const sx = (currentImage.width / canvas.width) * SCALE_TO_1X;
            const sy = (currentImage.height / canvas.height) * SCALE_TO_1X;
            onCropChange({ x1: x1 * sx, y1: y1 * sy, x2: x2 * sx, y2: y2 * sy });
        } else {
            setCropBox(null);
            onCropChange(null);
        }
    }, [stopAutoScroll, handleGlobalMouseMove, onCropChange]);

    useEffect(() => {
        return () => {
            stopAutoScroll();
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [stopAutoScroll, handleGlobalMouseMove, handleGlobalMouseUp]);

    const onMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_W / rect.width;
        const scaleY = CANVAS_H / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const newBox = { x1: x, y1: y, x2: x, y2: y };
        setCropBox(newBox);
        cropBoxRef.current = newBox;
        isDraggingRef.current = true;
        lastMouseRef.current = { clientX: e.clientX, clientY: e.clientY };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
    };

    return (
        <div className="border border-border rounded-2xl overflow-hidden relative bg-surface-2 flex items-center justify-center w-full aspect-5/3">
            {hasError ? (
                <div className="flex flex-col items-center gap-2 text-danger">
                    <AlertCircle className="w-6 h-6" />
                    <p className="text-label font-black uppercase tracking-widest">Failed to load preview image</p>
                </div>
            ) : image ? (
                <canvas
                    ref={canvasRef}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    onMouseDown={onMouseDown}
                    className="cursor-crosshair border border-border w-full h-full"
                />
            ) : (
                <div className="flex flex-col items-center gap-2 text-text-subtle">
                    <Loader2 className="w-6 h-6 animate-spin text-brand" />
                    <p className="text-label font-black uppercase tracking-widest">Generating page preview…</p>
                </div>
            )}
        </div>
    );
}
