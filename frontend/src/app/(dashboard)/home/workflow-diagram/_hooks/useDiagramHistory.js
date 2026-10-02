import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 50;

const sameSnapshot = (a, b) => !!a && !!b && JSON.stringify(a) === JSON.stringify(b);

// React Flow node/edge arrays from getNodes()/getEdges() must be cloned before
// storing — otherwise a stored snapshot and the live canvas state could end up
// sharing object references, letting a later drag silently rewrite history.
const clone = (nodes, edges) => JSON.parse(JSON.stringify({ nodes, edges }));

/**
 * Local undo/redo stack for the workflow canvas. The caller pushes a snapshot
 * whenever nodes/edges settle after a change; undo()/redo() hand back the
 * snapshot to re-apply. push() de-dupes against the current pointer so
 * re-applying a restored snapshot (which will re-trigger the caller's own
 * change-detection) never grows the stack or clobbers the redo branch.
 */
export function useDiagramHistory() {
    const stackRef = useRef([{ nodes: [], edges: [] }]);
    const indexRef = useRef(0);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const syncFlags = useCallback(() => {
        setCanUndo(indexRef.current > 0);
        setCanRedo(indexRef.current < stackRef.current.length - 1);
    }, []);

    /** Replace the whole stack with a single starting snapshot (diagram loaded or canvas cleared). */
    const reset = useCallback((nodes, edges) => {
        stackRef.current = [clone(nodes, edges)];
        indexRef.current = 0;
        syncFlags();
    }, [syncFlags]);

    /** Append a snapshot after the current pointer, discarding any redo branch ahead of it. */
    const push = useCallback((nodes, edges) => {
        const snapshot = clone(nodes, edges);
        if (sameSnapshot(stackRef.current[indexRef.current], snapshot)) return;
        const truncated = stackRef.current.slice(0, indexRef.current + 1);
        truncated.push(snapshot);
        if (truncated.length > MAX_HISTORY) truncated.shift();
        stackRef.current = truncated;
        indexRef.current = truncated.length - 1;
        syncFlags();
    }, [syncFlags]);

    const undo = useCallback(() => {
        if (indexRef.current <= 0) return null;
        indexRef.current -= 1;
        syncFlags();
        return stackRef.current[indexRef.current];
    }, [syncFlags]);

    const redo = useCallback(() => {
        if (indexRef.current >= stackRef.current.length - 1) return null;
        indexRef.current += 1;
        syncFlags();
        return stackRef.current[indexRef.current];
    }, [syncFlags]);

    return { canUndo, canRedo, reset, push, undo, redo };
}
