/**
 * /api/domain-configuration/context/get  →  <DOMAIN_CONFIGURATION>/context/get
 *
 * Unified read router for Data Source Integration connectors — `connector`
 * query param selects which internal flow runs. Replaces the four separate
 * per-connector get-context routes (pnid/sap/documents/timeseries), which
 * have been removed from this app; the backend keeps getPnidContext/
 * getSapContext/getDocsContext/getTsContext alive, but this app no longer
 * calls them. 2026-08-17: the backend widened this to all seven connectors
 * (added aif/gloc/lopc — the SAP-linked findings feeds) and added an
 * `unmatched_only` filter for those findings connectors. See
 * api-data/domain-configuration-context.json.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/context/get",
    methods: ["GET"],
});
