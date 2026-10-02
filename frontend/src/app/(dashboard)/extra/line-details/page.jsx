'use client';
import React, { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Activity, Droplets, Box, Settings, MoreVertical, ArrowLeft, Bell, GripVertical } from 'lucide-react';
import dynamic from 'next/dynamic';
// Dynamically import the Highcharts component to avoid SSR issues
const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const initialLayouts = {
    lg: [
        { i: 'kpis', x: 0, y: 0, w: 12, h: 1.3, minW: 12, minH: 1.3 },
        { i: 'trend', x: 0, y: 1.3, w: 12, h: 4.5, minW: 8, minH: 3 },
        { i: 'table', x: 0, y: 5.8, w: 12, h: 4.5, minW: 6, minH: 4 },
    ],
};
const PanelHeader = ({ title, badge = null }) => (<div className="drag-handle cursor-move p-4 border-b border-border flex items-center justify-between bg-surface rounded-t-2xl shrink-0">
        <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-border-strong"/>
            <h2 className="text-text-primary font-black text-[14px] uppercase tracking-[0.15em]">{title}</h2>
            {badge}
        </div>
        <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-surface-2 rounded transition-colors"><Settings className="w-4 h-4 text-text-subtle"/></button>
            <MoreVertical className="w-4 h-4 text-text-subtle"/>
        </div>
    </div>);
function LineDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lineId = searchParams.get('id') || 'L-390';
    const { width, containerRef, mounted } = useContainerWidth();
    const [layouts, setLayouts] = useState(initialLayouts);
    const [viewMode, setViewMode] = useState('lanes');
    // Generated trend data for 24 hours
    const trendData = useMemo(() => {
        const data = [];
        const now = Date.now();
        const start = now - 24 * 3600000;
        const generateSeries = (base, variance) => {
            const series = [];
            for (let i = 0; i < 24 * 12; i++) {
                series.push([start + i * 300000, base + Math.sin(i / 10) * variance + Math.random() * (variance / 2)]);
            }
            return series;
        };
        return [
            { name: 'Pressure (Bar)', data: generateSeries(42, 2.5), color: '#3b82f6' },
            { name: 'Temperature (°C)', data: generateSeries(125, 5), color: '#f59e0b' },
            { name: 'Flow (kg/hr)', data: generateSeries(850, 40), color: '#10b981' },
            { name: 'Corrosion Rate (mm/yr)', data: generateSeries(0.12, 0.02), color: '#ef4444' }
        ];
    }, []);
    const chartOptions = useMemo(() => {
        const isLanes = viewMode === 'lanes';
        return {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: 300,
                style: { fontFamily: 'Inter, sans-serif' },
                // spacingLeft: 20,
                // spacingRight: 20
            },
            title: { text: '' },
            credits: { enabled: false },
            xAxis: {
                type: 'datetime',
                lineColor: '#e2e8f0',
                tickColor: '#e2e8f0',
                labels: { style: { fontSize: '10px', fontWeight: '700', color: '#64748b' } },
                crosshair: { width: 1, color: '#94a3b8', dashStyle: 'Dot' }
            },
            yAxis: trendData.map((s, idx) => ({
                title: { text: isLanes ? '' : '' },
                visible: isLanes ? true : (idx === 0),
                gridLineColor: '#f1f5f9',
                height: isLanes ? `${100 / trendData.length}%` : '100%',
                top: isLanes ? `${(100 / trendData.length) * idx}%` : '0%',
                offset: 0,
                labels: { style: { fontSize: '9px', fontWeight: '700', color: s.color } }
            })),
            tooltip: {
                shared: true,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e2e8f0',
                borderRadius: 12,
                shadow: true,
                style: { fontSize: '10px' }
            },
            plotOptions: {
                line: {
                    marker: { enabled: false },
                    lineWidth: 2,
                    states: { hover: { lineWidth: 3 } }
                }
            },
            series: trendData.map((s, idx) => ({
                type: 'line',
                name: s.name,
                data: s.data,
                color: s.color,
                yAxis: isLanes ? idx : 0
            }))
        };
    }, [viewMode, trendData]);
    const specs1500 = [
        { id: 1, lineNo: '12"-HV-0302-CS601', size: '12', serviceCode: 'HV', pipeSpec: 'CS601', fluidService: 'MIXED', circuit: 'LGPE-02-1000-002P', fromTag: 'OW-1', fromDesc: 'OIL WELL 1', toTag: 'HP-1', toDesc: 'HP SEPARATOR', continuesTo: 'PID-0105', notes: 'WELL EFFLUENT' },
        { id: 2, lineNo: '12"-HV-0303-CS601', size: '12', serviceCode: 'HV', pipeSpec: 'CS601', fluidService: 'MIXED', circuit: 'LGPE-02-1000-002P', fromTag: 'OW-2', fromDesc: 'OIL WELL 2', toTag: 'HP-1', toDesc: 'HP SEPARATOR', continuesTo: 'PID-0105', notes: 'WELL EFFLUENT' },
        { id: 3, lineNo: '12"-HV-0304-CS601', size: '12', serviceCode: 'HV', pipeSpec: 'CS601', fluidService: 'MIXED', circuit: 'LGPE-02-1000-002P', fromTag: 'OW-3', fromDesc: 'OIL WELL 3', toTag: 'HP-1', toDesc: 'HP SEPARATOR', continuesTo: 'PID-0105', notes: 'WELL EFFLUENT' },
    ];
    const specs3000 = [
        { id: 1, lineNo: '6"-W-1400-CS150', size: '6', serviceCode: 'W', pipeSpec: 'CS150', fluidService: 'WATER', circuit: 'LGPE-19-3100-001WT', fromTag: 'HP-1', fromDesc: 'HP SEPARATOR', toTag: 'WT-1', toDesc: 'WATER TREATMENT', continuesTo: '', notes: 'PRODUCED WATER' },
        { id: 2, lineNo: '6"-W-1401-CS150', size: '6', serviceCode: 'W', pipeSpec: 'CS150', fluidService: 'WATER', circuit: 'LGPE-19-3100-001WT', fromTag: 'LP-1', fromDesc: 'LP SEPARATOR', toTag: 'WT-1', toDesc: 'WATER TREATMENT', continuesTo: '', notes: 'PRODUCED WATER' },
    ];
    const specs3200 = [
        { id: 1, lineNo: '8"-O-1400-CS601', size: '8', serviceCode: 'O', pipeSpec: 'CS601', fluidService: 'OIL', circuit: 'LGPE-19-3200-011OIL', fromTag: 'HP-1', fromDesc: 'HP SEPARATOR', toTag: 'LP-1', toDesc: 'LP SEPARATOR', continuesTo: 'PID-0106', notes: '' },
        { id: 2, lineNo: '8"-O-1401-CS601', size: '8', serviceCode: 'O', pipeSpec: 'CS601', fluidService: 'OIL', circuit: 'LGPE-19-3200-012OIL', fromTag: 'LP-1', fromDesc: 'LP SEPARATOR', toTag: 'COAL-1', toDesc: 'COALESCER', continuesTo: '', notes: '' },
    ];
    const specs4000 = [
        { id: 1, lineNo: '450-PG-24026-63451', size: '450', serviceCode: 'PG', pipeSpec: '63451', fluidService: 'PROCESS GAS', circuit: '1', fromTag: 'E-2440B', fromDesc: '1ST STAGE EXPORT COMPRESSOR AFTER COOLER TRAIN B', toTag: 'V-2440B', toDesc: 'V-2440B', continuesTo: '', notes: '' },
        { id: 2, lineNo: '450-PG-24026-63451-IA-27', size: '450', serviceCode: 'PG', pipeSpec: '63451', fluidService: 'PROCESS GAS', circuit: '2', fromTag: 'E-2450B', fromDesc: '2ND STAGE EXPORT COMPRESSOR AFTER COOLER TRAIN B', toTag: 'V-2440B', toDesc: 'V-2440B', continuesTo: '', notes: '' },
        { id: 3, lineNo: '450-PG-24031-93451-IA-27', size: '450', serviceCode: 'PG', pipeSpec: '93451-IA-27', fluidService: 'PROCESS GAS', circuit: '3', fromTag: 'V-2450B', fromDesc: 'EXPORT COMPRESSOR 2ND STAGE SUCTION SCRUBBER DRUM B', toTag: 'K2450B', toDesc: 'EXPORT COMPRESSOR K2450B', continuesTo: '', notes: '' },
        { id: 4, lineNo: '3000-PG-24032-91492-IA-27', size: '3000', serviceCode: 'PG', pipeSpec: '91492-IA-27', fluidService: 'PROCESS GAS', circuit: '4', fromTag: 'K2450B', fromDesc: 'EXPORT COMPRESSOR K2450B', toTag: 'E-2460B', toDesc: '2ND STAGE EXPORT COMPRESSOR AFTER COOLER', continuesTo: '', notes: '' },
    ];
    const getSpecsForLine = (id) => {
        if (id.includes('1500'))
            return specs1500;
        if (id.includes('3000'))
            return specs3000;
        if (id.includes('3200'))
            return specs3200;
        if (id.includes('4000'))
            return specs4000;
        return specs1500; // default
    };
    const getMetadataForLine = (id) => {
        if (id.includes('1500'))
            return {
                damageMechanism: 'CO2 Corrosion / Erosion',
                materialFlow: 'Multiphase (Crushed/Water)',
                moc: 'Carbon Steel + 3mm Clad'
            };
        if (id.includes('3000'))
            return {
                damageMechanism: 'Microbiologically Induced Corrosion',
                materialFlow: 'Produced Water',
                moc: 'Super Duplex Stainless Steel'
            };
        if (id.includes('3200'))
            return {
                damageMechanism: 'Localized Pitting / Naphthenic Acid',
                materialFlow: 'Stabilized Crude Oil',
                moc: 'Carbon Steel / Stainless Steel'
            };
        if (id.includes('4000'))
            return {
                damageMechanism: 'Co2 Corrosion, Corrosion Under Insulation',
                materialFlow: 'Process Gas (Hot)',
                moc: 'Carbon Steel / 5Cr-0.5Mo'
            };
        return {
            damageMechanism: 'Sulfidation / HTHA',
            materialFlow: 'Process Gas (Hot)',
            moc: 'Carbon Steel / 5Cr-0.5Mo'
        };
    };
    const metadata = getMetadataForLine(lineId);
    const mockData = {
        lineNo: lineId,
        corrosionLoop: `CL-${lineId.split('-').pop()}-P1`,
        damageMechanism: metadata.damageMechanism,
        materialFlow: metadata.materialFlow,
        moc: metadata.moc,
        specifications: getSpecsForLine(lineId)
    };
    return (<>
                <header className="h-20 shrink-0 border-b border-border flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.push('/home')} className="flex items-center justify-center w-10 h-10 bg-canvas border border-border hover:bg-surface hover:shadow-md rounded-xl transition-all duration-300 group">
                            <ArrowLeft className="w-5 h-5 text-text-secondary group-hover:-translate-x-0.5 transition-transform"/>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-brand uppercase tracking-widest mb-1">
                                <Box className="w-3 h-3"/> Industrial Flow Line
                            </div>
                            <h1 className="text-[26px] font-black text-text-primary tracking-tight uppercase">
                                Line Details: <span className="text-brand">{mockData.lineNo}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-surface-2 p-1 rounded-xl">
                            <button className="px-4 py-2 text-[10px] font-black uppercase text-text-muted bg-surface rounded-lg shadow-sm">Real-time</button>
                            <button className="px-4 py-2 text-[10px] font-black uppercase text-text-subtle hover:text-text-secondary00 transition-colors">Historical</button>
                        </div>
                        <button className="p-3 bg-surface border border-border rounded-xl hover:shadow-md transition-all relative">
                            <Bell className="w-5 h-5 text-text-secondary"/>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto thin-scrollbar" ref={containerRef}>
                    {mounted && (<ResponsiveGridLayout width={width} layouts={layouts} onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)} breakpoints={{ lg: 1200 }} cols={{ lg: 12 }} rowHeight={80} dragConfig={{ handle: '.drag-handle' }} margin={[24, 24]}>
                            {/* KPI Cards */}
                            <div key="kpis" className="bg-transparent flex items-stretch justify-between gap-6 overflow-hidden">
                                {[
                { label: 'Corrosion Loop', value: mockData.corrosionLoop, icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Damage Mechanism', value: mockData.damageMechanism, icon: Activity, color: 'text-danger', bg: 'bg-danger/10' },
                { label: 'Material Flow', value: mockData.materialFlow, icon: Droplets, color: 'text-brand', bg: 'bg-brand-muted' },
                { label: 'Pipe Material', value: mockData.moc, icon: Box, color: 'text-text-secondary', bg: 'bg-surface-2' },
            ].map((kpi, i) => (<div key={i} className="flex-1 flex flex-col min-h-[100px] bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 group">
                                        <div className="flex justify-between items-center">
                                            <div className={`p-2.5 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                                                <kpi.icon className={`w-5 h-5 ${kpi.color}`}/>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] font-bold text-text-subtle uppercase tracking-widest">{kpi.label}</div>
                                                <div className="text-[18px] font-black text-text-primary mt-0.5">{kpi.value}</div>
                                            </div>
                                        </div>
                                    </div>))}
                            </div>

                            {/* Detailed Table */}
                            <div key="table" className="bg-surface rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
                                <PanelHeader title="Detailed Line Specifications" badge={<span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2 tracking-tighter">Verified</span>}/>
                                <div className="flex-1 overflow-x-auto p-4 thin-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[1600px]">
                                        <thead>
                                            <tr className="bg-brand text-white">
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 first:border-l-0 whitespace-nowrap">Line Number</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">Size (in)</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">Service Code</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">Pipe Spec</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">Fluid Service</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">Circuit Numbers (LGPE)</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">FROM Tag</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">FROM Description</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">TO Tag</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">TO Description</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 whitespace-nowrap">Continues to PID</th>
                                                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border border-brand/70 border-t-0 last:border-r-0 whitespace-nowrap">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockData.specifications.map((spec) => (<tr key={spec.id} onClick={() => router.push(`/inspection-report?lineId=${spec.lineNo}`)} className="group hover:bg-brand-muted/50 cursor-pointer transition-all font-medium text-[12px] bg-surface last:border-b-0">
                                                    <td className="px-4 py-3 border border-border first:border-l-0 whitespace-nowrap font-bold text-text-primary leading-tight">
                                                        {spec.lineNo}
                                                    </td>
                                                    <td className="px-4 py-3 border border-border">{spec.size}</td>
                                                    <td className="px-4 py-3 border border-border">{spec.serviceCode}</td>
                                                    <td className="px-4 py-3 border border-border">{spec.pipeSpec}</td>
                                                    <td className="px-4 py-3 border border-border whitespace-nowrap">{spec.fluidService}</td>
                                                    <td className="px-4 py-3 border border-border italic text-text-muted00 whitespace-nowrap">{spec.circuit}</td>
                                                    <td className="px-4 py-3 border border-border font-bold text-brand">{spec.fromTag}</td>
                                                    <td className="px-4 py-3 border border-border whitespace-nowrap">{spec.fromDesc}</td>
                                                    <td className="px-4 py-3 border border-border font-bold text-brand">{spec.toTag}</td>
                                                    <td className="px-4 py-3 border border-border whitespace-nowrap">{spec.toDesc}</td>
                                                    <td className="px-4 py-3 border border-border text-success00 font-bold">{spec.continuesTo}</td>
                                                    <td className="px-4 py-3 border border-border last:border-r-0 italic text-text-subtle min-w-[200px]">
                                                        {spec.notes}
                                                    </td>
                                                </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </ResponsiveGridLayout>)}
                </div>

        </>);
}
export default function LineDetailsPage() {
    return (<Suspense fallback={<div>Loading...</div>}>
            <LineDetailsContent />
        </Suspense>);
}
