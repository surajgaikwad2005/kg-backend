'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { IndustrialNode } from '@/src/app/(dashboard)/home/workflow-diagram/_nodes/EquipmentNode';
import PipeEdge from '@/src/app/(dashboard)/home/workflow-diagram/_edges/EditableEdge';

const nodeTypes = { industrial: IndustrialNode };
const edgeTypes = { pipe: PipeEdge };

// Phase 2 Component: Editable Diagram
export function EditableSubDiagram({ initialNodes, initialEdges, onSave, isSaving, excelDownloadUrl, intermediateItems }) {
    const formattedNodes = useMemo(() => (initialNodes || []).map(n => ({ ...n, type: 'industrial' })), [initialNodes]);
    const [nodes, setNodes, onNodesChange] = useNodesState(formattedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView } = useReactFlow();

    useEffect(() => {
        setNodes((initialNodes || []).map(n => ({ ...n, type: 'industrial' })));
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    useEffect(() => {
        if (!initialNodes || !initialNodes.length) return undefined;
        const timer = setTimeout(() => {
            fitView({ duration: 600, padding: 0.2 });
        }, 300);
        return () => clearTimeout(timer);
    }, [initialNodes, fitView]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'pipe' }, eds)), [setEdges]);

    return (
        <div className="w-full h-[650px] min-h-[550px] bg-surface overflow-hidden flex flex-col relative">
            <div className="p-3 bg-surface/95 backdrop-blur-md border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-bold text-text-subtle uppercase tracking-wider text-2xs mr-1">In-Between Components:</span>
                    {intermediateItems && intermediateItems.length > 0 ? (
                        intermediateItems.map((item, idx) => (
                            <span
                                key={idx}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border shadow-xs ${item.badge_class || 'bg-surface-2 text-text-primary border-border'}`}
                            >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#3B82F6' }} />
                                {item.tag} <span className="opacity-70 text-2xs font-sans">({item.category || item.type})</span>
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-text-muted italic">Direct path extracted</span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {excelDownloadUrl && (
                        <a
                            href={excelDownloadUrl}
                            download
                            className="inline-flex items-center gap-2 bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand px-3.5 py-1.5 rounded-lg shadow-2xs text-xs font-bold transition-all cursor-pointer"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Download Excel
                        </a>
                    )}
                    <button
                        onClick={() => onSave({ nodes, edges })}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-success hover:bg-success/90 text-white px-4 py-1.5 rounded-lg shadow-sm font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {isSaving ? 'Saving...' : 'Save Diagram'}
                    </button>
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                className="bg-surface w-full h-full"
                minZoom={0.05}
                maxZoom={4}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
            </ReactFlow>
        </div>
    );
}
