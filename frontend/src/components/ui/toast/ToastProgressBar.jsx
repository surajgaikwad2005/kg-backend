'use client';

import { useEffect, useRef } from 'react';

// rAF-driven countdown (smoother than setInterval). Freezes/resumes from the
// exact frozen point while `isPaused` (hover/blur/drag), and fully restarts
// whenever `resetKey` changes (toast.update() bumping updatedAt, or a
// promise() toast transitioning from its sticky pending state to a timed
// success/error state).
//
// The fill width is written straight to the DOM node via a ref instead of
// React state: rAF already ticks every frame (~16ms), so a setState here
// would re-render the whole ToastItem tree at 60fps per visible toast for
// no visual benefit. It also used to carry a CSS `transition-[width]` on
// top of the rAF loop — two competing animation sources fighting over the
// same property, which visibly lagged the bar behind the real elapsed time
// (most noticeable on short durations, where a ~100ms transition lag is a
// much bigger fraction of the total). Direct, transition-free DOM writes
// keep the visible line exactly in sync with the timer that dismisses the
// toast.
export function ToastProgressBar({ barColor, duration, resetKey, isPaused, onExpire }) {
  const barRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const remainingRef = useRef(duration);
  const pausedRef = useRef(isPaused);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    pausedRef.current = isPaused;
    startRef.current = isPaused ? null : performance.now();
  }, [isPaused]);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (!Number.isFinite(duration)) return undefined;

    remainingRef.current = duration;
    if (barRef.current) barRef.current.style.width = '100%';
    startRef.current = pausedRef.current ? null : performance.now();

    const tick = (now) => {
      if (!pausedRef.current && startRef.current != null) {
        const elapsed = now - startRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        startRef.current = now;
        if (barRef.current) {
          barRef.current.style.width = `${(remainingRef.current / duration) * 100}%`;
        }
        if (remainingRef.current <= 0) {
          onExpireRef.current?.();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, resetKey]);

  if (!Number.isFinite(duration)) return null;

  return (
    <div className="absolute bottom-2 left-3.5 right-3.5 h-0.75 rounded-full bg-border/50 overflow-hidden">
      <div ref={barRef} style={{ width: '100%' }} className={`h-full rounded-full ${barColor}`} />
    </div>
  );
}
