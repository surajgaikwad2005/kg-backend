import { cookies, headers } from "next/headers";
/**
 * Dynamically resolves the best available Bearer token and merges it into headers.
 * Falls back to "dev-token" if no token is found in the current request context.
 */
export async function getAuthHeaders(customHeaders = {}) {
    let token = null;
    try {
        const cookieStore = await cookies();
        token = cookieStore.get("access_token")?.value;
    }
    catch (e) {
        // cookies() might throw if called outside of a request context
    }
    if (!token) {
        try {
            const headersList = await headers();
            token = headersList.get("Authorization")?.replace("Bearer ", "");
        }
        catch (e) {
            // headers() might throw if called outside of a request context
        }
    }
    const merged = { ...customHeaders };
    // Normalize key casing to avoid duplicate Authorization headers
    const existingKey = Object.keys(merged).find(k => k.toLowerCase() === "authorization");
    const authVal = `Bearer ${token || "dev-token"}`;
    if (existingKey) {
        merged[existingKey] = authVal;
    }
    else {
        merged["Authorization"] = authVal;
    }
    return merged;
}
