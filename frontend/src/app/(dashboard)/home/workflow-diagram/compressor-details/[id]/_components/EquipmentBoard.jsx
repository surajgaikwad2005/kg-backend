'use client';
import React, { useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { Activity, BellRing, GaugeCircle, Image as ImageIcon, LineChart, ListTree } from 'lucide-react';
import AlertsPanel from '@/src/components/dashboard/AlertsPanel';
import { PanelShell, PanelBadge } from '../../_components/PanelShell';
import { PanelContent, TileSkeleton, ChartSkeleton, PanelEmpty } from '../../_components/PanelState';
import { SignalTiles } from '../../_components/SignalTiles';
import { SignalHealth } from '../../_components/SignalHealth';
import { TrendChart } from '../../_components/TrendChart';
import { EquipmentGraphic } from './EquipmentGraphic';
import { EquipmentSpecs } from './EquipmentSpecs';

/** Grid geometry — module scope so it is never re-created on render (Rule 22). */
const BREAKPOINTS = { lg: 1200, md: 768, sm: 0 };
const COLS = { lg: 12, md: 6, sm: 1 };
const MARGIN = [20, 20];
const ROW_HEIGHT = 100;

export const DEFAULT_LAYOUTS = {
    lg: [
        { i: 'drawing', x: 0, y: 0, w: 5, h: 4.4, minW: 3, minH: 3 },
        { i: 'specs', x: 5, y: 0, w: 3, h: 4.4, minW: 2, minH: 3 },
        { i: 'health', x: 8, y: 0, w: 4, h: 4.4, minW: 3, minH: 4 },
        { i: 'signals', x: 0, y: 4.4, w: 12, h: 2.4, minW: 4, minH: 2 },
        { i: 'trend', x: 0, y: 6.8, w: 8, h: 4, minW: 4, minH: 3 },
        { i: 'alerts', x: 8, y: 6.8, w: 4, h: 4, minW: 3, minH: 3 },
    ],
    md: [
        { i: 'drawing', x: 0, y: 0, w: 3, h: 4, minH: 3 },
        { i: 'specs', x: 3, y: 0, w: 3, h: 4, minH: 3 },
        { i: 'signals', x: 0, y: 4, w: 6, h: 3 },
        { i: 'trend', x: 0, y: 7, w: 6, h: 4 },
        { i: 'health', x: 0, y: 11, w: 3, h: 4.5 },
        { i: 'alerts', x: 3, y: 11, w: 3, h: 4.5 },
    ],
    sm: [
        { i: 'drawing', x: 0, y: 0, w: 1, h: 3.5 },
        { i: 'specs', x: 0, y: 3.5, w: 1, h: 3.5 },
        { i: 'signals', x: 0, y: 7, w: 1, h: 4 },
        { i: 'trend', x: 0, y: 11, w: 1, h: 3.5 },
        { i: 'health', x: 0, y: 14.5, w: 1, h: 4.5 },
        { i: 'alerts', x: 0, y: 19, w: 1, h: 4 },
    ],
};

/**
 * EquipmentBoard — the draggable panel board for one piece of equipment.
 *
 * Mirrors the train board's contract exactly (same grid geometry, same
 * PanelShell/PanelContent state handling, same telemetry panels), so the two
 * screens stay visually and behaviourally identical where they overlap.
 *
 * Drag/resize are switched off below the `md` breakpoint: on a phone the grid
 * competes with page scrolling, and a one-column stack has nothing meaningful
 * to rearrange anyway.
 */
export function EquipmentBoard({
    equipmentName,
    componentType,
    drawing,
    telemetry,
    layouts,
    onLayoutChange,
}) {
    const { width, containerRef, mounted } = useContainerWidth();

    const interactive = width >= BREAKPOINTS.md;
    const dragConfig = useMemo(() => ({ enabled: interactive, handle: '.drag-handle' }), [interactive]);
    const resizeConfig = useMemo(() => ({ enabled: interactive }), [interactive]);

    const {
        summaries, timestamps, fleet, loading, error, refetch, hasSelection,
        equipment, isUnbound, tagCount,
    } = telemetry;
    const noData = summaries.length === 0;

    const emptyState = (
        <PanelEmpty
            icon={<Activity className="h-7 w-7" />}
            title={
                isUnbound
                    ? 'This node is not bound to an asset'
                    : hasSelection
                        ? 'No samples in this window'
                        : 'No signals selected'
            }
            description={
                isUnbound
                    ? `No asset on this plant matches "${equipmentName}". Pin one from the toolbar to chart its telemetry here.`
                    : hasSelection
                        ? 'The plant data service returned no readings for the selected time range. Try a wider window.'
                        : 'Pick one or more signals from the toolbar to chart this equipment.'
            }
        />
    );

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            {mounted && (
                <ResponsiveGridLayout
                    width={width}
                    layouts={layouts}
                    onLayoutChange={onLayoutChange}
                    breakpoints={BREAKPOINTS}
                    cols={COLS}
                    rowHeight={ROW_HEIGHT}
                    margin={MARGIN}
                    dragConfig={dragConfig}
                    resizeConfig={resizeConfig}
                >
                    <div key="drawing">
                        <PanelShell
                            title="Equipment Drawing"
                            icon={ImageIcon}
                            draggable={interactive}
                            badge={
                                drawing.graphic ? (
                                    <PanelBadge tone={drawing.graphic.source === 'plant' ? 'success' : 'neutral'}>
                                        {drawing.graphic.source === 'plant' ? 'P&ID' : 'Library'}
                                    </PanelBadge>
                                ) : null
                            }
                            bodyClassName="bg-canvas"
                        >
                            <EquipmentGraphic
                                graphic={drawing.graphic}
                                loading={drawing.loading}
                                error={drawing.error}
                                onRetry={drawing.refetch}
                                name={equipmentName}
                            />
                        </PanelShell>
                    </div>

                    <div key="specs">
                        <PanelShell title="Identification" icon={ListTree} draggable={interactive}>
                            <EquipmentSpecs
                                componentType={componentType}
                                graphic={drawing.graphic}
                                graphicLoading={drawing.loading}
                                equipment={equipment}
                                isUnbound={isUnbound}
                                tagCount={tagCount}
                                chartedCount={summaries.length}
                                fleet={fleet}
                                loading={loading}
                            />
                        </PanelShell>
                    </div>

                    <div key="health">
                        <PanelShell title="Signal Health" icon={GaugeCircle} draggable={interactive}>
                            <PanelContent
                                loading={loading}
                                error={error}
                                isEmpty={noData}
                                skeleton={<ChartSkeleton bars={6} />}
                                empty={emptyState}
                                onRetry={refetch}
                            >
                                <SignalHealth fleet={fleet} summaries={summaries} />
                            </PanelContent>
                        </PanelShell>
                    </div>

                    <div key="signals">
                        <PanelShell
                            title="Live Signals"
                            icon={Activity}
                            draggable={interactive}
                            badge={<PanelBadge tone="brand">{summaries.length} tracked</PanelBadge>}
                        >
                            <PanelContent
                                loading={loading}
                                error={error}
                                isEmpty={noData}
                                skeleton={<TileSkeleton count={4} />}
                                empty={emptyState}
                                onRetry={refetch}
                            >
                                <SignalTiles summaries={summaries} />
                            </PanelContent>
                        </PanelShell>
                    </div>

                    <div key="trend">
                        <PanelShell
                            title="Telemetry Trend"
                            icon={LineChart}
                            draggable={interactive}
                            badge={timestamps.length > 0 ? <PanelBadge>{timestamps.length} pts</PanelBadge> : null}
                        >
                            <PanelContent
                                loading={loading}
                                error={error}
                                isEmpty={noData}
                                empty={emptyState}
                                onRetry={refetch}
                            >
                                <TrendChart timestamps={timestamps} summaries={summaries} />
                            </PanelContent>
                        </PanelShell>
                    </div>

                    <div key="alerts">
                        <PanelShell title="System Alerts" icon={BellRing} draggable={interactive} bodyClassName="overflow-hidden">
                            <AlertsPanel />
                        </PanelShell>
                    </div>
                </ResponsiveGridLayout>
            )}
        </div>
    );
}
