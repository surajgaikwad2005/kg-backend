"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, ChevronDown, LayoutDashboard, Search, FileSearch, MoreVertical } from "lucide-react";
import { PageHeader } from "@/src/components/layout/PageHeader";
/* ─────────────────────────── Site Selection Component ───────────────────── */
const FacilitySelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("ALL FACILITIES");
    const dropdownRef = useRef(null);
    const facilities = [
        "BNGB", "BNCP", "BNDI", "BNDJ", "BNPA", "BNPB", "BNJK", "BNQB", "BNDA", "BNDB"
    ];
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (<div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 px-4 py-2 bg-surface-2 rounded-xl border border-black/5 hover:bg-border transition-all min-w-[180px] justify-between h-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-text-muted"/>
                    <span className="text-[11px] font-black text-text-primary uppercase tracking-widest">{selected}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>

            {isOpen && (<div className="absolute top-12 left-0 w-[220px] bg-white border border-black shadow-2xl rounded-xl z-[100] overflow-hidden">
                    <button onClick={() => { setSelected("ALL FACILITIES"); setIsOpen(false); }} className={`w-full text-left px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-colors ${selected === "ALL FACILITIES" ? 'bg-brand text-white' : 'text-text-primary hover:bg-canvas'}`}>
                        ALL FACILITIES
                    </button>
                    <div className="px-5 py-2 bg-canvas border-y border-border/40">
                        <span className="text-[9px] font-black text-text-subtle uppercase tracking-widest">Offshore Platforms</span>
                    </div>
                    {facilities.map((fac) => (<button key={fac} onClick={() => { setSelected(fac); setIsOpen(false); }} className={`w-full text-left px-8 py-3 text-[11px] font-bold uppercase transition-colors ${selected === fac ? 'bg-brand-muted text-brand' : 'text-text-secondary hover:bg-canvas'}`}>
                            {fac}
                        </button>))}
                </div>)}
        </div>);
};
/* ─────────────────────────── Mock Data ─────────────────────────── */
const HISTORICAL_REPORTS = [
    { id: "6022000", asset: "BNCP.COMP.37", owner: "Senior Analyst", date: "2025-02-09", priority: "P1", status: "VERIFIED" },
    { id: "21042003", asset: "BNCP.PUMP.12", owner: "Operation Lead", date: "2025-01-21", priority: "P2", status: "CLOSED" },
    { id: "21042000", asset: "BNCP.TURB.05", owner: "Technical Lead", date: "2025-01-18", priority: "P1", status: "CLOSED" },
    // { id: "REP-9521", asset: "BNCP.GEN.02", owner: "Field Eng.", date: "2026-03-10", priority: "P3", status: "ARCHIVED" },
    // { id: "REP-9411", asset: "BNCP.VALV.10", owner: "Maintenance Mgr.", date: "2026-03-05", priority: "P4", status: "CLOSED" },
];
const METRICS = {
    notification: { total: 1284, overdue: 156, trend: "+12%" },
    workorder: { total: 4512, overdue: 18, trend: "+5.4%" }
};
/* ───────────────────────── Main Page ───────────────────────── */
export default function WorkflowManagementPage() {
    const router = useRouter();
    return (<>

       <PageHeader showDateRange title="RCA" subtitle="Root Cause Analysis" showDateRange />

        
        <div className="p-10 flex flex-col gap-10">

          {/* Historical Investigation Table */}
          <div className="bg-white rounded-3xl border-2 border-black shadow-sm flex flex-col overflow-hidden group">
            <div className="p-6 border-b border-black flex items-center justify-between bg-white relative">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center text-text-primary border border-black/5">
                        <FileSearch className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-text-primary uppercase tracking-widest">Historical Investigation Reports</h2>
                        <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mt-0.5">P1 - P4 Classified Reports</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle"/>
                        <input type="text" placeholder="Find report ID or asset..." className="pl-10 pr-4 py-2 bg-canvas border border-border/40 rounded-xl text-[11px] font-bold outline-none focus:border-brand/50 transition-all w-72"/>
                    </div>
                    <button className="p-2.5 bg-surface-2 rounded-xl hover:bg-surface-2 transition-colors">
                        <MoreVertical className="w-5 h-5 text-text-subtle"/>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto max-h-[500px] thin-scrollbar">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-canvas border-b border-border">
                            {[
            "Report ID",
            "Source Asset",
            "Lead Auditor",
            "Risk class",
            "Archival Date",
            "Verification"
        ].map((col) => (<th key={col} className="px-8 py-5 text-left text-[11px] font-black text-text-subtle uppercase tracking-[0.2em] whitespace-nowrap">{col}</th>))}
                        </tr>
                    </thead>
                    <tbody>
  {HISTORICAL_REPORTS.map((row) => (<tr key={row.id} className="border-b border-border/20 hover:bg-canvas transition-all cursor-pointer group/row" onClick={() => {
                router.push(`/compressor-details/comp_2/investigation?endTime=2025-02-09%2010%3A20%3A00&anomalyId=${row.id}`);
            }}>
      {/* ✅ FIXED: REPORT ID COLUMN */}
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className={`w-1.5 h-6 rounded-full ${row.priority === "P1"
                ? "bg-danger"
                : "bg-border"}`}/>
          <span className="text-[15px] font-black tracking-tight">
            {row.id}
          </span>
        </div>
      </td>

      {/* Asset */}
      <td className="px-8 py-6 text-text-secondary font-bold text-[12px] uppercase">
        {row.asset}
      </td>

      {/* Owner */}
      <td className="px-8 py-6 text-text-primary font-black text-[14px]">
        {row.owner}
      </td>

      {/* Priority */}
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 text-[11px] font-black rounded-xl ${row.priority === "P1"
                ? "bg-danger text-white"
                : row.priority === "P2"
                    ? "bg-warning text-white"
                    : row.priority === "P3"
                        ? "bg-brand text-white"
                        : "bg-surface-2 text-text-muted"}`}>
            {row.priority}
          </span>
          {row.priority === "P1" && (<AlertTriangle className="w-5 h-5 text-danger"/>)}
        </div>
      </td>

      {/* Date */}
      <td className="px-8 py-6 text-text-subtle font-bold text-[12px]">
        {row.date}
      </td>

      {/* Status */}
      <td className="px-8 py-6">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-success/10 w-fit rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-success"/>
          <span className="text-[10px] font-black text-success">
            {row.status}
          </span>
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
