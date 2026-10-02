'use client';

/**
 * KGOverlay — full-panel knowledge-graph view: themed toolbar, the KG canvas,
 * a node-type legend, the auto-collapsing NodeProperties inspector, and the KG
 * modals. The inspector slides in only when a node/relationship is selected.
 */
import React, { useMemo } from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { groupOf, GROUP_CONFIG } from '@/src/components/ui/knowledge-graph/groups';
import KG from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/KG';
import NodeProperties from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/NodeProperties';
import KGModals from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/KGModals';
import KGToolbar from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/KGToolbar';
import KGLegend from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/KGLegend';

export default function KGOverlay() {
    const {
        showKG,
        kgGraphContainerRef, kgDimensions, kgLayoutKey,
        kgGraphData, kgTotalNodes, setKgTotalNodes, selectedKGNode, setSelectedKGNode,
        handleEditNode, handleConnectNodeTrigger, handleDeleteNodeTrigger, handleDeleteRelationshipTrigger,
        isMagnifyMode,
    } = useValidateContext();

    // Per-type node counts for the legend — capped the same way the canvas caps
    // visible nodes (rawNodes.slice(0, totalNodes)) so the numbers match.
    const typeCounts = useMemo(() => {
        const nodes = kgGraphData?.nodes || [];
        const cap = kgTotalNodes || nodes.length;
        const counts = {};
        Object.keys(GROUP_CONFIG).forEach(g => { counts[g] = 0; });
        nodes.slice(0, cap).forEach((n) => { counts[groupOf(n.labels?.[0] || 'Document')] += 1; });
        return counts;
    }, [kgGraphData, kgTotalNodes]);

    if (!showKG) return null;

    const hasSelection = !!selectedKGNode;

    return (
        <div className="absolute inset-0 z-50 flex min-w-0 min-h-0 bg-canvas text-text-secondary animate-in fade-in duration-300">
            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-canvas">
                <KGToolbar />
                <KGLegend counts={typeCounts} />

                {/* Canvas */}
                <div ref={kgGraphContainerRef} className="flex-1 w-full h-full relative overflow-hidden select-none bg-surface">
                    {kgDimensions.width > 0 && kgDimensions.height > 0 && (
                        <KG
                            key={kgLayoutKey}
                            data={kgGraphData}
                            setSelectedNode={setSelectedKGNode}
                            filteredNodeIds={null}
                            filteredRelationshipIds={null}
                            width={kgDimensions.width}
                            height={kgDimensions.height}
                            totalNodes={kgTotalNodes}
                            onTotalNodesChange={setKgTotalNodes}
                            onTotalNodesSubmit={() => {}}
                            isMagnifyMode={isMagnifyMode}
                        />
                    )}
                </div>
            </div>

            {/* Inspector — collapses to zero width when nothing is selected.
                Outer animates width; inner keeps a fixed width so content never
                squishes during the slide. */}
            <div
                className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    hasSelection ? 'w-80' : 'w-0'
                }`}
                aria-hidden={!hasSelection}
            >
                <div
                    className={`w-80 h-full border-l border-border bg-surface shadow-xl text-text-secondary transition-all duration-300 ${
                        hasSelection ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                >
                    <NodeProperties
                        selectedNode={selectedKGNode}
                        onEditNode={handleEditNode}
                        onConnectFromNode={handleConnectNodeTrigger}
                        onDeleteNode={handleDeleteNodeTrigger}
                        onDeleteRelationship={handleDeleteRelationshipTrigger}
                    />
                </div>
            </div>

            <KGModals />
        </div>
    );
}
