/**
 * /api/domain-configuration/connectors/labels  →  <DOMAIN_CONFIGURATION>/connectors/labels
 *
 * The fixed use-case label vocabulary rendered by every connector upload
 * modal, plus which connectors require a label (`required_for` /
 * `not_required_for`) and what the backend suggests per connector
 * (`suggested`). This is the ONLY source of that list — the app used to carry
 * a hardcoded FILE_LABEL_OPTIONS copy in admin.constants.js, which has been
 * removed so the vocabulary can never drift from the backend that validates
 * the `labels` field on /connectors/upload.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/connectors/labels",
    methods: ["GET"],
});
