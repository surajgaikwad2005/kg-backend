import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({ backend: "DOMAIN_CONFIGURATION", path: "/generate_job_status" });
