'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, FolderSearch } from 'lucide-react';
import { useSourceTabs } from '@/src/components/admin/views/hooks/useSourceTabs';
import { SourceRailItem } from '@/src/components/admin/views/components/SourceRailItem';
import { SourceRailItemCompact } from '@/src/components/admin/views/components/SourceRailItemCompact';
import { Input } from '@/src/components/ui/Input';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { cn } from '@/src/lib/utils';

const COLLAPSED_KEY = 'dataSourceSidebar:collapsed';

function readCollapsed() {
    try { return localStorage.getItem(COLLAPSED_KEY) === 'true'; } catch { return false; }
}

/**
 * Fixed second sidebar for the Data Source Integration + Review sub-routes —
 * lives in data-source-integration/layout.jsx so it stays mounted across both
 * (CLAUDE.md #45). Replaces the horizontal tab row that used to render inside
 * SharedSourceHeader on every source view. Shrinkable via a toggle button
 * (persisted to localStorage) and filterable via a search box, mirroring the
 * collapse/search rail pattern already used by the PlantGPT SessionSidebar
 * (src/app/(dashboard)/plant-gpt/_components/SessionSidebar.jsx) so both
 * secondary sidebars in the app share one look — circular chevron toggle,
 * Tooltip on every collapsed icon, shared Input atom for the search field.
 */
export function DataSourceSidebar() {
    const { tabs, showTabs } = useSourceTabs();
    const [isCollapsed, setIsCollapsedState] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        setIsCollapsedState(readCollapsed());
    }, []);

    const setIsCollapsed = (val) => {
        setIsCollapsedState(val);
        try { localStorage.setItem(COLLAPSED_KEY, String(val)); } catch {}
    };

    const filteredTabs = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return tabs;
        return tabs.filter((tab) => tab.type.toLowerCase().includes(q));
    }, [tabs, query]);

    if (!showTabs || tabs.length === 0) return null;

    return (
        <aside
            aria-label="Data sources"
            className={cn(
                'hidden md:flex shrink-0 h-full flex-col border-r border-border bg-surface py-5',
                'transition-[width] duration-[var(--duration-base,300ms)] ease-[cubic-bezier(0.32,0.72,0,1)]',
                isCollapsed ? 'w-18 px-2' : 'w-64 px-3',
            )}
        >
            <div className={cn('flex items-center gap-2 mb-3 shrink-0', isCollapsed ? 'flex-col' : 'justify-between px-2.5')}>
                {!isCollapsed && (
                    <p className="text-label font-bold text-text-muted uppercase tracking-widest">
                        Data Sources
                    </p>
                )}
                <Tooltip label={isCollapsed ? 'Expand panel' : 'Collapse panel'} side="right">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? 'Expand data sources panel' : 'Collapse data sources panel'}
                        className={cn(
                            'flex items-center justify-center w-7 h-7 rounded-full border border-border bg-surface shrink-0 cursor-pointer shadow-sm',
                            'text-text-subtle hover:text-brand hover:border-brand/30',
                            'transition-all duration-[var(--duration-fast,150ms)]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                        )}
                    >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    </button>
                </Tooltip>
            </div>

            {isCollapsed ? (
                <Tooltip label="Search sources" side="right">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        aria-label="Search data sources"
                        className="mb-3 w-10 h-10 mx-auto shrink-0 flex items-center justify-center rounded-xl bg-canvas border border-border text-text-subtle cursor-pointer transition-colors duration-[var(--duration-fast,150ms)] hover:text-brand"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </Tooltip>
            ) : (
                <Input
                    size="sm"
                    icon={Search}
                    aria-label="Search data sources"
                    placeholder="Search sources..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    wrapperClassName="mb-3 shrink-0"
                    rightElement={query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            className="flex items-center justify-center w-4.5 h-4.5 rounded-full text-text-subtle hover:text-text-primary hover:bg-surface-2 transition-colors duration-[var(--duration-fast,150ms)] cursor-pointer"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                />
            )}

            <div className={cn('flex flex-col overflow-y-auto overflow-x-hidden flex-1 hide-scrollbar', isCollapsed ? 'gap-2' : 'gap-1.5')}>
                {filteredTabs.length === 0 ? (
                    isCollapsed ? (
                        <Tooltip label={`No sources match "${query}"`} side="right">
                            <div className="mx-auto w-10 h-10 flex items-center justify-center bg-canvas border border-dashed border-border rounded-xl">
                                <FolderSearch className="w-4 h-4 text-text-subtle" />
                            </div>
                        </Tooltip>
                    ) : (
                        <div className="mx-0.5 my-2 px-4 py-6 text-center bg-canvas border border-dashed border-border rounded-xl">
                            <FolderSearch className="w-6 h-6 text-text-subtle mx-auto mb-2" aria-hidden="true" />
                            <p className="text-label font-bold uppercase tracking-widest text-text-subtle">
                                No sources match &ldquo;{query}&rdquo;
                            </p>
                        </div>
                    )
                ) : (
                    filteredTabs.map((tab, idx) => {
                        // A divider marks a group boundary (pnid / documents / historian /
                        // sap / other / standalone) between two ADJACENT rendered rows —
                        // computed after filtering so a search query never leaves a
                        // stray/duplicate line.
                        const showDivider = idx > 0 && tab.group !== filteredTabs[idx - 1].group;
                        return (
                            <React.Fragment key={tab.type}>
                                {showDivider && (
                                    <div
                                        className={cn('shrink-0 border-t border-border', isCollapsed ? 'my-1 mx-2' : 'my-1')}
                                        aria-hidden="true"
                                    />
                                )}
                                {isCollapsed
                                    ? <SourceRailItemCompact tab={tab} />
                                    : <SourceRailItem tab={tab} />}
                            </React.Fragment>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
