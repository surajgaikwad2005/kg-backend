import { createProxy } from "@/src/app/api/_lib/proxy";

export const { PUT } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/optimizer/modifyObjectiveFunction",
    methods: ["PUT"],
});
