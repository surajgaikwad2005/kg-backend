'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, Maximize2, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import GraphMiniMap from './GraphMiniMap';
import GraphSearchInput from '@/src/app/(dashboard)/knowledge-graph/_components/GraphSearchInput';
import GraphSearchResults from '@/src/app/(dashboard)/knowledge-graph/_components/GraphSearchResults';

const POSITION_CLASSES = {
    'top-left': 'absolute top-4 left-4 z-30',
    'top-right': 'absolute top-4 right-4 z-30',
    'bottom-left': 'absolute bottom-4 left-4 z-30',
    'bottom-right': 'absolute bottom-4 right-4 z-30',
};

/**
 * GraphNavigator — collapsible "Navigator" panel wrapping the embedded
 * GraphMiniMap. Self-contained collapse state.
 */
export default function GraphNavigator({
    position = 'bottom-right',
    defaultOpen = true,
    className,
    cyRef,
    mapTick,
    searchQuery,
    setSearchQuery,
    matchedNodes,
    setSelectedId,
    setSelectedNode,
    ...miniMapProps
}) {
    const [open, setOpen] = useState(defaultOpen);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const posClass = POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right'];

    return (
        <div className={cn(posClass, className)}>
            <div className="w-fit overflow-hidden rounded-xl border border-border bg-surface/95 shadow-card backdrop-blur-sm">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    title={open ? 'Collapse navigator' : 'Expand navigator'}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-surface-2/60"
                >
                    <span className="flex-1 text-left text-label font-black uppercase tracking-widest text-text-subtle">
                        Navigator
                    </span>
                    {open
                        ? <ChevronDown size={14} className="text-text-subtle" />
                        : <ChevronUp size={14} className="text-text-subtle" />}
                </button>
                <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="relative">
                            <GraphMiniMap embedded cyRef={cyRef} mapTick={mapTick} {...miniMapProps} />
                            
                            {/* Search Results Overlay */}
                            {isSearchOpen && searchQuery.trim() && (
                                <GraphSearchResults
                                    matchedNodes={matchedNodes}
                                    setSelectedId={setSelectedId}
                                    setSelectedNode={setSelectedNode}
                                    setSearchQuery={setSearchQuery}
                                    setIsSearchOpen={setIsSearchOpen}
                                    cyRef={cyRef}
                                />
                            )}
                        </div>

                        {/* Search Input Panel */}
                        {isSearchOpen && (
                            <GraphSearchInput
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                        )}

                        {/* Control Bar */}
                        <div className="flex items-center justify-center gap-1 border-t border-border bg-surface-2/45 p-1.5">
                            <button
                                type="button"
                                title="Zoom in"
                                aria-label="Zoom in"
                                onClick={() => window.__kgZoomIn?.()}
                                className="grid place-items-center w-7 h-7 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-2 cursor-pointer transition-colors"
                            >
                                <ZoomIn size={14} />
                            </button>
                            <button
                                type="button"
                                title="Zoom out"
                                aria-label="Zoom out"
                                onClick={() => window.__kgZoomOut?.()}
                                className="grid place-items-center w-7 h-7 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-2 cursor-pointer transition-colors"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <button
                                type="button"
                                title="Fit view"
                                aria-label="Fit view"
                                onClick={() => window.__kgFitView?.()}
                                className="grid place-items-center w-7 h-7 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-2 cursor-pointer transition-colors"
                            >
                                <Maximize2 size={14} />
                            </button>
                            <span className="w-px h-4 bg-border shrink-0 mx-0.5" />
                            <button
                                type="button"
                                title="Search nodes"
                                aria-label="Search nodes"
                                onClick={() => setIsSearchOpen(prev => !prev)}
                                className={`grid place-items-center w-7 h-7 rounded-lg cursor-pointer transition-colors ${
                                    isSearchOpen
                                        ? 'bg-brand text-white shadow-sm font-bold'
                                        : 'text-text-subtle hover:text-text-primary hover:bg-surface-2'
                                }`}
                            >
                                <Search size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
