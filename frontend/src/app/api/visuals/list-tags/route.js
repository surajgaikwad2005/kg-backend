import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST } = createProxy({
    backend: "VISUALS",
    path: "/p1/visuals/tags",
    methods: ["GET", "POST"]
});

