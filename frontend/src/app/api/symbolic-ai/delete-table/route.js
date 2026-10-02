import { createProxy } from "@/src/app/api/_lib/proxy";

export const { DELETE } = createProxy({
    backend: "SYMBOLIC_AI",
    path: "/deleteTable",
    methods: ["DELETE"],
});
