import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Optimizer contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS). Note: unlike the
// other *List endpoints in this module, the backend doc explicitly states this
// one takes no plant_code_id query param (global listing) — see
// deploymentService.js for how the client still sends it defensively per
// CLAUDE.md Rule 0.
export const { GET } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/optimizer/deployment/deploymentList",
    methods: ["GET"],
});
