import { createProxy } from "@/src/app/api/_lib/proxy";

export const { PUT } = createProxy({
    backend: "MODEL_FACTORY",
    path: "/mlModel/pipeline/updatePipeline",
    methods: ["PUT"],
});
