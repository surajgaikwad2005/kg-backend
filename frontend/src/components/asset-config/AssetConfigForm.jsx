'use client';
import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle2, Settings2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { ConfigFieldRenderer } from '@/src/components/config-fields/ConfigFieldRenderer';

/**
 * AssetConfigForm — presentational renderer for an asset's config schema
 * (the `config` object returned by assetConfigOption, already seeded with
 * `userValue` by useAssetConfig).
 *
 * Shared by the admin "Configure Asset" modal and the /asset-config/[assetId]
 * page, which want the same fields in two different shells — hence `variant`
 * rather than two components:
 *   • `flat`  — plain stacked sections, for the modal body.
 *   • `cards` — one bordered card per config group, for the full page.
 *
 * Owns no state: the caller passes configGroups down and receives edits back
 * through onFieldChange(groupKey, index, value).
 *
 * configGroups: { [groupKey]: { name?, description?, configurations: [...] } }
 */

/**
 * Section heading. The backend ships its own `name` per group (e.g.
 * "template Selection", "Optimization [Investigate]") — that is the label the
 * user is meant to see, so it wins. Humanizing the raw key is only the fallback
 * for a group that arrives without one.
 */
const humanizeGroupKey = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
const groupTitle = (groupKey, group) => group?.name || humanizeGroupKey(groupKey);

// A textarea reads badly at half width next to a one-line input.
const FULL_WIDTH_TYPES = new Set(['text-field']);

function ConfigFormSkeleton({ variant }) {
    return (
        <div className={cn('space-y-4', variant === 'cards' && 'space-y-5')} aria-busy="true">
            {[0, 1].map((i) => (
                <div
                    key={`asset-config-skeleton-${i}`}
                    className={cn('space-y-3', variant === 'cards' && 'rounded-2xl border border-border bg-surface p-5')}
                >
                    <Skeleton className="h-3 w-40 rounded-full" delay={i * 0.08} />
                    <Skeleton className="h-9 w-full rounded-(--do-radius)" delay={i * 0.08} />
                    <Skeleton className="h-9 w-2/3 rounded-(--do-radius)" delay={i * 0.08} />
                </div>
            ))}
            <span className="sr-only">Loading asset configuration</span>
        </div>
    );
}

function GroupFields({ groupKey, configurations, onFieldChange, variant }) {
    return (
        <div className={cn(variant === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4')}>
            {configurations.map((config, index) => (
                <div
                    key={config.name || `${groupKey}-${index}`}
                    className={cn(variant === 'cards' && FULL_WIDTH_TYPES.has(config.type) && 'md:col-span-2')}
                >
                    <ConfigFieldRenderer
                        config={config}
                        value={config.userValue}
                        onChange={(newValue) => onFieldChange(groupKey, index, newValue)}
                    />
                </div>
            ))}
        </div>
    );
}

export function AssetConfigForm({
    assetId = '',
    phase = 'idle',
    error = null,
    alreadyConfigured = false,
    configGroups = {},
    onFieldChange,
    variant = 'flat',
    showStatusBanner = true,
    className = '',
}) {
    const groupEntries = useMemo(() => Object.entries(configGroups), [configGroups]);
    const hasFields = useMemo(
        () => groupEntries.some(([, group]) => group?.configurations?.length > 0),
        [groupEntries],
    );

    if (phase === 'idle') return null;
    if (phase === 'loading') return <ConfigFormSkeleton variant={variant} />;

    if (phase === 'error') {
        return (
            <div
                role="alert"
                className={cn('flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-2xl p-4', className)}
            >
                <AlertCircle className="w-5 h-5 text-danger shrink-0" />
                <p className="text-sm text-danger">{error}</p>
            </div>
        );
    }

    return (
        <div className={cn(variant === 'cards' ? 'space-y-5' : 'space-y-5', className)}>
            {showStatusBanner && (
                <div
                    className={cn(
                        'flex items-center gap-2 rounded-(--do-radius) px-3 py-2 text-xs font-semibold',
                        alreadyConfigured ? 'bg-success/10 text-success' : 'bg-info/10 text-info',
                    )}
                >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {alreadyConfigured
                        ? `${assetId} is already configured — editing its saved configuration.`
                        : `${assetId} is not configured yet — filling defaults for a new configuration.`}
                </div>
            )}

            {!hasFields && (
                <div className="text-sm text-text-secondary italic bg-border/20 border border-border rounded-2xl p-6 text-center">
                    No configurable fields returned for this asset.
                </div>
            )}

            {hasFields && groupEntries.map(([groupKey, group]) => (
                variant === 'cards' ? (
                    <section
                        key={groupKey}
                        className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md"
                    >
                        <header className="flex items-start gap-2.5 px-5 py-3.5 border-b border-border bg-surface-2/40">
                            <span className="p-1.5 rounded-(--do-radius) bg-brand/10 shrink-0">
                                <Settings2 className="w-3.5 h-3.5 text-brand" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-text-primary">{groupTitle(groupKey, group)}</h3>
                                {group.description && (
                                    <p className="text-label font-semibold text-text-muted">{group.description}</p>
                                )}
                            </div>
                        </header>
                        <div className="p-5">
                            <GroupFields
                                groupKey={groupKey}
                                configurations={group.configurations}
                                onFieldChange={onFieldChange}
                                variant={variant}
                            />
                        </div>
                    </section>
                ) : (
                    <div key={groupKey} className="space-y-4">
                        <div>
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">
                                {groupTitle(groupKey, group)}
                            </h4>
                            {group.description && (
                                <p className="text-label font-semibold text-text-muted mt-0.5">{group.description}</p>
                            )}
                        </div>
                        <GroupFields
                            groupKey={groupKey}
                            configurations={group.configurations}
                            onFieldChange={onFieldChange}
                            variant={variant}
                        />
                    </div>
                )
            ))}
        </div>
    );
}
