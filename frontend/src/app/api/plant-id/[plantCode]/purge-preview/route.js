import { createProxy } from "@/src/app/api/_lib/proxy";

// GET → preview cascade-purge impact for a plant (admin only).
// Client path is kebab-case (purge-preview); backend segment is camelCase
// (purgePreview) — same client/backend casing split already used for
// sapTables/columnRenames/userConfig elsewhere in the CDM config domain.
export const { GET } = createProxy({
    backend: "PLANT_CODE_ID",
    path: ({ plantCode }) => `/plants/${plantCode}/purgePreview`,
    methods: ["GET"],
});
