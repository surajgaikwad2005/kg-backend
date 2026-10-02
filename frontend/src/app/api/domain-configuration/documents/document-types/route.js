/**
 * /api/domain-configuration/documents/document-types  →  <DOMAIN_CONFIGURATION>/configRouter/documentTypes
 *
 * Document-type catalog + default extraction fields for the upload modal.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/configRouter/documentTypes",
    methods: ["GET"],
});
