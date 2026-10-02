/**
 * /api/domain-configuration/pnid/knowledge-graph/update  →  <KNOWLEDGE_GRAPH>/p1/knowledgeGraph/graph/updateGraph
 *
 * Batch node/relationship upsert for the P&ID Ontology Generator (validate
 * step). Separate from /api/knowledge-graph/update (the dashboard KG
 * Explorer's route) even though both hit the same backend endpoint — kept
 * per-domain so each feature owns its own proxy route. PNID never deletes
 * through this flow, so only POST is exposed here.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "KNOWLEDGE_GRAPH",
    path: "/p1/knowledgeGraph/graph/updateGraph",
    methods: ["POST"],
});
