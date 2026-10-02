import { NextRequest } from "next/server";
import { runProxy } from "@/src/app/api/_lib/proxy";



// ?node=... is forwarded automatically via the incoming query string.
// We map incoming query param 'plant_code' to 'plant_code_id' as required by the backend API.
export async function GET(req) {
    const url = new URL(req.url);
    const plantCode = url.searchParams.get("plant_code");
    if (plantCode !== null) {
        url.searchParams.set("plant_code_id", plantCode);
        url.searchParams.delete("plant_code");
    }

    const modifiedReq = new NextRequest(url, req);

    return runProxy(modifiedReq, {
        backend: "KNOWLEDGE_GRAPH",
        path: "/p1/knowledgeGraph/graph/kgExplore",
        trailingSlash: false,
    });
}
