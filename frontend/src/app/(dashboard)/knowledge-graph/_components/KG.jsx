'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import GraphNavigator from '@/src/components/ui/knowledge-graph/GraphNavigator';
import GraphFilterPanel from './GraphFilterPanel';
import { useTheme } from '@/src/context/visuals/ThemeContext';
import { useGraphDataMapper } from '@/src/hooks/knowledge-graph/useGraphDataMapper';
import { useCytoscapeInstance } from './useCytoscapeInstance';
import { useCytoscapeElements } from './useCytoscapeElements';
import { useCytoscapeInteractions } from './useCytoscapeInteractions';

export default function KG({
    data,
    setSelectedNode,
    width,
    height,
    totalNodes,
    onTotalNodesChange,
    onNodeExplore,
    showNodeLimit = true,
    nodeVariant = 'card',
    isMagnifyMode,
    onToggleMagnify,
    isSidebarOpen,
    exploredNodeIds,
    layoutVersion,
    onResetExplored,
    selectedNode,
    layout: layoutName = 'force',
    headerActions,
    hiddenGroups: hiddenGroupsProp,
    onToggleGroup: onToggleGroupProp,
}) {
    const { isDark } = useTheme();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set());
    const [internalHiddenGroups, setInternalHiddenGroups] = useState(new Set());
    const hiddenGroups = hiddenGroupsProp !== undefined ? hiddenGroupsProp : internalHiddenGroups;
    const [selectedId, setSelectedId] = useState(null);
    const [mapTick, setMapTick] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const positionsRef = useRef(new Map());
    const focusRequestId = useRef(null);

    const matchedNodes = useMemo(() => {
        if (!searchQuery.trim() || !cyRef.current) return [];
        const q = searchQuery.toLowerCase().trim();
        return cyRef.current.nodes().filter(n => {
            const name = n.data('name');
            return name && name.toLowerCase().includes(q);
        });
    }, [searchQuery, mapTick]);

    const toggleGroup = useCallback((group) => {
        if (onToggleGroupProp) {
            onToggleGroupProp(group);
            return;
        }
        const filterAlreadyOn = hiddenGroups.has(group);
        const bypassActive = (exploredNodeIds?.size ?? 0) > 0;
        if (filterAlreadyOn && bypassActive) {
            onResetExplored?.();
            return;
        }
        setInternalHiddenGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
        onResetExplored?.();
    }, [hiddenGroups, exploredNodeIds, onResetExplored, onToggleGroupProp]);

    const onToggleCollapse = useCallback((nodeId) => {
        setCollapsedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
                focusRequestId.current = nodeId;
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    const { groupCounts, initialNodes, initialEdges, hiddenNodes, hiddenEdges } = useGraphDataMapper({
        data,
        totalNodes: totalNodes || data?.nodes?.length || 50,
        nodeVariant,
        hiddenGroups,
        collapsedNodeIds,
        exploredNodeIds
    });

    const visibleNodes = useMemo(() => initialNodes.filter(n => !hiddenNodes.has(n.id)), [initialNodes, hiddenNodes]);
    const visibleEdges = useMemo(() => initialEdges.filter(e => !hiddenEdges.has(e.id)), [initialEdges, hiddenEdges]);

    const callbacksRef = useRef({ setSelectedNode, onNodeExplore, onToggleCollapse, exploredNodeIds });
    useEffect(() => { callbacksRef.current = { setSelectedNode, onNodeExplore, onToggleCollapse, exploredNodeIds }; });

    useEffect(() => { positionsRef.current = new Map(); }, [layoutVersion, hiddenGroups]);

    const { runCytoscapeLayout } = useCytoscapeInstance({
        containerRef, cyRef, isDark, callbacksRef, setSelectedId, setMapTick, positionsRef, focusRequestId
    });

    useCytoscapeElements({
        cyRef, visibleNodes, visibleEdges, width, height, layoutVersion, layoutName, runCytoscapeLayout,
        exploredNodeIds, collapsedNodeIds, focusRequestId, selectedId, setMapTick, positionsRef
    });

    useCytoscapeInteractions({ cyRef, selectedNode, setSelectedId, isDark, searchQuery });

    return (
        <div className={`w-full h-full relative bg-canvas ${isMagnifyMode ? '[&_canvas]:cursor-zoom-in!' : ''}`}>
            <div className="absolute top-4 right-4 z-40 flex items-start gap-2 pointer-events-none">
                <div className="pointer-events-auto flex items-start gap-2">
                    {headerActions}
                    <GraphFilterPanel
                        isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen}
                        groupCounts={groupCounts} hiddenGroups={hiddenGroups} toggleGroup={toggleGroup}
                    />
                </div>
            </div>

            {showNodeLimit && (
                <div className="absolute top-4 right-4 z-10 flex items-center justify-end gap-2 pointer-events-none">
                    <label className="flex items-center gap-2 text-label font-black uppercase tracking-wider text-text-subtle pointer-events-auto bg-surface/80 p-2 rounded-xl backdrop-blur-sm border border-border">
                        Max nodes
                        <input
                            type="number" value={totalNodes} onChange={(e) => onTotalNodesChange?.(Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-surface border border-border rounded-lg text-text-primary text-xs font-bold outline-none focus:border-brand"
                        />
                    </label>
                </div>
            )}

            <div ref={containerRef} className="w-full h-full" />

            <GraphNavigator
                cyRef={cyRef} mapTick={mapTick}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                matchedNodes={matchedNodes} setSelectedId={setSelectedId} setSelectedNode={setSelectedNode}
            />
        </div>
    );
}
