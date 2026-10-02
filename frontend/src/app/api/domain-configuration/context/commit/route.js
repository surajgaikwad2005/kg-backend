/**
 * /api/domain-configuration/context/commit  →  <DOMAIN_CONFIGURATION>/context/commit
 *
 * Unified commit router for all four Data Source Integration connectors
 * (pnid | documents | sap | timeseries) — `connector` in the request body
 * selects which internal flow runs. Replaces the four separate per-connector
 * commit-context routes (pnid/sap/documents/timeseries), which have been
 * removed from this app; the backend keeps commitPnidContext/
 * commitDocsContext/commitTsContext/commitSapContext alive, but this app no
 * longer calls them. See api-data/domain-configuration-context.json.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/context/commit",
    methods: ["POST"],
});
