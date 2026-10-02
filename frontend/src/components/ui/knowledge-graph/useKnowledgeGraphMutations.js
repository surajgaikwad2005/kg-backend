'use client';

/**
 * useKnowledgeGraphMutations — reusable knowledge-graph CRUD controller.
 *
 * Refactored to compose useNodeMutations, useConnectionMutations, and useDeleteMutations.
 */
import { useMemo } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import { nodeName } from './mutationUtils';
import { useNodeMutations } from './useNodeMutations';
import { useConnectionMutations } from './useConnectionMutations';
import { useDeleteMutations } from './useDeleteMutations';

export function useKnowledgeGraphMutations({ graphData, setGraphData, setSelectedNode }) {
    const { plantCode } = useApp();
    const { success, error } = useToast();
    
    const sharedArgs = { graphData, setGraphData, setSelectedNode, plantCode, success, error };

    const nodeMutations = useNodeMutations(sharedArgs);
    const connectionMutations = useConnectionMutations(sharedArgs);
    const deleteMutations = useDeleteMutations(sharedArgs);

    // Options for the connect modal's source/target selects.
    const nodeOptions = useMemo(
        () =>
            (graphData.nodes || [])
                .map((n) => ({ id: n.dbId ?? n.id, label: nodeName(n), classification: n.labels?.[0] || 'Entity' }))
                .sort((a, b) => String(a.label).localeCompare(String(b.label))),
        [graphData.nodes],
    );

    return {
        nodeOptions,
        ...nodeMutations,
        ...connectionMutations,
        ...deleteMutations
    };
}
