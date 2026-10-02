'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '@/src/components/ui/Modal';
import {
  X, Sun, Moon, Monitor, Palette, SlidersHorizontal,
  Info, Check, Settings, RotateCcw, Sparkles, Bell, Factory,
} from 'lucide-react';
import { useTheme, LIGHT_VARIANTS, DARK_VARIANTS } from '@/src/context/visuals/ThemeContext';
import {
  useCustomization,
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
  BLUR_PRESETS,
} from '@/src/context/visuals/CustomizationContext';
import { SPRING, SectionLabel, ActiveTick, tileCls, SegmentControl, IntensitySlider, ToggleSwitch } from './settingsAtoms';
import { NotificationsTab } from './NotificationsTab';

/**
 * SettingsModal — responds to every Appearance/Interface control it exposes:
 * theme mode + all variants, accent, typography (font family/size/line-height/
 * letter-spacing/tabular numbers), density, motion, blur, and geometry (the
 * live preview + all chrome use semantic tokens and --do-radius, so the
 * modal itself restyles as you click).
 */

const TABS = [
  { id: 'appearance',    label: 'Appearance',    desc: 'Theme & colors',   icon: Palette },
  { id: 'interface',     label: 'Interface',     desc: 'Type & layout',    icon: SlidersHorizontal },
  { id: 'notifications', label: 'Notifications', desc: 'Toasts & alerts',  icon: Bell },
  { id: 'about',         label: 'About',         desc: 'App info',         icon: Info },
];

const THEME_MODES = [
  { id: 'light',  label: 'Light',  icon: Sun,     desc: 'Bright & clean' },
  { id: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Easy on the eyes' },
  { id: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS' },
];

// Static previews for the geometry picker
const GEOMETRY_PREVIEW_RADIUS = { sharp: '0.25rem', standard: '0.5rem', soft: '1rem' };

// ─── Live preview ─────────────────────────────────────────────────────────────
// Built exclusively from semantic tokens + --do-radius, so every selection in
// this modal (mode, variant, accent, geometry, font) repaints it instantly.

function LivePreview() {
  return (
    <div className="rounded-xl border border-border overflow-hidden select-none" aria-hidden="true">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 border-b border-border">
        <span className="w-2 h-2 rounded-full bg-danger/60" />
        <span className="w-2 h-2 rounded-full bg-warning/60" />
        <span className="w-2 h-2 rounded-full bg-success/60" />
        <span className="ml-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-text-subtle">
          <Sparkles className="w-2.5 h-2.5 text-brand" /> Live preview
        </span>
      </div>
      <div className="flex bg-canvas">
        {/* Mini sidebar */}
        <div className="w-14 shrink-0 bg-surface border-r border-border p-2 space-y-1.5 hidden sm:block">
          <div className="h-2 w-8 rounded-full bg-brand" />
          <div className="h-2 w-9 rounded-full bg-surface-2" />
          <div className="h-2 w-7 rounded-full bg-surface-2" />
          <div className="h-2 w-9 rounded-full bg-surface-2" />
        </div>
        {/* Mini page */}
        <div className="flex-1 p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs font-bold text-text-primary leading-none truncate">Compressor Overview</p>
              <p className="text-[10px] text-text-muted leading-none truncate">Realtime plant telemetry</p>
            </div>
            <span className="shrink-0 px-2.5 py-1 bg-brand text-white text-[10px] font-bold shadow-sm shadow-brand/30 rounded-(--do-radius)">
              Action
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-surface border border-border rounded-(--do-radius) space-y-1">
              <p className="text-[10px] font-bold text-text-primary leading-none">98.2%</p>
              <p className="text-[8px] text-success leading-none">▲ Uptime</p>
            </div>
            <div className="p-2 bg-surface border border-border rounded-(--do-radius) space-y-1">
              <p className="text-[10px] font-bold text-text-primary leading-none">3 alerts</p>
              <p className="text-[8px] text-warning leading-none">● Watchlist</p>
            </div>
            <div className="p-2 bg-surface border border-border rounded-(--do-radius) space-y-1">
              <p className="text-[10px] font-bold text-brand leading-none">12 tags</p>
              <p className="text-[8px] text-text-muted leading-none">Monitored</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Appearance tab ───────────────────────────────────────────────────────────

function ThemeModeCard({ mode, active, onSelect }) {
  const Icon = mode.icon;
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(mode.id)}
      aria-pressed={active}
      aria-label={`Switch to ${mode.label} theme`}
      className={`${tileCls(active)} flex flex-col items-center gap-2.5 p-4`}
    >
      {active && <ActiveTick />}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-brand/10' : 'bg-surface'}`}>
        <Icon className={`w-5 h-5 transition-colors ${active ? 'text-brand' : 'text-text-muted'}`} />
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold leading-tight transition-colors ${active ? 'text-brand' : 'text-text-primary'}`}>{mode.label}</p>
        <p className="text-xs text-text-muted mt-0.5 leading-tight hidden sm:block">{mode.desc}</p>
      </div>
    </motion.button>
  );
}

function VariantSwatchCard({ variant, active, onSelect }) {
  const [canvas, surface] = variant.swatch;
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(variant.id)}
      aria-pressed={active}
      aria-label={`Select ${variant.label} theme variant`}
      className={`${tileCls(active)} flex flex-col gap-2 p-2.5 text-left`}
    >
      {active && <ActiveTick />}
      {/* Two-tone swatch mimicking canvas + surface card */}
      <span className="block w-full h-11 rounded-lg border border-border/50 overflow-hidden shrink-0 relative" style={{ backgroundColor: canvas }}>
        <span className="absolute left-1.5 top-1.5 bottom-1.5 w-2/3 rounded-md shadow-sm" style={{ backgroundColor: surface }} />
        <span className="absolute right-1.5 bottom-1.5 w-3 h-1.5 rounded-full bg-brand" />
      </span>
      <div className="min-w-0">
        <p className={`text-xs font-semibold leading-tight truncate transition-colors ${active ? 'text-brand' : 'text-text-primary'}`}>{variant.label}</p>
        <p className="text-[10px] text-text-muted mt-0.5 leading-tight line-clamp-1">{variant.desc}</p>
      </div>
    </motion.button>
  );
}

function VariantGroup({ title, hint, variants, current, onSelect }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-subtle">{title}</p>
        {hint && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 border border-success/20 text-[9px] font-bold text-success uppercase tracking-wide">
            <span className="w-1 h-1 rounded-full bg-success animate-pulse" /> {hint}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {variants.map(variant => (
          <VariantSwatchCard key={variant.id} variant={variant} active={current === variant.id} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function AccentSwatch({ palette, active, onSelect }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -1 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => onSelect(palette.id)}
      aria-pressed={active}
      aria-label={`Select ${palette.label} accent color`}
      title={palette.label}
      className="relative flex flex-col items-center gap-1.5 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg p-1"
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: palette.swatch,
          boxShadow: active
            ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${palette.swatch}, 0 6px 14px ${palette.swatch}55`
            : `0 2px 6px ${palette.swatch}40`,
        }}
      >
        <AnimatePresence>
          {active && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING}>
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}>
        {palette.label}
      </span>
    </motion.button>
  );
}

function AppearanceTab() {
  const { theme, setTheme, themeVariant, isDark, lightVariant, setLightVariant, darkVariant, setDarkVariant } = useTheme();
  const { prefs, updatePref } = useCustomization();

  const activeVariantMeta = (isDark ? DARK_VARIANTS : LIGHT_VARIANTS).find(v => v.id === themeVariant);

  return (
    <div className="space-y-7">
      <LivePreview />

      {/* Mode */}
      <div>
        <SectionLabel hint={theme === 'system' ? 'Synced with OS' : undefined}>Mode</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {THEME_MODES.map(mode => (
            <ThemeModeCard key={mode.id} mode={mode} active={theme === mode.id} onSelect={setTheme} />
          ))}
        </div>
        <div className="flex items-center gap-2.5 mt-3 px-3 py-2 rounded-lg bg-surface-2 border border-border">
          {isDark ? <Moon className="w-3.5 h-3.5 text-brand shrink-0" /> : <Sun className="w-3.5 h-3.5 text-warning shrink-0" />}
          <p className="text-xs text-text-muted">
            Displaying <span className="font-semibold text-text-primary">{activeVariantMeta?.label ?? themeVariant}</span>
            {theme === 'system' && <span className="text-text-subtle"> — follows your OS setting</span>}
          </p>
        </div>
      </div>

      {/* Variants — only the group matching the resolved mode (explicit
          light/dark, or system's current OS reading) is shown; the other
          family is hidden entirely rather than just dimmed. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <VariantGroup
            title={isDark ? 'Dark variants' : 'Light variants'}
            hint={theme === 'system' ? 'Following system' : undefined}
            variants={isDark ? DARK_VARIANTS : LIGHT_VARIANTS}
            current={isDark ? darkVariant : lightVariant}
            onSelect={isDark ? setDarkVariant : setLightVariant}
          />
        </motion.div>
      </AnimatePresence>

      {/* Accent */}
      <div>
        <SectionLabel hint="Buttons, links & highlights">Accent Color</SectionLabel>
        <div className="flex items-center justify-start sm:justify-between flex-wrap gap-2 p-3 bg-surface-2/60 border border-border rounded-xl">
          {Object.values(ACCENT_PALETTES).map(palette => (
            <AccentSwatch
              key={palette.id}
              palette={palette}
              active={prefs.accent === palette.id}
              onSelect={v => updatePref('accent', v)}
            />
          ))}
        </div>
      </div>

      {/* Background Pattern */}
      <div>
        <SectionLabel hint="Architectural engineering artwork on landing canvas">Industrial Wallpaper</SectionLabel>
        <div className="flex items-center justify-between gap-3 p-3 bg-surface-2/60 border border-border rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
              <Factory className="w-5 h-5 text-brand" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-text-primary">Industrial Plant Blueprint</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${prefs.industrialBackground !== false ? 'bg-brand/10 text-brand' : 'bg-surface text-text-subtle border border-border'}`}>
                  {prefs.industrialBackground !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                Refinery fractionators, LNG carrier vessels, tank farms, piping manifolds &amp; clean energy schematics
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={prefs.industrialBackground !== false}
            onChange={v => updatePref('industrialBackground', v)}
            labelOn="Disable industrial blueprint wallpaper"
            labelOff="Enable industrial blueprint wallpaper"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Interface tab ────────────────────────────────────────────────────────────

function GeometryCard({ option, active, onSelect }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(option.id)}
      aria-pressed={active}
      aria-label={`Select ${option.label} corner geometry`}
      className={`${tileCls(active)} flex flex-col items-center gap-2.5 p-3`}
    >
      {active && <ActiveTick />}
      <span
        className={`block w-10 h-10 border-2 shrink-0 transition-colors ${active ? 'border-brand bg-brand/10' : 'border-border-strong bg-surface'}`}
        style={{ borderRadius: GEOMETRY_PREVIEW_RADIUS[option.id] }}
      />
      <div className="text-center">
        <p className={`text-xs font-semibold leading-tight transition-colors ${active ? 'text-brand' : 'text-text-primary'}`}>{option.label}</p>
        <p className="text-[10px] text-text-muted mt-0.5 leading-tight">{option.desc}</p>
      </div>
    </motion.button>
  );
}

/** Three bars whose spacing mirrors the density option (index-scaled). */
function DensityGlyph({ index, active }) {
  return (
    <span className="flex flex-col justify-center shrink-0 w-8 h-8 rounded-lg bg-surface border border-border px-1.5" style={{ gap: 2 + index * 2 }}>
      {[0, 1, 2].map(i => (
        <span key={i} className={`block h-1 rounded-full transition-colors ${active ? 'bg-brand' : 'bg-border-strong'}`} />
      ))}
    </span>
  );
}

/** Mirrors the header ProfileMenu trigger itself: an avatar dot, plus two
 *  name/role bars only when previewing the "expanded" option. */
function ProfileGlyph({ compact, active }) {
  return (
    <span className={`flex items-center shrink-0 w-16 h-8 rounded-lg bg-surface border border-border px-2 ${compact ? 'justify-center gap-0' : 'gap-1.5'}`}>
      <span className={`w-3.5 h-3.5 rounded-full shrink-0 transition-colors ${active ? 'bg-brand' : 'bg-border-strong'}`} />
      {!compact && (
        <span className="flex flex-col gap-1 flex-1 min-w-0">
          <span className={`block h-1 w-full rounded-full transition-colors ${active ? 'bg-brand' : 'bg-border-strong'}`} />
          <span className={`block h-1 w-2/3 rounded-full transition-colors ${active ? 'bg-brand/50' : 'bg-border-strong/60'}`} />
        </span>
      )}
    </span>
  );
}

/** Live frosted-glass swatch — reacts instantly to the blur slider since it
 *  renders with the same backdrop-blur-xl utility every glass panel uses. */
function GlassPreviewChip() {
  return (
    <div
      aria-hidden="true"
      className="relative w-9 h-9 rounded-lg overflow-hidden border border-border shrink-0"
      style={{ background: 'linear-gradient(135deg, var(--do-brand) 0%, var(--do-highlight) 100%)' }}
    >
      <div className="absolute inset-0 bg-surface/40 backdrop-blur-xl" />
      <Sparkles className="absolute inset-0 m-auto w-3.5 h-3.5 text-white" />
    </div>
  );
}

/** Live typography specimen — pure semantic-token markup (no inline font
 *  overrides), so it reacts instantly to every Typography control: family,
 *  size, line height, letter spacing, and tabular numbers (the readout
 *  figure below is left un-classed for digit width so the toggle is visible). */
function TypographyPreview() {
  return (
    <div aria-hidden="true" className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5 select-none">
      <p className="text-lg font-bold text-text-primary leading-tight">Compressor Health Report</p>
      <p className="text-sm text-text-secondary">
        Live telemetry shows stable vibration and bearing temperature across all monitored tags for the last 24 hours.
      </p>
      <div className="flex items-center gap-4 pt-1">
        <span className="text-xl font-bold text-brand">1,204.38</span>
        <span className="text-xs text-text-muted">Uptime readings · last 24h</span>
      </div>
    </div>
  );
}

function InterfaceTab() {
  const { prefs, updatePref } = useCustomization();

  return (
    <div className="space-y-7">
      {/* Typography */}
      <div>
        <SectionLabel hint="Live preview reacts instantly">Typography</SectionLabel>
        <TypographyPreview />

        {/* Font Family */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-text-secondary mb-2">Font Family</p>
          <div className="space-y-2">
            {FONT_OPTIONS.map(font => {
              const active = prefs.fontId === font.id;
              return (
                <motion.button
                  key={font.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => updatePref('fontId', font.id)}
                  aria-pressed={active}
                  className={`${tileCls(active)} group flex items-center gap-3.5 p-3 text-left`}
                >
                  {/* Specimen glyph */}
                  <span
                    className={`w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-xl font-bold border transition-colors ${
                      active ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-surface border-border text-text-secondary'
                    }`}
                    style={{ fontFamily: font.stack }}
                    aria-hidden="true"
                  >
                    Ag
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-none transition-colors truncate ${active ? 'text-brand' : 'text-text-primary'}`} style={{ fontFamily: font.stack }}>
                      {font.preview}
                    </p>
                    <p className="text-xs text-text-muted mt-1.5 font-medium truncate">{font.label}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-1 shrink-0">
                    <span className={`hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      active ? 'bg-brand/10 text-brand' : 'bg-surface text-text-subtle border border-border'
                    }`}>
                      {font.description.split(' · ')[0]}
                    </span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-brand bg-brand' : 'border-border-strong'}`}>
                      {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Font Size */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-text-secondary mb-2">Font Size <span className="text-text-subtle font-normal">— text only, layout unchanged</span></p>
          <SegmentControl
            options={FONT_SCALE_OPTIONS}
            value={prefs.fontScale}
            onChange={v => updatePref('fontScale', v)}
            renderOption={(opt, active) => {
              const idx = FONT_SCALE_OPTIONS.findIndex(o => o.id === opt.id);
              return (
                <>
                  <span aria-hidden="true" className={`font-bold leading-none ${active ? 'text-brand' : ''}`} style={{ fontSize: 10 + idx * 2 }}>A</span>
                  {opt.label}
                </>
              );
            }}
          />
        </div>

        {/* Line Height + Letter Spacing */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-2">Line Height</p>
            <SegmentControl
              options={LINE_HEIGHT_OPTIONS}
              value={prefs.lineHeight}
              onChange={v => updatePref('lineHeight', v)}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-2">Letter Spacing</p>
            <SegmentControl
              options={LETTER_SPACING_OPTIONS}
              value={prefs.letterSpacing}
              onChange={v => updatePref('letterSpacing', v)}
            />
          </div>
        </div>

        {/* Tabular Numbers */}
        <div className="flex items-center justify-between gap-3 mt-5 p-3 bg-surface-2/60 border border-border rounded-xl">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary">Tabular Numbers</p>
            <p className="text-[11px] text-text-muted mt-0.5">Aligns digit widths in KPI tiles, tables &amp; trend readouts</p>
          </div>
          <ToggleSwitch
            checked={prefs.tabularNumbers}
            onChange={v => updatePref('tabularNumbers', v)}
            labelOn="Disable tabular numbers"
            labelOff="Enable tabular numbers"
          />
        </div>
      </div>

      {/* Layout Density */}
      <div>
        <SectionLabel>Layout Density</SectionLabel>
        <div className="space-y-2">
          {DENSITY_OPTIONS.map((opt, idx) => {
            const active = prefs.density === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updatePref('density', opt.id)}
                aria-pressed={active}
                className={`${tileCls(active)} group flex items-center gap-3.5 p-3 text-left`}
              >
                <DensityGlyph index={idx} active={active} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${active ? 'text-brand' : 'text-text-primary'}`}>{opt.label}</p>
                  <p className="text-[11px] text-text-muted mt-0.5 truncate">{opt.description}</p>
                </div>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${active ? 'border-brand bg-brand' : 'border-border-strong'}`}>
                  {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Menu */}
      <div>
        <SectionLabel hint="Header trigger only — menu stays full size">Profile Menu</SectionLabel>
        <div className="space-y-2">
          {PROFILE_DISPLAY_OPTIONS.map(opt => {
            const active = prefs.profileDisplay === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updatePref('profileDisplay', opt.id)}
                aria-pressed={active}
                className={`${tileCls(active)} group flex items-center gap-3.5 p-3 text-left`}
              >
                <ProfileGlyph compact={opt.id === 'compact'} active={active} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${active ? 'text-brand' : 'text-text-primary'}`}>{opt.label}</p>
                  <p className="text-[11px] text-text-muted mt-0.5 truncate">{opt.description}</p>
                </div>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${active ? 'border-brand bg-brand' : 'border-border-strong'}`}>
                  {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Geometry */}
      <div>
        <SectionLabel>Geometry</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {GEOMETRY_OPTIONS.map(opt => (
            <GeometryCard key={opt.id} option={opt} active={prefs.geometry === opt.id} onSelect={v => updatePref('geometry', v)} />
          ))}
        </div>
      </div>

      {/* Effects & Motion */}
      <div>
        <SectionLabel>Effects &amp; Motion</SectionLabel>
        <div className="space-y-3">
          <div className="p-3 bg-surface-2/60 border border-border rounded-xl">
            <p className="text-xs font-semibold text-text-secondary mb-2">Animation speed</p>
            <SegmentControl
              options={MOTION_OPTIONS}
              value={prefs.motion}
              onChange={v => updatePref('motion', v)}
            />
          </div>
          <div className="p-3 bg-surface-2/60 border border-border rounded-xl">
            <p className="text-xs font-semibold text-text-secondary mb-2">Dropdown animation style</p>
            <SegmentControl
              options={DROPDOWN_ANIMATION_OPTIONS}
              value={prefs.dropdownAnimation}
              onChange={v => updatePref('dropdownAnimation', v)}
            />
            <p className="text-[11px] text-text-muted mt-2 leading-snug">
              {DROPDOWN_ANIMATION_OPTIONS.find(o => o.id === prefs.dropdownAnimation)?.description}
            </p>
          </div>
          <IntensitySlider
            label="Blur & Glass effects"
            hint="Backdrop blur on panels, modals & glows"
            value={prefs.blurIntensity}
            min={0}
            max={150}
            step={5}
            onChange={(v) => updatePref('blurIntensity', v)}
            presets={BLUR_PRESETS}
            preview={<GlassPreviewChip />}
          />
        </div>
      </div>
    </div>
  );
}

// ─── About tab ────────────────────────────────────────────────────────────────

function AboutTab() {
  const STACK = [
    ['Framework', 'Next.js 16 (App Router)'],
    ['Language',  'JavaScript / JSX'],
    ['Styling',   'Tailwind CSS v4'],
    ['Animations','Framer Motion 12'],
  ];
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-2/60">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand/10 blur-2xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
          <Settings className="w-6 h-6 text-brand" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-primary">Decision Ops</h3>
          <p className="text-xs text-text-muted mt-0.5">AI PlantOps Platform</p>
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-semibold text-text-secondary">
            v1.0.0
          </span>
        </div>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {STACK.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5 bg-surface hover:bg-surface-2/50 transition-colors">
            <span className="text-xs text-text-muted">{label}</span>
            <span className="text-xs font-medium text-text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

export default function SettingsModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('appearance');
  const { resetPrefs } = useCustomization();

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  return (
    <Modal open={open} onClose={handleClose} size="3xl" className="bg-surface/95 backdrop-blur-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-4 border-b border-border overflow-hidden">
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Settings className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h2 id="settings-title" className="text-sm font-bold text-text-primary leading-none">Settings</h2>
            <p className="text-[11px] text-text-muted mt-1 leading-none">Personalize appearance &amp; interface</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close"
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all hover:rotate-90 duration-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col sm:flex-row" style={{ minHeight: '460px', maxHeight: 'calc(100vh - 160px)' }}>
        {/* Tab rail */}
        <nav
          role="tablist"
          aria-label="Settings sections"
          className="w-full sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border p-3 flex sm:flex-col gap-1.5 overflow-x-auto hide-scrollbar sm:bg-surface-2/40"
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`settings-tab-${tab.id}`}
                aria-selected={active}
                aria-controls="settings-tabpanel"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 sm:flex-none sm:w-full flex items-center justify-center sm:justify-start gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand z-10 shrink-0 ${
                  active ? 'text-brand' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="settings-active-tab"
                    className="absolute inset-0 bg-brand-muted border border-brand/20 rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-brand/10' : 'bg-surface-2 sm:bg-surface'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="hidden sm:block text-left min-w-0">
                  <span className="block font-semibold leading-none">{tab.label}</span>
                  <span className={`block text-[10px] mt-1 leading-none ${active ? 'text-brand/70' : 'text-text-subtle'}`}>{tab.desc}</span>
                </span>
                <span className="sm:hidden">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div
          role="tabpanel"
          id="settings-tabpanel"
          aria-labelledby={`settings-tab-${activeTab}`}
          className="flex-1 p-4 sm:p-6 overflow-y-auto thin-scrollbar"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {activeTab === 'appearance'    && <AppearanceTab />}
              {activeTab === 'interface'     && <InterfaceTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'about'         && <AboutTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-surface-2/50">
        <p className="text-[11px] text-text-subtle">
          Changes apply instantly and are saved to this browser.
        </p>
        <button
          onClick={resetPrefs}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted hover:text-danger hover:bg-danger/5 border border-transparent hover:border-danger/20 transition-all duration-150 px-2.5 py-1.5 rounded-lg cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          Reset to defaults
        </button>
      </div>
    </Modal>
  );
}
