import { createProxy } from "@/src/app/api/_lib/proxy";

// Returns an SSE / event-stream — the proxy core streams non-JSON bodies through unchanged.
export const { POST } = createProxy({ backend: "DOMAIN_CONFIGURATION", path: "/suggest" });
