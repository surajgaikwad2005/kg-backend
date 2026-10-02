import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Download, RotateCcw, X } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

export default function GraphToolbar({ onExport, onReset, onClose }) {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="absolute top-6 left-6 right-6 lg:right-auto z-40 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Title Block */}
            <div className="bg-overlay text-white rounded-2xl px-5 py-3 shadow-2xl flex flex-col justify-center border border-border-strong/30">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle mb-0.5">Knowledge Graph View</h2>
                <p className="text-sm font-bold tracking-tight">Double-click to expand nodes. Drag nodes to reposition.</p>
            </div>

            {/* Controls Block */}
            <div className="flex items-center gap-2 bg-overlay/90 backdrop-blur-md p-1.5 rounded-2xl border border-border-strong/30 shadow-xl">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 px-2 border-r border-white/10">
                    <button onClick={() => zoomIn()} className="p-2 text-text-subtle hover:text-white hover:bg-overlay-hover rounded-lg transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => zoomOut()} className="p-2 text-text-subtle hover:text-white hover:bg-overlay-hover rounded-lg transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => fitView({ duration: 800 })} className="p-2 text-text-subtle hover:text-white hover:bg-overlay-hover rounded-lg transition-colors" title="Fit to View">
                        <Maximize className="w-4 h-4" />
                    </button>
                </div>

                {/* Actions */}
                <button 
                    onClick={onExport} 
                    className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brand/20"
                >
                    <Download className="w-3.5 h-3.5" />
                    JSON
                </button>
                <button 
                    onClick={onReset} 
                    className="flex items-center gap-2 px-4 py-2 text-border-strong hover:text-white hover:bg-overlay-hover text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Layout
                </button>

                {/* Close */}
                <div className="pl-2 border-l border-white/10">
                    <button 
                        onClick={onClose} 
                        className="flex items-center gap-2 px-4 py-2 bg-danger hover:bg-danger/80 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-danger/20"
                    >
                        <X className="w-3.5 h-3.5" />
                        Close Graph
                    </button>
                </div>
            </div>
        </div>
    );
}
