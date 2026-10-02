import { useReducedMotion } from 'framer-motion';
import { useCustomization } from '@/src/context/visuals/CustomizationContext';

// Mirrors CustomizationContext's MOTION_DURATIONS table (same convention as
// toast/constants.js's MOTION_MS) so these header-dropdown panels
// (ProfileMenu, PlantSwitcher, Select) agree with Settings → Interface →
// Animation speed instead of hardcoding an unrelated scale.
const PANEL_MS = {
    full:    { duration: 0.16, stiffness: 500 },
    reduced: { duration: 0.08, stiffness: 700 },
    off:     { duration: 0,    stiffness: 0 },
};

// Liquid Glass leans on spring physics for its elastic overshoot rather than
// a plain duration, so it gets its own stiffness/damping table per speed.
const LIQUID_SPRING = {
    full:    { stiffness: 320, damping: 22 },
    reduced: { stiffness: 480, damping: 30 },
};

const SNAPPY_DURATION = { full: 0.07, reduced: 0.04 };

// Builds the {initial, animate, exit, transition, sheen} bundle for one
// dropdown-animation style. `sheen` tells the caller whether to render the
// one-shot `.liquid-glass-sheen` overlay (see globals.css) on top of the panel.
function buildPanelMotion(style, effectiveMotion, motionOff, openUp) {
    if (motionOff) {
        return {
            initial: false,
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0 },
            sheen: false,
        };
    }

    const sign = openUp ? 1 : -1;

    if (style === 'liquid-glass') {
        const spring = LIQUID_SPRING[effectiveMotion] ?? LIQUID_SPRING.full;
        return {
            initial: { opacity: 0, scale: 0.82, y: sign * 14, filter: 'blur(10px)' },
            animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
            exit: { opacity: 0, scale: 0.9, y: sign * 8, filter: 'blur(6px)' },
            transition: {
                scale: { type: 'spring', ...spring, mass: 0.9 },
                y: { type: 'spring', ...spring, mass: 0.9 },
                opacity: { duration: 0.16 },
                filter: { duration: 0.22 },
            },
            sheen: true,
        };
    }

    if (style === 'snappy') {
        const duration = SNAPPY_DURATION[effectiveMotion] ?? SNAPPY_DURATION.full;
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration },
            sheen: false,
        };
    }

    // 'smooth' — default
    const { duration } = PANEL_MS[effectiveMotion] ?? PANEL_MS.full;
    return {
        initial: { opacity: 0, scale: 0.95, y: sign * 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: sign * 8 },
        transition: { duration, ease: [0.16, 1, 0.3, 1] },
        sheen: false,
    };
}

/**
 * useMenuMotion — shared entrance/gesture transition for the small
 * absolute/fixed-positioned dropdown panels (ProfileMenu, PlantSwitcher,
 * Select). Respects both Settings → Interface → Animation speed AND the
 * OS-level prefers-reduced-motion setting (the stricter of the two wins),
 * matching ToastItem's effectiveMotion logic — AND layers Settings →
 * Interface → Dropdown Animation Style (smooth / liquid-glass / snappy) on
 * top, so every menu-like panel in the app picks up new styles for free
 * instead of each one hand-rolling its own initial/animate/exit.
 *
 * @param {{openUp?: boolean}} [opts] — pass the live flip direction for
 * panels that can open upward when space runs out (Select); panels that
 * always open downward (ProfileMenu, PlantSwitcher) can omit this.
 */
export function useMenuMotion({ openUp = false } = {}) {
    const { prefs } = useCustomization();
    const osReducedMotion = useReducedMotion();
    const effectiveMotion = osReducedMotion && prefs.motion === 'full' ? 'reduced' : prefs.motion;
    const motionOff = effectiveMotion === 'off';
    const style = prefs.dropdownAnimation || 'smooth';

    const { stiffness } = PANEL_MS[effectiveMotion] ?? PANEL_MS.full;
    const panelMotion = buildPanelMotion(style, effectiveMotion, motionOff, openUp);

    return {
        motionOff,
        dropdownAnimation: style,
        panelMotion,
        tapTransition: motionOff ? { duration: 0 } : { type: 'spring', stiffness, damping: 30 },
    };
}
