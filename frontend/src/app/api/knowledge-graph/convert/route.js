import { NextRequest } from "next/server";
import { runProxy } from "@/src/app/api/_lib/proxy";

/**
 * POST handler to proxy graphConverter requests to the KNOWLEDGE_GRAPH backend.
 * Converts 'plant_code' parameter to 'plant_code_id' as required by the backend API.
 */
export async function POST(req) {
    const url = new URL(req.url);
    const plantCode = url.searchParams.get("plant_code");
    if (plantCode !== null) {
        url.searchParams.set("plant_code_id", plantCode);
        url.searchParams.delete("plant_code");
    }

    const modifiedReq = new NextRequest(url, req);

    return runProxy(modifiedReq, {
        backend: "KNOWLEDGE_GRAPH",
        path: "/p1/knowledgeGraph/graph/graphConverter",
        trailingSlash: false,
    });
}
