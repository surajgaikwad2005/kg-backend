import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Experiment contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS). New endpoint —
// starts the background training run for an already-created experiment.
export const { POST } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/mlModel/experiment/runTrainingContainer",
});
