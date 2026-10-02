/**
 * /api/log-management/*  →  <DOMAIN_CONFIGURATION>/logs/*
 *
 * CDM logs router — list servable log files, tail one, activity feed, events,
 * summary. Cross-cutting observability feature with its own top-level admin
 * page (/admin/log-management, sibling of /admin/domain-configuration), so it
 * gets its own top-level API folder too — not nested under
 * domain-configuration/, same convention as user-registry/ and
 * group-management/.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/logs",
    trailingSlash: false,
});