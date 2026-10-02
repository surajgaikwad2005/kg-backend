/**
 * /api/domain-configuration/pnid/*  →  <DOMAIN_CONFIGURATION>/connectors/pnid/*
 *
 * PNID connector catch-all: upload, connect/cloud, existing-file listing, etc.
 * /jobs/* is handled by the more specific sibling jobs/[...path] route instead
 * (connector-agnostic job polling lives at /connectors/jobs/*, not /connectors/pnid/jobs/*).
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/connectors/pnid",
    trailingSlash: false,
});
