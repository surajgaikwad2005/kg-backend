/**
 * /api/domain-configuration/connectors/upload  →  <DOMAIN_CONFIGURATION>/connectors/upload
 *
 * Unified upload endpoint shared by documents, timeseries, sap, and the
 * natively-typed aif/gloc/lopc feeds — one multipart endpoint for all of
 * them, distinguished by a `connector` field in the form body instead of a
 * per-connector URL segment. Fields: connector, plant_code_id, files, labels
 * (required except for pnid — pnid isn't routed here), optional files_meta,
 * plus the type field — `document_type` for connector=documents, `file_type`
 * for connector=timeseries/sap only (see connectorsService.js). pnid
 * deliberately stays on its own dedicated
 * `/api/domain-configuration/pnid/upload` route (see
 * src/services/domain-configuration/common/connectorsService.js) — it has
 * not been migrated to this unified endpoint.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/connectors/upload",
    methods: ["POST"],
});
