/**
 * routes.js
 * Single source of truth for all P&ID route paths.
 *
 * Two sets of constants live here:
 *
 * 1. MODAL-MODE IDENTIFIERS (plain strings, backward compat)
 *    Used by PnidRouterContext / PnidFlowModal for the embedded in-modal flow where
 *    navigation is React-state-based, not URL-based.
 *
 * 2. URL BUILDERS
 *    Used for real Next.js navigation. Plant-scoped, not workspace-scoped — there
 *    is no more per-workspace `[workspace]` URL segment (one implicit workspace
 *    per globally-selected plant, same model as workflow-diagram), so these are
 *    fixed paths now, not functions.
 */
export const PNID_ROUTES = {
  // ── Modal-mode route identifiers ─────────────────────────────────────────────
  home: '/admin/pnid',
  manageFiles: '/admin/pnid/manage-files',
  validate: '/admin/pnid/validate',
  templateMatching: '/admin/pnid/template-matching',

  // ── Real Next.js URL builders (plant-scoped, no workspace segment) ────────────
  homeUrl: () => '/admin/domain-configuration/pnid',
  manageFilesUrl: () => '/admin/domain-configuration/pnid/manage-files',
  validateUrl: () => '/admin/domain-configuration/pnid/validate',
  templateMatchingUrl: () => '/admin/domain-configuration/pnid/template-matching',
};
