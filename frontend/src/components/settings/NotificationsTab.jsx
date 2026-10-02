'use client';

import { Bell, BellOff, Check } from 'lucide-react';

import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/components/ui/Toast';
import { POSITIONS } from '@/src/components/ui/toast/constants';
import { useCustomization, TOAST_DURATION_OPTIONS, TOAST_ANIMATION_OPTIONS } from '@/src/context/visuals/CustomizationContext';

import { SectionLabel, SegmentControl, ToggleSwitch } from './settingsAtoms';

const POSITION_LABELS = {
  'top-left': 'Top Left',
  'top-center': 'Top Center',
  'top-right': 'Top Right',
  'bottom-left': 'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
};

// Mirrors POSITION_CLASSES' corner anchoring at mockup scale, so the picker
// visually matches where the toast will actually land on screen.
const MOCK_ANCHOR = {
  'top-left': 'top-2 left-2',
  'top-center': 'top-2 left-1/2 -translate-x-1/2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-2 right-2',
};

// The 3-toast demo burst fired by "Send test notifications" — different
// types so the icon/accent variety is visible too, not just the animation.
const PREVIEW_BURST = [
  { type: 'success', title: 'Preview', description: 'This is how your notifications will look.' },
  { type: 'info',     title: 'Second toast', description: 'Notice how they stack together.' },
  { type: 'warning',  title: 'Third toast', description: 'Hover the stack to expand it.' },
];
const PREVIEW_STAGGER_MS = 350;

function PositionPicker({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Notification position"
      className="relative w-full h-32 rounded-xl border border-border bg-surface-2/60 overflow-hidden"
    >
      {/* Mini browser chrome — sells the "this is your screen" metaphor */}
      <div className="absolute top-0 left-0 right-0 h-5 bg-surface border-b border-border flex items-center gap-1 px-2">
        <span className="w-1.5 h-1.5 rounded-full bg-danger/50" />
        <span className="w-1.5 h-1.5 rounded-full bg-warning/50" />
        <span className="w-1.5 h-1.5 rounded-full bg-success/50" />
      </div>

      {POSITIONS.map((pos) => {
        const active = value === pos;
        return (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(pos)}
            aria-pressed={active}
            aria-label={`Show notifications at ${POSITION_LABELS[pos]}`}
            className={`absolute ${MOCK_ANCHOR[pos]} flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              active
                ? 'bg-brand border-brand shadow-sm shadow-brand/40 scale-105'
                : 'bg-surface border-border hover:border-border-strong hover:bg-surface-2'
            }`}
          >
            <span className={`w-6 h-1.5 rounded-full transition-colors ${active ? 'bg-white/85' : 'bg-border-strong'}`} />
            {active && <Check className="w-2.5 h-2.5 text-white shrink-0" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}

export function NotificationsTab() {
  const { prefs, updatePref } = useCustomization();
  const toast = useToast();
  const enabled = prefs.toastEnabled;

  const handlePreview = () => {
    if (!enabled) return;
    PREVIEW_BURST.forEach(({ type, title, description }, i) => {
      setTimeout(() => toast[type](title, description, { position: prefs.toastPosition }), i * PREVIEW_STAGGER_MS);
    });
  };

  return (
    <div className="space-y-7">
      <div className={cn(
        'flex items-center justify-between gap-3 p-3 border rounded-xl transition-colors duration-200',
        enabled ? 'bg-surface-2/60 border-border' : 'bg-brand-muted/40 border-brand/20',
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn(
            'flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors duration-200',
            enabled ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-text-subtle',
          )}>
            {enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary">Show toast notifications</p>
            <p className="text-[11px] text-text-muted mt-0.5">Turn all popup notifications on or off, app-wide</p>
          </div>
        </div>
        <ToggleSwitch
          checked={enabled}
          onChange={(v) => updatePref('toastEnabled', v)}
          labelOn="Disable toast notifications"
          labelOff="Enable toast notifications"
        />
      </div>

      <div
        aria-disabled={!enabled}
        className={cn(
          'space-y-7 transition-opacity duration-200',
          !enabled && 'opacity-40 pointer-events-none select-none',
        )}
      >
        <div>
          <SectionLabel hint="Where they appear on screen">Position</SectionLabel>
          <PositionPicker value={prefs.toastPosition} onChange={(v) => updatePref('toastPosition', v)} />
        </div>

        <div>
          <SectionLabel hint="How they enter and leave">Animation style</SectionLabel>
          <SegmentControl
            options={TOAST_ANIMATION_OPTIONS}
            value={prefs.toastAnimation}
            onChange={(v) => updatePref('toastAnimation', v)}
          />
        </div>

        <div>
          <SectionLabel hint="How long they stay visible">Duration</SectionLabel>
          <SegmentControl
            options={TOAST_DURATION_OPTIONS}
            value={prefs.toastDuration}
            onChange={(v) => updatePref('toastDuration', v)}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-2/60 border border-border rounded-xl">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary">Stack notifications</p>
            <p className="text-[11px] text-text-muted mt-0.5">Collapse multiple into a peekable stack, expand on hover</p>
          </div>
          <ToggleSwitch
            checked={prefs.toastStack}
            onChange={(v) => updatePref('toastStack', v)}
            labelOn="Disable notification stacking"
            labelOff="Enable notification stacking"
          />
        </div>

        <button
          type="button"
          onClick={handlePreview}
          disabled={!enabled}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 text-xs font-semibold text-text-primary transition-colors duration-150 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5 text-brand" />
          Send test notifications
        </button>
      </div>
    </div>
  );
}
