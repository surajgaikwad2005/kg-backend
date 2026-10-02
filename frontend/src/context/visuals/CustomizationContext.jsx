'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from './ThemeContext';
import { GEOMETRY_OPTIONS, FONT_SCALE_OPTIONS, LINE_HEIGHT_OPTIONS, LETTER_SPACING_OPTIONS } from '@/src/config/theme.registry';

export { GEOMETRY_OPTIONS, FONT_SCALE_OPTIONS, LINE_HEIGHT_OPTIONS, LETTER_SPACING_OPTIONS };

// ─── Accent Palette ──────────────────────────────────────────────────────────

export const ACCENT_PALETTES = {
  blue: {
    id: 'blue',
    label: 'Ocean Blue',
    swatch: '#2563eb',
    light: { brand: '#2563eb', hover: '#1d4ed8', muted: '#eff6ff' },
    dark:  { brand: '#3b82f6', hover: '#2563eb', muted: '#172554' },
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    swatch: '#7c3aed',
    light: { brand: '#7c3aed', hover: '#6d28d9', muted: '#f5f3ff' },
    dark:  { brand: '#8b5cf6', hover: '#7c3aed', muted: '#2e1065' },
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    swatch: '#059669',
    light: { brand: '#059669', hover: '#047857', muted: '#ecfdf5' },
    dark:  { brand: '#10b981', hover: '#059669', muted: '#022c22' },
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    swatch: '#e11d48',
    light: { brand: '#e11d48', hover: '#be123c', muted: '#fff1f2' },
    dark:  { brand: '#f43f5e', hover: '#e11d48', muted: '#4c0519' },
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    swatch: '#d97706',
    light: { brand: '#d97706', hover: '#b45309', muted: '#fffbeb' },
    dark:  { brand: '#f59e0b', hover: '#d97706', muted: '#451a03' },
  },
  cyan: {
    id: 'cyan',
    label: 'Cyan',
    swatch: '#0891b2',
    light: { brand: '#0891b2', hover: '#0e7490', muted: '#ecfeff' },
    dark:  { brand: '#06b6d4', hover: '#0891b2', muted: '#083344' },
  },
};

// ─── Font Options ─────────────────────────────────────────────────────────────

export const FONT_OPTIONS = [
  {
    id: 'helvetica',
    label: 'Helvetica / Arial',
    description: 'Default · Classic neutral sans-serif',
    stack: 'var(--font-helvetica)',
    preview: 'The quick brown fox',
  },
  {
    id: 'jakarta',
    label: 'Plus Jakarta Sans',
    description: 'Modern humanist',
    stack: 'var(--font-jakarta)',
    preview: 'The quick brown fox',
  },
  {
    id: 'inter',
    label: 'Inter',
    description: 'Clean · Neutral system',
    stack: 'var(--font-inter)',
    preview: 'The quick brown fox',
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    description: 'Geometric · Friendly',
    stack: 'var(--font-dm-sans)',
    preview: 'The quick brown fox',
  },
  {
    id: 'manrope',
    label: 'Manrope',
    description: 'Geometric · Distinct headlines',
    stack: 'var(--font-manrope)',
    preview: 'The quick brown fox',
  },
  {
    id: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    description: 'Technical · Engineering-grade',
    stack: 'var(--font-ibm-plex-sans)',
    preview: 'The quick brown fox',
  },
  {
    id: 'sora',
    label: 'Sora',
    description: 'Distinctive · Premium SaaS',
    stack: 'var(--font-sora)',
    preview: 'The quick brown fox',
  },
];

// ─── Density Options ──────────────────────────────────────────────────────────

export const DENSITY_OPTIONS = [
  { id: 'compact',     label: 'Compact',     description: 'Tighter spacing, more content' },
  { id: 'normal',      label: 'Normal',       description: 'Balanced default layout' },
  { id: 'comfortable', label: 'Comfortable',  description: 'More breathing room' },
];

// ─── Motion Options ───────────────────────────────────────────────────────────

export const MOTION_OPTIONS = [
  { id: 'full',    label: 'Full',    description: 'All animations enabled' },
  { id: 'reduced', label: 'Reduced', description: 'Subtle, shorter transitions' },
  { id: 'off',     label: 'Off',     description: 'No animations' },
];

// ─── Dropdown Animation Style ─────────────────────────────────────────────────
// A STYLE choice (not a speed) for every menu-like floating panel that uses
// the shared useMenuMotion hook (Select, ProfileMenu, PlantSwitcher) — layered
// on top of Animation Speed above, which still governs how long each style's
// transition takes (or disables motion entirely when set to 'off').

export const DROPDOWN_ANIMATION_OPTIONS = [
  { id: 'smooth',       label: 'Smooth',       description: 'Clean fade + scale (default)' },
  { id: 'liquid-glass', label: 'Liquid Glass', description: 'Apple-style elastic spring, blur-in, specular sheen' },
  { id: 'snappy',       label: 'Snappy',       description: 'Near-instant fade — minimal motion' },
];

// ─── Toast/Notification Duration Options ───────────────────────────────────────
// `ms` is the actual auto-dismiss duration the toast system reads (see
// src/components/ui/toast/ToastProvider.jsx, which pushes the selected
// option's `ms` into the toast store as the new default for every toast that
// doesn't explicitly request its own duration).

export const TOAST_DURATION_OPTIONS = [
  { id: 'short',  label: 'Short',  description: '2 seconds', ms: 2000 },
  { id: 'normal', label: 'Normal', description: '4 seconds', ms: 4000 },
  { id: 'long',   label: 'Long',   description: '6 seconds', ms: 6000 },
];

// ─── Toast/Notification Animation Options ──────────────────────────────────────
// Consumed by ToastItem.jsx to pick the entrance/exit motion variant.

export const TOAST_ANIMATION_OPTIONS = [
  { id: 'slide', label: 'Slide', description: 'Slides in from the edge' },
  { id: 'fade',  label: 'Fade',  description: 'Simple crossfade, no motion' },
  { id: 'pop',   label: 'Pop',   description: 'Scales in with a gentle bounce' },
];

// ─── Profile Menu Display ─────────────────────────────────────────────────────
// Controls the header ProfileMenu trigger only (PageHeader top-right corner) —
// the opened dropdown panel always renders at full size regardless of this.

export const PROFILE_DISPLAY_OPTIONS = [
  { id: 'compact',  label: 'Compact',  description: 'Avatar only — saves header space' },
  { id: 'expanded', label: 'Expanded', description: 'Avatar with name & role visible' },
];

// ─── Blur & Glass Intensity ───────────────────────────────────────────────────
// A 0–150 scale multiplier (see applyPrefs) applied to Tailwind's own
// --blur-* theme tokens in globals.css — every backdrop-blur-*/blur-* utility
// in the app references those tokens, so this single value controls glass
// panels AND soft blur glows app-wide from one source of truth. Presets are
// quick-select shortcuts on top of the continuous slider, not separate modes.

export const BLUR_PRESETS = [
  { id: 'off',      label: 'Off',      value: 0 },
  { id: 'subtle',   label: 'Subtle',   value: 50 },
  { id: 'standard', label: 'Standard', value: 100 },
  { id: 'max',      label: 'Max',      value: 150 },
];

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PREFS = {
  accent: 'blue',
  fontId: 'helvetica',
  density: 'normal',
  motion: 'full',
  dropdownAnimation: 'smooth',
  blurIntensity: 100,
  geometry: 'standard',
  fontScale: 'md',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  tabularNumbers: false,
  industrialBackground: true,
  profileDisplay: 'expanded',
  toastEnabled: true,
  toastPosition: 'bottom-right',
  toastDuration: 'normal',
  toastAnimation: 'slide',
  toastStack: false,
};

const STORAGE_KEY = 'do-customization-v1';

const MOTION_DURATIONS = {
  full:    { fast: '150ms', base: '300ms', slow: '500ms', slower: '700ms' },
  reduced: { fast: '75ms',  base: '150ms', slow: '250ms', slower: '350ms' },
  off:     { fast: '0ms',   base: '0ms',   slow: '0ms',   slower: '0ms'   },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CustomizationContext = createContext({
  prefs: DEFAULT_PREFS,
  updatePref: () => {},
  resetPrefs: () => {},
  ACCENT_PALETTES,
  FONT_OPTIONS,
  DENSITY_OPTIONS,
  MOTION_OPTIONS,
  DROPDOWN_ANIMATION_OPTIONS,
  GEOMETRY_OPTIONS,
  FONT_SCALE_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  LETTER_SPACING_OPTIONS,
  PROFILE_DISPLAY_OPTIONS,
  TOAST_DURATION_OPTIONS,
  TOAST_ANIMATION_OPTIONS,
  BLUR_PRESETS,
});

// ─── Apply prefs to DOM ───────────────────────────────────────────────────────

function applyPrefs(prefs, isDark) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Accent color
  const palette = ACCENT_PALETTES[prefs.accent] ?? ACCENT_PALETTES.blue;
  const colors = isDark ? palette.dark : palette.light;
  root.style.setProperty('--do-brand',       colors.brand);
  root.style.setProperty('--do-brand-hover', colors.hover);
  root.style.setProperty('--do-brand-muted', colors.muted);

  // Font family — CSS var is defined by next/font on body; override --font-sans
  const font = FONT_OPTIONS.find(f => f.id === prefs.fontId) ?? FONT_OPTIONS[0];
  root.style.setProperty('--font-sans', font.stack);

  // Density via data attribute (CSS selectors respond)
  root.setAttribute('data-density', prefs.density);

  // Motion — override Tailwind @theme duration vars
  const durations = MOTION_DURATIONS[prefs.motion] ?? MOTION_DURATIONS.full;
  root.style.setProperty('--duration-fast',   durations.fast);
  root.style.setProperty('--duration-base',   durations.base);
  root.style.setProperty('--duration-slow',   durations.slow);
  root.style.setProperty('--duration-slower', durations.slower);

  // Blur & glass intensity — scales Tailwind's --blur-* theme tokens (see
  // globals.css), so backdrop-blur-*/blur-* utilities everywhere scale from
  // this one variable. data-blur="0" additionally zeroes every other
  // backdrop-filter channel for a true, zero-cost disable at 0%.
  const blurIntensity = Math.max(0, Math.min(150, prefs.blurIntensity ?? 100));
  root.style.setProperty('--do-blur-scale', String(blurIntensity / 100));
  root.setAttribute('data-blur', blurIntensity === 0 ? '0' : '1');

  // Geometry (corner radius)
  const geometry = GEOMETRY_OPTIONS.find(g => g.id === prefs.geometry) ?? GEOMETRY_OPTIONS[1];
  root.style.setProperty('--do-radius', geometry.radius);

  // Font scale (type-scale tokens only — see globals.css @theme inline)
  const fontScale = FONT_SCALE_OPTIONS.find(f => f.id === prefs.fontScale) ?? FONT_SCALE_OPTIONS.find(f => f.id === 'md');
  root.style.setProperty('--do-font-scale', String(fontScale.scale));

  // Line height — base body rhythm; elements with their own Tailwind
  // leading-* utility still win locally via normal CSS specificity.
  const lineHeight = LINE_HEIGHT_OPTIONS.find(l => l.id === prefs.lineHeight) ?? LINE_HEIGHT_OPTIONS.find(l => l.id === 'normal');
  root.style.setProperty('--do-line-height', String(lineHeight.value));

  // Letter spacing — same inheritance model as line height.
  const letterSpacing = LETTER_SPACING_OPTIONS.find(l => l.id === prefs.letterSpacing) ?? LETTER_SPACING_OPTIONS.find(l => l.id === 'normal');
  root.style.setProperty('--do-letter-spacing', letterSpacing.value);

  // Tabular numbers — aligns digit widths in KPI tiles, tables & trend readouts.
  root.setAttribute('data-tabular-nums', prefs.tabularNumbers ? '1' : '0');

  // Background doodle pattern toggle
  root.setAttribute('data-industrial-bg', prefs.industrialBackground !== false ? '1' : '0');
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CustomizationProvider({ children }) {
  const { isDark } = useTheme();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPrefs(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch {}
  }, []);

  useEffect(() => {
    applyPrefs(prefs, isDark);
  }, [prefs, isDark]);

  const updatePref = useCallback((key, value) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const value = useMemo(() => ({
    prefs,
    updatePref,
    resetPrefs,
    ACCENT_PALETTES,
    FONT_OPTIONS,
    DENSITY_OPTIONS,
    MOTION_OPTIONS,
    DROPDOWN_ANIMATION_OPTIONS,
    GEOMETRY_OPTIONS,
    FONT_SCALE_OPTIONS,
    LINE_HEIGHT_OPTIONS,
    LETTER_SPACING_OPTIONS,
    PROFILE_DISPLAY_OPTIONS,
    TOAST_DURATION_OPTIONS,
    TOAST_ANIMATION_OPTIONS,
    BLUR_PRESETS,
  }), [prefs, updatePref, resetPrefs]);

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
}

export const useCustomization = () => useContext(CustomizationContext);
