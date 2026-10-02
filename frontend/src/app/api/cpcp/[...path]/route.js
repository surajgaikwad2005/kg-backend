/**
 * /api/cpcp/[...path]  →  <PNID backend>/<path>
 *
 * Catch-all proxy for the admin/cpcp Assessment Matrix feature: the P&ID
 * agent run trigger and the per-tag CRUD/verify endpoints
 * (assessment/matrix, run-pnid-agent, assessment/update-tag,
 * assessment/verify-tag, assessment/add-tag, assessment/delete-tag).
 *
 * Backend URL resolved via resolveBackend("PNID") → SERVICE_PNID_URL. The
 * ontology matrix columns/rows themselves (getOntology, saveEquipment, ...)
 * stay on the existing /api/ontology/cpcp next.config.js rewrite — a
 * different (CDM) backend, out of scope for this proxy.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "CPCP", // Changed from "PNID"
    prefix: 'api/decisionops-pod2/p1/cpcp',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    trailingSlash: false,
});
