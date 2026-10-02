import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

// Forwards /api/decision-template/* → <gateway>/p1/decisionModel/decisionworkflow/*
// (gateway + /p1/decisionModel lives in backends.js BACKEND_PATHS.DECISION_TEMPLATE;
// this route only supplies the /decisionworkflow resource segment — confirmed live
// 2026-07-15 against http://172.16.0.12/api/decisionops-pod2/openapi.json)
export const { GET, POST, PUT, DELETE } = createCatchAllProxy({
    backend: "DECISION_TEMPLATE",
    prefix: "/decisionworkflow",
    methods: ["GET", "POST", "PUT", "DELETE"],
    trailingSlash: false,
});
