'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ServerCrash, RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';

const RETRY_COUNTDOWN = 30;

import { apiClient } from '@/src/services/apiClient';

// Use apiClient.raw so the ping itself doesn't re-trigger the backend-offline event,
// but still routes through the proxy factory (handling base URLs properly).
async function pingBackend(path) {
    try {
        const res = await apiClient.raw(path || '/api/domain-configuration/pipeline/jobs', { method: 'GET' });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = null; }
        return data?.error !== 'Backend Offline';
    } catch {
        return false;
    }
}

export default function BackendOfflineModal() {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [offlineInfo, setOfflineInfo] = useState(null);
    const [retrying, setRetrying] = useState(false);
    const [backOnline, setBackOnline] = useState(false);
    const [countdown, setCountdown] = useState(RETRY_COUNTDOWN);
    const countdownRef = useRef(null);
    // Ref so doRetry always reads the latest offlineInfo without stale closure.
    const offlineInfoRef = useRef(null);

    const startCountdown = useCallback(() => {
        setCountdown(RETRY_COUNTDOWN);
        clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const doRetry = useCallback(async () => {
        setRetrying(true);
        clearInterval(countdownRef.current);
        const isOnline = await pingBackend(offlineInfoRef.current?.path);
        if (isOnline) {
            setBackOnline(true);
            // Show "back online" state briefly then close
            setTimeout(() => setVisible(false), 1800);
        } else {
            setRetrying(false);
            startCountdown();
        }
    }, [startCountdown]);

    // Auto-retry when countdown hits 0
    useEffect(() => {
        if (countdown === 0 && visible && !retrying) doRetry();
    }, [countdown, visible, retrying, doRetry]);

    // Listen for backend-offline events emitted by apiClient
    useEffect(() => {
        const onOffline = (e) => {
            offlineInfoRef.current = e.detail || {};
            setOfflineInfo(e.detail || {});
            setVisible(true);
            setMounted(true);
            setRetrying(false);
            setBackOnline(false);
            startCountdown();
        };
        window.addEventListener('backend-offline', onOffline);
        return () => {
            window.removeEventListener('backend-offline', onOffline);
            clearInterval(countdownRef.current);
        };
    }, [startCountdown]);

    // Enter/exit animation — delay unmount until exit transition finishes
    useEffect(() => {
        if (visible) {
            requestAnimationFrame(() => setAnimateIn(true));
        } else {
            setAnimateIn(false);
            const t = setTimeout(() => { setMounted(false); setBackOnline(false); }, 300);
            return () => clearTimeout(t);
        }
    }, [visible]);

    if (!mounted) return null;

    const progress = ((RETRY_COUNTDOWN - countdown) / RETRY_COUNTDOWN) * 100;

    return (
        <div
            className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-all duration-300 ${
                animateIn ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    animateIn ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Card */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="backend-offline-title"
                className={`relative w-full max-w-md bg-surface border rounded-(--do-radius) shadow-2xl overflow-hidden transition-all duration-300 ${
                    backOnline ? 'border-success/40' : 'border-border'
                } ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
            >
                {/* Top progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-border overflow-hidden">
                    {backOnline ? (
                        <div className="h-full w-full bg-success transition-all duration-500" />
                    ) : (
                        <div
                            style={{ '--progress': `${progress}%` }}
                            className="h-full bg-danger transition-all duration-1000 ease-linear w-(--progress)"
                        />
                    )}
                </div>

                <div className="p-8 flex flex-col items-center text-center gap-5">

                    {/* Icon */}
                    <div className="relative">
                        {backOnline ? (
                            <div className="w-20 h-20 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-9 h-9 text-success" strokeWidth={1.5} />
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
                                    <ServerCrash className="w-9 h-9 text-danger" strokeWidth={1.5} />
                                </div>
                                <span className="absolute -inset-1 rounded-2xl border border-danger/30 animate-ping" />
                                <span className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-danger text-white text-label font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg">
                                    <WifiOff size={9} /> Offline
                                </span>
                            </>
                        )}
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <h2 id="backend-offline-title" className={`text-xl font-black tracking-tight ${backOnline ? 'text-success' : 'text-text-primary'}`}>
                            {backOnline ? 'Backend is Back Online' : 'Backend Unreachable'}
                        </h2>
                        <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                            {backOnline
                                ? 'Connection restored successfully. Closing in a moment…'
                                : 'The server is not responding. It may be restarting or experiencing a brief outage.'}
                        </p>
                    </div>

                    {/* Error detail — only when offline */}
                    {!backOnline && offlineInfo?.details && (
                        <div className="w-full bg-danger/5 border border-danger/15 rounded-xl px-4 py-3 text-left">
                            <p className="text-caption font-mono text-danger break-all leading-relaxed">
                                {offlineInfo.details}
                            </p>
                            {offlineInfo.path && (
                                <p className="text-label text-text-muted mt-1 font-mono truncate">
                                    {offlineInfo.method} {offlineInfo.path}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Animated signal bars — only when offline */}
                    {!backOnline && (
                        <div className="w-full flex items-center gap-3">
                            <div className="flex-1 flex items-center gap-1.5">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-1 flex-1 rounded-full bg-danger/20 overflow-hidden">
                                        <div
                                            style={{ '--delay': `${i * 150}ms` }}
                                            className="h-full bg-danger animate-pulse rounded-full [animation-delay:var(--delay)]"
                                        />
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-text-muted whitespace-nowrap shrink-0 flex items-center gap-1">
                                <WifiOff size={11} className="text-danger/70" />
                                No connection
                            </span>
                        </div>
                    )}

                    {/* Actions — only when offline */}
                    {!backOnline && (
                        <div className="w-full flex flex-col items-center gap-3">
                            {!retrying && (
                                <p className="text-xs text-text-muted">
                                    Checking again in{' '}
                                    <span className="font-black text-text-secondary tabular-nums">{countdown}s</span>
                                </p>
                            )}
                            <button
                                onClick={doRetry}
                                disabled={retrying}
                                aria-busy={retrying}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-danger hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-wider rounded-(--do-radius) transition-all shadow-lg shadow-danger/30 cursor-pointer"
                            >
                                <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
                                {retrying ? 'Checking…' : 'Check Now'}
                            </button>
                            <button
                                onClick={() => setVisible(false)}
                                className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer underline underline-offset-2"
                            >
                                Dismiss and continue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
