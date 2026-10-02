/**
 * /api/domain-configuration/documents/jobs/*  →  <DOMAIN_CONFIGURATION>/connectors/jobs/*
 *
 * Connector job polling is backend-agnostic across pnid|sap|timeseries|documents —
 * every connector's job status lives under the same /connectors/jobs/* path.
 * Nested here (more specific than the sibling [...path] catch-all) so Next.js
 * resolves this route first for /jobs/* requests.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/connectors/jobs",
    trailingSlash: false,
});
