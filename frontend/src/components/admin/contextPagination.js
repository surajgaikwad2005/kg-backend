/**
 * contextPagination.js
 * Reads the `pagination` envelope that GET /context/get returns alongside
 * `rows`, and answers one question: is the user looking at ALL of this
 * connector's rows, or only the first page?
 *
 * Why this exists
 * ---------------
 * `getContext()` requests a single large page (page 1, page_size 500) because no
 * review screen implements server-driven pagination yet — see its doc comment in
 * services/domain-configuration/common/contextService.js. That is a survivable
 * limitation ONLY while the user can tell it is happening. Until now the
 * `pagination` block was parsed and thrown away, so a plant with 50,000
 * timeseries tags rendered its first 500 in a table captioned "Tag Mapping"
 * with no indication anything was missing. An engineer would review those 500,
 * press Commit, and have no way to know the other 49,500 were never shown —
 * a silent data-integrity failure, not a slow screen.
 *
 * Surfacing `has_more` does not fix the truncation; it makes it visible, which
 * is the part that has to land before anyone trusts a commit. Wiring real
 * server-side pagination (useInfiniteQuery against `next_cursor`) is the actual
 * fix and is tracked separately.
 *
 * The backend's shape (confirmed, api-data/cdm-flow-state.json):
 *   pagination: { page, page_size, total_items, total_pages, has_more, next_cursor }
 * Older/other endpoints may omit it entirely, so every field is optional here
 * and absence is treated as "nothing to warn about" rather than as an error.
 */

/**
 * @param {object} data  the unwrapped GET /context/get payload ({ rows, pagination, ... })
 * @param {Array} [displayedRows]  the array the screen ACTUALLY renders, when it
 *   isn't `data.rows` — P&ID reads its rows out of `equipment_connectivity`, so
 *   counting `data.rows` there would report 0 shown against a real total.
 * @returns {{ isTruncated: boolean, shown: number, total: number|null, totalPages: number|null }}
 */
export function deriveContextTruncation(data, displayedRows) {
    const source = displayedRows ?? data?.rows;
    const rows = Array.isArray(source) ? source : [];
    const pagination = data?.pagination;

    const shown = rows.length;
    const total = Number.isFinite(Number(pagination?.total_items))
        ? Number(pagination.total_items)
        : null;
    const totalPages = Number.isFinite(Number(pagination?.total_pages))
        ? Number(pagination.total_pages)
        : null;

    // `has_more` is authoritative when present. Without it, fall back to
    // comparing what we hold against the declared total — a backend that reports
    // total_items but not has_more still gives us enough to be honest.
    const hasMore = pagination?.has_more != null
        ? Boolean(pagination.has_more)
        : (total != null && shown < total);

    return {
        isTruncated: Boolean(hasMore) && shown > 0,
        shown,
        total,
        totalPages,
    };
}

/** Nothing loaded / no pagination block — the shape consumers can render against. */
export const NO_TRUNCATION = Object.freeze({
    isTruncated: false,
    shown: 0,
    total: null,
    totalPages: null,
});
