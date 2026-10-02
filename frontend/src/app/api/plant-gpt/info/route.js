import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "PLANT_GPT",
    path: "/",
    methods: ["GET"],
    trailingSlash: true,
});
