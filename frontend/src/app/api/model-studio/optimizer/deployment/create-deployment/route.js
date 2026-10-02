import { createProxy } from "@/src/app/api/_lib/proxy";

// Refactored ModelFactory Optimizer contract (decisionops-pod2 gateway,
// backend "MODEL_FACTORY" — see backends.js BACKEND_PATHS). The source doc's
// pasted URL for this one endpoint was ".../p2/modelFactoryoptimizer/deployment/
// createDeployment" (missing slash before "optimizer") while all 4 sibling
// deployment endpoints use ".../p2/modelFactory/optimizer/deployment/..." —
// treated as a copy-paste typo and confirmed with the user; using the
// consistent path below.
export const { POST } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/optimizer/deployment/createDeployment",
});
