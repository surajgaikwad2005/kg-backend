import { createProxy } from "@/src/app/api/_lib/proxy";

// GET  → list all registered plants
// POST → register a new plant (plant_code_id / label / industry)
// path is "/plants" (not "/") — buildUrl() always renders "/" as a trailing
// slash, and this backend 404s on GET .../configRouter/plants/ (verified live).
export const { GET, POST } = createProxy({
    backend: "PLANT_CODE_ID",
    path: "/plants",
    methods: ["GET", "POST"],
});
