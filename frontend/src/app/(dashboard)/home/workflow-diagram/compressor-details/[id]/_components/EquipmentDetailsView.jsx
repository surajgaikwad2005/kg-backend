'use client';
import React, { useCallback, useMemo } from 'react';
import { Gauge, Workflow } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { EquipmentToolbar } from './EquipmentToolbar';
import { EquipmentBoard, DEFAULT_LAYOUTS } from './EquipmentBoard';
import { useEquipmentGraphic } from '../_hooks/useEquipmentGraphic';
import { useEquipmentTelemetry } from '../_hooks/useEquipmentTelemetry';
import { useCompressorParams } from '../../_hooks/useCompressorParams';
import { useTagSeries } from '../../_hooks/useTagSeries';
import { usePersistedLayouts } from '../../_hooks/usePersistedLayouts';
import { formatEquipmentId } from '../_utils/equipmentIdentity';

const BACK_HREF = '/home/workflow-diagram';

/**
 * EquipmentDetailsView — composition root for one equipment node's board.
 *
 * Holds no data logic of its own: it wires the route/URL state to the plant's
 * component library (`useEquipmentGraphic` → the real P&ID drawing) and to the
 * live P1 Dashboard telemetry (`useEquipmentTelemetry` → `useTagSeries`), then
 * hands both to the presentation layer.
 *
 * The page is reached by clicking a node on the workflow diagram, so the route
 * carries the node's `componentType` as `[id]` and its caption as `?label=`.
 *
 * `useCompressorParams` is reused verbatim for the tag selection: it merges into
 * the existing query string, so `?label=` survives every selection change and
 * the configured view stays shareable (Rule 38).
 */
export function EquipmentDetailsView({ componentType }) {
    const searchParams = useSearchParams();
    const labelParam = searchParams.get('label');

    const { equipmentOverride, selectedTags, setEquipment, setSelectedTags } = useCompressorParams();

    const node = useMemo(
        () => ({ componentType, label: labelParam || '' }),
        [componentType, labelParam]
    );

    const drawing = useEquipmentGraphic(node);

    const {
        equipmentList,
        equipment,
        isUnbound,
        tags,
        defaultTagIds,
        loading: equipmentLoading,
        error: equipmentError,
        refetch: refetchEquipment,
    } = useEquipmentTelemetry(node, equipmentOverride);

    // The node's caption is the authoritative display name; fall back to the
    // resolved component's own name before ever formatting the raw route id.
    const equipmentName =
        labelParam || drawing.graphic?.name || formatEquipmentId(componentType);

    // Nothing pinned in the URL → chart the asset's first few tags.
    const activeTagIds = useMemo(
        () => (selectedTags.length > 0 ? selectedTags : defaultTagIds),
        [selectedTags, defaultTagIds]
    );

    const {
        summaries,
        timestamps,
        fleet,
        loading: seriesLoading,
        error: seriesError,
        refetch: refetchSeries,
    } = useTagSeries(activeTagIds, {
        title: equipmentName,
        equipmentId: equipment?.id || '',
    });

    // Per-component, so each equipment remembers its own arrangement.
    const { layouts, handleLayoutChange, resetLayouts, isDirty } = usePersistedLayouts(
        `equipment-board-layout:${componentType}`,
        DEFAULT_LAYOUTS
    );

    // Depends on the individual refetch callbacks (each a stable useCallback),
    // not on `drawing` — that object is a fresh literal every render and would
    // invalidate this callback, and the telemetry memo below, on every pass.
    const refetchDrawing = drawing.refetch;
    const refetchAll = useCallback(() => {
        refetchDrawing();
        refetchEquipment();
        refetchSeries();
    }, [refetchDrawing, refetchEquipment, refetchSeries]);

    // Depends on the individual values rather than the hook return objects,
    // which are fresh literals every render and would defeat the memo.
    const telemetry = useMemo(
        () => ({
            summaries,
            timestamps,
            fleet,
            loading: equipmentLoading || seriesLoading,
            error: equipmentError || seriesError,
            refetch: refetchAll,
            hasSelection: activeTagIds.length > 0,
            equipment,
            equipmentList,
            isUnbound,
            tagCount: tags.length,
        }),
        [
            summaries, timestamps, fleet, equipmentLoading, seriesLoading,
            equipmentError, seriesError, refetchAll, activeTagIds.length,
            equipment, equipmentList, isUnbound, tags.length,
        ]
    );

    const breadcrumbs = useMemo(
        () => [
            { label: 'Workflow Diagram', icon: Workflow, href: BACK_HREF },
            { label: equipmentName, icon: Gauge },
        ],
        [equipmentName]
    );

    return (
        <>
            <PageHeader
                title={equipmentName}
                subtitle={
                    equipment
                        ? `Equipment Detail · ${equipment.label}`
                        : 'Equipment Detail · Not bound to a plant asset'
                }
                breadcrumbs={breadcrumbs}
            />

            <EquipmentToolbar
                backHref={BACK_HREF}
                equipmentList={equipmentList}
                equipmentId={equipment?.id ?? null}
                onEquipmentChange={setEquipment}
                tags={tags}
                selectedTags={activeTagIds}
                onSelectedTagsChange={setSelectedTags}
                onRefresh={refetchAll}
                onResetLayout={resetLayouts}
                canResetLayout={isDirty}
                isRefreshing={telemetry.loading || drawing.loading}
            />

            <div className="relative min-h-0 flex-1 bg-canvas">
                <EquipmentBoard
                    equipmentName={equipmentName}
                    componentType={componentType}
                    drawing={drawing}
                    telemetry={telemetry}
                    layouts={layouts}
                    onLayoutChange={handleLayoutChange}
                />
            </div>
        </>
    );
}
