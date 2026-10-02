import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({ backend: "USER_REGISTRY", path: "/signup" });
