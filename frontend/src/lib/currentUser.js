/**
 * currentUser.js
 * Single source for "who is acting" when an API needs a `created_by` string.
 *
 * Lived in admin/decision-template/utils/workflowUtils.js until the asset-config
 * hook was promoted out of that route folder (both the admin modal and the
 * /asset-config page need it now, and a shared hook must not reach back into a
 * route folder). workflowUtils.js re-exports this so its existing importers are
 * untouched.
 */

/** Derives a display username from the locally-stored login (title-cased, domain stripped). */
export const getCurrentUsername = () => {
    const rawUser =
        typeof window !== 'undefined'
            ? localStorage.getItem('username')?.split('@')[0].split('.')[0] || 'admin'
            : 'admin';
    return rawUser.charAt(0).toUpperCase() + rawUser.slice(1);
};
