'use client';
import React, { useCallback, useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { CompressorToolbar } from './CompressorToolbar';
import { CompressorBoard, DEFAULT_LAYOUTS } from './CompressorBoard';
import { useCompressorParams } from '../_hooks/useCompressorParams';
import { useCompressorEquipment } from '../_hooks/useCompressorEquipment';
import { useTagSeries } from '../_hooks/useTagSeries';
import { usePersistedLayouts } from '../_hooks/usePersistedLayouts';
import { getTrainMeta } from '../_utils/trainMeta';

/**
 * CompressorDetailsView — composition root for the compressor board.
 *
 * Holds no data logic of its own: it wires the URL state (`useCompressorParams`)
 * to the live P1 Dashboard telemetry (`useCompressorEquipment` → `useTagSeries`)
 * and hands the result to the presentation layer.
 */
export function CompressorDetailsView() {
    const { train, equipmentOverride, selectedTags, setTrain, setEquipment, setSelectedTags } =
        useCompressorParams();

    const {
        equipmentList,
        equipment,
        tags,
        defaultTagIds,
        loading: equipmentLoading,
        error: equipmentError,
        refetch: refetchEquipment,
    } = useCompressorEquipment(train, equipmentOverride);

    // Nothing pinned in the URL → chart the equipment's first few tags.
    const activeTagIds = useMemo(
        () => (selectedTags.length > 0 ? selectedTags : defaultTagIds),
        [selectedTags, defaultTagIds]
    );

    const trainMeta = getTrainMeta(train);
    const {
        summaries,
        timestamps,
        fleet,
        loading: seriesLoading,
        error: seriesError,
        refetch: refetchSeries,
    } = useTagSeries(activeTagIds, {
        title: `${trainMeta.title} — ${trainMeta.label}`,
        equipmentId: equipment?.id || '',
    });

    // The board is per-train, so each train remembers its own arrangement.
    const { layouts, handleLayoutChange, resetLayouts, isDirty } = usePersistedLayouts(
        `compressor-board-layout:${train}`,
        DEFAULT_LAYOUTS
    );

    const refetchAll = useCallback(() => {
        refetchEquipment();
        refetchSeries();
    }, [refetchEquipment, refetchSeries]);

    // Depends on the individual values rather than the hook's return object,
    // which is a fresh literal every render and would defeat the memo.
    const telemetry = useMemo(
        () => ({
            summaries,
            timestamps,
            fleet,
            loading: equipmentLoading || seriesLoading,
            error: equipmentError || seriesError,
            refetch: refetchAll,
            hasSelection: activeTagIds.length > 0,
        }),
        [summaries, timestamps, fleet, equipmentLoading, seriesLoading, equipmentError, seriesError, refetchAll, activeTagIds.length]
    );

    return (
        <>
            <PageHeader
                title={trainMeta.title}
                subtitle={
                    equipment
                        ? `${trainMeta.label} · ${equipment.label}`
                        : `${trainMeta.label} · Diagnostic Fleet Suite`
                }
                breadcrumbs={[{ label: 'Compressor Details', icon: Gauge }]}
            />

            <CompressorToolbar
                train={train}
                onTrainChange={setTrain}
                equipmentList={equipmentList}
                equipmentId={equipment?.id ?? null}
                onEquipmentChange={setEquipment}
                tags={tags}
                selectedTags={activeTagIds}
                onSelectedTagsChange={setSelectedTags}
                onRefresh={refetchAll}
                onResetLayout={resetLayouts}
                canResetLayout={isDirty}
                isRefreshing={telemetry.loading}
            />

            <div className="relative min-h-0 flex-1 bg-canvas">
                <CompressorBoard
                    train={train}
                    telemetry={telemetry}
                    layouts={layouts}
                    onLayoutChange={handleLayoutChange}
                />
            </div>
        </>
    );
}
