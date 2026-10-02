import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Forecasting Experiment contract (decisionops-pod2
// gateway, backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS).
export const { PUT } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/forecasting/experiment/updateExperiment",
    methods: ["PUT"],
});
