'use client';

/**
 * useTableVirtualizer — spacer-row virtualization for a hand-rolled <table>.
 *
 * `DataTable` covers the tables that are just columns and rows. Some screens
 * cannot use it: the timeseries tag table renders an inline <input> per cell
 * while a row is being edited and pins a sticky Actions column, and that markup
 * does not survive being reduced to a `columns` array. This hook gives those
 * tables the same windowing without asking them to give up their own row JSX.
 *
 * How it works: only the visible slice of rows is mounted, and two zero-content
 * <tr>s reserve the scroll height of everything above and below. Because the
 * spacers are real rows, the element stays a real table — column widths keep
 * auto-sizing together, `position: sticky` headers and columns keep working,
 * and assistive tech still walks rows and cells. (Absolute positioning, the
 * other common approach, breaks all three.)
 *
 * Below `threshold` rows it returns `isVirtual: false` and the caller renders
 * its rows exactly as before — the bookkeeping is not worth it for a short list,
 * and short lists are the common case.
 *
 * Usage:
 *   const scrollRef = useRef(null);
 *   const v = useTableVirtualizer({ rows, scrollRef });
 *   ...
 *   <div ref={scrollRef} className="overflow-auto max-h-[600px]">
 *     <table><tbody>
 *       {v.padTop > 0 && <tr aria-hidden="true" style={{ height: v.padTop }} />}
 *       {v.items.map(({ index }) => renderRow(rows[index], index, v.measureElement))}
 *       {v.padBottom > 0 && <tr aria-hidden="true" style={{ height: v.padBottom }} />}
 *     </tbody></table>
 *   </div>
 *
 * The rendered <tr> must carry `ref={v.measureElement}` and `data-index={index}`
 * so real heights replace the estimate after mount — without both, rows of
 * differing height drift the scroll position.
 */
import { useVirtualizer } from '@tanstack/react-virtual';

/** Below this many rows, render everything — windowing costs more than it saves. */
const DEFAULT_THRESHOLD = 60;

/** Starting guess before any row has been measured. */
const DEFAULT_ROW_HEIGHT = 44;

/** Rows rendered beyond the viewport on each side, so fast scrolling stays filled. */
const OVERSCAN = 10;

export function useTableVirtualizer({
    rows = [],
    scrollRef,
    enabled = true,
    threshold = DEFAULT_THRESHOLD,
    estimateRowHeight = DEFAULT_ROW_HEIGHT,
}) {
    const isVirtual = enabled && rows.length > threshold;

    // Hooks cannot be conditional, so the virtualizer always exists; `count: 0`
    // makes it inert when windowing is off.
    const virtualizer = useVirtualizer({
        count: isVirtual ? rows.length : 0,
        getScrollElement: () => scrollRef?.current ?? null,
        estimateSize: () => estimateRowHeight,
        overscan: OVERSCAN,
    });

    const items = isVirtual ? virtualizer.getVirtualItems() : [];
    const padTop = items.length ? items[0].start : 0;
    const padBottom = items.length
        ? virtualizer.getTotalSize() - items[items.length - 1].end
        : 0;

    return {
        isVirtual,
        items,
        padTop,
        padBottom,
        measureElement: virtualizer.measureElement,
        /** Bring one row into view — e.g. after jumping to a search hit. */
        scrollToIndex: virtualizer.scrollToIndex,
    };
}
