import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "MODEL_FACTORY",
    path: (params) => `/function/getFunction/${params.function_id}`,
    methods: ["GET"],
});
