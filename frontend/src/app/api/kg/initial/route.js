import { NextResponse } from 'next/server';

// Thin proxy to the SAP PM Knowledge Graph FastAPI service.
// GET /graph/initial — seed graph (starts at FL:BOKOR server-side).
const BASE = process.env.KG_API_BASE_URL || 'http://127.0.0.1:8000';

export async function GET() {
    try {
        const r = await fetch(`${BASE}/graph/initial`, { cache: 'no-store' });
        const body = await r.text();
        return new NextResponse(body, {
            status: r.status,
            headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
        });
    } catch (err) {
        return NextResponse.json(
            { error: 'Knowledge Graph service unreachable', details: err?.message },
            { status: 503 },
        );
    }
}
