'use client';
import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Select } from '@/src/components/ui/Select';
import { BoardToolbar } from '../../_components/BoardToolbar';
import { TagPicker } from '../../_components/TagPicker';

/**
 * EquipmentToolbar — controls for the single-equipment board.
 *
 * Shares `BoardToolbar` with the train board, so the time window, refresh and
 * reset-layout controls are literally the same component in both places; only
 * the left-hand selectors differ. Adds a back link to the diagram the user came
 * from, replacing the old hand-rolled header's arrow button.
 */
export function EquipmentToolbar({
    backHref,
    equipmentList,
    equipmentId,
    onEquipmentChange,
    tags,
    selectedTags,
    onSelectedTagsChange,
    onRefresh,
    onResetLayout,
    canResetLayout,
    isRefreshing,
}) {
    const equipmentOptions = useMemo(
        () => equipmentList.map((eq) => ({ value: eq.id, label: eq.label })),
        [equipmentList]
    );

    return (
        <BoardToolbar
            onRefresh={onRefresh}
            onResetLayout={onResetLayout}
            canResetLayout={canResetLayout}
            isRefreshing={isRefreshing}
        >
            <Link
                href={backHref}
                aria-label="Back to workflow diagram"
                title="Back to workflow diagram"
                className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-bold text-text-secondary transition-all duration-(--duration-fast) hover:border-border-strong hover:text-text-primary"
            >
                <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Diagram</span>
            </Link>

            {equipmentOptions.length > 0 && (
                <div className="min-w-0 max-w-56 flex-1 sm:w-56 sm:flex-none">
                    <Select
                        id="equipment-binding"
                        value={equipmentId ?? ''}
                        onChange={onEquipmentChange}
                        options={equipmentOptions}
                        placeholder="Bind an asset"
                        searchable={equipmentOptions.length > 8}
                        triggerClassName="h-8"
                    />
                </div>
            )}

            <TagPicker
                tags={tags}
                selected={selectedTags}
                onChange={onSelectedTagsChange}
                disabled={tags.length === 0}
            />
        </BoardToolbar>
    );
}
