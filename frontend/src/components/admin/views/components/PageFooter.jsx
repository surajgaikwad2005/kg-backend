'use client';
import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const PageFooterSlotContext = createContext(null);

/**
 * Wraps the content column of data-source-integration/layout.jsx. Renders the
 * fixed slot DOM node below {children} — a portal target that stays pinned
 * under the scrollable content instead of scrolling away with it. Collapses
 * to nothing (`empty:hidden`) on views that never call <PageFooter> (e.g. the
 * "no processed data yet" empty states), so no bar flashes up when there's
 * nothing to put in it.
 */
export function PageFooterSlotProvider({ children }) {
    const [slotEl, setSlotEl] = useState(null);

    // `children` arrives from the route segment as an ARRAY (the App Router
    // hands a layout its segment children that way), and it sits here as a
    // sibling of the slot div — so React reconciles it as a nested list and
    // warns that every child needs a key. Children.toArray is React's own
    // answer to exactly this: it flattens and stamps a stable key on each
    // child. Rendering `{children}` bare is what produced the runtime
    // "Each child in a list should have a unique key prop" warning attributed
    // to this component.
    return (
        <PageFooterSlotContext.Provider value={slotEl}>
            <div className="flex-1 min-w-0 flex flex-col min-h-0">
                {React.Children.toArray(children)}
                <div
                    ref={setSlotEl}
                    className="sticky bottom-0 z-30 shrink-0 border-t border-border bg-surface px-6 md:px-8 py-4 empty:hidden empty:p-0 empty:border-0"
                />
            </div>
        </PageFooterSlotContext.Provider>
    );
}

/**
 * Teleports its children into the fixed slot above. Each source view wraps
 * its existing bottom action row in this — same JSX, same handlers, it just
 * stops scrolling with the table above it.
 */
export function PageFooter({ children }) {
    const slotEl = useContext(PageFooterSlotContext);
    if (!slotEl) return null;
    return createPortal(children, slotEl);
}
