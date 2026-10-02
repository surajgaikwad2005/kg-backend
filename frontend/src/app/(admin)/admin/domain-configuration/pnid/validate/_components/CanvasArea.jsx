'use client';

/**
 * CanvasArea — the diagram viewport with zoom/pan, region-filter, and fullscreen
 * controls, plus floating verify actions in fullscreen. The viewer chrome stays
 * dark in both themes for consistent drawing contrast.
 */
import React from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { ZoomIn, ZoomOut, Maximize2, Crop, Trash2, Expand, Shrink, Loader2, ShieldCheck, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function CanvasArea() {
    const {
        canvasRef, containerRef, imageObj,
        isFilterMode, setIsFilterMode, filterBox, isFullScreen, setIsFullScreen,
        activeConnection, isHighlightLoading, validationResult, isValidationLoading,
        connections, setConnections, setActiveConnection, saveConnectionsToBackend,
        handleZoomIn, handleZoomOut, handleResetZoom,
        handleMouseDown, handleMouseMove, handleMouseUpOrLeave, handleClearFilter, handleWheel,
        markActiveConnectionAsVerified, markActiveConnectionAsWrong, getValidationIconAndCls,
    } = useValidateContext();

    const handleUnverify = async () => {
        if (!activeConnection) return;
        const next = connections.map((c) => (c.from === activeConnection.from && c.to === activeConnection.to ? { ...c, verified: false, wrong: false } : c));
        setConnections(next);
        setActiveConnection((prev) => (prev ? { ...prev, verified: false, wrong: false } : null));
        await saveConnectionsToBackend(next);
    };

    const badgeCls = (valid) =>
        valid === true ? 'bg-success/15 border-success/30 text-success'
            : valid === false ? 'bg-warning/15 border-warning/30 text-warning'
                : 'bg-danger/15 border-danger/30 text-danger';

    return (
        <div className="flex-1 min-h-137.5 lg:min-h-175 bg-overlay border border-overlay-hover rounded-3xl overflow-hidden relative shadow-inner flex flex-col">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-40 bg-overlay/80 backdrop-blur-sm border border-overlay-hover rounded-xl p-1.5 flex items-center gap-1">
                <button onClick={handleZoomIn} className="p-2 text-white/60 hover:text-white hover:bg-overlay-hover rounded-lg transition-colors cursor-pointer" title="Zoom In"><ZoomIn size={16} /></button>
                <button onClick={handleZoomOut} className="p-2 text-white/60 hover:text-white hover:bg-overlay-hover rounded-lg transition-colors cursor-pointer" title="Zoom Out"><ZoomOut size={16} /></button>
                <button onClick={handleResetZoom} className="p-2 text-white/60 hover:text-white hover:bg-overlay-hover rounded-lg transition-colors cursor-pointer" title="Reset View"><Maximize2 size={16} /></button>
                <div className="w-px h-5 bg-overlay-hover mx-1" />
                <button onClick={() => setIsFilterMode(!isFilterMode)} className={`p-2 rounded-lg transition-colors cursor-pointer ${isFilterMode ? 'bg-brand text-white hover:bg-brand-hover' : 'text-white/60 hover:text-white hover:bg-overlay-hover'}`} title="Draw Region Filter"><Crop size={16} /></button>
                {filterBox && (
                    <button onClick={handleClearFilter} className="p-2 text-danger hover:text-danger/80 hover:bg-overlay-hover rounded-lg transition-colors cursor-pointer" title="Clear Region Filter"><Trash2 size={16} /></button>
                )}
                <div className="w-px h-5 bg-overlay-hover mx-1" />
                <button onClick={() => setIsFullScreen(!isFullScreen)} className={`p-2 rounded-lg transition-colors cursor-pointer ${isFullScreen ? 'bg-brand text-white hover:bg-brand-hover' : 'text-white/60 hover:text-white hover:bg-overlay-hover'}`} title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}>
                    {isFullScreen ? <Shrink size={16} /> : <Expand size={16} />}
                </button>
            </div>

            {/* Fullscreen floating actions removed - standard buttons now visible */}

            {/* Loading overlay */}
            {isHighlightLoading && (
                <div className="absolute inset-0 z-30 bg-overlay/60 flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-brand" />
                    <p className="text-xs font-black text-white/60 uppercase tracking-widest animate-pulse">Loading Drawing & Coordinates...</p>
                </div>
            )}

            {/* Viewport */}
            <div
                ref={containerRef}
                className={`flex-1 overflow-hidden relative ${isFilterMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onWheel={handleWheel}
            >
                {imageObj ? (
                    <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 text-xs font-bold gap-2">
                        <ShieldCheck size={28} className="opacity-40" />
                        <span>No drawing loaded. Select a component tag to locate on diagram.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
