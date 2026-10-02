// Single source of truth for the theme/customization system.
// Add or remove a variant here + a matching CSS block in globals.css — no component changes needed.

export const LIGHT_VARIANTS = [
    { id: 'light',       label: 'Pure White',      desc: 'Default, clean, bright rooms',     swatch: ['#f8fafc', '#ffffff'] },
    { id: 'soft-gray',   label: 'Soft Gray',        desc: 'Admin & report reading',            swatch: ['#f1f5f9', '#ffffff'] },
    { id: 'warm-ivory',  label: 'Warm Ivory',       desc: 'Warm-toned, reduced harshness',     swatch: ['#faf9f7', '#ffffff'] },
    { id: 'glass-light', label: 'Glassmorphism',    desc: 'Executive dashboards',               swatch: ['#eef1fb', '#ffffff'] },
    { id: 'apple',       label: 'Apple-Inspired',   desc: 'Premium consumer-grade feel',        swatch: ['#f5f5f7', '#ffffff'] },
    { id: 'hc-light',    label: 'High Contrast',    desc: 'Outdoor tablets, max readability',   swatch: ['#ffffff', '#ffffff'] },
];

export const DARK_VARIANTS = [
    { id: 'slate-dark', label: 'Slate Enterprise', desc: 'Default dark, office operators',     swatch: ['#0f172a', '#1e293b'] },
    { id: 'midnight',   label: 'Midnight OLED',    desc: 'Dark control rooms, OLED tablets',    swatch: ['#000000', '#0a0a0a'] },
    { id: 'github',     label: 'Developer',        desc: 'Engineers monitoring logs',           swatch: ['#0d1117', '#161b22'] },
    { id: 'soft-dark',  label: 'Soft Dark',        desc: '12-hour shifts, easy on the eyes',    swatch: ['#1c1c1e', '#2c2c2e'] },
    { id: 'hc-dark',    label: 'High Contrast',    desc: 'Accessibility, neon alerts',          swatch: ['#09090b', '#09090b'] },
    { id: 'glass-dark', label: 'Glassmorphism',    desc: 'Management presentations',            swatch: ['#0f1623', '#1e293b'] },
];

export const DARK_THEME_IDS = new Set(DARK_VARIANTS.map((v) => v.id));

export const GEOMETRY_OPTIONS = [
    { id: 'sharp',    label: 'Sharp',    desc: 'Minimal, precise corners',  radius: '0.25rem' },
    { id: 'standard', label: 'Standard', desc: 'Balanced, modern default',  radius: '0.5rem' },
    { id: 'soft',     label: 'Soft',     desc: 'Rounded, friendly feel',    radius: '1rem' },
];

export const FONT_SCALE_OPTIONS = [
    { id: 'xs', label: 'XS', desc: 'Extra small — dense data screens', px: 12, scale: 0.786 },
    { id: 'sm', label: 'S',  desc: 'Small — compact readability',      px: 13, scale: 0.857 },
    { id: 'md', label: 'M',  desc: 'Default — balanced',               px: 14, scale: 1 },
    { id: 'lg', label: 'L',  desc: 'Large — easier reading',           px: 16, scale: 1.143 },
    { id: 'xl', label: 'XL', desc: 'Extra large — accessibility',      px: 18, scale: 1.286 },
];

export const LINE_HEIGHT_OPTIONS = [
    { id: 'compact', label: 'Compact', desc: 'Dense, data-heavy screens', value: 1.35 },
    { id: 'normal',  label: 'Normal',  desc: 'Balanced default reading',  value: 1.55 },
    { id: 'relaxed', label: 'Relaxed', desc: 'Airy, long-form reading',   value: 1.75 },
];

export const LETTER_SPACING_OPTIONS = [
    { id: 'tight',  label: 'Tight',  desc: 'Condensed, technical feel',  value: '-0.01em' },
    { id: 'normal', label: 'Normal', desc: 'Balanced default spacing',   value: '0em' },
    { id: 'wide',   label: 'Wide',   desc: 'Open, premium spacing',      value: '0.02em' },
];
