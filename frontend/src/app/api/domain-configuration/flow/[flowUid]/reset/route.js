/**
 * /api/domain-configuration/flow/[flowUid]/reset  →  <DOMAIN_CONFIGURATION>/flow/{flowUid}/reset
 *
 * Reset one file to stage='uploaded', status='pending', error=NULL so the
 * pipeline will pick it up again, and bump its attempt_count. Returns the
 * updated row. This is the action behind the per-file reprocess control.
 *
 * ⚠ plant_code_id travels in the BODY here, but in the QUERY STRING for the
 * sibling DELETE route one level up. The asymmetry is the backend's own and is
 * deliberate on their side — do not "align" the two. The body passes straight
 * through untouched, so nothing here has to know that.
 *
 * No other body field is read: the reset target state is fixed server-side.
 * 404 when flow_uid does not exist.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: ({ flowUid }) => `/flow/${encodeURIComponent(flowUid)}/reset`,
    methods: ["POST"],
});
