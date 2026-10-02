import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Pipeline contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS).
export const { DELETE } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/mlModel/pipeline/deletePipeline",
    methods: ["DELETE"],
});
