import { MarkerType } from '@xyflow/react';

// Grid fallback layout for diagrams whose saved nodes arrive without a
// position (e.g. seeded/test data) — spaces nodes so they don't stack at (0,0).
const LOAD_GRID_COLS = 4;
const LOAD_GRID_SPACING_X = 240;
const LOAD_GRID_SPACING_Y = 200;

function hasValidPosition(position) {
    return position && typeof position.x === 'number' && typeof position.y === 'number';
}

// Backend-saved nodes aren't guaranteed to carry React Flow's own fields
// (position, type) — only `id` + `data` are contractually guaranteed. Without
// `position` React Flow can't place the node; without `type` it silently
// falls back to the plain default node instead of our IndustrialNode.
export function normalizeLoadedNodes(nodes) {
    if (!Array.isArray(nodes)) return [];
    return nodes.map((node, index) => ({
        ...node,
        type: node.type || 'industrial',
        position: hasValidPosition(node.position)
            ? node.position
            : {
                x: (index % LOAD_GRID_COLS) * LOAD_GRID_SPACING_X,
                y: Math.floor(index / LOAD_GRID_COLS) * LOAD_GRID_SPACING_Y,
            },
        data: { status: 'normal', isConnecting: false, ...node.data },
    }));
}

export function normalizeLoadedEdges(edges) {
    if (!Array.isArray(edges)) return [];
    return edges.map((edge) => ({
        ...edge,
        type: edge.type || 'pipe',
        data: { label: 'flow', direction: 'forward', animated: true, flowColor: '#64748b', ...edge.data },
        markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: '#64748b', width: 18, height: 18 },
    }));
}
