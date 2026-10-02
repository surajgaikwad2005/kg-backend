/** Validate feature — pure helpers (no JSX). */

/** Remove duplicate / empty connections, keyed by from➔to (case-insensitive). */
export function deDuplicate(conns) {
    const seen = new Set();
    return conns.filter((c) => {
        const k = `${(c.from || '').trim().toLowerCase()}➔${(c.to || '').trim().toLowerCase()}`;
        if (!c.from && !c.to) return false;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

/** Infer a KG entity label from a tag prefix. */
export function kgNodeLabel(node) {
    const c = node.trim().toUpperCase();
    if (c.startsWith('P')) return 'Pump';
    if (c.startsWith('V')) return 'Vessel';
    if (c.startsWith('E') || c.startsWith('HX')) return 'Exchanger';
    if (c.startsWith('T')) return 'Tank';
    return 'Equipment';
}

/**
 * Pick the bbox whose centre falls inside the filter region (canvas space);
 * falls back to the first bbox. Returns a (bboxes, filter) picker bound to scale.
 */
export function makePickBbox(scaleX, scaleY) {
    return (bboxes, filter) => {
        if (!filter || bboxes.length === 0) return bboxes[0] || null;
        return (
            bboxes.find(([bx1, by1, bx2, by2]) => {
                const cx = ((bx1 + bx2) / 2) * scaleX;
                const cy = ((by1 + by2) / 2) * scaleY;
                return cx >= filter.x1 && cx <= filter.x2 && cy >= filter.y1 && cy <= filter.y2;
            }) || bboxes[0] || null
        );
    };
}

/** Resolve the baseline image dimensions used to scale highlight bboxes. */
export function baseDimensions(hlData) {
    return {
        width: hlData.pdf_size?.width || hlData.image_size.width / 3,
        height: hlData.pdf_size?.height || hlData.image_size.height / 3,
    };
}
