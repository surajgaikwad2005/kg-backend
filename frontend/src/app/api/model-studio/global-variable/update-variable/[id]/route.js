import { createProxy } from "@/src/app/api/_lib/proxy";

export const { PUT, POST } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/globalVariable/modify",
    methods: ["PUT", "POST"],
});
