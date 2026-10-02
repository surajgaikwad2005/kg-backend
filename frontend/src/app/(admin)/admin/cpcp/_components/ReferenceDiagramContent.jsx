'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Crop, Loader2, Maximize2 } from 'lucide-react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { IndustrialNode } from '@/src/app/(dashboard)/home/workflow-diagram/_nodes/EquipmentNode';
import PipeEdge from '@/src/app/(dashboard)/home/workflow-diagram/_edges/EditableEdge';

const nodeTypes = { industrial: IndustrialNode };
const edgeTypes = { pipe: PipeEdge };

// Phase 1 Component: Reference Diagram with Node Selection
export function ReferenceDiagramContent({ nodes: loadedNodes, edges: loadedEdges, onExtract, isExtracting }) {
    const { fitView } = useReactFlow();

    const formattedNodes = useMemo(
        () => (loadedNodes || []).map(n => ({ ...n, type: 'industrial', selected: false })),
        [loadedNodes]
    );
    const formattedEdges = useMemo(
        () => (loadedEdges || []).map(e => ({ ...e, type: 'pipe', data: { ...e.data, readOnly: true } })),
        [loadedEdges]
    );

    const [rfNodes, setRfNodes, onNodesChange] = useNodesState(formattedNodes);
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(formattedEdges);

    useEffect(() => {
        setRfNodes((loadedNodes || []).map(n => ({ ...n, type: 'industrial', selected: false })));
        setRfEdges((loadedEdges || []).map(e => ({ ...e, type: 'pipe', data: { ...e.data, readOnly: true } })));
    }, [loadedNodes, loadedEdges, setRfNodes, setRfEdges]);

    useEffect(() => {
        if (!loadedNodes.length) return undefined;
        const timer = setTimeout(() => {
            fitView({ duration: 600, padding: 0.2 });
        }, 200);
        return () => clearTimeout(timer);
    }, [loadedNodes, fitView]);

    const onNodeClick = useCallback((_, clickedNode) => {
        setRfNodes((prevNodes) => {
            const selectedNodes = prevNodes.filter(n => n.selected);
            const isCurrentlySelected = prevNodes.find(n => n.id === clickedNode.id)?.selected;

            if (isCurrentlySelected) {
                return prevNodes.map(n => n.id === clickedNode.id ? { ...n, selected: false } : n);
            } else {
                if (selectedNodes.length >= 2) {
                    const firstSelectedId = selectedNodes[0].id;
                    return prevNodes.map(n => {
                        if (n.id === firstSelectedId) return { ...n, selected: false };
                        if (n.id === clickedNode.id) return { ...n, selected: true };
                        return n;
                    });
                } else {
                    return prevNodes.map(n => n.id === clickedNode.id ? { ...n, selected: true } : n);
                }
            }
        });
    }, [setRfNodes]);

    const selectedIds = rfNodes.filter(n => n.selected).map(n => n.id);

    return (
        <div className="w-full h-[650px] min-h-[550px] bg-surface overflow-hidden flex flex-col relative">
            <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                elementsSelectable={false}
                nodesConnectable={false}
                nodesDraggable={false}
                className="bg-surface w-full h-full"
                minZoom={0.05}
                maxZoom={4}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
            </ReactFlow>
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fitView({ duration: 400, padding: 0.2 })}
                        className="bg-surface/90 hover:bg-surface-2 backdrop-blur-md px-3 py-2 rounded-lg border border-border shadow-sm text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-text-primary transition-all"
                        title="Recenter / Reset View"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Fit View ({rfNodes.length})
                    </button>
                    <div className="bg-surface/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border shadow-sm text-sm font-medium">
                        Select exactly 2 nodes to extract path
                    </div>
                </div>
                {selectedIds.length === 2 && (
                    <button
                        onClick={() => onExtract(selectedIds)}
                        disabled={isExtracting}
                        className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg shadow-md font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crop className="w-4 h-4" />}
                        {isExtracting ? 'Extracting...' : 'Crop / Extract Path'}
                    </button>
                )}
            </div>
        </div>
    );
}

export function ReferenceDiagramSelection({ nodes, edges, onExtract, isExtracting }) {
    if (!nodes || !nodes.length) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-surface-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }
    return <ReferenceDiagramContent nodes={nodes} edges={edges} onExtract={onExtract} isExtracting={isExtracting} />;
}
