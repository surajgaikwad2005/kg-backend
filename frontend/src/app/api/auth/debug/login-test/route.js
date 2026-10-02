import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({ backend: "AUTH", path: "/debug/login-test", methods: ["GET"] });
