/**
 * /api/domain-configuration/pnid/knowledge-graph/chat  →  <KNOWLEDGE_GRAPH>/p1_knowledgegraph/graph/kg_chat
 *
 * Natural-language Q&A over the knowledge graph — powers the P&ID KG's Aivee
 * assistant. Body: { message, history }.
 *
 * NOTE: the upstream path mirrors its sibling KG endpoints (kg_explore /
 * update_graph). This route is the single place to adjust it if the backend
 * exposes the chat under a different path.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "KNOWLEDGE_GRAPH",
    path: "/p1_knowledgegraph/graph/kg_chat",
    methods: ["POST"],
});
