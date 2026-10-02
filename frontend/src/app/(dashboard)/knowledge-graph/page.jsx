"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import KG from "./_components/KG";
import NodeProperties from "./_components/NodeProperties";
import KnowledgeGraphSkeleton from "./_components/KnowledgeGraphSkeleton";
import { AlertTriangle, RotateCw, Network, Settings } from "lucide-react";
import { PageHeader } from "@/src/components/layout/PageHeader";
import GraphLegend from "@/src/components/ui/knowledge-graph/GraphLegend";
import { useKgViewer } from "@/src/hooks/useKgViewer";

export default function KnowledgeGraphPage() {
    const p = useKgViewer();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [layout, setLayout] = useState('force');

    return (<>
        <PageHeader title="Knowledge Graph" subtitle="Entity Relationship Mapping" />
        <div className="flex-1 flex overflow-hidden relative">
            <div ref={p.graphContainerRef} className="flex-1 relative bg-surface overflow-hidden">
                {p.isLoading ? (
                    <KnowledgeGraphSkeleton />
                ) : p.loadError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-canvas z-40 p-6">
                        <div className="max-w-sm w-full text-center flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 shadow-card animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-danger" /></div>
                            <div className="space-y-1">
                                <h3 className="text-title font-bold text-text-primary">Couldn’t load the graph</h3>
                                <p className="text-body-sm text-text-muted">{p.loadError}</p>
                            </div>
                            <button onClick={p.loadGraph} className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-caption font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer">
                                <RotateCw className="w-4 h-4" /> Retry
                            </button>
                        </div>
                    </div>
                ) : p.graphData.nodes.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-canvas z-40 p-6">
                        <div className="max-w-md w-full text-center flex flex-col items-center gap-6 rounded-3xl border border-border bg-surface p-10 shadow-card animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center ring-4 ring-surface shadow-sm">
                                <Network className="w-8 h-8 text-brand" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-extrabold text-text-primary tracking-tight">No entities</h3>
                                <p className="text-body-sm text-text-muted leading-relaxed">The Knowledge Graph service returned no nodes.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    p.dimensions.width > 0 && (
                        <>
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsMenuOpen((v) => !v)}
                                    className={`group flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                                        isMenuOpen ? 'bg-surface-2 text-text-primary ring-2 ring-brand/25' : ''
                                    }`}
                                    title={isMenuOpen ? "Hide Controls" : "Show Controls"}
                                    aria-label={isMenuOpen ? "Hide Controls" : "Show Controls"}
                                >
                                    <Settings className={`w-4 h-4 transition-transform duration-500 ease-out ${isMenuOpen ? 'rotate-90 text-brand' : ''}`} />
                                </button>

                                <div
                                    className={`flex items-center gap-3 transition-all duration-300 ease-out overflow-hidden ${
                                        isMenuOpen ? 'max-w-[800px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
                                    }`}
                                >
                                    {/* Hover-Expanding Layout Switcher (view-only) */}
                                    <div
                                        className="group flex items-center h-9 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2/50 text-sm font-semibold cursor-pointer shadow-sm overflow-hidden w-9 hover:w-[325px] transition-all duration-300 ease-in-out pointer-events-auto"
                                        title="Switch Graph Layout"
                                    >
                                        <div className="flex items-center gap-2 pl-[10px] w-[325px]">
                                            <Network className="w-4 h-4 flex-shrink-0" />
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center gap-1.5">
                                                {['force', 'fcose', 'cose', 'circle', 'grid'].map((lay) => (
                                                    <button
                                                        key={lay}
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setLayout(lay); }}
                                                        className={`px-2 py-0.5 h-6 rounded-md text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer select-none flex items-center justify-center active:scale-95 ${
                                                            layout === lay
                                                                ? 'bg-brand text-white shadow-xs'
                                                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                                                        }`}
                                                    >
                                                        {lay === 'force' ? 'Orbital' : lay.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-5 left-5 z-40">
                                <GraphLegend
                                    nodes={p.graphData.nodes}
                                    hiddenGroups={p.hiddenGroups}
                                    onToggleGroup={p.toggleGroup}
                                />
                            </div>
                            <KG
                                data={p.graphData}
                                setSelectedNode={p.handleSelect}
                                selectedNode={p.selectedNode}
                                width={p.dimensions.width}
                                height={p.dimensions.height}
                                showNodeLimit={false}
                                nodeVariant="orb"
                                onNodeExplore={p.handleNodeExplore}
                                isSidebarOpen={!!p.selectedNode}
                                exploredNodeIds={p.exploredNodeIds}
                                layoutVersion={p.layoutVersion}
                                onResetExplored={p.resetExploredNodeIds}
                                layout={layout}
                                hiddenGroups={p.hiddenGroups}
                                onToggleGroup={p.toggleGroup}
                            />
                            {/* Non-blocking subtle expansion indicator */}
                            <AnimatePresence>
                                {p.isExpanding && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 border border-brand/30 shadow-md backdrop-blur-md text-xs font-semibold text-text-primary pointer-events-none"
                                    >
                                        <div className="w-3 h-3 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
                                        <span>Expanding child nodes...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Full-screen loader ONLY on initial reload */}
                            <AnimatePresence>
                                {p.isReloading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute inset-0 z-50 flex items-center justify-center bg-canvas/50 backdrop-blur-[2px] pointer-events-auto select-none"
                                    >
                                        <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md animate-in zoom-in-95 duration-200">
                                            <div className="relative w-9 h-9 flex items-center justify-center">
                                                <div className="w-9 h-9 rounded-full border-2 border-border/70" />
                                                <div className="absolute inset-0 w-9 h-9 rounded-full border-2 border-transparent border-t-brand animate-spin" />
                                            </div>
                                            <div className="flex flex-col items-center text-center gap-0.5">
                                                <span className="text-caption font-extrabold text-text-primary uppercase tracking-wider">
                                                    Loading Graph
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )
                )}
            </div>

            <AnimatePresence>
                {p.selectedNode && (
                    <motion.aside initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="absolute right-0 top-0 bottom-0 w-80 lg:w-96 bg-surface/95 backdrop-blur-2xl border-l border-border shadow-panel z-50 overflow-hidden flex flex-col">
                        <NodeProperties selectedNode={p.panelNode} nodes={p.graphData.nodes} onClose={() => p.setSelectedNode(null)} />
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    </>
    );
}
