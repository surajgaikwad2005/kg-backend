import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Optimizer contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS). Nested under
// optimizer/ (not the sibling model-studio/experiment/ folder) since that one
// backs the ml-model mlModel/experiment contract — same leaf names, different
// upstream paths.
export const { POST } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/optimizer/createExperiment",
});
