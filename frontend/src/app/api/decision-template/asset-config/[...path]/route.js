import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

// Forwards /api/decision-template/asset-config/* → <gateway>/p1/decisionModel/assetconfig/*
// (gateway + /p1/decisionModel lives in backends.js BACKEND_PATHS.DECISION_TEMPLATE;
// this route only supplies the /assetconfig resource segment — confirmed live
// 2026-07-28 against the pasted decision-template API contract table)
export const { GET, POST, PUT, DELETE } = createCatchAllProxy({
    backend: "DECISION_TEMPLATE",
    prefix: "/assetconfig",
    methods: ["GET", "POST", "PUT", "DELETE"],
    trailingSlash: false,
});
