/**
 * Aivee theme — accent (colour) + size presets so the widget can be reskinned per
 * page without touching component internals.
 *
 * Colour is driven by a single CSS custom property `--aivee-accent` set on each
 * root (launcher + panels) via `accentVars()`. The class fragments in `ACCENT`
 * read that var through color-mix(), so ANY hue works — pass a preset name
 * ('cyan') or a raw colour ('#0ea5e9').
 *
 * IMPORTANT: every entry below is a complete literal class string. Tailwind's
 * JIT scans source for full class names — never build these by interpolation.
 */

export const ACCENT_PRESETS = {
    indigo: '#6366f1',
    violet: '#8b5cf6',
    blue: '#3b82f6',
    sky: '#0ea5e9',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    emerald: '#10b981',
    amber: '#f59e0b',
    orange: '#f97316',
    rose: '#f43f5e',
    pink: '#ec4899',
    slate: '#64748b',
};

/** Resolve a preset name or raw colour (hex/rgb/hsl) to a CSS colour. */
export function resolveAccent(accent) {
    if (!accent) return ACCENT_PRESETS.indigo;
    if (typeof accent === 'string' && /^(#|rgb|hsl)/i.test(accent)) return accent;
    return ACCENT_PRESETS[accent] || ACCENT_PRESETS.indigo;
}

/** Inline style publishing the accent to descendants. Spread onto each root. */
export function accentVars(accent) {
    return { '--aivee-accent': resolveAccent(accent) };
}

/** Accent-driven class fragments. Consume the cascaded `--aivee-accent`. */
export const ACCENT = {
    text: 'text-[var(--aivee-accent)]',
    dot: 'bg-[var(--aivee-accent)]',
    ring: 'border-[color-mix(in_srgb,var(--aivee-accent)_50%,transparent)]',
    ringSoft: 'border-[color-mix(in_srgb,var(--aivee-accent)_40%,transparent)]',
    glow: 'shadow-[0_4px_24px_color-mix(in_srgb,var(--aivee-accent)_38%,transparent)]',
    glowHover: 'hover:shadow-[0_6px_32px_color-mix(in_srgb,var(--aivee-accent)_55%,transparent)]',
    send: 'bg-[var(--aivee-accent)] hover:opacity-90',
    sendOff: 'bg-[color-mix(in_srgb,var(--aivee-accent)_30%,transparent)]',
    focus: 'focus-within:border-[color-mix(in_srgb,var(--aivee-accent)_50%,transparent)]',
    userBubble:
        'border-[color-mix(in_srgb,var(--aivee-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--aivee-accent)_12%,transparent)] text-[color-mix(in_srgb,var(--aivee-accent),black_22%)] dark:text-[color-mix(in_srgb,var(--aivee-accent),white_35%)]',
    typingBubble:
        'border-[color-mix(in_srgb,var(--aivee-accent)_16%,transparent)] bg-[color-mix(in_srgb,var(--aivee-accent)_8%,transparent)]',
    suggestHover:
        'hover:border-[color-mix(in_srgb,var(--aivee-accent)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--aivee-accent)_10%,transparent)]',
    activateHover: 'hover:border-[color-mix(in_srgb,var(--aivee-accent)_55%,transparent)]',
    sessionNew:
        'border-[color-mix(in_srgb,var(--aivee-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--aivee-accent)_8%,transparent)] text-[var(--aivee-accent)] hover:bg-[color-mix(in_srgb,var(--aivee-accent)_15%,transparent)]',
};

/** Docked-card size presets (expanded overlay is large regardless). */
export const SIZES = {
    sm: { docked: 'h-[440px] w-[300px]' },
    md: { docked: 'h-130 w-90' },
    lg: { docked: 'h-[600px] w-[420px]' },
};

export function sizeOf(size) {
    return SIZES[size] || SIZES.md;
}
