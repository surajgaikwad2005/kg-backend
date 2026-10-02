import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "SYMBOLIC_AI",
    path: "/listTables",
    methods: ["GET"],
});
