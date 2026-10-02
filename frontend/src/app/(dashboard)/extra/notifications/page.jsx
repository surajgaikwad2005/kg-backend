"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TimeSelector from "@/src/components/ui/TimeSelector";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, LabelList, ResponsiveContainer } from 'recharts';
import { Bell, ArrowLeft, Plus, Search, Filter, Activity, History, Settings, ChevronDown } from "lucide-react";
import { useAllNotifications } from "./_queries/useNotificationQueries";

const NOTIFICATION_LIST = [
    { id: "25415354", functionalLocation: "BNCP.COMP.37", equipment: "Compressor", description: "Mechanical failure in main seal", creationDate: "2026-03-25", priority: "HIGH", status: "OPEN" },
    { id: "25415355", functionalLocation: "BNCP.PUMP.12", equipment: "Pump", description: "Minor vibration detected in motor", creationDate: "2026-03-24", priority: "MEDIUM", status: "IN PROGRESS" },
    { id: "25415356", functionalLocation: "BNCP.TURB.05", equipment: "Turbine", description: "Lube oil pressure drop", creationDate: "2026-03-23", priority: "CRITICAL", status: "OPEN" },
    { id: "25415357", functionalLocation: "BNCP.BLR.09", equipment: "Boiler", description: "Annual inspection pending", creationDate: "2026-03-20", priority: "LOW", status: "CLOSED" },
    { id: "25415358", functionalLocation: "BNCP.GEN.02", equipment: "Generator", description: "Thermal overload tripped", creationDate: "2026-03-18", priority: "HIGH", status: "CLOSED" },
    { id: "25415359", functionalLocation: "BNCP.VALV.10", equipment: "Valve", description: "Actuator stuck in closed position", creationDate: "2026-03-15", priority: "CRITICAL", status: "IN PROGRESS" },
];

const STATUS_DATA = [
    { name: 'Open', value: 156, color: '#f43f5e' },
    { name: 'In Progress', value: 480, color: '#f59e0b' },
    { name: 'Closed', value: 648, color: '#10b981' },
];
const PRIORITY_DATA = [
    { name: 'Critical', value: 45, color: '#f43f5e' },
    { name: 'High', value: 120, color: '#f59e0b' },
    { name: 'Medium', value: 310, color: '#3b82f6' },
    { name: 'Low', value: 809, color: '#94a3b8' },
];

const NotificationStatusPie = () => (
    <div className="bg-surface rounded-3xl border-2 border-border-strong p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-label font-black tracking-widest text-text-subtle">Status Distribution</h3>
            <Settings className="w-4 h-4 text-border-strong" />
        </div>
        <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie data={STATUS_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {STATUS_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const NotificationPriorityChart = () => (
    <div className="bg-surface rounded-3xl border-2 border-border-strong p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-label font-black tracking-widest text-text-subtle">Priority Breakdown</h3>
            <Filter className="w-4 h-4 text-border-strong" />
        </div>
        <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={PRIORITY_DATA} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {PRIORITY_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 10, fontWeight: 900 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);
/* ───────────────────────── Main Page ───────────────────────── */
export default function NotificationsDashboardPage() {
    const router = useRouter();
    const { data: rawData } = useAllNotifications();

    const notifications = React.useMemo(() => {
        if (!rawData) return NOTIFICATION_LIST;
        const list = Array.isArray(rawData) ? rawData : (rawData.notifications || rawData.data || []);
        if (list.length === 0) return NOTIFICATION_LIST;
        return list.map((item) => ({
            id: item.notification_id || "N/A",
            functionalLocation: item.functional_location || "Unknown",
            equipment: item.equipment_ref || "-",
            description: item.description || "No description",
            creationDate: item.creation_date ? item.creation_date.split('T')[0] : "-",
            dueDate: item.aif_due_date ? item.aif_due_date.split('T')[0] : "-",
            priority: "MEDIUM",
            status: (item.status || "OPEN").toUpperCase()
        }));
    }, [rawData]);
    return (<>

                {/* Header */}
                <header className="h-20 shrink-0 border-b border-black flex items-center justify-between px-10 bg-white z-30 shadow-sm transition-all">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.push("/workflow-management")} className="w-10 h-10 rounded-xl border border-black flex items-center justify-center hover:bg-canvas transition-colors">
                            <ArrowLeft className="w-5 h-5 text-text-primary"/>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[22px] font-black text-text-primary tracking-tight leading-none uppercase">
                                Notification Dashboard
                            </h1>
                            <p className="text-label font-bold text-text-subtle uppercase tracking-widest mt-1">Live Operational Intake</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <TimeSelector />
                        <button onClick={() => router.push("/notification-create")} className="px-6 py-3 bg-brand text-white rounded-xl text-caption font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-brand-hover shadow-lg active:scale-95 transition-all">
                            <Plus className="w-4 h-4"/>
                            New Notification
                        </button>
                        <button className="p-3 border border-black rounded-xl text-text-subtle hover:text-text-primary transition-all hover:bg-canvas">
                            <Bell className="w-5 h-5"/>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 p-10 overflow-y-auto min-h-0 thin-scrollbar space-y-10">

                    {/* KPI Cards Row (The Dashboard Part) */}
                    <div className="grid grid-cols-3 gap-10 h-80">
                        <NotificationStatusPie />
                        <NotificationPriorityChart />

                        {/* Summary Stat Card */}
                        <div className="bg-overlay rounded-3xl p-10 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-bl-[120px] transition-transform group-hover:scale-110"/>
                            <div className="relative z-10">
                                <Activity className="w-10 h-10 text-brand mb-6"/>
                                <h3 className="text-label font-black uppercase tracking-widest text-text-subtle">Total Notifications</h3>
                                <div className="text-[64px] font-black leading-none mt-2 tabular-nums tracking-tighter">1,284</div>
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[20px] font-black text-danger">156</span>
                                    <span className="text-2xs font-black text-text-subtle uppercase tracking-widest mt-1">Overdue Actions</span>
                                </div>
                                <div className="w-px h-10 bg-white/20"/>
                                <div className="flex flex-col">
                                    <span className="text-[20px] font-black text-success">72%</span>
                                    <span className="text-2xs font-black text-text-subtle uppercase tracking-widest mt-1">Triage Comp Rate</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List of Notification Section */}
                    <div className="bg-white rounded-3xl border-2 border-black shadow-sm flex flex-col overflow-hidden group">
                        <div className="p-8 border-b border-black flex items-center justify-between bg-white">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-canvas flex items-center justify-center text-text-primary border border-black/5">
                                    <History className="w-7 h-7"/>
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-text-primary uppercase tracking-widest">List of Notifications</h2>
                                    <p className="text-label font-bold text-text-subtle uppercase tracking-widest mt-0.5">Real-time registry across all assets</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-subtle group-hover:text-brand transition-colors"/>
                                    <input type="text" placeholder="Filter notifications..." className="pl-12 pr-6 py-3 bg-canvas border border-border rounded-2xl text-label font-bold outline-none focus:border-brand/60 transition-all w-96 shadow-inner"/>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-xl text-caption font-black uppercase tracking-widest hover:bg-canvas transition-all">
                                    <ChevronDown className="w-4 h-4"/>
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto max-h-150 thin-scrollbar">
                            <table className="w-full text-sm border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-canvas border-b border-border">
                                        {[
            "Notice ID",
            "Asset Reference",
            "Description",
            "Priority",
            "Submission Date",
            "Status"
        ].map((col) => (<th key={col} className="px-8 py-5 text-left text-caption font-black text-text-subtle uppercase tracking-[0.2em] whitespace-nowrap">{col}</th>))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((row) => (<tr key={row.id} className="border-b border-border/20 hover:bg-canvas transition-all cursor-pointer group/row">
                                            <td className="px-8 py-6">
                                                <span className="text-[16px] font-black text-text-primary group-hover:text-brand transition-colors tabular-nums tracking-tighter">#{row.id}</span>
                                            </td>
                                            <td className="px-8 py-6 text-text-secondary font-bold text-label uppercase tracking-wide tabular-nums">{row.functionalLocation}</td>
                                            <td className="px-8 py-6 text-text-secondary font-medium text-body-sm tracking-tight max-w-100 truncate">{row.description}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 text-caption font-black rounded-lg border-2 ${row.priority === 'CRITICAL' ? 'bg-danger text-white border-danger/80 shadow-md' :
                row.priority === 'HIGH' ? 'bg-warning text-text-primary border-warning/80' :
                    row.priority === 'MEDIUM' ? 'bg-brand text-white border-brand/80' : 'bg-surface-2 text-text-muted border-border'}`}>
                                                    {row.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-text-subtle font-bold text-label tabular-nums">{row.creationDate}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 px-3 py-2 bg-text-primary/5 w-fit rounded-xl border border-black/5 group-hover/row:bg-surface group-hover/row:border-black/10 transition-all">
                                                    <div className={`w-2 h-2 rounded-full ${row.status === 'CLOSED' ? 'bg-success' :
                row.status === 'OPEN' ? 'bg-danger animate-pulse' : 'bg-warning'}`}/>
                                                    <span className="text-label font-black text-text-primary uppercase tracking-widest">{row.status}</span>
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
