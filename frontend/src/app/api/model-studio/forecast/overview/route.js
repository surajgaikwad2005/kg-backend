import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Forecasting contract: now behind the decisionops-pod2
// gateway (backend "MODEL_FACTORY", see backends.js) instead of the bare
// MODEL_STUDIO host.
export const { GET } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/forecasting/overview/modelFactoryForecastOverview",
    methods: ["GET"],
});
