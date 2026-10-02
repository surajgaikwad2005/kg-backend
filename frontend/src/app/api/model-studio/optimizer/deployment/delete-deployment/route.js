import { createProxy } from "@/src/app/api/_lib/proxy";

export const { DELETE } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/optimizer/deployment/deleteDeployment",
    methods: ["DELETE"],
});
