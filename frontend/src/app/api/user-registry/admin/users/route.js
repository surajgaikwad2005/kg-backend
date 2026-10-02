import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET, DELETE } = createProxy({ backend: "USER_REGISTRY", path: "/admin/users", methods: ["GET", "DELETE"] });
