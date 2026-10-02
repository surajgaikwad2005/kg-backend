/**
 * /api/domain-configuration/ontology/*  →  <DOMAIN_CONFIGURATION>/ontology/*
 *
 * Knowledge-graph ontology: populate/export/schema/use-cases. Shared across
 * every connector (not owned by one), so it stays its own top-level folder.
 * Only /populate is exercised today; the catch-all is kept for parity with
 * the rest of the ontology router.
 */
import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/ontology",
    trailingSlash: false,
});
