/**
 * /api/domain-configuration/sap/column-renames/*  →  <DOMAIN_CONFIGURATION>/configRouter/columnRenames/*
 *
 * SAP field → canonical column-rename mappings, keyed by source.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/configRouter/columnRenames",
    trailingSlash: false,
});
