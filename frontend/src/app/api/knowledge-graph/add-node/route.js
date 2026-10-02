import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "KNOWLEDGE_GRAPH",
    path: "/p1/knowledgeGraph/graph/addNode",
    methods: ["POST"],
});
