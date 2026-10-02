'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from '@/src/components/ui/toast/toastApi';

const SECRET = 'taitaitai';
const DEV_OPTIONS_PREFIX = '/developer-options';

const DeveloperAccessContext = createContext(null);

/**
 * Shared home for the "taitaitai" Konami-style unlock. Mounted once in the
 * root layout (src/app/layout.jsx) because Sidebar is mounted independently
 * in more than one route group ((dashboard)/layout.jsx AND
 * (admin)/admin/layout.jsx) and both need to see the same in-memory state as
 * the routed page content sitting alongside them.
 *
 * - `unlocked`  → sidebar entry visibility. Single reveal: set true by the
 *   secret keystroke, set false the instant the entry is clicked
 *   (consumeReveal), so it has to be retyped every time.
 * - `hasAccess` → route gate for /developer-options/*. Granted at the same
 *   moment as `unlocked`, but only revoked when the user navigates to a
 *   route outside /developer-options — so it survives the click-through
 *   navigation into the section, but a later Back button or a fresh/direct
 *   URL both land here with hasAccess already (or freshly) false.
 *
 * Both flags are in-memory only (useState) — a hard reload resets everything,
 * so this never persists as a standing backdoor.
 */
export function DeveloperAccessProvider({ children }) {
  const pathname = usePathname();
  const [unlocked, setUnlocked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Revoke access the moment the user leaves the section for anything else,
  // so Back button / re-entering the URL can never land back inside without
  // the secret being typed again. Adjusted during render (React's "adjusting
  // state when a prop changes" pattern) rather than in an effect, so the
  // revoke is visible in the very same commit as the navigation — no extra
  // render pass, no flash of the guarded content.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (!pathname.startsWith(DEV_OPTIONS_PREFIX)) {
      setHasAccess(false);
    }
  }

  useEffect(() => {
    if (unlocked) return;

    let buffer = '';
    const handleKeydown = (e) => {
      const target = e.target;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (isTyping || e.key.length !== 1) return;

      buffer = (buffer + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer === SECRET) {
        setUnlocked(true);
        setHasAccess(true);
        toast.success('Developer option activated', undefined, { toastId: 'developer-options-unlocked' });
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [unlocked]);

  const consumeReveal = useCallback(() => setUnlocked(false), []);

  return (
    <DeveloperAccessContext.Provider value={{ unlocked, hasAccess, consumeReveal }}>
      {children}
    </DeveloperAccessContext.Provider>
  );
}

export function useDeveloperAccess() {
  const ctx = useContext(DeveloperAccessContext);
  if (!ctx) throw new Error('useDeveloperAccess must be used within DeveloperAccessProvider');
  return ctx;
}
