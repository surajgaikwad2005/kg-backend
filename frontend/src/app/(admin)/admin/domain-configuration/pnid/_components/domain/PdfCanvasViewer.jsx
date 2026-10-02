'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    ZoomIn, ZoomOut, RotateCw, RotateCcw, Download, Printer,
    ChevronLeft, ChevronRight, Maximize2, Minimize2, Frame, MoveHorizontal, Eye
} from 'lucide-react';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';

export default function PdfCanvasViewer({
    pdfDoc,
    pageNumber,
    pdfPageCount,
    onPageChange,
    previewFile,
    plantCode,
    blobUrl,
}) {
    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const renderTaskRef = useRef(null);

    const [scale, setScale] = useState(1.2);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(true);
    const [renderError, setRenderError] = useState(null);
    const [pageInput, setPageInput] = useState(String(pageNumber));
    const [useNativeViewer, setUseNativeViewer] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setPageInput(String(pageNumber));
    }, [pageNumber]);

    const renderPage = useCallback(async () => {
        if (!pdfDoc || pageNumber < 1 || pageNumber > pdfPageCount || useNativeViewer) return;
        setLoading(true);
        setRenderError(null);

        try {
            const page = await pdfDoc.getPage(pageNumber);
            const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

            const viewport = page.getViewport({ scale: scale * dpr, rotation });
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            canvas.style.width = `${viewport.width / dpr}px`;
            canvas.style.height = `${viewport.height / dpr}px`;

            renderTaskRef.current?.cancel();
            const renderContext = {
                canvasContext: ctx,
                viewport,
            };

            const task = page.render(renderContext);
            renderTaskRef.current = task;

            await task.promise;
            setLoading(false);
        } catch (err) {
            if (err?.name !== 'RenderingCancelledException') {
                console.error('[PdfCanvasViewer] Render error:', err);
                setRenderError(err?.message || 'Failed to render PDF page');
                setLoading(false);
            }
        }
    }, [pdfDoc, pageNumber, pdfPageCount, scale, rotation, useNativeViewer]);

    useEffect(() => {
        renderPage();
        return () => {
            renderTaskRef.current?.cancel();
        };
    }, [renderPage]);

    const handleZoomIn = () => setScale((s) => Math.min(3.0, s + 0.25));
    const handleZoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
    const handleResetZoom = () => setScale(1.2);
    const handleRotateCw = () => setRotation((r) => (r + 90) % 360);
    const handleRotateCcw = () => setRotation((r) => (r - 90 + 360) % 360);

    const handleFitWidth = async () => {
        if (!pdfDoc || !stageRef.current) return;
        try {
            const page = await pdfDoc.getPage(pageNumber);
            const unscaled = page.getViewport({ scale: 1.0, rotation });
            const containerWidth = stageRef.current.clientWidth - 48;
            if (containerWidth > 0 && unscaled.width > 0) {
                setScale(containerWidth / unscaled.width);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFitPage = async () => {
        if (!pdfDoc || !stageRef.current) return;
        try {
            const page = await pdfDoc.getPage(pageNumber);
            const unscaled = page.getViewport({ scale: 1.0, rotation });
            const containerWidth = stageRef.current.clientWidth - 48;
            const containerHeight = stageRef.current.clientHeight - 48;
            if (containerWidth > 0 && containerHeight > 0 && unscaled.width > 0 && unscaled.height > 0) {
                const scaleW = containerWidth / unscaled.width;
                const scaleH = containerHeight / unscaled.height;
                setScale(Math.min(scaleW, scaleH));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePageInputSubmit = (e) => {
        if (e.key === 'Enter') {
            const num = parseInt(pageInput, 10);
            if (!isNaN(num) && num >= 1 && num <= pdfPageCount) {
                onPageChange?.(num - 1);
            } else {
                setPageInput(String(pageNumber));
            }
        }
    };

    const handlePrint = () => {
        const url = blobUrl || pnidService.fileUrl(plantCode, previewFile?.path);
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
            win.print?.();
        }
    };

    const toggleFullscreen = () => {
        if (!stageRef.current) return;
        if (!document.fullscreenElement) {
            stageRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    return (
        <div ref={stageRef} className="flex-1 min-w-0 min-h-0 flex flex-col bg-canvas overflow-hidden">
            {/* Custom Theme-Aligned Toolbar with Full Feature Set */}
            <div className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0 select-none z-10 shadow-xs flex-wrap gap-2">
                {/* Page Navigation & Direct Page Jump Input */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange?.(pageNumber - 2)}
                        disabled={pageNumber <= 1}
                        className="p-1.5 rounded-(--do-radius-sm) text-text-secondary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Previous Page"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1 text-xs font-bold text-text-primary px-2 py-0.5 rounded-(--do-radius-sm) bg-surface-2 border border-border">
                        <span>Page</span>
                        <input
                            type="text"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={handlePageInputSubmit}
                            className="w-8 text-center bg-surface border border-border rounded-(--do-radius-sm) text-xs font-black text-brand focus:outline-none focus:ring-1 focus:ring-brand"
                            title="Type page number and press Enter"
                        />
                        <span>of {pdfPageCount}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onPageChange?.(pageNumber)}
                        disabled={pageNumber >= pdfPageCount}
                        className="p-1.5 rounded-(--do-radius-sm) text-text-secondary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Next Page"
                        aria-label="Next Page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Zoom, Fit & View Controls */}
                <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-(--do-radius-sm) border border-border">
                    <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={scale <= 0.5}
                        className="p-1.5 rounded-(--do-radius-sm) text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 cursor-pointer transition-colors"
                        title="Zoom Out (-)"
                        aria-label="Zoom Out"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={handleResetZoom}
                        className="text-xs font-black text-brand px-2 py-0.5 rounded-(--do-radius-sm) hover:bg-surface cursor-pointer transition-colors"
                        title="100% Zoom"
                    >
                        {Math.round(scale * 100)}%
                    </button>
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={scale >= 3.0}
                        className="p-1.5 rounded-(--do-radius-sm) text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 cursor-pointer transition-colors"
                        title="Zoom In (+)"
                        aria-label="Zoom In"
                    >
                        <ZoomIn size={14} />
                    </button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <button
                        type="button"
                        onClick={handleFitWidth}
                        className="px-2 py-1 text-2xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface rounded-(--do-radius-sm) cursor-pointer transition-colors flex items-center gap-1"
                        title="Fit to Container Width"
                    >
                        <MoveHorizontal size={12} /> Fit Width
                    </button>
                    <button
                        type="button"
                        onClick={handleFitPage}
                        className="px-2 py-1 text-2xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface rounded-(--do-radius-sm) cursor-pointer transition-colors flex items-center gap-1"
                        title="Fit Entire Page"
                    >
                        <Frame size={12} /> Fit Page
                    </button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <button
                        type="button"
                        onClick={handleRotateCcw}
                        className="p-1.5 rounded-(--do-radius-sm) text-text-secondary hover:text-text-primary hover:bg-surface cursor-pointer transition-colors"
                        title="Rotate Counter-Clockwise"
                        aria-label="Rotate Counter-Clockwise"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={handleRotateCw}
                        className="p-1.5 rounded-(--do-radius-sm) text-text-secondary hover:text-text-primary hover:bg-surface cursor-pointer transition-colors"
                        title="Rotate Clockwise"
                        aria-label="Rotate Clockwise"
                    >
                        <RotateCw size={14} />
                    </button>
                </div>

                {/* Right Actions: Native View Toggle, Print, Fullscreen, Download */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setUseNativeViewer((v) => !v)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-(--do-radius-sm) text-xs font-bold border transition-all cursor-pointer ${
                            useNativeViewer
                                ? 'bg-brand text-white border-brand shadow-xs'
                                : 'bg-surface-2 text-text-secondary border-border hover:bg-surface hover:text-text-primary'
                        }`}
                        title={useNativeViewer ? "Switch to Theme Canvas View" : "Switch to Native Chrome Viewer"}
                    >
                        <Eye size={13} />
                        <span>{useNativeViewer ? "Theme View" : "Native Chrome View"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="p-1.5 rounded-(--do-radius-sm) bg-surface-2 hover:bg-surface text-text-secondary hover:text-text-primary border border-border text-xs font-bold transition-all cursor-pointer shadow-xs"
                        title="Print PDF"
                        aria-label="Print PDF"
                    >
                        <Printer size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-(--do-radius-sm) bg-surface-2 hover:bg-surface text-text-secondary hover:text-text-primary border border-border text-xs font-bold transition-all cursor-pointer shadow-xs"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                        aria-label="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>

                    <a
                        href={blobUrl || pnidService.fileUrl(plantCode, previewFile?.path)}
                        download={previewFile?.name}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 rounded-(--do-radius-sm) bg-brand text-white hover:bg-brand-hover text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                        <Download size={13} />
                        <span>Download</span>
                    </a>
                </div>
            </div>

            {/* Stage Body */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-canvas relative min-h-0">
                {useNativeViewer ? (
                    <iframe
                        key={`native-${previewFile?.path}-${pageNumber}`}
                        src={`${blobUrl || `${pnidService.fileUrl(plantCode, previewFile?.path)}`}#page=${pageNumber}&zoom=150`}
                        className="w-full h-full border-0 bg-surface rounded-(--do-radius)"
                        title={previewFile?.name}
                    />
                ) : (
                    <>
                        {loading && (
                            <div className="absolute inset-0 bg-surface/60 backdrop-blur-xs z-20 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3 p-4 rounded-(--do-radius) bg-surface border border-border shadow-xl">
                                    <div className="w-6 h-6 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
                                    <span className="text-xs font-bold text-text-secondary">Rendering Page {pageNumber}…</span>
                                </div>
                            </div>
                        )}

                        {renderError ? (
                            <div className="p-8 rounded-(--do-radius) bg-surface border border-border text-center max-w-md shadow-lg">
                                <p className="text-sm font-bold text-danger mb-2">PDF Render Fallback</p>
                                <p className="text-xs text-text-subtle mb-4">{renderError}</p>
                                <iframe
                                    src={`${blobUrl || `${pnidService.fileUrl(plantCode, previewFile?.path)}`}#page=${pageNumber}`}
                                    className="w-full h-96 border border-border rounded-(--do-radius)"
                                    title={previewFile?.name}
                                />
                            </div>
                        ) : (
                            <div className="relative border border-border rounded-(--do-radius) bg-surface shadow-2xl overflow-hidden transition-all duration-200">
                                <canvas ref={canvasRef} className="block mx-auto max-w-full" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
