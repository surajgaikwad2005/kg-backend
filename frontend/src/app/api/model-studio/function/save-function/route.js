import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/function/saveFunction",
    methods: ["POST"],
});
