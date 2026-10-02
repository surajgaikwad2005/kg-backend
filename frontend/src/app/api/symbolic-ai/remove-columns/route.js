import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "SYMBOLIC_AI",
    path: "/removeColumns",
});
