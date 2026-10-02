/**
 * /api/cpcp/configuration/pnid/[...path]  →  <CPCP Configuration backend>/<path>
 *
 * Catch-all proxy for the workflow-diagram (home/workflow-diagram) surface:
 * component/folder catalog, sidebar data, AI diagram persistence
 * (list/load/save/delete/pin), batch generation jobs, and Detailed Equipment
 * Summary. Sibling to `diagram/` (a separate namespace already proxying
 * VISUALS + DOMAIN_CONFIGURATION for the home dashboard's "Saved Workflow"
 * widget) — kept apart so the two unrelated backends never share a path.
 *
 * Backend URL resolved via resolveBackend("CPCP_CONFIGURATION") →
 * SERVICE_CPCP_CONFIGURATION_URL. Previously pointed at "PNID" →
 * SERVICE_PNID_URL — repointed because the refactored contract behind this
 * route is plant_code-scoped and versioned independently of the PNID backend
 * still used by admin/cpcp and domain-configuration/pnid-workspace.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "CPCP_CONFIGURATION",
    prefix: '',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    trailingSlash: false,
});
