/**
 * /api/domain-configuration/pnid-workspace/[...path]  →  <PNID_WORKSPACE backend>/<path>
 *
 * Catch-all proxy for the Domain Configuration P&ID workspace surface: file
 * upload/inspection, the OCR → Extract → Compare pipeline, Template Matching,
 * Validate/highlight, Knowledge Graph and Chatbot — everything under
 * /admin/domain-configuration/pnid/*, plant-scoped (plant_code_id/plantCodeId
 * per endpoint, sourced from useApp().plantCode — see pnidService.js).
 * Query params and request bodies (JSON + multipart uploads) pass through
 * automatically; binary responses (PDF/PNG/xlsx) are streamed by the factory.
 *
 * Named pnid-workspace (sibling of pnid/, not nested under it) because pnid/
 * now hosts the live PNID connector's own catch-all (upload/connect/existing)
 * plus its jobs/[...path] route — nesting this here would collide with that.
 * The pnid/knowledge-graph/* routes stay under pnid/ since they're a
 * different feature (P&ID Ontology Generator's KG Explorer chat, on the
 * KNOWLEDGE_GRAPH backend) — this domain's own /kg_data and /chatbot/chat
 * endpoints are unrelated, on this same PNID_WORKSPACE backend.
 *
 * Backend URL resolved via resolveBackend("PNID_WORKSPACE") →
 * SERVICE_PNID_WORKSPACE_URL — a DEDICATED logical backend, deliberately
 * separate from "PNID" (SERVICE_PNID_URL), which stays exclusively for
 * admin/cpcp's Assessment Matrix (src/app/api/cpcp/[...path]/route.js,
 * cpcpService.js's PNID_BASE calls). Both happen to be the same local dev
 * host today, but they are different backend processes/contracts — repointing
 * "PNID" here would have silently broken admin/cpcp, which isn't part of this
 * refactored contract at all.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "PNID_WORKSPACE",
    prefix: '',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    trailingSlash: false,
});
