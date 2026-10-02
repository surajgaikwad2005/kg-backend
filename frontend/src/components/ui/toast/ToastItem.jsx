'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

import { useCustomization } from '@/src/context/visuals/CustomizationContext';
import { cn } from '@/src/lib/utils';

import { DRAG_DISMISS_OFFSET, DRAG_DISMISS_VELOCITY, MOTION_MS } from './constants';
import { getToastTheme, ToastIcon } from './ToastIcon';
import { ToastProgressBar } from './ToastProgressBar';

// Base z-index for a card in a collapsed stack — kept comfortably above the
// front card's own auto stacking so peeking cards (base - depth) can never
// out-rank it. Each toast's transform creates its own stacking context, so
// every card in the stack needs an explicit value here; leaving the front
// card (depth 0) at z-index:auto let the peeking cards behind it (which do
// set one) paint on top, producing overlapping/double text.
const STACK_Z_BASE = 20;

// Settings → Notifications → Animation style. Each variant only defines the
// entrance (`initial`) shape and easing curves — the resting `animate`
// target is always the fully-settled state (or the stack "peek" transform,
// see isPeeking below), so styles stay orthogonal to stacking.
const ANIMATION_VARIANTS = {
  slide: {
    initial: (enterY) => ({ opacity: 0, y: enterY, scale: 0.97 }),
    exit: (enterY) => ({ opacity: 0, y: enterY, scale: 0.96 }),
    enterEase: [0.34, 1.56, 0.64, 1],
    exitEase: [0.4, 0, 1, 1],
  },
  fade: {
    initial: () => ({ opacity: 0 }),
    exit: () => ({ opacity: 0 }),
    enterEase: [0.4, 0, 0.2, 1],
    exitEase: [0.4, 0, 1, 1],
  },
  pop: {
    initial: () => ({ opacity: 0, scale: 0.8 }),
    exit: () => ({ opacity: 0, scale: 0.85 }),
    enterEase: [0.34, 1.56, 0.64, 1],
    exitEase: [0.4, 0, 1, 1],
  },
};

export function ToastItem({ item, onDismiss, windowBlurred, stackDepth = 0, stackCollapsed = false }) {
  const { id, type, title, description, content, duration, icon, action, position, draggable, updatedAt } = item;
  const { prefs } = useCustomization();
  const osReducedMotion = useReducedMotion();
  // The stricter of the app's own motion setting and the OS-level preference wins —
  // closes a gap where neither Modal.jsx nor the old Toast.jsx checked the OS setting at all.
  const effectiveMotion = osReducedMotion && prefs.motion === 'full' ? 'reduced' : prefs.motion;
  const motionOff = effectiveMotion === 'off';
  const motionMs = MOTION_MS[effectiveMotion] ?? MOTION_MS.full;
  const anim = ANIMATION_VARIANTS[prefs.toastAnimation] ?? ANIMATION_VARIANTS.slide;

  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Hover, keyboard-focus-within, window-blur and mid-drag all freeze the
  // countdown the same way — one derived boolean instead of juggling three.
  const isPaused = isHovered || isFocusWithin || windowBlurred || isDragging;

  const theme = getToastTheme(type);
  const isCenter = Boolean(position?.includes('center'));
  // A card peeking behind the collapsed stack isn't the one the user is
  // interacting with — no drag-to-dismiss for it (only the front card).
  const isPeeking = stackCollapsed && stackDepth > 0;
  const canDrag = draggable !== false && !motionOff && !isPeeking;
  const enterY = position?.startsWith('top') ? -12 : 12;

  // Resting position: normally fully settled (opacity 1 / y 0 / scale 1).
  // While peeking behind the front card, it's a small offset + shrink +
  // fade per depth instead — capped so cards past ~depth 3 fully vanish
  // (still mounted, so their own dismiss timer keeps running underneath).
  const peekScale = Math.max(0.88, 1 - stackDepth * 0.045);
  const peekOpacity = Math.max(0, 1 - stackDepth * 0.35);
  const peekOffset = stackDepth * (position?.startsWith('bottom') ? -10 : 10);
  const restingAnimate = isPeeking
    ? { opacity: peekOpacity, y: peekOffset, scale: peekScale }
    : { opacity: 1, y: 0, scale: 1 };

  const handleDragEnd = (_event, info) => {
    setIsDragging(false);
    const offsetMag = isCenter
      ? Math.max(Math.abs(info.offset.x), Math.abs(info.offset.y))
      : Math.abs(info.offset.x);
    const velocityMag = isCenter
      ? Math.max(Math.abs(info.velocity.x), Math.abs(info.velocity.y))
      : Math.abs(info.velocity.x);
    if (offsetMag > DRAG_DISMISS_OFFSET || velocityMag > DRAG_DISMISS_VELOCITY) {
      onDismiss(id);
    }
  };

  // Escape only dismisses a toast the user is actually interacting with
  // (hovered or focus-within) — with several toasts open, a global listener
  // couldn't tell which one the user meant to close.
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && (isHovered || isFocusWithin)) {
      onDismiss(id);
    }
  };

  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <motion.div
      layout={!motionOff && !isDragging}
      data-toast-id={id}
      role={role}
      aria-live={ariaLive}
      aria-busy={type === 'loading' || undefined}
      drag={canDrag ? (isCenter ? true : 'x') : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={anim.initial(enterY)}
      animate={restingAnimate}
      exit={{ ...anim.exit(enterY), transition: { duration: motionMs.exit, ease: anim.exitEase } }}
      transition={{ duration: motionMs.enter, ease: anim.enterEase }}
      style={stackCollapsed ? { zIndex: STACK_Z_BASE - Math.min(stackDepth, 9) } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={() => setIsFocusWithin(false)}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex flex-col w-full max-w-sm overflow-hidden rounded-2xl border border-border/40',
        'bg-surface/80 backdrop-blur-2xl shadow-toast p-3.5 pb-4 group',
        isPeeking ? 'pointer-events-none' : canDrag && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <div className="flex gap-3 items-center pr-5">
        <ToastIcon type={type} icon={icon} />
        <div className="flex-1 space-y-0.5 min-w-0">
          {content ? (
            content
          ) : (
            <>
              {title && (
                <h4 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h4>
              )}
              {description && (
                <p className="text-label text-text-subtle leading-snug font-medium">{description}</p>
              )}
            </>
          )}
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick?.();
                if (action.dismissOnClick !== false) onDismiss(id);
              }}
              className="mt-1.5 text-label font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="absolute top-2.5 right-2.5 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-2 opacity-40 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-250 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <ToastProgressBar
        barColor={theme.bar}
        duration={duration}
        resetKey={updatedAt}
        isPaused={isPaused}
        onExpire={() => onDismiss(id)}
      />
    </motion.div>
  );
}
