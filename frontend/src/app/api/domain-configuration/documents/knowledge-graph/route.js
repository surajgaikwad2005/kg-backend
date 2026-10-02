/**
 * /api/domain-configuration/documents/knowledge-graph  →  <DOMAIN_CONFIGURATION>/context/getDocsKg
 *
 * Knowledge graph derived from the committed documents (Knowledge Graph view).
 * Distinct from domain-configuration/pnid/knowledge-graph/* (P&ID Ontology
 * Generator's KG chat/update) — same name, different feature, different backend.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/context/getDocsKg",
    methods: ["GET"],
});
