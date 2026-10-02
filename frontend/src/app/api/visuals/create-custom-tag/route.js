import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({ backend: "VISUALS", path: "/p1/visuals/createCustomTag" });
