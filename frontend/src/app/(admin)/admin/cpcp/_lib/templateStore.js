'use client';

import { STORAGE_KEY, SEED_TEMPLATES } from './constants';

/**
 * Local persistence for the CPCP template list. The backend contract for this
 * flow isn't wired yet (design is still "static"), so the home list and the
 * wizard's completion step share state through localStorage instead of a
 * fetch — swap both call sites for `cpcpService` once the API lands.
 */
export function readTemplates() {
    if (typeof window === 'undefined') return SEED_TEMPLATES;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return Array.isArray(parsed) ? parsed : SEED_TEMPLATES;
    } catch {
        return SEED_TEMPLATES;
    }
}

export function writeTemplates(templates) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch {
        /* storage unavailable (private mode / quota) — list just won't persist across reloads */
    }
}

export function addTemplate(entry) {
    const next = [entry, ...readTemplates()];
    writeTemplates(next);
    return next;
}
