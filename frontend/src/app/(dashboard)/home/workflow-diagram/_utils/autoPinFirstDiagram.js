import { listPnidDiagrams, pinPnidDiagram } from '@/src/services/cpcp/diagram/diagramService';

/**
 * Auto-pins a freshly created diagram to the home dashboard, but ONLY when it
 * is the plant's very first saved diagram — so SavedWorkflowFlow.jsx (the
 * home dashboard widget) has something to show out of the box, without
 * requiring the user to manually click the Monitor/pin icon first. Re-checks
 * the live list rather than trusting local state so it's correct regardless
 * of which save path (manual Save, autosave, or batch connections-diagram
 * generation) created the diagram.
 *
 * Deliberately a one-time default, not a standing invariant: once the plant
 * has 2+ diagrams, this is a no-op even if none of them is pinned, so a
 * user's later manual unpin is never silently reversed.
 */
export const maybePinFirstDiagram = async (plantCode, diagramId) => {
    if (!plantCode || !diagramId) return;
    try {
        const { diagrams = [] } = await listPnidDiagrams(plantCode);
        if (diagrams.length === 1 && diagrams[0]?.id === diagramId) {
            await pinPnidDiagram(plantCode, diagramId, true);
        }
    } catch {
        // Best-effort — a failed auto-pin just means the user pins manually.
    }
};
