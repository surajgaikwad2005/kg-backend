/**
 * Pure rectangle math for the grid designer's drag-to-size selection.
 * A rect is { rowStart, rowEnd, colStart, colEnd } — all inclusive.
 */

function normalizeRect(anchor, cursor) {
    return {
        rowStart: Math.min(anchor.row, cursor.row),
        rowEnd: Math.max(anchor.row, cursor.row),
        colStart: Math.min(anchor.col, cursor.col),
        colEnd: Math.max(anchor.col, cursor.col),
    };
}

function isRectFree(rect, occupiedCells) {
    for (let r = rect.rowStart; r <= rect.rowEnd; r++) {
        for (let c = rect.colStart; c <= rect.colEnd; c++) {
            if (occupiedCells.has(`${r}-${c}`)) return false;
        }
    }
    return true;
}

/**
 * The largest rectangle anchored at `anchor` and reaching toward `cursor`
 * that doesn't cross any already-occupied cell — shrinks one row/col at a
 * time from whichever edge is farthest from the anchor until every cell in
 * the rect is free. The anchor cell itself is always free (a drag can only
 * start on an empty cell), so this always terminates on at least a 1x1 rect.
 */
export function largestFreeRect(anchor, cursor, occupiedCells) {
    let rect = normalizeRect(anchor, cursor);
    while (!isRectFree(rect, occupiedCells)) {
        const rowSpan = rect.rowEnd - rect.rowStart;
        const colSpan = rect.colEnd - rect.colStart;
        if (rect.rowEnd > anchor.row && rowSpan >= colSpan) rect = { ...rect, rowEnd: rect.rowEnd - 1 };
        else if (rect.rowStart < anchor.row && rowSpan >= colSpan) rect = { ...rect, rowStart: rect.rowStart + 1 };
        else if (rect.colEnd > anchor.col) rect = { ...rect, colEnd: rect.colEnd - 1 };
        else if (rect.colStart < anchor.col) rect = { ...rect, colStart: rect.colStart + 1 };
        else break;
    }
    return rect;
}

export function rectContains(rect, row, col) {
    return row >= rect.rowStart && row <= rect.rowEnd && col >= rect.colStart && col <= rect.colEnd;
}
