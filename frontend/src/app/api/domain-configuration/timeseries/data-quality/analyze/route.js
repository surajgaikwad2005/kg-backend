import { NextResponse } from "next/server";
import { resolveBackend } from "@/src/app/api/_lib/backends";

const isProd = process.env.NODE_ENV === "production";

function getToken(req) {
    const fromHeader = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (fromHeader) return fromHeader;
    const fromCookie = req.cookies.get("access_token")?.value;
    if (fromCookie) return fromCookie;
    return isProd ? null : "dev-token";
}

export async function GET(req) {
    const label = "[Proxy:DATAQUALITY GET]";
    try {
        const base = resolveBackend("DATAQUALITY");
        const target = `${base}/dataquality/analyze${req.nextUrl.search || ""}`;
        const token = getToken(req);
        const headers = {
            accept: "application/json",
            // Send both auth schemes — see CLAUDE.md "API & Proxy Architecture"
            // rule 3 (this route bypasses _lib/proxy.js's forward(), so it needs
            // its own copy of the same Authorization + Cookie logic).
            ...(token ? { Authorization: `Bearer ${token}`, Cookie: `access_token=${token}` } : {}),
        };
        console.log(`${label} --> ${target}`);
        let res;
        try {
            res = await fetch(target, { method: "GET", headers, cache: "no-store" });
        } catch (err) {
            console.warn(`${label} network error: ${err.message} — returning unavailable`);
            return NextResponse.json({ available: false, quality_score: null }, { status: 200 });
        }
        console.log(`${label} <-- ${res.status}`);
        if (res.ok) {
            const text = await res.text();
            if (!text) return NextResponse.json(null, { status: 200 });
            try { return NextResponse.json(JSON.parse(text)); }
            catch { return new NextResponse(text, { status: 200, headers: { "content-type": "application/json" } }); }
        }
        if (res.status >= 500) {
            console.warn(`${label} backend ${res.status} — data quality service unavailable`);
            return NextResponse.json({ available: false, quality_score: null }, { status: 200 });
        }
        const text = await res.text();
        try { return NextResponse.json(JSON.parse(text), { status: res.status }); }
        catch { return new NextResponse(text, { status: res.status }); }
    } catch (err) {
        console.error(`${label} handler error:`, err);
        return NextResponse.json({ available: false, quality_score: null }, { status: 200 });
    }
}
