/**
 * /api/domain-configuration/flow/[flowUid]  →  <DOMAIN_CONFIGURATION>/flow/{flowUid}
 *
 * Remove a file from the flow entirely — the file grid's row-delete action.
 * Responds `data: { deleted: <flow_uid> }` rather than the row itself, so
 * callers must not expect a row shape back here (unlike the reset route).
 *
 * ⚠ plant_code_id is a QUERY param on this route, but a BODY field on the
 * sibling `[flowUid]/reset` route. That is the backend's own inconsistency and
 * is intentional on their side — see api-data/cdm-flow-state.json.
 *
 * The static `state` sibling wins for `/flow/state`, so this dynamic segment
 * only ever matches a real id. 404 when flow_uid does not exist.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { DELETE } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: ({ flowUid }) => `/flow/${encodeURIComponent(flowUid)}`,
    methods: ["DELETE"],
});
