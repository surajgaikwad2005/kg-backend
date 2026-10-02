'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';

const PnidRouterContext = createContext(null);

/**
 * useNextRouterFallback — wraps Next.js router with the PnidRouter API shape.
 * Called unconditionally (hooks rule) inside usePnidRouter; result is used only
 * when no PnidRouterProvider ancestor exists (i.e. real URL-route mode).
 */
function useNextRouterFallback() {
  const nextRouter = useRouter();
  const pathname = usePathname();
  return {
    push: (url) => nextRouter.push(url),
    back: () => nextRouter.back(),
    pathname,
    onComplete: () => window.dispatchEvent(new CustomEvent('pnid:complete')),
    onProcessed: (detail) => window.dispatchEvent(new CustomEvent('pnid:processed', { detail })),
    onValidated: (detail) => window.dispatchEvent(new CustomEvent('pnid:validated', { detail })),
    onClose: undefined,
  };
}

/**
 * usePnidRouter — two operating modes:
 *
 * 1. MODAL MODE  — when rendered inside a PnidRouterProvider (e.g. PnidFlowModal).
 *    `push` changes React state; `currentRoute` drives which page component renders.
 *    Lifecycle callbacks (onProcessed, onValidated, onClose) are wired to the modal host.
 *
 * 2. STANDALONE URL MODE — when used outside a Provider (real Next.js routes).
 *    `push` calls nextRouter.push(); `pathname` reflects the real URL.
 *    Lifecycle callbacks are no-ops (no modal host to notify).
 */
export const usePnidRouter = () => {
  const context = useContext(PnidRouterContext);
  const fallback = useNextRouterFallback(); // always called — satisfies hooks rule

  if (!context) {
    return { currentRoute: fallback.pathname, router: fallback };
  }
  return context;
};

/**
 * PnidRouterProvider — modal-mode router. Wrap PnidFlowModal's content with this
 * so all nested pages share the same in-modal navigation state.
 */
export const PnidRouterProvider = ({ children, onComplete, onProcessed, onValidated, onClose }) => {
  const [currentRoute, setCurrentRoute] = useState(PNID_ROUTES.home);
  const [history, setHistory] = useState([PNID_ROUTES.home]);

  const push = (route) => {
    setCurrentRoute(route);
    setHistory((prev) => [...prev, route]);
  };

  const back = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const newHistory = prev.slice(0, -1);
      setCurrentRoute(newHistory[newHistory.length - 1]);
      return newHistory;
    });
  };

  const router = {
    push,
    back,
    pathname: currentRoute,
    onComplete: onComplete || (() => {}),
    onProcessed: onProcessed || (() => {}),
    onValidated: onValidated || (() => {}),
    onClose: onClose || (() => {}),
  };

  return (
    <PnidRouterContext.Provider value={{ currentRoute, router }}>
      {children}
    </PnidRouterContext.Provider>
  );
};

/**
 * PnidUrlModeProvider — used by real Next.js URL route pages (under /pnid/*).
 * Provides a PnidRouterContext whose `push` maps old modal-style route strings
 * (e.g. PNID_ROUTES.manageFiles) to real URL-builder routes, so private-folder
 * page components work unchanged inside URL routes without breaking modal mode.
 * Lifecycle callbacks dispatch window CustomEvents that PnidFlowModal relays to AdminPanel.
 *
 * Plant-scoped, not workspace-scoped — the URL builders take no name argument
 * anymore (one implicit workspace per globally-selected plant).
 */
export const PnidUrlModeProvider = ({ children }) => {
  const nextRouter = useRouter();
  const pathname = usePathname();

  const router = useMemo(() => ({
    push: (route) => {
      if (route === PNID_ROUTES.manageFiles) return nextRouter.push(PNID_ROUTES.manageFilesUrl());
      if (route === PNID_ROUTES.validate) return nextRouter.push(PNID_ROUTES.validateUrl());
      if (route === PNID_ROUTES.templateMatching) return nextRouter.push(PNID_ROUTES.templateMatchingUrl());
      if (route === PNID_ROUTES.home) return nextRouter.push(PNID_ROUTES.homeUrl());
      return nextRouter.push(route);
    },
    back: () => nextRouter.back(),
    pathname,
    onComplete: () => window.dispatchEvent(new CustomEvent('pnid:complete')),
    onProcessed: (detail) => window.dispatchEvent(new CustomEvent('pnid:processed', { detail })),
    onValidated: (detail) => window.dispatchEvent(new CustomEvent('pnid:validated', { detail })),
    onClose: undefined,
  }), [nextRouter, pathname]);

  return (
    <PnidRouterContext.Provider value={{ currentRoute: pathname, router }}>
      {children}
    </PnidRouterContext.Provider>
  );
};
