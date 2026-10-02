'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter } from 'next/navigation';
import { Info, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { IndustrialNode } from '@/src/app/(dashboard)/home/workflow-diagram/_nodes/EquipmentNode';
import PipeEdge from '@/src/app/(dashboard)/home/workflow-diagram/_edges/EditableEdge';
import { WorkflowDataProvider } from '@/src/context/workflow-management/WorkflowContext';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Button } from '@/src/components/ui/Button';
import { ContextMenu } from '@/src/components/ui/ContextMenu';

const nodeTypes = { industrial: IndustrialNode };
const edgeTypes = { pipe: PipeEdge };

const EMPTY = [];

// React Flow needs a painted frame before fitView can measure the nodes.
const FIT_VIEW_DELAY_MS = 200;
const FIT_VIEW_OPTIONS = { duration: 800, padding: 0.2 };

/** Shimmer stand-in that mirrors the diagram's node grid while it loads. */
function FlowSkeleton() {
    return (
        <div className="w-full h-full bg-canvas p-6 flex flex-col gap-6" aria-busy="true">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 flex-1 min-h-0">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={`flow-skeleton-${i}`} className="flex flex-col gap-2">
                        <Skeleton className="flex-1 min-h-0 rounded-xl" delay={i * 0.08} />
                        <Skeleton className="h-2.5 w-2/3 rounded-full" delay={i * 0.08} />
                    </div>
                ))}
            </div>
            <span className="sr-only">Loading industrial flow diagram</span>
        </div>
    );
}

/** Shared empty/error shell so both states animate and align identically. */
function FlowMessage({ title, children, onRetry }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-canvas p-8 text-center gap-4">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center border border-border">
                <Info className="w-8 h-8 text-text-subtle" />
            </div>
            <div className="space-y-1">
                <h4 className="text-text-primary font-bold text-body-sm">{title}</h4>
                <p className="text-text-muted text-caption max-w-65 leading-relaxed">{children}</p>
            </div>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2 cursor-pointer">
                    <RefreshCw className="w-3 h-3" /> Retry
                </Button>
            )}
        </div>
    );
}

function FlowViewer({ nodes: loadedNodes, edges: loadedEdges }) {
    const router = useRouter();
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(loadedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(loadedEdges);
    // Right-click target: { x, y, label } in viewport coords, or null when closed.
    // Local UI state by definition — never lifted into a context (Rule 39).
    const [contextTarget, setContextTarget] = useState(null);

    // Mirror the fetched diagram into React Flow's controlled state, then frame it.
    useEffect(() => {
        setNodes(loadedNodes);
        setEdges(loadedEdges);
    }, [loadedNodes, loadedEdges, setNodes, setEdges]);

    useEffect(() => {
        if (!loadedNodes.length) return undefined;
        const timer = setTimeout(() => fitView(FIT_VIEW_OPTIONS), FIT_VIEW_DELAY_MS);
        return () => clearTimeout(timer);
    }, [loadedNodes, fitView]);

    const onNodeClick = useCallback((_, node) => {
        const assetLabel = node.data?.label || '';
        if (!assetLabel) return;
        const componentType = node.data?.componentType || 'equipment';
        router.push(
            `/home/workflow-diagram/compressor-details/${encodeURIComponent(componentType)}?label=${encodeURIComponent(assetLabel)}`
        );
    }, [router]);

    // The node's label IS the asset id: the CPCP diagram contract stores only
    // `{ id, data: { label, componentType } }` per node — `id` is a synthetic
    // `node_1`-style key and `data.code` is SVG markup, so `label` is the sole
    // identifier the asset-config backend can resolve.
    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        setContextTarget({
            x: event.clientX,
            y: event.clientY,
            label: node.data?.label || '',
        });
    }, []);

    const closeContextMenu = useCallback(() => setContextTarget(null), []);

    const contextMenuItems = useMemo(() => {
        const label = contextTarget?.label;
        return [{
            id: 'configure-asset',
            label: label ? `Configure ${label}` : 'Configure equipment',
            description: label ? 'Open asset configuration' : 'This node has no asset id',
            icon: SlidersHorizontal,
            disabled: !label,
            onSelect: () => router.push(`/asset-config/${encodeURIComponent(label)}`),
        }];
    }, [contextTarget, router]);

    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeClick}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={closeContextMenu}
                onMoveStart={closeContextMenu}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnScroll
                selectionKeyCode={null}
                multiSelectionKeyCode={null}
                deleteKeyCode={null}
                className="bg-surface"
                minZoom={0.1}
                maxZoom={4}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
            </ReactFlow>

            <div className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-md border border-border px-3 py-1.5 rounded-lg shadow-sm pointer-events-none">
                <p className="text-label font-bold text-text-muted uppercase tracking-tighter">
                    Live Industrial State · Read Only
                </p>
            </div>

            <ContextMenu
                open={Boolean(contextTarget)}
                x={contextTarget?.x ?? 0}
                y={contextTarget?.y ?? 0}
                onClose={closeContextMenu}
                items={contextMenuItems}
                ariaLabel="Equipment actions"
            />
        </div>
    );
}

/**
 * SavedWorkflowFlow — read-only render of the diagram pinned to the home
 * dashboard. Purely presentational: `useDashboardDiagram` (owned by the page)
 * performs GET /diagrams + GET /loadDiagram/{id}, and WorkflowDataProvider
 * supplies the node visuals from GET /components.
 */
export default function SavedWorkflowFlow({ nodes = EMPTY, edges = EMPTY, isLoading = false, error = null, onRetry }) {
    const content = useMemo(() => {
        if (isLoading) return <FlowSkeleton />;

        if (error) {
            return (
                <FlowMessage title="Dashboard Flow Not Set" onRetry={onRetry}>
                    {error} Open the <span className="text-brand font-bold">Workflow Diagram</span> editor and use the
                    {' '}<span className="font-bold">Monitor icon</span> in the sidebar to pin a workflow here.
                </FlowMessage>
            );
        }

        if (!nodes.length) {
            return (
                <FlowMessage title="Diagram Is Empty">
                    This diagram has no equipment on it yet. Add components in the
                    {' '}<span className="text-brand font-bold">Workflow Diagram</span> editor and save.
                </FlowMessage>
            );
        }

        return <FlowViewer nodes={nodes} edges={edges} />;
    }, [isLoading, error, nodes, edges, onRetry]);

    return (
        <WorkflowDataProvider>
            <ReactFlowProvider>{content}</ReactFlowProvider>
        </WorkflowDataProvider>
    );
}
