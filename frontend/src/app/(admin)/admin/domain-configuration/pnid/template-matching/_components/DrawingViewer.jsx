'use client';

/**
 * DrawingViewer — the large interactive drawing canvas with fit/zoom controls
 * and the manual-marking banner. Dark chrome in both themes for contrast.
 */
import React from 'react';
import { Maximize2, ZoomIn, ZoomOut, Loader2, Crop } from 'lucide-react';
import { useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';

export default function DrawingViewer() {
    const {
        handleResetZoomPan, activeDrawing, setZoom, imageObj, canvasRef, containerRef,
        isCropMode, isManualMatchMode, setIsManualMatchMode,
        handleMouseDown, handleMouseMove, handleMouseUpOrLeave,
    } = useTemplateMatchingContext();

    return (
        <div className="flex-1 min-w-0 min-h-0 flex flex-col relative bg-overlay">
            {/* Top-left controls */}
            <div className="absolute top-6 left-6 z-10 flex gap-2">
                <button onClick={handleResetZoomPan} className="px-4 py-2.5 bg-overlay/80 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-label uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5 cursor-pointer">
                    <Maximize2 size={12} /> Fit Screen
                </button>
                {activeDrawing && (
                    <div className="px-4 py-2.5 bg-overlay/80 backdrop-blur-md border border-white/10 text-white/60 rounded-xl font-bold text-label uppercase tracking-wider shadow-lg flex items-center gap-1.5 select-none">
                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        Viewing: {activeDrawing.pdf} (Page {activeDrawing.page_no})
                    </div>
                )}
            </div>

            {/* Top-right zoom widget */}
            <div className="absolute top-6 right-6 z-10 flex border border-overlay-hover bg-overlay/85 backdrop-blur-md rounded-xl p-1 shadow-xl">
                <button onClick={() => setZoom((z) => Math.min(5, z + 0.25))} className="p-2.5 hover:bg-overlay-hover/80 text-white/70 hover:text-white rounded-lg transition-all cursor-pointer" title="Zoom In"><ZoomIn size={14} /></button>
                <div className="w-px bg-overlay-hover self-stretch my-1" />
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-2.5 hover:bg-overlay-hover/80 text-white/70 hover:text-white rounded-lg transition-all cursor-pointer" title="Zoom Out"><ZoomOut size={14} /></button>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="flex-1 w-full h-full overflow-hidden select-none outline-none relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
            >
                {!imageObj ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40">
                        <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        <p className="text-label font-black uppercase tracking-widest animate-pulse">Rendering P&ID Asset...</p>
                    </div>
                ) : (
                    <canvas ref={canvasRef} className={`block w-full h-full ${isCropMode || isManualMatchMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`} />
                )}

                {isManualMatchMode && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-5 py-3 bg-brand text-white rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce border border-brand/20">
                        <Crop className="w-4 h-4 text-white/80" />
                        <div className="flex flex-col text-left">
                            <span className="text-label font-black uppercase tracking-widest text-white/80 leading-none">Manual Marking Mode</span>
                            <span className="text-xs font-bold mt-0.5 text-white">Click and drag a box on the drawing to mark the symbol</span>
                        </div>
                        <button onClick={() => setIsManualMatchMode(false)} className="ml-3 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-2xs font-black uppercase tracking-wider transition-all cursor-pointer">Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}
