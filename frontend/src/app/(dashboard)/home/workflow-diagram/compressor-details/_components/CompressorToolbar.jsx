'use client';
import React, { useMemo } from 'react';
import { Select } from '@/src/components/ui/Select';
import { cn } from '@/src/lib/utils';
import { BoardToolbar } from './BoardToolbar';
import { TagPicker } from './TagPicker';
import { TRAIN_IDS, TRAIN_META } from '../_utils/trainMeta';

/**
 * CompressorToolbar — the control strip under the PageHeader on the train board.
 *
 * Everything here writes to the URL (train / equipment / tags) or to the shared
 * time range, so the board's whole configuration is shareable and survives a
 * reload. Previously the only way to switch trains was to navigate back to the
 * workflow canvas and click a different one.
 *
 * The time window / refresh / reset-layout cluster is not repeated here — it
 * comes from `BoardToolbar`, which the equipment detail board composes too.
 */
export function CompressorToolbar({
    train,
    onTrainChange,
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
            {/* Train switcher */}
            <div
                role="group"
                aria-label="Select compressor train"
                className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-canvas p-0.5"
            >
                {TRAIN_IDS.map((id) => {
                    const isActive = id === train;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onTrainChange(id)}
                            aria-pressed={isActive}
                            title={TRAIN_META[id].label}
                            className={cn(
                                'cursor-pointer rounded-md px-2.5 py-1 text-tiny font-black uppercase tracking-wider',
                                'transition-all duration-(--duration-fast)',
                                isActive
                                    ? 'bg-brand text-white shadow-sm'
                                    : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                            )}
                        >
                            {TRAIN_META[id].pill}
                        </button>
                    );
                })}
            </div>

            {/* Bound equipment */}
            {equipmentOptions.length > 0 && (
                <div className="min-w-0 max-w-56 flex-1 sm:w-56 sm:flex-none">
                    <Select
                        id="compressor-equipment"
                        value={equipmentId ?? ''}
                        onChange={onEquipmentChange}
                        options={equipmentOptions}
                        placeholder="Select equipment"
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
