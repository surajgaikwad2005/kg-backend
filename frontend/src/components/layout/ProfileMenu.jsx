'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMsal } from '@azure/msal-react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, LogOut, ChevronDown, ChevronRight, Loader2, ShieldCheck, UserRound } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { logout as authLogout } from '@/src/services/user-registry/authService';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { useCustomization } from '@/src/context/visuals/CustomizationContext';
import { useMenuMotion } from './menuMotion';
import SettingsModal from '@/src/components/settings/SettingsModal';

function Avatar({ initials, isAdmin, className }) {
    return (
        <span
            className={cn(
                // rounded-4xl (not rounded-full), same Geometry-scaling
                // reasoning as the trigger buttons above.
                'shrink-0 flex items-center justify-center rounded-4xl font-bold text-white shadow-sm',
                // Admin badge keeps the static --color-overlay base (does not
                // adapt to light/dark by design), but still needs to react to
                // Settings → Accent Color somehow — a brand-colored ring does
                // that without touching the fill itself.
                isAdmin ? 'bg-overlay border-2 border-brand/70' : 'bg-brand',
                className,
            )}
        >
            {initials}
        </span>
    );
}

/**
 * ProfileMenu — avatar + name/role trigger rendered in PageHeader's top-right
 * corner. Opens a small account-card dropdown with Settings and Logout,
 * replacing the previous standalone gear icon and the sidebar's user-card footer.
 * Visual language (glass panel, corner glow, tinted icon tiles) matches
 * SettingsModal — this app's existing reference for "premium" chrome.
 */
export function ProfileMenu() {
    const router = useRouter();
    const { instance: msalInstance } = useMsal();
    const queryClient = useQueryClient();
    const { success: toastSuccess } = useToast();
    const { openConfirm } = useConfirm();
    const { prefs } = useCustomization();
    const compact = prefs.profileDisplay === 'compact';
    const { motionOff, panelMotion, tapTransition } = useMenuMotion();

    const [role, setRole] = useState(null);
    const [username, setUsername] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        setRole(localStorage.getItem('role'));
        setUsername(localStorage.getItem('username'));
        setMounted(true);
        const handler = () => {
            setRole(localStorage.getItem('role'));
            setUsername(localStorage.getItem('username'));
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        const onEscape = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, [open]);

    const isAdmin = mounted && role === 'admin';

    const getInitials = (name) => {
        if (!name) return isAdmin ? 'SU' : 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const formatRole = (roleStr) => {
        if (!roleStr) return isAdmin ? 'Administrator' : 'User';
        if (roleStr.toLowerCase() === 'admin') return 'Administrator';
        return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
    };

    const initials = mounted ? getInitials(username) : isAdmin ? 'SU' : 'U';
    const displayName = mounted && username ? username : isAdmin ? 'Superuser' : 'Operator ID';
    const displayRole = mounted ? formatRole(role) : isAdmin ? 'Administrator' : 'Operator';

    const handleLogout = async () => {
        setOpen(false);
        const confirmed = await openConfirm('You will need to sign in again to access your account.', {
            title: 'Log out?',
            confirmLabel: 'Logout',
            cancelLabel: 'Cancel',
            variant: 'danger',
        });
        if (!confirmed) return;

        setLoggingOut(true);
        try {
            await authLogout();
        } catch (_) {}
        // Azure Entra ID is the only login method — locally clear MSAL's cached
        // account too, so the next sign-in attempt doesn't silently reuse a
        // stale cached session.
        try { await msalInstance.clearCache(); } catch (_) {}
        localStorage.removeItem('auth');
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('auth_provider');
        // The query cache lives in QueryProvider's useState for the lifetime of
        // the tab — clearing localStorage does not touch it. Without this, the
        // next user to sign in on this tab renders the previous user's cached
        // plant data instantly (and, within staleTime, may not even refetch).
        // AuthInterceptor does the same on forced logout; this is the path users
        // actually take.
        queryClient.clear();
        toastSuccess('Logged out', username ? `See you soon, ${username}` : undefined);
        setLoggingOut(false);
        router.push('/');
    };

    return (
        <div className="relative" ref={menuRef}>
            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Open profile menu"
                title={compact ? `${displayName} · ${displayRole}` : undefined}
                whileHover={motionOff ? undefined : { scale: compact ? 1.05 : 1.015 }}
                whileTap={motionOff ? undefined : { scale: compact ? 0.95 : 0.97 }}
                transition={tapTransition}
                className={cn(
                    // rounded-(--do-radius), same reasoning as PlantSwitcher's
                    // trigger: the raw Geometry token every other control uses.
                    'group flex items-center rounded-(--do-radius) border cursor-pointer',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    compact ? 'justify-center w-10 h-10' : 'gap-2.5 h-10 pl-1.5 pr-3',
                    open
                        ? 'bg-brand-muted border-brand/30 shadow-sm shadow-brand/10'
                        : 'bg-canvas border-border hover:bg-surface-2 hover:border-border-strong',
                )}
            >
                <Avatar
                    initials={initials}
                    isAdmin={isAdmin}
                    className={compact ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-tiny'}
                />

                {!compact && (
                    <>
                        <span className="hidden sm:flex flex-col items-start min-w-0 max-w-35 leading-none">
                            <span className="text-body-sm font-bold text-text-primary truncate w-full text-left">
                                {displayName}
                            </span>
                            <span className="text-label text-text-muted font-medium truncate w-full text-left mt-0.5">
                                {displayRole}
                            </span>
                        </span>

                        <ChevronDown
                            className={cn(
                                'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
                                open ? 'rotate-180 text-brand' : 'text-text-subtle group-hover:text-text-muted',
                            )}
                        />
                    </>
                )}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="menu"
                        aria-label="Profile menu"
                        initial={panelMotion.initial}
                        animate={panelMotion.animate}
                        exit={panelMotion.exit}
                        transition={panelMotion.transition}
                        style={{ transformOrigin: 'top right' }}
                        className={cn(
                            'absolute right-0 top-[calc(100%+10px)] z-100 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border',
                            'bg-surface/95 backdrop-blur-2xl shadow-modal overflow-hidden',
                        )}
                    >
                        {/* Account card */}
                        <div className="relative overflow-hidden px-4 py-4">
                            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand/10 blur-2xl pointer-events-none" />

                            <div className="relative flex items-center gap-3">
                                <Avatar initials={initials} isAdmin={isAdmin} className="w-11 h-11 text-sm" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-tiny font-bold text-text-subtle uppercase tracking-widest">
                                        Signed in as
                                    </p>
                                    <p className="text-sm font-bold text-text-primary truncate leading-tight mt-0.5">
                                        {displayName}
                                    </p>
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full',
                                            'text-tiny font-semibold',
                                            isAdmin ? 'bg-overlay text-white' : 'bg-brand-muted text-brand',
                                        )}
                                    >
                                        {isAdmin ? (
                                            <ShieldCheck className="w-2.5 h-2.5" />
                                        ) : (
                                            <UserRound className="w-2.5 h-2.5" />
                                        )}
                                        {displayRole}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Actions */}
                        <div className="p-1.5">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => { setOpen(false); setSettingsOpen(true); }}
                                className={cn(
                                    'group/item w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer',
                                    'text-body-sm font-semibold text-text-secondary transition-colors duration-150',
                                    'hover:bg-surface-2',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex items-center justify-center w-9 h-9 rounded-xl shrink-0',
                                        'bg-brand/10 border border-brand/20 text-brand transition-colors duration-150',
                                        'group-hover/item:bg-brand/15',
                                    )}
                                >
                                    <Settings className="w-4 h-4" />
                                </span>
                                <span className="flex-1 text-left">Settings</span>
                                <ChevronRight
                                    className={cn(
                                        'w-3.5 h-3.5 text-text-subtle shrink-0 transition-all duration-150',
                                        'opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:text-brand',
                                    )}
                                />
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleLogout}
                                disabled={loggingOut}
                                aria-busy={loggingOut}
                                className={cn(
                                    'group/item w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer mt-0.5',
                                    'text-body-sm font-semibold text-text-secondary transition-colors duration-150',
                                    'hover:bg-danger/10 hover:text-danger',
                                    loggingOut && 'opacity-70 cursor-not-allowed',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex items-center justify-center w-9 h-9 rounded-xl shrink-0',
                                        'bg-surface-2 border border-border text-text-muted transition-colors duration-150',
                                        'group-hover/item:bg-danger/10 group-hover/item:border-danger/20 group-hover/item:text-danger',
                                    )}
                                >
                                    {loggingOut ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4" />
                                    )}
                                </span>
                                <span className="flex-1 text-left">
                                    {loggingOut ? 'Logging out…' : 'Logout'}
                                </span>
                            </button>
                        </div>

                        {panelMotion.sheen && <div className="liquid-glass-sheen" />}
                    </motion.div>
                )}
            </AnimatePresence>

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
