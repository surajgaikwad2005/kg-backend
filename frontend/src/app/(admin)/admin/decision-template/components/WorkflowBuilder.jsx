'use client';
import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MoveRight, RotateCcw, RotateCw, PanelLeft, Settings2 } from 'lucide-react';

import { CustomNode } from './flow/CustomNode';
import { GroupNode } from './flow/GroupNode';
import { DeletableEdge } from './flow/DeletableEdge';
import { TemplateSidebar } from './ui/TemplateSidebar';
import { PropertiesSidebar } from './ui/PropertiesSidebar';
import { FlowNavigator } from '@/src/components/ui/FlowNavigator';
import { useWorkflowBuilder } from '../hooks/useWorkflowBuilder';

const nodeTypes = { custom: CustomNode, group: GroupNode };
const edgeTypes = { deletableEdge: DeletableEdge };

const CATEGORY_NODE_COLORS = {
    Observe: 'var(--color-brand)',
    Investigate: 'var(--color-warning)',
    Diagnose: 'var(--color-success)',
};

const navigatorNodeColor = (node) =>
    CATEGORY_NODE_COLORS[node.data?.type] || CATEGORY_NODE_COLORS[node.data?.label] || 'var(--color-brand)';

function BuilderFlow({ onClose, onSaved, templateName, templateClass, initialData, templateId }) {
    const {
        nodes, edges, onNodesChange, onEdgesChange,
        selectedNode, setSelectedNode, setNodes,
        history, redoStack, saving,
        handleUndo, handleRedo,
        onConnect, onDragStart, onDragOver, onDrop,
        onNodeClick, onPaneClick, handleSave,
    } = useWorkflowBuilder({ templateName, templateClass, templateId, initialData, onSaved, onClose });

    // Below lg the palette is an overlay drawer instead of a fixed column, so
    // the canvas keeps usable width on tablets. Desktop keeps it always-open.
    const [paletteOpen, setPaletteOpen] = useState(false);

    const closePalette = useCallback(() => setPaletteOpen(false), []);
    const handleNodeClick = useCallback((e, node) => {
        setPaletteOpen(false);
        onNodeClick(e, node);
    }, [onNodeClick]);

    const iconBtn =
        'flex items-center justify-center w-9 h-9 rounded-lg text-text-primary hover:bg-border/30 active:bg-border/50 transition-colors duration-fast cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent';

    return (
        <div className="absolute inset-0 bg-surface flex flex-col overflow-hidden">
            {/* Builder Header */}
            <header className="px-3 sm:px-4 lg:px-6 py-3 bg-surface border-b border-border flex justify-between items-center gap-3 shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={onClose}
                        aria-label="Back to template list"
                        title="Back to list"
                        className="text-text-secondary hover:text-text-primary p-1.5 bg-border/30 hover:bg-border/60 rounded-lg transition-colors duration-fast cursor-pointer shrink-0"
                    >
                        <MoveRight className="w-5 h-5 rotate-180" />
                    </button>

                    {/* Palette toggle — only meaningful while the palette is a drawer */}
                    <button
                        onClick={() => setPaletteOpen((o) => !o)}
                        aria-label={paletteOpen ? 'Hide template palette' : 'Show template palette'}
                        aria-expanded={paletteOpen}
                        title="Toggle templates"
                        className={`lg:hidden p-1.5 rounded-lg transition-colors duration-fast cursor-pointer shrink-0 ${
                            paletteOpen ? 'bg-brand-muted text-brand' : 'bg-border/30 text-text-secondary hover:bg-border/60 hover:text-text-primary'
                        }`}
                    >
                        <PanelLeft className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-text-primary leading-tight truncate">
                            Decision Template Builder
                        </h2>
                        <p className="text-xs text-text-secondary truncate hidden sm:block">
                            {templateName ? `Editing: ${templateName}` : 'Drag and drop nodes to configure your workflow'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="flex border border-border rounded-lg overflow-hidden bg-surface">
                        <button
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            aria-label="Undo last change"
                            title="Undo"
                            className={`${iconBtn} border-r border-border rounded-none`}
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            aria-label="Redo last undone change"
                            title="Redo"
                            className={`${iconBtn} rounded-none`}
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Properties toggle — the sidebar is an overlay below xl */}
                    {selectedNode && (
                        <button
                            onClick={() => setSelectedNode(null)}
                            aria-label="Close properties panel"
                            title="Properties"
                            className="xl:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-brand-muted text-brand transition-colors duration-fast cursor-pointer"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        aria-busy={saving}
                        className="px-3 sm:px-5 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-hover active:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-fast shadow-sm shadow-brand/20 cursor-pointer whitespace-nowrap"
                    >
                        {saving ? 'Saving…' : 'Save Template'}
                    </button>
                </div>
            </header>

            {/* Canvas Area */}
            <div className="flex-1 flex overflow-hidden min-h-0 relative">
                {/* Palette: static column on desktop, slide-in drawer below lg */}
                <div
                    className={`absolute inset-y-0 left-0 z-20 transition-transform duration-base ease-default lg:static lg:translate-x-0 lg:z-auto ${
                        paletteOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <TemplateSidebar onDragStart={onDragStart} />
                </div>
                {paletteOpen && (
                    <button
                        type="button"
                        aria-label="Close template palette"
                        onClick={closePalette}
                        className="absolute inset-0 z-10 bg-overlay/40 backdrop-blur-xs lg:hidden cursor-pointer"
                    />
                )}

                <div className="flex-1 relative min-w-0">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={handleNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={{ type: 'deletableEdge', zIndex: 1000 }}
                        fitView
                        minZoom={0.1}
                        maxZoom={4}
                        proOptions={{ hideAttribution: true }}
                        className="bg-surface"
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={24}
                            size={1.2}
                            color="var(--color-border)"
                        />
                        <FlowNavigator
                            nodeColor={navigatorNodeColor}
                            emptyLabel="No nodes yet"
                        />
                    </ReactFlow>
                </div>

                {/* Properties: static column on xl, overlay drawer below */}
                {selectedNode && (
                    <>
                        <button
                            type="button"
                            aria-label="Close properties panel"
                            onClick={() => setSelectedNode(null)}
                            className="absolute inset-0 z-10 bg-overlay/40 backdrop-blur-xs xl:hidden cursor-pointer"
                        />
                        <div className="absolute inset-y-0 right-0 z-20 xl:static xl:z-auto">
                            <PropertiesSidebar
                                selectedNode={selectedNode}
                                setSelectedNode={setSelectedNode}
                                setNodes={setNodes}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function WorkflowBuilder(props) {
    return (
        <ReactFlowProvider>
            <BuilderFlow {...props} />
        </ReactFlowProvider>
    );
}
