import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Experiment contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS). New endpoint —
// backs the Experiment modal's live Primary Metric dropdown.
export const { GET } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/mlModel/experiment/metricOptions",
    methods: ["GET"],
});
