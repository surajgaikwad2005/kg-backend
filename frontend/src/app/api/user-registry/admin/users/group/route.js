import { createProxy } from "@/src/app/api/_lib/proxy";

export const { PUT } = createProxy({ backend: "USER_REGISTRY", path: "/admin/users/group", methods: ["PUT"] });
