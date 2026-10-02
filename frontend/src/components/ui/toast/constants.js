export const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

// bottom-right (not top-center): every page has an in-flow PageHeader
// (h-17, ~68px) at the very top of the content area, and app-wide
// PlantCodeBanner is a fixed full-width strip pinned to top-0 — a
// top-anchored toast at a small inset visually collides with both on
// nearly every screen. The bottom corners sit below all persistent chrome
// (header, banner, sidebar all live top/left), so bottom-right is the
// only corner clear of everything by default.
export const DEFAULT_POSITION = 'bottom-right';
export const DEFAULT_DURATION = 4000;

// Anchor + stacking-direction classes per corner. Top positions stack
// downward (new toast appears below older ones); bottom positions stack
// upward via flex-col-reverse so the newest toast sits closest to the edge
// it's anchored to.
export const POSITION_CLASSES = {
  'top-left': 'top-4 left-4 flex-col items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col items-center',
  'top-right': 'top-4 right-4 flex-col items-end',
  'bottom-left': 'bottom-4 left-4 flex-col-reverse items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
  'bottom-right': 'bottom-4 right-4 flex-col-reverse items-end',
};

// Mirrors CustomizationContext's MOTION_DURATIONS table so JS-side
// framer-motion transitions (seconds) agree with the app's CSS --duration-*
// vars (ms) instead of inventing an unrelated scale.
export const MOTION_MS = {
  full: { enter: 0.3, exit: 0.15 },
  reduced: { enter: 0.15, exit: 0.1 },
  off: { enter: 0, exit: 0 },
};

// Swipe-to-dismiss heuristic: exceed either threshold to dismiss on drag release.
export const DRAG_DISMISS_OFFSET = 80; // px
export const DRAG_DISMISS_VELOCITY = 500; // px/s
