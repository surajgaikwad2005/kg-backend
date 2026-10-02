'use client';

import { createContext, useContext, useEffect } from 'react';

import { useCustomization, TOAST_DURATION_OPTIONS } from '@/src/context/visuals/CustomizationContext';

import * as store from './store';
import { ToastContainer } from './ToastContainer';
import { toast } from './toastApi';

// null = no ancestor ToastProvider at all (used by useToast()'s missing-
// provider safety net); true = at least one ancestor provider exists.
const ToastRootContext = createContext(null);

export function ToastProvider({ children, limit }) {
  const parentValue = useContext(ToastRootContext);
  const isRoot = parentValue === null;
  const { prefs } = useCustomization();

  // Only the outermost provider in the tree owns the limit and mounts the
  // portal — a nested provider (e.g. the pnid section) becomes a pass-through
  // no-op so the module-global store never renders into two containers at once.
  useEffect(() => {
    if (isRoot) store.setLimit(limit ?? Infinity);
  }, [isRoot, limit]);

  // Settings → Notifications (position/duration) flow into the plain-JS
  // store the same way — it's the single default every toast call falls
  // back to unless it explicitly overrides position/duration itself.
  useEffect(() => {
    if (!isRoot) return;
    const durationOpt = TOAST_DURATION_OPTIONS.find(o => o.id === prefs.toastDuration) ?? TOAST_DURATION_OPTIONS[1];
    store.setDefaults({ position: prefs.toastPosition, duration: durationOpt.ms });
  }, [isRoot, prefs.toastPosition, prefs.toastDuration]);

  // Settings → Notifications → "Show toast notifications" master switch.
  useEffect(() => {
    if (!isRoot) return;
    store.setEnabled(prefs.toastEnabled);
  }, [isRoot, prefs.toastEnabled]);

  return (
    <ToastRootContext.Provider value={true}>
      {children}
      {isRoot && <ToastContainer />}
    </ToastRootContext.Provider>
  );
}

export function useToast() {
  if (useContext(ToastRootContext) === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  // Same module-level singleton toastApi.js builds — the hook and the plain
  // `import { toast }` entry point can never drift apart.
  return toast;
}
