import { createProxy } from "@/src/app/api/_lib/proxy";

// Backend returns { success, message, data: { tableName, query, searchQuery, total, markdown } }
export const { POST } = createProxy({
    backend: "SYMBOLIC_AI",
    path: "/findSymbolicAi",
});
