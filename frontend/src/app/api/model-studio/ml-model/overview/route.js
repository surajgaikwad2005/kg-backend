import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Overview contract: now behind the decisionops-pod2
// gateway (backend "MODEL_FACTORY", see backends.js) instead of the bare
// MODEL_STUDIO host — literal URL confirmed by the backend team.
export const { GET } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/mlModel/overview/getModelfactoryOverview",
    methods: ["GET"],
});
