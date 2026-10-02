import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Model Registry contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS). Shared by
// src/services/model-studio/shared/assetService.js.
export const { GET } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/mlModel/modelRegistry/assetList",
    methods: ["GET"],
});
