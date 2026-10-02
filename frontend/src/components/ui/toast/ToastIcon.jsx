'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react';

import { Spinner } from '../Spinner';

// Loading reuses the `info` token deliberately — no new CSS variable added
// for a 6th status color (loading isn't a status, it's a transient state).
// No `border` field: the card itself stays a neutral hairline regardless of
// type (status lives only in the icon badge) — matches macOS/iOS notification
// styling, where the app/system icon carries the color, not the card chrome.
const THEME = {
  success: {
    Icon: CheckCircle2,
    color: 'text-toast-success',
    bg: 'bg-toast-success/15',
    bar: 'bg-toast-success',
  },
  error: {
    Icon: AlertCircle,
    color: 'text-toast-danger',
    bg: 'bg-toast-danger/15',
    bar: 'bg-toast-danger',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-toast-warning',
    bg: 'bg-toast-warning/15',
    bar: 'bg-toast-warning',
  },
  sparkle: {
    Icon: Sparkles,
    color: 'text-toast-sparkle',
    bg: 'bg-toast-sparkle/15',
    bar: 'bg-toast-sparkle',
    iconClassName: 'animate-pulse',
  },
  info: {
    Icon: Info,
    color: 'text-toast-info',
    bg: 'bg-toast-info/15',
    bar: 'bg-toast-info',
  },
  loading: {
    Icon: null,
    color: 'text-toast-info',
    bg: 'bg-toast-info/15',
    bar: 'bg-toast-info',
  },
  custom: {
    Icon: null,
    color: 'text-text-primary',
    bg: 'bg-surface-2',
    bar: 'bg-brand',
  },
};

export function getToastTheme(type) {
  return THEME[type] ?? THEME.info;
}

export function ToastIcon({ type, icon }) {
  const theme = getToastTheme(type);
  if (icon === false) return null;

  return (
    <div className={`p-1.5 rounded-full ${theme.bg} flex items-center justify-center shrink-0`}>
      {icon ? (
        icon
      ) : type === 'loading' ? (
        <Spinner size="sm" className={theme.color} />
      ) : theme.Icon ? (
        <theme.Icon className={`w-4 h-4 ${theme.color} ${theme.iconClassName ?? ''} shrink-0`} />
      ) : null}
    </div>
  );
}
