import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/optimizer/deployment/getDeploymentDetail",
    methods: ["GET"],
});
