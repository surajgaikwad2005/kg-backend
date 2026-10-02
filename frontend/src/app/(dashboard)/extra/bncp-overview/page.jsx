'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Grid, MoreVertical, Building2, Layers } from 'lucide-react';
import TimeSelector from '@/src/components/ui/TimeSelector';
export default function BNCPOverviewPage() {
    const router = useRouter();
    const distributionData = [
        { label: 'REALIZED', total: 297, maint: 283, maintPct: 80, int: 14, intPct: 20 },
        { label: 'CONSTRAINED', total: 149, maint: 142.00, maintPct: 85, int: 7.00, intPct: 15 },
        { label: 'CONTINGENT', total: 237, maint: 226, maintPct: 88, int: 11, intPct: 12 },
    ];
    const cpcpData = [
        {
            id: 'CPCP1',
            section: 'Export Gas Compressor Train A',
            totalPar: 101.63,
            reliability: { realized: 15.45, constrained: 2.00, contingent: 20.30 },
            integrity: { realized: 21.68, constrained: 1.50, contingent: 40.70 }
        },
        {
            id: 'CPCP2',
            section: 'Export Gas Compressor Train B',
            totalPar: 683.545,
            reliability: { realized: 283, constrained: 142, contingent: 226 },
            integrity: { realized: 14.15, constrained: 7.075, contingent: 11.32 }
        },
        {
            id: 'CPCP3',
            section: 'Reinjection Gas Compressor Train A',
            totalPar: 63.50,
            reliability: { realized: 12.00, constrained: 1.00, contingent: 10.00 },
            integrity: { realized: 15.00, constrained: 0.50, contingent: 25.00 }
        },
        {
            id: 'CPCP4',
            section: 'Reinjection Gas Compressor Train B',
            totalPar: 79.50,
            reliability: { realized: 12.00, constrained: 1.50, contingent: 12.00 },
            integrity: { realized: 20.00, constrained: 1.00, contingent: 33.00 }
        }
    ];
    const maxCpcpPar = Math.max(...cpcpData.map(c => c.totalPar));
    const handleCpcpClick = (cpcpId) => {
        if (cpcpId === 'CPCP1')
            router.push('/compressor-details?train=A');
        else if (cpcpId === 'CPCP2')
            router.push('/compressor-details?train=B');
        else if (cpcpId === 'CPCP3')
            router.push('/compressor-details?train=RA');
        else if (cpcpId === 'CPCP4')
            router.push('/compressor-details?train=RB');
    };
    return (<>

                {/* Header Navbar */}
                <header className="h-20 border-b border-slate-200 flex items-center px-8 bg-white shrink-0 sticky top-0 z-40 justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-blue-600"/>
                            BNCP Platform - PaR Dashboard
                        </h1>
                        <p className="text-[13px] font-bold text-slate-400 tracking-[0.2em] mt-0.5">
                            Asset Analysis & Performance Tracking
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <TimeSelector />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="flex gap-6 items-stretch flex-wrap lg:flex-nowrap w-full">

                        {/* Total Production at Risk Card */}
                        <div className="flex-1 bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden flex flex-col min-w-[320px] max-w-[500px]">
                            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Grid className="w-4 h-4 text-slate-400"/>
                                    <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">Total Production at Risk</h2>
                                    <span className="text-[13px] font-bold text-blue-600 cursor-pointer hover:underline ml-1">Info</span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="w-5 h-5"/>
                                </button>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-center">
                                <p className="text-[11px] font-black text-slate-500 tracking-widest mb-1">
                                    PRODUCTION AT RISK (PaR)
                                </p>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <h3 className="text-[52px] font-black text-slate-900 tracking-tight leading-none">
                                        683
                                    </h3>
                                    <span className="text-[18px] font-medium text-slate-400">
                                        MMSCFD
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 mb-6">
                                    <div>
                                        <p className="text-[12px] font-black text-black-500 tracking-widest mb-1">PaR REALIZED</p>
                                        <div className="text-[20px] font-black text-slate-900">297</div>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-black-500 tracking-widest mb-1">PaR CONSTRAINED</p>
                                        <div className="text-[20px] font-black text-slate-900">149</div>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-black-500 tracking-widest mb-1">PaR CONTINGENT</p>
                                        <div className="text-[20px] font-black text-slate-900">237</div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-auto">
                                    <button onClick={() => router.push('/home')} className="group inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold tracking-widest rounded-lg transition-all shadow-md shadow-blue-500/20">
                                        SITE OVERVIEW
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PaR Distribution Card */}
                        <div className="flex-[2] bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden flex flex-col min-w-[450px]">
                            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <Grid className="w-4 h-4 text-slate-400"/>
                                    <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">PaR Distribution</h2>
                                </div>
                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-md tracking-widest shadow-sm">Interactive Segment Tracking</span>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-center space-y-7">
                                {distributionData.map((item, idx) => (<div key={idx} className="group relative block w-full">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[14px] font-bold text-slate-500 tracking-widest">{item.label}</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-[18px] font-black text-slate-900 leading-none">{item.total.toFixed(2)}</span>
                                                <span className="text-[11px] font-bold text-slate-400 tracking-[0.2em]">MMSCFD</span>
                                            </div>
                                        </div>

                                        {/* Solid Dashboard Horizontal Stacked Bar */}
                                        <div className="w-full h-[36px] flex rounded-lg overflow-hidden shadow-sm border border-slate-200 group-hover:shadow-md transition-shadow cursor-pointer">

                                            {/* Maintenance side */}
                                            <div className="h-full bg-blue-500 group-hover:bg-blue-600 transition-colors flex items-center justify-between px-3 relative overflow-hidden focus-within:w-full" style={{ width: `${item.maintPct}%` }}>
                                                <span className="text-[12px] font-bold text-blue-50 relative z-10 tracking-wider overflow-hidden text-ellipsis whitespace-nowrap hidden sm:block">MAINTENANCE</span>
                                                <span className="text-[13px] font-black text-white relative z-10 shrink-0 ml-auto drop-shadow-sm">{item.maint.toFixed(2)}</span>
                                            </div>

                                            {/* Integrity side */}
                                            <div className="h-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors border-l border-white/20 flex items-center justify-between px-3 relative overflow-hidden" style={{ width: `${item.intPct}%` }}>
                                                <span className="text-[12px] font-bold text-emerald-50 relative z-10 tracking-wider overflow-hidden text-ellipsis whitespace-nowrap pl-1 hidden sm:block">INTEGRITY</span>
                                                <span className="text-[13px] font-black text-white relative z-10 shrink-0 ml-auto drop-shadow-sm">{item.int.toFixed(2)}</span>
                                            </div>

                                        </div>
                                    </div>))}
                            </div>
                        </div>

                    </div>

                    {/* CPCP Drill-down Section */}
                    <div className="mt-12 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
                            {cpcpData.map((cpcp, idx) => {
            // Treemap-style Heat Logic: 
            // Map ratio (0 to 1) to a Hue from 45 (Yellow-Orange) down to 0 (Vibrant Red).
            // If Total PaR is less than 100, lock to the User's exact requested Custom Green.
            let headerBg, cardBorder, parColor;
            let nodeStatus = 'Active Node';
            if (cpcp.totalPar < 70) {
                headerBg = '#0ab473'; // Requested Custom Green
                cardBorder = 'rgba(10, 180, 115, 0.3)';
                parColor = '#0ab473';
                nodeStatus = 'Low Risk';
            }
            else {
                // Use a fixed top threshold (80) for color intensity to ensure CPCP4 (79.5) is red.
                const intensityThreshold = 80;
                const riskRatio = Math.min(cpcp.totalPar / intensityThreshold, 1);
                const hue = 45 * (1 - riskRatio);
                if (riskRatio > 0.3)
                    nodeStatus = 'Critical Node';
                headerBg = `hsl(${hue}, 88%, 56%)`;
                cardBorder = `hsl(${hue}, 80%, 80%)`;
                parColor = `hsl(${hue}, 80%, 45%)`;
            }
            return (<div key={idx} onClick={() => handleCpcpClick(cpcp.id)} className="bg-white border-[2px] rounded-xl shadow-sm overflow-hidden flex flex-col w-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer" style={{ borderColor: cardBorder }}>
                                        <div className="px-5 py-4 flex justify-between items-center transition-colors" style={{ backgroundColor: headerBg }}>
                                            <h3 className="text-[17px] font-black text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
                                                <Layers className="w-5 h-5 text-white/90"/>
                                                {cpcp.id}
                                            </h3>
                                            <span className="text-[10px] font-black bg-black/10 text-white border border-white/20 px-3 py-1 rounded-full tracking-widest shadow-sm">
                                                {nodeStatus}
                                            </span>
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="text-center mb-10 bg-slate-50 py-2 rounded-lg border border-slate-100">
                                                <span className="text-[18px] font-bold text-black-600 tracking-widest">{cpcp.section}</span>
                                            </div>

                                            {/* Custom Chart Area */}
                                            <div className="flex justify-center items-start h-[240px] relative mx-auto w-full max-w-[380px] mt-2">

                                                {/* Left Labels */}
                                                <div className="flex flex-col h-[180px] w-32 justify-between mt-0">
                                                    <div className="flex-1 flex items-center justify-end pr-5 text-[12px] font-black text-indigo-600 tracking-widest uppercase">REALIZED</div>
                                                    <div className="flex-1 flex items-center justify-end pr-5 text-[12px] font-black text-amber-500 tracking-widest uppercase">CONSTRAINED</div>
                                                    <div className="flex-1 flex items-center justify-end pr-5 text-[12px] font-black text-rose-500 tracking-widest uppercase">CONTINGENT</div>
                                                </div>

                                                {/* Segmented Bars */}
                                                <div className="flex gap-12 flex-1 h-[180px]">

                                                    {/* Reliability Pillar */}
                                                    <div className="flex flex-col items-center h-full relative group">
                                                        <div className="w-[64px] h-full flex flex-col rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(15,23,42,0.1)] group-hover:-translate-y-1">
                                                            <div className="flex-1 bg-indigo-500 border-b border-white/30 flex items-center justify-center hover:bg-indigo-400 cursor-pointer transition-colors relative overflow-hidden">
                                                                <span className="text-[14px] font-black text-white drop-shadow-sm relative z-10">{cpcp.reliability.realized}</span>
                                                            </div>
                                                            <div className="flex-1 bg-amber-500 border-b border-white/30 flex items-center justify-center hover:bg-amber-400 cursor-pointer transition-colors relative overflow-hidden">
                                                                <span className="text-[14px] font-black text-white drop-shadow-sm relative z-10">{cpcp.reliability.constrained}</span>
                                                            </div>
                                                            <div className="flex-1 bg-rose-500 flex items-center justify-center hover:bg-rose-400 cursor-pointer transition-colors relative overflow-hidden">
                                                                <span className="text-[14px] font-black text-white drop-shadow-sm relative z-10">{cpcp.reliability.contingent}</span>
                                                            </div>
                                                        </div>
                                                        <span className="absolute -bottom-10 text-[12px] font-black text-slate-600 tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap shadow-sm group-hover:bg-slate-100 group-hover:text-slate-800 transition-colors">Reliability</span>
                                                    </div>

                                                    {/* Integrity Pillar */}
                                                    <div className="flex flex-col items-center h-full relative group">
                                                        <div className="w-[64px] h-full flex flex-col rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(15,23,42,0.1)] group-hover:-translate-y-1">
                                                            <div className="flex-1 bg-indigo-500 border-b border-white/30 flex items-center justify-center hover:bg-indigo-400 cursor-pointer transition-colors relative overflow-hidden">
                                                                <span className="text-[14px] font-black text-white drop-shadow-sm relative z-10">{cpcp.integrity.realized}</span>
                                                            </div>
                                                            <div className="flex-1 bg-amber-500 border-b border-white/30 flex items-center justify-center hover:bg-amber-400 cursor-pointer transition-colors relative overflow-hidden">
                                                                <span className="text-[14px] font-black text-white drop-shadow-sm relative z-10">{cpcp.integrity.constrained}</span>
                                                            </div>
                                                            <div className="flex-1 bg-rose-500 flex items-center justify-center hover:bg-rose-400 cursor-pointer transition-colors relative overflow-hidden">
                                                                <span className="text-[14px] font-black text-white drop-shadow-sm relative z-10">{cpcp.integrity.contingent}</span>
                                                            </div>
                                                        </div>
                                                        <span className="absolute -bottom-10 text-[12px] font-black text-slate-600 tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap shadow-sm group-hover:bg-slate-100 group-hover:text-slate-800 transition-colors">Integrity</span>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Footer Totals */}
                                            <div className="mt-auto pt-8 flex justify-center items-center gap-2">
                                                <span className="text-[16px] font-bold text-slate-500 tracking-widest">Total PaR:</span>
                                                <span className="text-[24px] font-black leading-none drop-shadow-sm" style={{ color: parColor }}>
                                                    {cpcp.totalPar.toFixed(2)}
                                                </span>
                                                <span className="text-[14px] font-black text-slate-400 pl-1">MMSCFD</span>
                                            </div>
                                        </div>
                                    </div>);
        })}
                        </div>
                    </div>

                </div>
        </>);
}
