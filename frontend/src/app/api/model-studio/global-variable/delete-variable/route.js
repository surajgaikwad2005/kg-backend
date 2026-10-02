import { createProxy } from "@/src/app/api/_lib/proxy";

export const { DELETE } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/globalVariable/deleteGlobalVariable",
    methods: ["DELETE"],
});