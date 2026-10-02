/**
 * industry.js
 * Single source of truth for the industry mapping between the UI label the user
 * picks (refinery / lng / cement) and the canonical enum the backend expects
 * (oil_gas / cement). Use these helpers everywhere instead of inline ternaries
 * so the mapping lives in exactly one place.
 */

/** UI dropdown value → backend industry enum. */
export const UI_TO_BACKEND_INDUSTRY = {
    refinery: 'oil_gas',
    lng: 'oil_gas',
    cement: 'cement',
};

/** Backend industry enum → UI dropdown value (oil_gas is shown as Refinery). */
export const BACKEND_TO_UI_INDUSTRY = {
    oil_gas: 'refinery',
    cement: 'cement',
    refinery: 'refinery',
    lng: 'lng',
};

/** Map a UI industry value to the backend enum. Passes unknowns through. */
export const toBackendIndustry = (ui) => (ui ? (UI_TO_BACKEND_INDUSTRY[ui] ?? ui) : null);

/** Map a backend industry enum to the UI value. Passes unknowns through. */
export const toUiIndustry = (backend) => (backend ? (BACKEND_TO_UI_INDUSTRY[backend] ?? backend) : null);
