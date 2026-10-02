import { generateId } from '@/src/lib/utils';

import { DEFAULT_DURATION, DEFAULT_POSITION, POSITIONS } from './constants';

// Framework-agnostic pub/sub singleton — no React import. One instance for
// the lifetime of the page, so it can be imported (and mutated) from plain
// files such as src/services/*.js, not just from components/hooks.
const toastsById = new Map();
const listeners = new Set();
let limitByPosition = Infinity;
let cachedSnapshot = null;

// User-configurable defaults (Settings → Notifications), pushed in by
// ToastProvider whenever prefs.toastPosition/toastDuration change. Falls
// back to the hardcoded constants until Settings has ever set a value —
// null means "no override", not "off".
let userDefaults = { position: null, duration: null };

export function setDefaults({ position, duration } = {}) {
  userDefaults = {
    position: position || null,
    duration: Number.isFinite(duration) ? duration : null,
  };
}

export function getDefaults() {
  return {
    position: userDefaults.position ?? DEFAULT_POSITION,
    duration: userDefaults.duration ?? DEFAULT_DURATION,
  };
}

// Settings → Notifications → "Show toast notifications" master switch,
// pushed in by ToastProvider. Defaults to on so toasts work before the
// customization prefs have ever loaded.
let enabled = true;

export function setEnabled(value) {
  enabled = value !== false;
}

export function getEnabled() {
  return enabled;
}

function emptySnapshot() {
  const snap = {};
  POSITIONS.forEach((position) => {
    snap[position] = [];
  });
  return snap;
}

const SERVER_SNAPSHOT = Object.freeze(emptySnapshot());

function notify() {
  cachedSnapshot = null;
  listeners.forEach((listener) => listener());
}

function countVisible(position) {
  let count = 0;
  toastsById.forEach((t) => {
    if (t.position === position && t.status === 'visible') count += 1;
  });
  return count;
}

function promoteNextQueued(position) {
  let next = null;
  toastsById.forEach((t) => {
    if (t.position === position && t.status === 'queued') {
      if (!next || t.createdAt < next.createdAt) next = t;
    }
  });
  if (next) {
    next.status = 'visible';
    next.updatedAt = Date.now();
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

// Memoized per-position grouping, required so useSyncExternalStore doesn't
// infinite-loop on a freshly-allocated object every render.
export function getSnapshot() {
  if (cachedSnapshot) return cachedSnapshot;
  const snap = emptySnapshot();
  Array.from(toastsById.values())
    .filter((t) => t.status === 'visible')
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((t) => snap[t.position].push(t));
  cachedSnapshot = snap;
  return snap;
}

export function setLimit(n) {
  limitByPosition = n ?? Infinity;
  POSITIONS.forEach((position) => {
    let before = -1;
    while (countVisible(position) < limitByPosition && countVisible(position) !== before) {
      before = countVisible(position);
      promoteNextQueued(position);
    }
  });
  notify();
}

// Dedupes by toastId (no-op, returns the existing id if already active);
// otherwise creates a new record, queued if the position is at its limit.
export function addToast(input) {
  const { toastId, position: explicitPosition, ...rest } = input;
  // Master switch off: skip the store entirely so nothing renders. Still
  // return an id so callers that later call update()/dismiss() on it
  // (loading/promise toasts) get a harmless no-op instead of an error.
  if (!enabled) return toastId ?? generateId();
  const position = explicitPosition || getDefaults().position;
  if (toastId && toastsById.has(toastId)) {
    return toastId;
  }
  const id = toastId ?? generateId();
  const now = Date.now();
  const status = countVisible(position) < limitByPosition ? 'visible' : 'queued';
  toastsById.set(id, {
    id,
    position,
    status,
    createdAt: now,
    updatedAt: now,
    ...rest,
  });
  notify();
  return id;
}

// Merges onto the existing record and bumps updatedAt (so the progress bar
// restarts its countdown). No-op if the id no longer exists — safe for a
// promise() settling after the user already dismissed the loading toast.
export function updateToast(id, patch) {
  const existing = toastsById.get(id);
  if (!existing) return;
  toastsById.set(id, { ...existing, ...patch, id, updatedAt: Date.now() });
  notify();
}

export function dismissToast(id) {
  const existing = toastsById.get(id);
  if (!existing) return;
  toastsById.delete(id);
  if (existing.status === 'visible') promoteNextQueued(existing.position);
  notify();
}

export function dismissAll(position) {
  if (!position) {
    toastsById.clear();
  } else {
    toastsById.forEach((t, id) => {
      if (t.position === position) toastsById.delete(id);
    });
  }
  notify();
}

export function clearQueue(position) {
  toastsById.forEach((t, id) => {
    if (t.status === 'queued' && (!position || t.position === position)) {
      toastsById.delete(id);
    }
  });
  notify();
}
