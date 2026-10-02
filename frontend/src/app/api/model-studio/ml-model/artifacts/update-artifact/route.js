import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Artifacts contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS).
export const { PUT } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/mlModel/artifacts/updateArtifact",
    methods: ["PUT"],
});
