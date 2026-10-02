'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/src/components/ui/Toast';
import { ArrowLeft, ClipboardList, Info, CheckCircle2, MoreVertical, Settings, Plus, Camera, Upload, X, FileDown, Activity, Shield, Clock, AlertOctagon, Layers, BarChart, Maximize2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });
import ExportCompressor from '@/src/components/diagrams/compressor/ExportCompressor';
import CheckValve from '@/src/components/diagrams/shared/CheckValve';
import SuctionScrubber from '@/src/components/diagrams/compressor/SuctionScrubber';
const INITIAL_REPORT_DATA = [
    {
        location: 'Baronia',
        platform: 'BNG-B',
        module: 'Main Deck Level 3',
        reportNo: 'BGC-PI/BNG/AU-001/SKA-25',
        visualNo: 'V1',
        equipmentType: 'PIPING HYDROCARBON',
        lineNo: '450-PG-24026-63451',
        cof: '4',
        category: 'A3_5_Piping_with_non_Removable_U_to_NRL',
        inspectorFindings: 'Localized general corrosion with minor scaling',
        findingsDetails: 'Secondary surface pitting observed on outer radius. No wall loss detected during UT.',
        aifPriority: 'P3', // Yellow
        aifNonAif: 'AIF',
        generalView: '/images/general_view.png',
        photo1: '/images/photo_1.png',
        photo2: '/images/photo_2.png',
        photo3: '/images/photo_3.png',
        recommendation: 'To be Painted',
        remarks: 'Spot coating repair. To apply coating as per PTS 15.20.03 (June 2019)',
        remainingLife: '36'
    },
    {
        location: 'Baronia',
        platform: 'BNG-B',
        module: 'Main Deck Level 3',
        reportNo: 'BGC-PI/BNG/AU-002/SKA-25',
        visualNo: 'V2',
        equipmentType: 'PIPING ANOMALY',
        lineNo: '450-PG-24026-63451',
        cof: '4',
        category: 'A2_6_Bolts_Nuts_Visual_Condition',
        inspectorFindings: 'Depleted bolts or nuts with severe corrosion with thick scaling / shape change / Deformed / mechanical damage.',
        findingsDetails: '*note 1,2,3 - Severe oxidation on flange interface.',
        aifPriority: 'P1', // Red
        aifNonAif: 'AIF',
        generalView: '/images/pipe_1_image.jpg',
        photo1: '/images/pipe_2_image.jpg',
        photo2: '/images/pipe_3_image.jpg',
        photo3: '/images/pipe_4_image.png',
        recommendation: 'To be Repaired',
        remarks: 'Replace corroded bolts and nuts with Zinc-Nickel Plating + PTFE-based coating as specified in PTS 15.20.03 / Table 5 2 CSP 23 Rev. 1',
        remainingLife: '24'
    }
];
const IntegrityKPIsHorizontal = () => {
    const kpis = [
        { label: 'Corrosion Rate', value: '0.042', unit: 'mm/y', icon: Activity, color: 'text-brand', trend: '+1.2%', trendUp: true, detail: 'Current measured metal loss' },
        { label: 'Remaining Wall Thickness', value: '9.32', unit: 'mm', icon: Shield, color: 'text-success', trend: '-0.04', trendUp: false, detail: 'Above retirement limit (8.5mm)' },
        { label: 'Remaining Useful Life', value: '4.8', unit: 'Years', icon: Clock, color: 'text-warning', trend: '-2d', trendUp: false, detail: 'Est. replacement: late 2030' },
        { label: 'Failure Probability', value: '1.2e-4', unit: 'P(f)', icon: AlertOctagon, color: 'text-danger', trend: '+0.5%', trendUp: true, detail: 'Annual probability of failure' },
        { label: 'Sand Deposition Risk', value: 'Low', unit: '', icon: Layers, color: 'text-warning', trend: 'Stable', trendUp: false, detail: 'Accumulation index within range' },
    ];
    return (<div className="w-full flex items-center justify-between gap-4 py-4 px-2 overflow-x-auto no-scrollbar">
            {kpis.map((kpi, idx) => (<div key={idx} className="flex-1 min-w-[200px] flex items-center gap-3 p-3 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-brand/30 transition-all group">
                    <div className={`p-2.5 rounded-xl bg-canvas ${kpi.color} border border-border/40 group-hover:scale-110 transition-transform`}>
                        <kpi.icon className="w-4 h-4"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                            <p className="text-[9px] uppercase font-black text-text-subtle tracking-widest truncate" title={kpi.label}>{kpi.label}</p>
                            <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${kpi.trendUp ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                {kpi.trend}
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-[16px] font-black text-text-primary tabular-nums">{kpi.value}</span>
                            <span className="text-[9px] font-bold text-text-subtle uppercase tracking-tighter">{kpi.unit}</span>
                        </div>
                    </div>
                </div>))}
        </div>);
};
const AssetIntegrityModelWidget = () => {
    const [expandedTitle, setExpandedTitle] = React.useState(null);
    const generateTrendData = (type) => {
        const start = new Date(2020, 0, 1);
        const data = [];
        const points = 132; // Jan 2020 to Dec 2030 (11 years)
        for (let i = 0; i < points; i++) {
            const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
            let value;
            if (type === 'corrosion') {
                // Realistic wall thickness degradation over 11 years
                value = 12.0 - (i * 0.02) - (Math.random() * 0.05);
            }
            else {
                // Realistic sand deposition accumulation over 11 years
                value = 2.0 + (i * 0.04) + (Math.sin(i * 0.2) * 0.5) + (Math.random() * 0.8);
            }
            data.push([date.getTime(), parseFloat(value.toFixed(2))]);
        }
        return data;
    };
    const makeChartOptions = (title, data, color, threshold, yLabel, isExpanded = false) => {
        return {
            chart: {
                type: 'line',
                height: isExpanded ? null : 280,
                backgroundColor: 'transparent',
                style: { fontFamily: 'inherit' },
                spacingBottom: isExpanded ? 20 : 15,
                spacingTop: 20,
                spacingLeft: 10,
                spacingRight: 10
            },
            title: { text: title, style: { fontSize: '12px', fontStyle: 'italic', fontWeight: '800', color: '#1e293b' }, align: 'left' },
            credits: { enabled: false },
            legend: { enabled: false },
            xAxis: {
                type: 'datetime',
                min: new Date(2020, 0, 1).getTime(),
                max: new Date(2030, 11, 31).getTime(),
                labels: {
                    style: { fontSize: isExpanded ? '11px' : '9px', color: '#64748b', fontWeight: 'bold' },
                    format: '{value:%Y}',
                    y: 20
                },
                tickInterval: 365 * 24 * 3600 * 1000,
                tickLength: 0,
                lineWidth: 0,
                gridLineWidth: 0,
                lineColor: '#cbd5e1',
                tickColor: '#cbd5e1'
            },
            yAxis: {
                title: { text: yLabel, style: { fontSize: '10px', color: '#64748b' } },
                labels: { style: { fontSize: '9px', color: '#64748b' } },
                gridLineColor: '#f1f5f9'
            },
            tooltip: { valueDecimals: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)', shadow: true, xDateFormat: '%b %Y' },
            plotOptions: {
                line: {
                    lineWidth: 1.5,
                    color: color,
                    marker: { enabled: true, radius: 3, symbol: 'circle' },
                    states: { hover: { lineWidth: 2 } }
                }
            },
            series: [
                { type: 'line', data, name: title, zIndex: 2 },
                {
                    type: 'line',
                    data: [[data[0][0], threshold], [data[data.length - 1][0], threshold]],
                    name: 'Design Limit',
                    color: '#f97316',
                    dashStyle: 'Dash',
                    lineWidth: 1.5,
                    marker: { enabled: false },
                    enableMouseTracking: false,
                    zIndex: 1
                }
            ],
        };
    };
    const corrosionData = generateTrendData('corrosion');
    const sandData = generateTrendData('sand');
    return (<div className="flex flex-col h-full bg-surface rounded-[32px] border border-border overflow-hidden shadow-sm hover:shadow transition-shadow relative">
            <div className="p-6 border-b border-border/40 flex items-center bg-surface shrink-0">
                <div className="flex items-center gap-3">
                    <BarChart className="w-5 h-5 text-brand"/>
                    <h2 className="text-text-primary font-black text-[14px] uppercase tracking-widest">
                        Asset Integrity Model Analysis
                    </h2>
                </div>
                <MoreVertical className="ml-auto w-4 h-4 text-text-subtle cursor-pointer hover:text-text-secondary transition-colors"/>
            </div>

            <div className="flex-1 flex bg-canvas/30 p-4 gap-6 overflow-hidden items-stretch">
                <div className="flex-1 bg-surface border border-border/40 rounded-3xl shadow-sm relative group overflow-hidden p-2">
                    <HighchartsChart options={makeChartOptions('Corrosion Degradation Trend', corrosionData, '#3b82f6', 9.5, 'Wall Thickness (mm)')}/>
                    <button onClick={() => setExpandedTitle('Corrosion Degradation Trend')} className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur border border-border rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-surface">
                        <Maximize2 className="w-4 h-4 text-text-secondary"/>
                    </button>
                </div>
                <div className="flex-1 bg-surface border border-border/40 rounded-3xl shadow-sm relative group overflow-hidden p-2">
                    <HighchartsChart options={makeChartOptions('Sand Deposition Trend', sandData, '#3b82f6', 7.5, 'Deposition Index')}/>
                    <button onClick={() => setExpandedTitle('Sand Deposition Trend')} className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur border border-border rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-surface">
                        <Maximize2 className="w-4 h-4 text-text-secondary"/>
                    </button>
                </div>
            </div>

            {expandedTitle && (<div className="fixed inset-0 bg-overlay/40 backdrop-blur-md z-10000 flex items-center justify-center p-8 animate-in fade-in duration-200">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="chart-expand-modal-title"
                        className="bg-surface w-full max-w-6xl h-[80vh] rounded-[48px] shadow-2xl flex flex-col p-10 animate-in zoom-in-95 duration-200 border border-border relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 id="chart-expand-modal-title" className="text-[24px] font-black uppercase tracking-tighter text-text-primary">{expandedTitle}</h3>
                            <button onClick={() => setExpandedTitle(null)} aria-label="Close" className="p-3 hover:bg-surface-2 rounded-full transition-colors border border-border/40 cursor-pointer">
                                <X className="w-6 h-6 text-text-secondary"/>
                            </button>
                        </div>
                        <div className="flex-1 shadow-inner border border-border/20 rounded-[32px] overflow-visible p-8 bg-canvas/20">
                            <HighchartsChart options={makeChartOptions(expandedTitle, expandedTitle === 'Corrosion Degradation Trend' ? corrosionData : sandData, '#3b82f6', expandedTitle === 'Corrosion Degradation Trend' ? 9.5 : 7.5, expandedTitle === 'Corrosion Degradation Trend' ? 'Wall Thickness (mm)' : 'Deposition Index', true)}/>
                        </div>
                    </div>
                </div>)}
        </div>);
};
function InspectionReportContent() {
    const { warning: toastWarning } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lineId = searchParams.get('lineId') || '450-PG-24026-63451';
    const [selectedMetricType, setSelectedMetricType] = React.useState('equipment');
    const [positions, setPositions] = React.useState({
        compressor: { x: 50, y: 80 },
        valve: { x: 340, y: 140 },
        scrubber: { x: 750, y: 110 }
    });
    const [activeDrag, setActiveDrag] = React.useState(null);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const svgRef = React.useRef(null);
    const getSVGCoords = (e) => {
        if (!svgRef.current)
            return { x: 0, y: 0 };
        const point = svgRef.current.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const ctm = svgRef.current.getScreenCTM();
        if (!ctm)
            return { x: 0, y: 0 };
        return point.matrixTransform(ctm.inverse());
    };
    const handleDragStart = (id, e) => {
        e.stopPropagation();
        const coords = getSVGCoords(e);
        const pos = positions[id];
        setDragOffset({ x: coords.x - pos.x, y: coords.y - pos.y });
        setActiveDrag(id);
        e.target.setPointerCapture(e.pointerId);
    };
    const handleDragMove = (e) => {
        if (!activeDrag)
            return;
        const coords = getSVGCoords(e);
        setPositions((prev) => ({
            ...prev,
            [activeDrag]: {
                x: coords.x - dragOffset.x,
                y: coords.y - dragOffset.y
            }
        }));
    };
    const handleDragEnd = () => {
        setActiveDrag(null);
    };
    const [findings, setFindings] = React.useState(INITIAL_REPORT_DATA);
    const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
    const [observation, setObservation] = React.useState('');
    const [uploadStatus, setUploadStatus] = React.useState({});
    const [attachments, setAttachments] = React.useState([]);
    const fileInputRefs = React.useRef({});
    // Load PDF libraries dynamically
    const downloadPDF = async () => {
        const loadScript = (src) => new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        try {
            if (!window.jspdf) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js');
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'pt', 'a1'); // Larger format for 22 columns
            const pageWidth = doc.internal.pageSize.getWidth();
            const now = new Date().toLocaleString();
            const table = document.querySelector('table');
            if (!table)
                return;
            doc.autoTable({
                html: table,
                theme: 'grid',
                margin: { top: 120, bottom: 60, left: 40, right: 40 },
                headStyles: {
                    fillColor: [15, 23, 42],
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle'
                },
                bodyStyles: {
                    fontSize: 7,
                    textColor: [51, 65, 85],
                    valign: 'middle'
                },
                columnStyles: {
                    11: { halign: 'center', fontStyle: 'bold' }, // AIF Priority
                    13: { cellWidth: 120, minCellHeight: 80 }, // Photos
                    14: { cellWidth: 120 },
                    15: { cellWidth: 120 },
                    16: { cellWidth: 120 }
                },
                didDrawPage: (data) => {
                    // Header Branding
                    doc.setFillColor(15, 23, 42);
                    doc.rect(0, 0, pageWidth, 80, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(24);
                    doc.setFont('helvetica', 'bold');
                    doc.text('INDUSTRIAL ASSET INTEGRITY REPORT', 40, 45);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`FACILITY: BARONIA BNG-B | ASSET ID: ${lineId} | STATUS: OPERATIONAL`, 40, 65);
                    doc.setFontSize(8);
                    doc.text(`GENERATED ON: ${now}`, pageWidth - 40, 45, { align: 'right' });
                    doc.text('CONFIDENTIAL - ENGINEERING COPY', pageWidth - 40, 65, { align: 'right' });
                    // Footer
                    const str = `Page ${doc.internal.getNumberOfPages()}`;
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 30, { align: 'center' });
                    doc.text('© 2026 TRIDIAGONAL AI - PETRONAS DECISION OPS MALAYSIA', 40, doc.internal.pageSize.getHeight() - 30);
                },
                didDrawCell: (data) => {
                    // Custom formatting for AIF Priority
                    if (data.section === 'body' && data.column.index === 11) {
                        const priority = data.cell.text[0];
                        if (priority === 'P1') {
                            doc.setFillColor(220, 38, 38); // Red
                            doc.setTextColor(255, 255, 255);
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                            doc.text(data.cell.text, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
                        }
                        else if (priority === 'P3') {
                            doc.setFillColor(250, 204, 21); // Yellow
                            doc.setTextColor(0, 0, 0);
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                            doc.text(data.cell.text, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
                        }
                    }
                    // Photo Embedding
                    if (data.section === 'body' && (data.column.index >= 13 && data.column.index <= 16)) {
                        const cell = data.cell;
                        const img = cell.raw.querySelector('img');
                        if (img && img.src) {
                            try {
                                doc.addImage(img.src, 'PNG', data.cell.x + 5, data.cell.y + 5, data.cell.width - 10, data.cell.height - 10);
                            }
                            catch (e) {
                            }
                        }
                    }
                }
            });
            doc.save(`Asset_Integrity_Report_${lineId}_${new Date().getTime()}.pdf`);
        }
        catch {
            toastWarning('PDF generation failed', 'Falling back to standard print…');
            window.print();
        }
    };
    const handleFileChange = (label, e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setUploadStatus(prev => ({ ...prev, [label]: url }));
        }
    };
    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [
            ...prev,
            ...files.map(f => ({
                name: f.name,
                size: (f.size / 1024).toFixed(1) + ' KB',
                type: f.type
            }))
        ]);
    };
    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    const handleAddFinding = () => {
        const newFinding = {
            location: 'Baronia',
            platform: 'BNG-B',
            module: 'Main Deck Level 3',
            reportNo: `BGC-PI/BNG/AU-00${findings.length + 1}/SKA-25`,
            visualNo: `V${findings.length + 1}`,
            equipmentType: 'PIPING ANOMALY',
            lineNo: lineId,
            cof: '4',
            category: 'A2_6_Bolts_Nuts_Visual_Condition',
            inspectorFindings: observation || 'New inspection record: Multi-point corrosion detected.',
            findingsDetails: 'Automated field capture via local file selection. Pending material analysis.',
            aifPriority: 'P1',
            aifNonAif: 'AIF',
            generalView: uploadStatus['General View'] || '/images/general_view.png',
            photo1: uploadStatus['Photo 1'] || '/images/photo_1.png',
            photo2: uploadStatus['Photo 2'] || '/images/photo_2.png',
            photo3: uploadStatus['Photo 3'] || '/images/photo_3.png',
            recommendation: 'To be Evaluated',
            remarks: 'Scheduled for detailed Ultrasonic Testing (UT) within 48 hours.',
            remainingLife: '48'
        };
        setFindings([...findings, newFinding]);
        setIsUploadModalOpen(false);
        setUploadStatus({});
        setObservation('');
        setAttachments([]);
    };
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'P1': return 'bg-danger text-white';
            case 'P3': return 'bg-warning text-white';
            case 'P5': return 'bg-success text-white';
            default: return 'bg-brand text-white';
        }
    };
    return (<>
                <header className="h-20 shrink-0 border-b border-border flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 bg-canvas border border-border hover:bg-surface hover:shadow-md rounded-xl transition-all duration-300 group">
                            <ArrowLeft className="w-5 h-5 text-text-secondary group-hover:-translate-x-0.5 transition-transform"/>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-brand uppercase tracking-widest mb-1">
                                <ClipboardList className="w-3 h-3"/> 
                            </div>
                            <h1 className="text-[22px] font-black text-text-primary tracking-tight uppercase">
                                Inspection Report: <span className="text-brand">{lineId}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={downloadPDF} className="px-6 py-2.5 bg-surface border border-border hover:bg-canvas text-text-secondary rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 transition-all shadow-sm active:scale-95 no-print">
                            <FileDown className="w-4 h-4 text-brand"/> Download PDF
                        </button>
                        <button onClick={() => setIsUploadModalOpen(true)} className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 transition-all shadow-lg active:scale-95 no-print">
                            <Plus className="w-4 h-4"/> Add Inspection Report
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 bg-canvas rounded-xl border border-border">
                            <Settings className="w-4 h-4 text-text-subtle"/>
                            <MoreVertical className="w-4 h-4 text-text-subtle"/>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-auto thin-scrollbar space-y-8">
                    {/* Flow Diagram Section */}
                    <div className="bg-surface rounded-[32px] border border-border shadow-sm overflow-hidden p-10 flex flex-col items-center">
                        <div className="w-full flex items-center justify-between mb-10 border-b border-border/40 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-muted rounded-lg border border-brand/20 italic font-black text-brand text-[10px] uppercase tracking-widest">Stage A Analysis</div>
                                <h3 className="text-text-primary font-black text-[14px] uppercase tracking-widest">Process Flow Sequence: <span className="text-brand underline decoration-brand/30 ml-1">K-2450B Discharge Loop</span></h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-text-subtle uppercase tracking-widest">Telemetry Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-[300px] bg-canvas/50 rounded-3xl border border-dashed border-border flex items-center justify-center p-4">
                            <svg ref={svgRef} viewBox="0 0 1000 300" className="w-full h-full drop-shadow-2xl overflow-visible" onPointerMove={handleDragMove} onPointerUp={handleDragEnd} onPointerLeave={handleDragEnd}>
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1"/>
                                    </marker>
                                </defs>

                                {/* Stage 1: Export Compressor */}
                                <g className={`cursor-grab active:cursor-grabbing ${activeDrag === 'compressor' ? 'z-50' : ''}`} onPointerDown={(e) => handleDragStart('compressor', e)} onClick={() => setSelectedMetricType('equipment')}>
                                    <ExportCompressor x={positions.compressor.x} y={positions.compressor.y} onPointerDown={() => { }} status="normal"/>
                                </g>

                                {/* Connection Line 1-2 (Dynamic) */}
                                {(() => {
            const startX = positions.compressor.x + 104; // Align with scaled Train outputs
            const startY = positions.compressor.y + 80; // Midpoint between Train A and Train B
            const endX = positions.valve.x;
            const endY = positions.valve.y + 18; // Midpoint of valve body
            return (<g className="cursor-pointer group" onClick={() => setSelectedMetricType('line')}>
                                            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="transparent" strokeWidth="20"/>
                                            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowhead)" className="group-hover:stroke-brand transition-colors"/>
                                            <text x={(startX + endX) / 2} y={(startY + endY) / 2 - 12} textAnchor="middle" className="fill-text-subtle font-bold text-[9px] uppercase tracking-widest group-hover:fill-brand transition-colors">Discharge: {lineId}</text>
                                        </g>);
        })()}

                                {/* Stage 2: Check Valve */}
                                <g className={`cursor-grab active:cursor-grabbing ${activeDrag === 'valve' ? 'z-50' : ''}`} onPointerDown={(e) => handleDragStart('valve', e)} onClick={() => setSelectedMetricType('equipment')}>
                                    <CheckValve x={positions.valve.x} y={positions.valve.y} scale={1.2} status="normal" label="CV-2450B Discharge"/>
                                </g>

                                {/* Connection Line 2-3 (Dynamic) */}
                                {(() => {
            const startX = positions.valve.x + 60;
            const startY = positions.valve.y + 18; // Midpoint of valve body
            const endX = positions.scrubber.x;
            const endY = positions.scrubber.y + 50;
            return (<g className="cursor-pointer group" onClick={() => setSelectedMetricType('line')}>
                                            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="transparent" strokeWidth="20"/>
                                            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowhead)" className="group-hover:stroke-brand transition-colors"/>
                                            <text x={(startX + endX) / 2} y={(startY + endY) / 2 - 12} textAnchor="middle" className="fill-text-subtle font-bold text-[9px] uppercase tracking-widest group-hover:fill-brand transition-colors">Suction: {lineId}</text>
                                        </g>);
        })()}

                                {/* Stage 3: Suction Scrubber */}
                                <g className={`cursor-grab active:cursor-grabbing ${activeDrag === 'scrubber' ? 'z-50' : ''}`} onPointerDown={(e) => handleDragStart('scrubber', e)} onClick={() => setSelectedMetricType('equipment')}>
                                    <SuctionScrubber x={positions.scrubber.x} y={positions.scrubber.y} status="normal" name="Suction Scrubber V-2440B"/>
                                </g>
                            </svg>
                        </div>

                        {/* Integrity KPIs Horizontal Bar */}
                        <div className="w-full mt-8 border-t border-border/40 pt-4">
                            <IntegrityKPIsHorizontal />
                        </div>
                    </div>

                    {/* Integrated Asset Integrity ModelChart Section */}
                    <div className="w-full">
                        <AssetIntegrityModelWidget />
                    </div>

                    <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-border/40 bg-canvas/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-brand"/>
                                <h2 className="text-text-primary font-black text-[14px] uppercase tracking-widest">Inspection Findings Register</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-brand-muted text-brand text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-brand/20">Engineering Copy</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[3200px]">
                                <thead>
                                    <tr className="bg-overlay-hover text-white">
                                        {[
            'Location', 'Platform', 'Module / Area', 'Report No', 'Visual No', 'Equipment Type',
            'Equipment Tag No / Line No', 'COF (Notes 1)', 'Category', 'Findings by Inspector',
            'Inspection Findings Details (If any)', 'AIF Priority', 'AIF / Non AIF',
            'General View', 'Photo 1', 'Photo 2', 'Photo 3',
            'Recommendation', 'Recommendation Remarks', 'Remaining Life (M)'
        ].map((header) => (<th key={header} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border border-white/10 whitespace-nowrap bg-overlay sticky top-0">
                                                {header}
                                            </th>))}
                                    </tr>
                                </thead>
                                <tbody className="bg-surface">
                                    {findings.map((row, idx) => (<tr key={idx} className="hover:bg-canvas/80 transition-all text-[11px] font-medium text-text-secondary leading-tight border-b border-border/40 animate-in slide-in-from-left-2 duration-300">
                                            <td className="px-6 py-4 border border-border/40 font-bold uppercase">{row.location}</td>
                                            <td className="px-6 py-4 border border-border/40 font-bold text-brand-hover">{row.platform}</td>
                                            <td className="px-6 py-4 border border-border/40 whitespace-nowrap">{row.module}</td>
                                            <td className="px-6 py-4 border border-border/40 font-mono text-[10px] text-text-muted">{row.reportNo}</td>
                                            <td className="px-6 py-4 border border-border/40 font-black">{row.visualNo}</td>
                                            <td className="px-6 py-4 border border-border/40 whitespace-nowrap">{row.equipmentType}</td>
                                            <td className="px-6 py-4 border border-border/40 font-black text-text-primary">{row.lineNo}</td>
                                            <td className="px-6 py-4 border border-border/40 text-center font-bold">{row.cof}</td>
                                            <td className="px-6 py-4 border border-border/40 max-w-[200px] text-text-muted font-mono text-[9px] truncate">{row.category}</td>
                                            <td className="px-6 py-4 border border-border/40 max-w-[250px] leading-normal">{row.inspectorFindings}</td>
                                            <td className="px-6 py-4 border border-border/40 max-w-[250px] italic text-text-subtle leading-normal">{row.findingsDetails}</td>

                                            {/* Priority Color Tag */}
                                            <td className={`px-6 py-4 border border-border/40 text-center font-black ${getPriorityStyle(row.aifPriority)}`}>
                                                {row.aifPriority}
                                            </td>

                                            <td className="px-6 py-4 border border-border/40 text-center font-bold text-text-muted">{row.aifNonAif}</td>

                                            {/* Static Inspection Photos */}
                                            <td className="px-4 py-3 border border-border/40">
                                                <div className="w-48 h-32 rounded-xl overflow-hidden shadow-sm border border-border bg-surface-2">
                                                    <img src={row.generalView} alt="General View" className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border border-border/40">
                                                <div className="w-48 h-32 rounded-xl overflow-hidden shadow-sm border border-border bg-surface-2">
                                                    <img src={row.photo1} alt="Photo 1" className="w-full h-full object-cover"/>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border border-border/40">
                                                <div className="w-48 h-32 rounded-xl overflow-hidden shadow-sm border border-border bg-surface-2">
                                                    <img src={row.photo2} alt="Photo 2" className="w-full h-full object-cover"/>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border border-border/40">
                                                <div className="w-48 h-32 rounded-xl overflow-hidden shadow-sm border border-border bg-surface-2">
                                                    <img src={row.photo3} alt="Photo 3" className="w-full h-full object-cover"/>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 border border-border/40 font-black text-brand-hover whitespace-nowrap">{row.recommendation}</td>
                                            <td className="px-6 py-4 border border-border/40 max-w-[300px] leading-normal">{row.remarks}</td>
                                            <td className="px-6 py-4 border border-border/40 text-center font-black text-text-primary border-r-0">{row.remainingLife}</td>
                                        </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Inspection Evidence Upload Modal */}
                {isUploadModalOpen && (<div className="fixed inset-0 z-9999 flex items-center justify-center bg-overlay/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="upload-modal-title"
                            className="bg-surface w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-border/40 flex justify-between items-center bg-canvas/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
                                        <Camera className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h3 id="upload-modal-title" className="text-[22px] font-black text-text-primary leading-tight">New Finding Capture</h3>
                                        <p className="text-text-muted text-[14px] font-bold uppercase tracking-widest mt-0.5">{lineId}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsUploadModalOpen(false)} aria-label="Close" className="w-10 h-10 rounded-full hover:bg-surface-2 flex items-center justify-center transition-colors border border-border/40 bg-surface cursor-pointer">
                                    <X className="w-5 h-5 text-text-muted"/>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 overflow-y-auto max-h-[70vh] thin-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    {['General View', 'Photo 1', 'Photo 2', 'Photo 3'].map((label) => (<div key={label} className="group flex flex-col gap-3">
                                            <input type="file" accept="image/png, image/jpeg" className="hidden" ref={el => { fileInputRefs.current[label] = el; }} onChange={(e) => handleFileChange(label, e)}/>
                                            <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.15em] ml-1">{label}</label>
                                            <div className={`relative h-48 rounded-[24px] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center
                                                    ${uploadStatus[label] ? 'border-success bg-success/10' : 'border-border hover:border-brand hover:bg-brand-muted/30'}`} onClick={() => fileInputRefs.current[label]?.click()}>
                                                {uploadStatus[label] ? (<div className="w-full h-full relative group">
                                                        <img src={uploadStatus[label]} alt={label} className="w-full h-full object-cover animate-in fade-in zoom-in-95"/>
                                                        <div className="absolute inset-0 bg-success/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="bg-surface/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-success"/>
                                                                <span className="text-[10px] font-black text-success uppercase tracking-widest">Change Photo</span>
                                                            </div>
                                                        </div>
                                                    </div>) : (<>
                                                        <div className="w-10 h-10 rounded-2xl bg-surface border border-border/40 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            <Upload className="w-5 h-5 text-text-subtle group-hover:text-brand"/>
                                                        </div>
                                                        <div className="mt-4 text-center">
                                                            <p className="text-[10px] font-black text-text-primary tracking-tight uppercase">TAP TO SELECT</p>
                                                            <p className="text-[9px] text-text-subtle font-bold mt-1">PNG, JPEG UP TO 10MB</p>
                                                        </div>
                                                    </>)}
                                            </div>
                                        </div>))}
                                </div>

                                {/* Observation Box */}
                                <div className="mt-8 flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.15em] ml-1">Field Observations</label>
                                    <textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="Enter detailed findings, surface conditions, or anomaly descriptions..." className="w-full h-32 p-5 bg-canvas border border-border rounded-[24px] text-[13px] font-medium text-text-secondary focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all resize-none placeholder:text-border-strong placeholder:italic shadow-inner"/>
                                </div>

                                {/* Attachments Section */}
                                <div className="mt-8 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.15em] ml-1">External Attachments</label>
                                        <span className="text-[9px] font-bold text-text-subtle bg-surface-2 px-2 py-0.5 rounded-full">PDF, DOCX, CSV</span>
                                    </div>
                                    <input type="file" multiple accept=".pdf,.doc,.docx,.csv,.xlsx" className="hidden" id="attachment-input" onChange={handleAttachmentChange}/>
                                    <label htmlFor="attachment-input" className="w-full p-4 border-2 border-dashed border-border rounded-[24px] hover:border-brand hover:bg-brand-muted/30 transition-all cursor-pointer flex items-center justify-center gap-3 group">
                                        <Upload className="w-4 h-4 text-text-subtle group-hover:text-brand group-hover:scale-110 transition-all"/>
                                        <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Add Supporting Documents</span>
                                    </label>

                                    {attachments.length > 0 && (<div className="grid grid-cols-1 gap-2 mt-2">
                                            {attachments.map((file, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-surface border border-border/40 rounded-xl shadow-sm hover:border-brand/30 transition-all animate-in slide-in-from-top-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-brand-muted flex items-center justify-center">
                                                            <Upload className="w-4 h-4 text-brand"/>
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] font-bold text-text-primary truncate max-w-[400px]">{file.name}</div>
                                                            <div className="text-[9px] font-bold text-text-subtle uppercase">{file.size}</div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeAttachment(idx)} className="p-1.5 hover:bg-danger/10 text-border-strong hover:text-danger rounded-lg transition-colors">
                                                        <X className="w-4 h-4"/>
                                                    </button>
                                                </div>))}
                                        </div>)}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-canvas/80 border-t border-border/40 flex justify-end gap-4">
                                <button onClick={() => {
                setIsUploadModalOpen(false);
                setObservation('');
                setUploadStatus({});
                setAttachments([]);
            }} className="px-8 py-3 bg-surface border border-border rounded-2xl text-[10px] font-black text-text-secondary hover:bg-surface-2 transition-all uppercase tracking-widest">
                                    DISCARD
                                </button>
                                <button onClick={handleAddFinding} className="px-10 py-3 bg-overlay text-white rounded-2xl text-[10px] font-black hover:bg-black transition-all shadow-xl shadow-border/30 uppercase tracking-widest active:scale-95">
                                    GENERATE FINDING
                                </button>
                            </div>
                        </div>
                    </div>)}
            <style jsx>{`
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 1cm;
                    }
                    :global(body) {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    :global(.flex.h-screen) {
                        height: auto !important;
                        display: block !important;
                        overflow: visible !important;
                    }
                    :global(main) {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
                    :global(header) {
                        display: none !important;
                    }
                    :global(sidebar) {
                        display: none !important;
                    }
                    .overflow-x-auto {
                        overflow: visible !important;
                        width: 100% !important;
                    }
                    table {
                        zoom: 45%; /* Heavy zoom out to fit 22 columns on landscape */
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #cbd5e1 !important;
                    }
                    .bg-white { background-color: white !important; }
                    .bg-slate-50\/50 { background-color: #f8fafc !important; }
                    .bg-blue-600 { background-color: #2563eb !important; }
                    .bg-red-600 { background-color: #dc2626 !important; }
                    .bg-yellow-400 { background-color: #facc15 !important; }
                }
            `}</style>
        </>);
}
export default function InspectionReportPage() {
    return (<Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-canvas font-black uppercase tracking-widest text-text-subtle">Loading Engine...</div>}>
            <InspectionReportContent />
        </Suspense>);
}
