'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import AlertsPanel from '@/src/components/dashboard/AlertsPanel';
import { GripVertical, MoreVertical, Pencil, AlertTriangle, LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { useRouter } from 'next/navigation';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import SavedWorkflowFlow from './_components/SavedWorkflowFlow';
import { useDashboardDiagram } from './_hooks/useDashboardDiagram';
import { Skeleton } from '@/src/components/ui/Skeleton';

const INITIAL_LAYOUTS = {
    lg: [
        { i: 'diagram', x: 0, y: 0, w: 9, h: 8, minW: 4, minH: 3 },
        { i: 'alerts',  x: 9, y: 0, w: 3, h: 8, minW: 3, minH: 4 },
    ],
    md: [
        { i: 'diagram', x: 0, y: 0, w: 9, h: 6, minW: 4, minH: 3 },
        { i: 'alerts',  x: 9, y: 0, w: 3, h: 6, minW: 3, minH: 4 },
    ],
};

const CARD_VARIANTS = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

function PanelHeader({ title, icon: Icon, badge = null, action = null }) {
    return (
        <div className="drag-handle cursor-move px-4 py-3 border-b border-border flex items-center justify-between bg-surface rounded-t-xl shrink-0 select-none">
            <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-text-subtle shrink-0" />
                {Icon && (
                    <div className="p-1 bg-brand/10 rounded-md">
                        <Icon className="w-3.5 h-3.5 text-brand" />
                    </div>
                )}
                <h2 className="text-text-primary font-bold text-body-sm flex items-center gap-2">
                    {title}
                </h2>
                {badge}
            </div>
            <div className="flex items-center gap-1.5">
                {action}
                <button
                    aria-label="Panel options"
                    className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                >
                    <MoreVertical className="w-4 h-4 text-text-subtle" />
                </button>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const { width, containerRef, mounted } = useContainerWidth();
    const [layouts, setLayouts] = useState(INITIAL_LAYOUTS);
    // Alert count is reported up by AlertsPanel so the badge reflects the real
    // feed instead of a hardcoded number — and without a second fetch.
    const [alertsCount, setAlertsCount] = useState(0);

    const {
        diagram,
        nodes,
        edges,
        isLoading: diagramLoading,
        error: diagramError,
        refetch: refetchDiagram,
    } = useDashboardDiagram();

    const onLayoutChange = useCallback((_, allLayouts) => setLayouts(allLayouts), []);

    const handleEditDiagram = useCallback(() => router.push('/home/workflow-diagram'), [router]);

    const editAction = useMemo(() => (
        <button
            onClick={handleEditDiagram}
            aria-label="Edit diagram"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 hover:bg-brand-muted text-text-muted hover:text-brand border border-border hover:border-brand/30 rounded-lg transition-all duration-200 text-caption font-black uppercase tracking-wider cursor-pointer"
        >
            <Pencil className="w-3 h-3" />
            Edit
        </button>
    ), [handleEditDiagram]);

    // Panel title is the saved diagram's own name (GET /loadDiagram), never a
    // hardcoded label — shimmer while it resolves, honest empty state after.
    const diagramTitle = useMemo(() => {
        if (diagramLoading) return <Skeleton as="span" className="inline-block h-3.5 w-40 rounded-full" />;
        return diagram?.name || 'No Diagram Pinned';
    }, [diagramLoading, diagram]);

    const diagramBadge = useMemo(() => {
        if (diagramLoading || !nodes.length) return null;
        return (
            <span className="bg-brand/10 text-brand text-label font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                {nodes.length} {nodes.length === 1 ? 'Asset' : 'Assets'}
            </span>
        );
    }, [diagramLoading, nodes.length]);

    const alertsBadge = useMemo(() => {
        if (!alertsCount) return null;
        return (
            <span className="bg-danger/10 text-danger text-label font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                {alertsCount} New
            </span>
        );
    }, [alertsCount]);

    return (<>

                <PageHeader showDateRange title="CPCP Configuration" subtitle="Platform Configuration" />

                <div className="flex-1 p-5 overflow-y-auto" ref={containerRef}>
                    {mounted && (
                        <ResponsiveGridLayout
                            width={width}
                            layouts={layouts}
                            onLayoutChange={onLayoutChange}
                            breakpoints={{ lg: 1200, md: 996 }}
                            cols={{ lg: 12, md: 10 }}
                            rowHeight={100}
                            draggableHandle=".drag-handle"
                            margin={[20, 20]}
                        >
                            {/* Diagram Panel */}
                            <div key="diagram">
                                <motion.div
                                    className="h-full bg-surface rounded-xl border border-border flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                                    variants={CARD_VARIANTS}
                                    initial="hidden"
                                    animate="visible"
                                    custom={0}
                                >
                                    <PanelHeader
                                        title={diagramTitle}
                                        icon={LayoutGrid}
                                        badge={diagramBadge}
                                        action={editAction}
                                    />
                                    <div className="flex-1 min-h-0">
                                        <SavedWorkflowFlow
                                            nodes={nodes}
                                            edges={edges}
                                            isLoading={diagramLoading}
                                            error={diagramError}
                                            onRetry={refetchDiagram}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Alerts Panel */}
                            <div key="alerts">
                                <motion.div
                                    className="h-full bg-surface rounded-xl border border-border flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                                    variants={CARD_VARIANTS}
                                    initial="hidden"
                                    animate="visible"
                                    custom={1}
                                >
                                    <PanelHeader
                                        title="System Alerts"
                                        icon={AlertTriangle}
                                        badge={alertsBadge}
                                    />
                                    <div className="flex-1 min-h-0 overflow-hidden">
                                        <AlertsPanel onCountChange={setAlertsCount} />
                                    </div>
                                </motion.div>
                            </div>
                        </ResponsiveGridLayout>
                    )}
                </div>
        </>
    );
}
