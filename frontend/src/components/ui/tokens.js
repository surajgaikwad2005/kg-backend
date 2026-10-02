/* ─── Design tokens ───────────────────────────────────────────────────────────
 * Use these in inline style={{ }} props, Canvas APIs, SVG fills, and any
 * context where Tailwind classes cannot be applied.
 *
 * For component styling prefer the Tailwind semantic utilities generated from
 * globals.css @theme:
 *   bg-surface, bg-canvas, bg-surface-2
 *   text-text-primary, text-text-secondary, text-text-muted, text-text-subtle
 *   border-border, border-border-strong
 *   bg-brand, text-brand, bg-brand-muted
 *
 * Status colors (success/warning/danger/info) are kept as static hex here
 * because they do not change between light and dark mode.
 * ─────────────────────────────────────────────────────────────────────────── */
export const C = {
  /* Surfaces — reference CSS custom properties so values auto-switch with theme */
  inkNavy:  'var(--do-text-1)',
  ink2:     'var(--do-text-2)',
  canvas:   'var(--do-canvas)',
  surface:  'var(--do-surface)',
  surface2: 'var(--do-surface-2)',
  divider:  'var(--do-surface-2)',

  /* Text */
  slate:  'var(--do-text-3)',
  slate2: 'var(--do-text-4)',
  slate3: 'var(--do-border-2)',

  /* Brand */
  accent:  'var(--do-brand)',
  blue700: 'var(--do-brand-hover)',

  /* Border */
  border:  'var(--do-border)',
  border2: 'var(--do-border-2)',

  /* Status (static — same in light and dark) */
  success:   '#10b981',
  successBg: 'rgba(16,185,129,0.12)',
  danger:    '#f43f5e',
  dangerBg:  'rgba(244,63,94,0.10)',
  warning:   '#f59e0b',
  warningBg: 'rgba(245,158,11,0.12)',
  info:      '#0ea5e9',
  infoBg:    'rgba(14,165,233,0.12)',

  /* Typography */
  fontSans: 'var(--font-sans)',
  fontMono: 'var(--font-mono)',
};
