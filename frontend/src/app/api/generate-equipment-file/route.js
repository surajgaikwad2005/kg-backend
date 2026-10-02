import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({ backend: "DOMAIN_CONFIGURATION", path: "/generate_file" });
