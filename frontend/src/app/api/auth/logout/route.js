import { NextResponse } from "next/server";

// NOTE: password login (and the refresh_token it minted) has been removed —
// Azure Entra ID is the only login method now, and its session was never
// backed by a backend refresh_token, so there is nothing to hand the
// backend's /logout for server-side invalidation. This route only clears
// the local app cookies. If the AUTH backend later exposes a session/
// access-token-based invalidation endpoint, wire it in here — don't guess
// the request shape without confirming it against that backend's contract.
export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully",
        data: null
    });
    response.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
    response.cookies.set("user_role", "", { httpOnly: true, path: "/", maxAge: 0 });
    response.cookies.set("session_id", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
}
