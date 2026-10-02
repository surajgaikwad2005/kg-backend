'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { useCustomization } from '@/src/context/visuals/CustomizationContext';

import { POSITION_CLASSES } from './constants';
import * as store from './store';
import { ToastItem } from './ToastItem';

// Cards behind the front one still get a "peeking edge" transform up to
// this depth (see ToastItem's peekScale/peekOpacity) — beyond it they've
// already faded to invisible, so there's no point tracking depth further.
const MAX_STACK_PEEK = 3;

/** One corner's toast list — owns the collapsed/expanded stack state for that corner. */
function PositionGroup({ position, items, windowBlurred, stackEnabled }) {
  const [hovered, setHovered] = useState(false);
  const collapsed = stackEnabled && items.length > 1 && !hovered;
  const total = items.length;

  return (
    <div
      role="region"
      aria-label="Notifications"
      onMouseEnter={() => stackEnabled && setHovered(true)}
      onMouseLeave={() => stackEnabled && setHovered(false)}
      className={`fixed z-9999 flex gap-2 w-full max-w-sm ${collapsed ? 'pointer-events-auto' : 'pointer-events-none'} ${POSITION_CLASSES[position]}`}
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => {
          // items are sorted oldest -> newest; the newest is the front card,
          // so depth counts backwards from the end of the array.
          const depth = Math.min(total - 1 - i, MAX_STACK_PEEK);
          const anchorSide = position.startsWith('bottom') ? 'bottom' : 'top';
          return (
            <div
              key={item.id}
              className={collapsed ? 'absolute inset-x-0' : 'relative w-full pointer-events-auto'}
              style={collapsed ? { [anchorSide]: 0 } : undefined}
            >
              <ToastItem
                item={item}
                onDismiss={store.dismissToast}
                windowBlurred={windowBlurred}
                stackDepth={collapsed ? depth : 0}
                stackCollapsed={collapsed}
              />
            </div>
          );
        })}
      </AnimatePresence>

      {collapsed && total > 1 && (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 min-w-4.5 h-4.5 px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-brand/40 z-9999 pointer-events-none"
        >
          {total}
        </span>
      )}
    </div>
  );
}

export function ToastContainer() {
  const [mounted, setMounted] = useState(false);
  const [windowBlurred, setWindowBlurred] = useState(false);
  const byPosition = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const { prefs } = useCustomization();

  // Portal to document.body, gated on mount, same SSR-safety pattern as
  // src/components/ui/Modal.jsx.
  useEffect(() => setMounted(true), []);

  // One shared blur/focus/visibility listener for every toast on the page,
  // instead of one per card.
  useEffect(() => {
    const handleBlur = () => setWindowBlurred(true);
    const handleFocus = () => setWindowBlurred(false);
    const handleVisibility = () => setWindowBlurred(document.hidden);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Only recomputed when the toast set itself changes — not on unrelated
  // re-renders (e.g. windowBlurred flipping) that leave byPosition untouched.
  const activePositions = useMemo(
    () => Object.entries(byPosition).filter(([, items]) => items.length > 0),
    [byPosition]
  );

  if (!mounted) return null;
  if (activePositions.length === 0) return null;

  return createPortal(
    <>
      {activePositions.map(([position, items]) => (
        <PositionGroup
          key={position}
          position={position}
          items={items}
          windowBlurred={windowBlurred}
          stackEnabled={prefs.toastStack}
        />
      ))}
    </>,
    document.body
  );
}
