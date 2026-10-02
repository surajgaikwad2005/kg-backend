import { createProxy } from "@/src/app/api/_lib/proxy";

export const { DELETE, POST } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/globalVariable/delete",
    methods: ["DELETE", "POST"],
});
