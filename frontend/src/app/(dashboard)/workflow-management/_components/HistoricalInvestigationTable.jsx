"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSearch, MoreVertical, Search } from "lucide-react";
import { EmptyState } from "@/src/components/ui/EmptyState";

const TABLE_COLUMNS = ["Report ID", "Source Asset", "Lead Auditor", "Risk Class", "Archival Date", "Verification"];

const PRIORITY_BADGE_CLASSNAME = {
    P1: "bg-danger text-white border-danger/80 shadow-xl",
    P2: "bg-warning text-white border-warning/80 shadow-lg",
    P3: "bg-brand text-white border-brand/80 shadow-md",
    P4: "bg-surface-2 text-text-muted border-border",
};

function matchesQuery(report, query) {
    return report.id.toLowerCase().includes(query) || report.asset.toLowerCase().includes(query);
}

/**
 * HistoricalInvestigationTable — searchable list of past investigation reports.
 * Pure/data-driven: caller supplies `reports`, this component owns only the
 * local search-filter UI state.
 */
export function HistoricalInvestigationTable({ reports }) {
    const [query, setQuery] = useState("");

    const filteredReports = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return reports;
        return reports.filter((report) => matchesQuery(report, normalizedQuery));
    }, [reports, query]);

    return (
        <div className="bg-surface rounded-3xl border-2 border-border-strong shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border-strong flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface relative">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center text-text-primary border border-border shrink-0">
                        <FileSearch className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-text-primary uppercase tracking-widest">Historical Investigation Matrix</h2>
                        <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mt-0.5">P1 - P4 Classified Reports</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 sm:flex-initial">
                        <label htmlFor="investigation-search" className="sr-only">Find report ID or asset</label>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
                        <input
                            id="investigation-search"
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Find report ID or asset..."
                            className="pl-10 pr-4 py-2 bg-canvas border border-border rounded-xl text-[11px] font-bold outline-none focus:border-brand/50 transition-all w-full sm:w-72"
                        />
                    </div>
                    <button type="button" aria-label="More options" className="p-2.5 bg-surface-2 rounded-xl hover:bg-border transition-colors cursor-pointer shrink-0">
                        <MoreVertical className="w-5 h-5 text-text-subtle" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto max-h-[500px] thin-scrollbar">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-canvas border-b border-border">
                            {TABLE_COLUMNS.map((col) => (
                                <th key={col} scope="col" className="px-8 py-5 text-left text-[11px] font-black text-text-subtle uppercase tracking-[0.2em] whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_COLUMNS.length}>
                                    <EmptyState
                                        icon={<FileSearch className="w-8 h-8" />}
                                        title="No matching reports"
                                        description={query ? `No reports match "${query}"` : "No historical investigation reports yet"}
                                    />
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((row) => (
                                <tr key={row.id} className="border-b border-border/20 hover:bg-canvas transition-all cursor-pointer group/row">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1.5 h-6 rounded-full transition-all duration-300 ${row.priority === "P1" ? "bg-danger animate-pulse scale-x-125" : "bg-border group-hover/row:bg-border-strong"}`} />
                                            <span className="text-[15px] font-black tracking-tight">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-text-secondary font-bold text-[12px] uppercase tracking-wider tabular-nums">{row.asset}</td>
                                    <td className="px-8 py-6 text-text-primary font-black text-[14px] tracking-tight">{row.owner}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 text-[11px] font-black rounded-xl border-2 ${PRIORITY_BADGE_CLASSNAME[row.priority]}`}>
                                                {row.priority}
                                            </span>
                                            {row.priority === "P1" && <AlertTriangle className="w-5 h-5 text-danger" />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-text-subtle font-bold text-[12px] tabular-nums">{row.date}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 px-3 py-1.5 bg-success/10 w-fit rounded-xl border border-success/20">
                                            <CheckCircle2 className="w-4 h-4 text-success" />
                                            <span className="text-[10px] font-black text-success uppercase tracking-widest">{row.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
