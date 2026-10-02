/**
 * /api/domain-configuration/sap/*  →  <DOMAIN_CONFIGURATION>/connectors/sap/*
 *
 * SAP connector catch-all: upload, connect/cloud, etc. /jobs/* is handled by
 * the more specific sibling jobs/[...path] route instead.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/connectors/sap",
    trailingSlash: false,
});
