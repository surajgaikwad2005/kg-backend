/**
 * /api/domain-configuration/sap/tables/*  →  <DOMAIN_CONFIGURATION>/configRouter/sapTables/*
 *
 * SAP extraction table catalog: register/list/delete SAP table definitions.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/configRouter/sapTables",
    trailingSlash: false,
});
