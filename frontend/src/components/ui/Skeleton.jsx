'use client';
import React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * Skeleton — theme-aware loading placeholder.
 *
 * The base tone uses the `surface-2` design token, so it adapts automatically
 * to light / dark / system themes. The shimmer sweep is driven by the
 * `.skeleton-shimmer` utility in globals.css (token-based sheen + reduced-motion
 * fallback). Compose with width/height/rounded classes via `className`.
 *
 * `as` keeps the placeholder valid wherever it is dropped in — e.g. `as="span"`
 * inside a heading or paragraph, where a block-level <div> would not be legal.
 *
 * @param {{ as?: React.ElementType, className?: string, delay?: number }} props
 */
export function Skeleton({ as: Component = 'div', className, delay, style, ...props }) {
  return (
    <Component
      aria-hidden="true"
      className={cn('skeleton-shimmer rounded-md bg-surface-2', className)}
      style={delay != null ? { '--sk-delay': `${delay}s`, ...style } : style}
      {...props}
    />
  );
}
