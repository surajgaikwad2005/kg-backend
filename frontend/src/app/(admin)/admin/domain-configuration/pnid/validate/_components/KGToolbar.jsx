'use client';

/**
 * KGToolbar — floating control bar for the knowledge-graph overlay.
 * Theme-token driven (bg-surface / border-border / brand) so it matches the
 * rest of the app instead of the old hard-coded slate palette. Groups the
 * controls into: identity badge · zoom cluster · fullscreen · layout/close.
 */
import React from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { Share2, ZoomIn, ZoomOut, Maximize2, Expand, Shrink, RotateCcw, X, Sparkles, Search } from 'lucide-react';

/** Small square icon button used across the toolbar clusters. */
function ToolBtn({ icon: Icon, label, onClick, active = false }) {
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`grid place-items-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer active:scale-90 ${
                active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-text-subtle hover:text-text-primary hover:bg-surface-2'
            }`}
        >
            <Icon size={15} />
        </button>
    );
}

const Divider = () => <span className="w-px h-7 bg-border shrink-0" />;

export default function KGToolbar() {
    const { setShowKG, setSelectedKGNode, setKgLayoutKey, isFullScreen, setIsFullScreen, showKgAivee, setShowKgAivee, isMagnifyMode, setIsMagnifyMode } = useValidateContext();

    return (
        <div className="absolute top-5 left-5 z-40 flex items-center gap-2 rounded-2xl border border-border bg-surface/90 backdrop-blur-xl px-2.5 py-2 shadow-card select-none animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Identity */}
            <div className="flex items-center gap-2.5 pl-1 pr-1">
                <span className="grid place-items-center w-8 h-8 rounded-xl bg-brand-muted text-brand">
                    <Share2 size={15} />
                </span>
                <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">Knowledge Graph</span>
                    <span className="text-[11px] font-bold text-text-secondary">Drag nodes to reposition</span>
                </div>
            </div>

            <Divider />

            {/* Zoom cluster */}
            <div className="flex items-center gap-0.5 rounded-xl bg-surface-2/70 p-1">
                <ToolBtn icon={ZoomIn} label="Zoom in" onClick={() => window.__kgZoomIn?.()} />
                <ToolBtn icon={ZoomOut} label="Zoom out" onClick={() => window.__kgZoomOut?.()} />
                <ToolBtn icon={Maximize2} label="Fit to view" onClick={() => window.__kgFitView?.()} />
                <span className="w-px h-4 mx-1 bg-border/80 shrink-0" />
                <ToolBtn icon={Search} label="Magnify/Explore Mode" active={isMagnifyMode} onClick={() => setIsMagnifyMode(v => !v)} />
            </div>

            <Divider />

            <ToolBtn
                icon={isFullScreen ? Shrink : Expand}
                label={isFullScreen ? 'Exit full screen' : 'Full screen'}
                active={isFullScreen}
                onClick={() => setIsFullScreen((v) => !v)}
            />

            <Divider />

            {/* Ask Aivee about the graph */}
            <button
                onClick={() => setShowKgAivee((v) => !v)}
                title="Ask Aivee about this graph"
                aria-pressed={showKgAivee}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                    showKgAivee
                        ? 'bg-brand text-white shadow-sm'
                        : 'bg-brand-muted text-brand hover:bg-brand/10'
                }`}
            >
                <Sparkles size={13} /> Ask Aivee
            </button>

            <Divider />

            {/* Layout + close */}
            <button
                onClick={() => { setSelectedKGNode(null); setKgLayoutKey((p) => p + 1); }}
                title="Reset layout"
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-surface-2 hover:bg-surface-2/70 text-text-secondary text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95"
            >
                <RotateCcw size={13} /> Reset
            </button>
            <button
                onClick={() => setShowKG(false)}
                title="Close graph"
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20 text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95"
            >
                <X size={13} /> Close
            </button>
        </div>
    );
}
