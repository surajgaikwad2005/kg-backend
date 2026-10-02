'use client';

import React from 'react';
import { ReactFlow, ReactFlowProvider, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from '@/src/components/ui/knowledge-graph/CustomNode';
import OrbNode from '@/src/components/ui/knowledge-graph/OrbNode';
import GraphNavigator from '@/src/components/ui/knowledge-graph/GraphNavigator';
import { useReactFlowCanvas } from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/_hooks/useReactFlowCanvas';

const nodeTypes = { custom: CustomNode, orb: OrbNode };

function ReactFlowCanvas({
    data, setSelectedNode, width, height, totalNodes, onTotalNodesChange,
    onNodeExplore, showNodeLimit = true, nodeVariant = 'card',
    isMagnifyMode, isSidebarOpen, exploredNodeIds, layoutVersion,
}) {
    const { nodes, edges, onNodesChange, onEdgesChange, onNodeClick, onEdgeClick, onNodeDoubleClick, onPaneClick } = useReactFlowCanvas({
        data, setSelectedNode, width, height, totalNodes,
        nodeVariant, isMagnifyMode, exploredNodeIds, layoutVersion, onNodeExplore,
    });

    return (
        <div className={`w-full h-full relative bg-canvas dark:bg-[#020617] ${isMagnifyMode ? '[&_.react-flow__pane]:cursor-zoom-in! [&_.react-flow__node]:cursor-zoom-in!' : ''}`}>
            <div className="absolute inset-0 pointer-events-none mix-blend-multiply dark:mix-blend-overlay bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.08)_100%)]" />

            {showNodeLimit && (
                <div className="absolute top-4 right-4 z-10 flex items-center justify-end gap-2 pointer-events-none">
                    <label className="flex items-center gap-2 text-label font-black uppercase tracking-wider text-text-subtle pointer-events-auto bg-surface/80 p-2 rounded-xl backdrop-blur-sm border border-border">
                        Max nodes
                        <input
                            type="number"
                            value={totalNodes}
                            onChange={(e) => onTotalNodesChange?.(Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-surface border border-border rounded-lg text-text-primary text-xs font-bold outline-none focus:border-brand"
                        />
                    </label>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                minZoom={0.1}
                maxZoom={4}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#94a3b8" gap={20} size={1} />
                <GraphNavigator
                    className={
                        isSidebarOpen
                            ? "transition-transform duration-300 ease-out -translate-x-80 lg:-translate-x-96"
                            : "transition-transform duration-300 ease-out translate-x-0"
                    }
                />
            </ReactFlow>
        </div>
    );
}

export default function KG(props) {
    return (
        <ReactFlowProvider>
            <ReactFlowCanvas {...props} />
        </ReactFlowProvider>
    );
}
