import { createProxy } from "@/src/app/api/_lib/proxy";

export const { DELETE } = createProxy({
    backend: "MODEL_FACTORY",
    path: () => `/function/deleteFunction`,
    methods: ["DELETE"],
});
