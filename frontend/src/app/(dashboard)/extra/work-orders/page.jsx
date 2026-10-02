"use client";
import React from "react";
import { useRouter } from "next/navigation";
import TimeSelector from "@/src/components/ui/TimeSelector";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, LabelList, ResponsiveContainer } from 'recharts';
import { Bell, ArrowLeft, Plus, Search, Filter, Settings, ChevronDown, Wrench, ClipboardList } from "lucide-react";

const WORK_ORDER_LIST = [
    { id: "45215354", asset: "BNCP.COMP.38", description: "Seal replacement - Main Compressor", type: "CORRECTIVE", priority: "HIGH", status: "OPEN", date: "2026-03-28" },
    { id: "45215355", asset: "BNCP.PUMP.13", description: "Bearing lubrication & health check", type: "PREVENTIVE", priority: "MEDIUM", status: "IN EXECUTION", date: "2026-03-27" },
    { id: "45215356", asset: "BNCP.TURB.06", description: "Turbine alignment calibration", type: "PREDICTIVE", priority: "CRITICAL", status: "PLANNING", date: "2026-03-26" },
    { id: "45215357", asset: "BNCP.BLR.10", description: "Pressure relief valve testing", type: "INSPECTION", priority: "LOW", status: "CLOSED", date: "2026-03-22" },
    { id: "45215358", asset: "BNCP.GEN.03", description: "AVR module replacement", type: "CORRECTIVE", priority: "HIGH", status: "CLOSED", date: "2026-03-20" },
    { id: "45215359", asset: "BNCP.VALV.11", description: "Gasket replacement & leak test", type: "CORRECTIVE", priority: "CRITICAL", status: "IN EXECUTION", date: "2026-03-18" },
];

const WO_STATUS_DATA = [
    { name: 'Planning', value: 840, color: '#6366f1' },
    { name: 'Execution', value: 1240, color: '#f59e0b' },
    { name: 'Closed', value: 2450, color: '#10b981' },
];
const WO_TYPE_DATA = [
    { name: 'Corrective', value: 1240, color: '#3b82f6' },
    { name: 'Preventive', value: 850, color: '#10b981' },
    { name: 'Predictive', value: 420, color: '#8b5cf6' },
    { name: 'Inspection', value: 310, color: '#94a3b8' },
];

const WorkOrderStatusPie = () => (
    <div className="bg-surface rounded-3xl border-2 border-border-strong p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-label font-black tracking-widest text-text-subtle">Execution Status</h3>
            <Settings className="w-4 h-4 text-border-strong" />
        </div>
        <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie data={WO_STATUS_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {WO_STATUS_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const WorkOrderTypeChart = () => (
    <div className="bg-surface rounded-3xl border-2 border-border-strong p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-label font-black tracking-widest text-text-subtle">Order Type Analysis</h3>
            <Filter className="w-4 h-4 text-border-strong" />
        </div>
        <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WO_TYPE_DATA} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {WO_TYPE_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 10, fontWeight: 900 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);
/* ───────────────────────── Main Page ───────────────────────── */
export default function WorkOrderDashboardPage() {
    const router = useRouter();
    return (<>

        {/* Header */}
        <header className="h-20 shrink-0 border-b border-black flex items-center justify-between px-10 bg-white z-30 shadow-sm transition-all">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push("/workflow-management")} className="w-10 h-10 rounded-xl border border-black flex items-center justify-center hover:bg-canvas transition-colors">
                <ArrowLeft className="w-5 h-5 text-text-primary"/>
            </button>
            <div className="flex flex-col">
                <h1 className="text-[22px] font-black text-text-primary tracking-tight leading-none">
                    Work Order Dashboard
                </h1>
                <p className="text-[10px] font-bold text-text-subtle tracking-widest mt-1">Refinery Execution Core</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <TimeSelector />
            <button onClick={() => router.push("/work-order-create")} className="group px-6 py-3 bg-overlay text-white rounded-xl text-[11px] font-black tracking-[0.2em] flex items-center gap-3 hover:bg-brand shadow-lg active:scale-95 transition-all">
              <Plus className="w-4 h-4"/>
              Create Work Orders
            </button>
            <button className="p-3 border border-black rounded-xl text-text-subtle hover:text-text-primary transition-all hover:bg-canvas">
              <Bell className="w-5 h-5"/>
            </button>
          </div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto min-h-0 thin-scrollbar space-y-10">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-3 gap-10 h-[320px]">
                <WorkOrderStatusPie />
                <WorkOrderTypeChart />
                
                {/* Summary Stat Card */}
                <div className="bg-overlay rounded-3xl p-10 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-bl-[120px] transition-transform group-hover:scale-110"/>
                    <div className="relative z-10">
                        <Wrench className="w-10 h-10 text-brand mb-6"/>
                        <h3 className="text-[12px] font-black tracking-widest text-text-subtle">Total No Of Workorder</h3>
                        <div className="text-[64px] font-black leading-none mt-2 tabular-nums tracking-tighter">4,530</div>
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[20px] font-black text-brand">840</span>
                            <span className="text-[9px] font-black text-text-subtle tracking-widest mt-1">Pending</span>
                        </div>
                        <div className="w-px h-10 bg-white/20"/>
                        <div className="flex flex-col">
                            <span className="text-[20px] font-black text-danger">156</span>
                            <span className="text-[9px] font-black text-text-subtle tracking-widest mt-1">Overdue</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Work Order Section */}
            <div className="bg-white rounded-3xl border-2 border-black shadow-sm flex flex-col overflow-hidden group">
                <div className="p-8 border-b border-black flex items-center justify-between bg-white">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-canvas flex items-center justify-center text-text-primary border border-black/5">
                            <ClipboardList className="w-7 h-7"/>
                        </div>
                        <div>
                            <h2 className="text-[18px] font-black text-text-primary tracking-widest">List of Work Orders</h2>
                            <p className="text-[10px] font-bold text-text-subtle tracking-widest mt-0.5">Live work tracking across physical assets</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-subtle group-hover:text-brand transition-colors"/>
                            <input type="text" placeholder="Filter work orders..." className="pl-12 pr-6 py-3 bg-canvas border border-border rounded-2xl text-[12px] font-bold outline-none focus:border-brand/60 transition-all w-96 shadow-inner"/>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-xl text-[11px] font-black tracking-widest hover:bg-canvas transition-all">
                            <ChevronDown className="w-4 h-4"/>
                            Export
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto max-h-[600px] thin-scrollbar">
                    <table className="w-full text-sm border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-canvas border-b border-border">
                                {[
            "Order ID",
            "Asset Reference",
            "Description",
            "Type",
            "Priority",
            "Submission Date",
            "Status"
        ].map((col) => (<th key={col} className="px-8 py-5 text-left text-[11px] font-black text-text-subtle tracking-[0.2em] whitespace-nowrap">{col}</th>))}
                            </tr>
                        </thead>
                        <tbody>
                            {WORK_ORDER_LIST.map((row) => (<tr key={row.id} className="border-b border-border/20 hover:bg-canvas transition-all cursor-pointer group/row">
                                    <td className="px-8 py-6">
                                        <span className="text-[16px] font-black text-text-primary group-hover:text-success transition-colors tabular-nums tracking-tighter">#{row.id}</span>
                                    </td>
                                    <td className="px-8 py-6 text-text-secondary font-bold text-[12px] tracking-wide tabular-nums">{row.asset}</td>
                                    <td className="px-8 py-6 text-text-secondary font-medium text-[13px] tracking-tight max-w-[400px] truncate">{row.description}</td>
                                    <td className="px-8 py-6">
                                        <span className="text-[11px] font-black text-text-subtle tracking-widest">{row.type}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 text-[11px] font-black rounded-lg border-2 ${row.priority === 'CRITICAL' ? 'bg-danger text-white border-danger/80 shadow-md' :
                row.priority === 'HIGH' ? 'bg-warning text-text-primary border-warning/80' :
                    row.priority === 'MEDIUM' ? 'bg-brand text-white border-brand/80' : 'bg-surface-2 text-text-muted border-border'}`}>
                                            {row.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-text-subtle font-bold text-[12px] tabular-nums">{row.date}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 px-3 py-2 bg-text-primary/5 w-fit rounded-xl border border-black/5 group-hover/row:bg-surface group-hover/row:border-black/10 transition-all">
                                            <div className={`w-2 h-2 rounded-full ${row.status === 'CLOSED' ? 'bg-success' :
                row.status === 'PLANNING' ? 'bg-brand' : 'bg-warning animate-pulse'}`}/>
                                            <span className="text-[10px] font-black text-text-primary tracking-widest">{row.status}</span>
                                        </div>
                                    </td>
                                </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </>);
}
