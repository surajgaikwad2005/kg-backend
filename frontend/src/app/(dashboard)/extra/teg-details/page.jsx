'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimeSelector from '@/src/components/ui/TimeSelector';
import TegDetailedDiagram from '@/src/components/diagrams/teg/TegDetailedDiagram';
import FlowChart from '@/src/components/charts/FlowChart';
import AlertsPanel from '@/src/components/dashboard/AlertsPanel';
import { Bell, GripVertical, MoreVertical, ArrowLeft } from 'lucide-react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
// 1. Grid Layout Configuration (Height set to 7 to prevent diagram clipping)
const initialLayouts = {
    lg: [
        { i: 'diagram', x: 0, y: 0, w: 8, h: 7, minW: 4, minH: 4 },
        { i: 'alerts', x: 8, y: 0, w: 4, h: 10, minW: 3, minH: 4 },
        { i: 'chart', x: 0, y: 7, w: 8, h: 3, minW: 4, minH: 2 },
    ],
};
// 2. Shared Panel Header Component
const PanelHeader = ({ title, badge = null }) => (<div className="drag-handle cursor-move p-3 border-b border-border flex items-center justify-between bg-surface rounded-t-xl shrink-0">
        <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-text-subtle"/>
            <h2 className="text-text-primary font-bold text-[16px] uppercase tracking-tight">{title}</h2>
            {badge}
        </div>
        <MoreVertical className="w-4 h-4 text-text-subtle"/>
    </div>);
export default function TegDetailsPage() {
    const router = useRouter();
    const { width, containerRef, mounted } = useContainerWidth();
    const [layouts, setLayouts] = useState(initialLayouts);
    return (<>


                {/* Header Area */}
                <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/home')} className="p-2 hover:bg-surface-2 rounded-lg transition-colors" title="Back to Main Dashboard">
                            <ArrowLeft className="w-5 h-5 text-text-muted"/>
                        </button>
                        <h1 className="text-[22px] font-bold text-text-primary tracking-tight uppercase">
                            TEG Unit Details
                        </h1>
                        <span className="bg-success/10 text-success border border-success/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase">
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"/>
                            Live Monitoring
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <TimeSelector />
                        <button onClick={() => setLayouts(initialLayouts)} className="px-3 py-1.5 text-[14px] font-bold bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors uppercase">
                            Reset Layout
                        </button>
                        <button className="p-2 text-text-subtle hover:text-text-muted relative">
                            <Bell className="w-5 h-5"/>
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border border-surface"></span>
                        </button>
                    </div>
                </header>

                {/* Draggable Grid Area */}
                <div className="flex-1 p-6 overflow-y-auto" ref={containerRef}>
                    {mounted && (<ResponsiveGridLayout width={width} layouts={layouts} onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)} breakpoints={{ lg: 1200 }} cols={{ lg: 12 }} rowHeight={100} dragConfig={{ handle: '.drag-handle' }} margin={[24, 24]}>
                            {/* 1. Diagram Panel */}
                            <div key="diagram" className="bg-surface rounded-xl border flex flex-col overflow-hidden relative shadow-sm">
                                <PanelHeader title="P&ID Detailed View"/>

                                {/* The Interactive Component */}
                                <TegDetailedDiagram />
                            </div>

                            {/* 2. Alerts Panel */}
                            <div key="alerts" className="bg-surface rounded-xl border flex flex-col overflow-hidden shadow-sm">
                                <PanelHeader title="System Alerts" badge={<span className="bg-danger/10 text-danger text-[10px] font-bold px-1.5 py-0.5 rounded">4 NEW</span>}/>
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <AlertsPanel />
                                </div>
                            </div>

                            {/* 3. Flow Chart Panel */}
                            <div key="chart" className="bg-surface rounded-xl border flex flex-col overflow-hidden shadow-sm">
                                <PanelHeader title="TEG Circulation Rate (24h)"/>
                                <div className="p-4 flex-1">
                                    <FlowChart />
                                </div>
                            </div>

                        </ResponsiveGridLayout>)}
                </div>
        </>);
}
