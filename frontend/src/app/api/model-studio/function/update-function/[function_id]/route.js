import { createProxy } from "@/src/app/api/_lib/proxy";

export const { PUT } = createProxy({
    backend: "MODEL_FACTORY",
    path: (params) => `/function/updateFunction/${params.function_id}`,
    methods: ["PUT"],
});
