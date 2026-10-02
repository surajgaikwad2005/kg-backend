const PREFIX = 'file_store_';

/**
 * Persist file metadata (name, size, type) only — never reads file bytes.
 * A File object is an OS handle; loading it into memory just to write to
 * localStorage causes OOM on large files and always fails for files > ~5 MB
 * anyway (localStorage quota). This function is safe for files of any size.
 */
export async function persistFiles(key, files) {
    if (typeof window === 'undefined') return;
    try {
        if (!files?.length) {
            localStorage.removeItem(PREFIX + key);
            return;
        }
        const meta = Array.from(files).map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            lastModified: f.lastModified,
            docType: f.docType ?? null,
        }));
        localStorage.setItem(PREFIX + key, JSON.stringify(meta));
    } catch { /* quota exceeded — silently skip */ }
}

/**
 * File objects cannot survive a page refresh — the browser revokes access for
 * security. Clear any stale data and return an empty array so callers start
 * fresh. Users must re-select files after a refresh (standard browser behaviour).
 */
export function loadPersistedFiles(key) {
    if (typeof window === 'undefined') return [];
    try { localStorage.removeItem(PREFIX + key); } catch {}
    return [];
}
