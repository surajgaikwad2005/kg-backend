'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { Breadcrumb } from './Breadcrumb';
import { DateRangePicker } from './DateRangePicker';
import { getRouteMeta } from '@/src/config/routeMeta';

/**
 * PageHeader — drop this at the top of any page's <main> element.
 *
 * Props:
 *   title          — overrides the auto-derived route title
 *   subtitle       — overrides the auto-derived route subtitle
 *   showDateRange  — show the shared date range picker (default: false)
 *   showBreadcrumb — show the breadcrumb strip below the header bar (default: true)
 *   breadcrumbs    — explicit crumb override for state-based navigation (no URL change).
 *                    undefined → auto-derive from pathname
 *                    []        → hide breadcrumb
 *                    [{label, icon?, href?}] → render these crumbs under the feature home
 *   children       — optional extra content rendered between the subtitle and right actions
 */
export function PageHeader({ title, subtitle, showDateRange = false, showBreadcrumb = true, breadcrumbs, children }) {
    const pathname = usePathname();

    const meta = getRouteMeta(pathname);
    const displayTitle    = title    ?? meta.title;
    const displaySubtitle = subtitle ?? meta.subtitle;

    return (
        <div className={cn(
            'shrink-0',
            'bg-surface',
            'border-b border-border',
            'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        )}>
            {/* ── Main header bar ── */}
            <header className="min-h-[68px] py-3 flex items-center justify-between gap-4 px-6">
                {/* Left: title + subtitle */}
                <div className="min-w-0 flex-1 pr-2">
                    <h1 className="text-title font-extrabold text-text-primary tracking-tight leading-tight truncate">
                        {displayTitle}
                    </h1>
                    <p className="text-label font-bold text-text-subtle uppercase tracking-widest mt-0.5 truncate" title={displaySubtitle}>
                        {displaySubtitle}
                    </p>
                    {children}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {showDateRange && <DateRangePicker />}
                </div>
            </header>

            {/* ── Breadcrumb strip ── */}
            {showBreadcrumb && (
                <Breadcrumb
                    key={pathname + '|' + (breadcrumbs?.[0]?.label ?? breadcrumbs?.length ?? '')}
                    pathname={pathname}
                    crumbs={breadcrumbs}
                />
            )}
        </div>
    );
}
