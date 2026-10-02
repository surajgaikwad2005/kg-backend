import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({ backend: "AUTH", path: "/health", methods: ["GET"] });
