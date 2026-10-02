"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TimeSelector from "@/src/components/ui/TimeSelector";
import { Bell, Search, ChevronDown, ClipboardList, Send, CheckCircle2, AlertCircle, ArrowLeft, MoreVertical, Activity, MapPin, Target, GripVertical, X } from "lucide-react";
import { useMatchObservation } from "../_queries/useNotificationQueries";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/* ─────────────────────────── Mock Data ─────────────────────────── */
const SITES = ["BNCP", "ANCP", "KPK", "DUL", "ZAB", "UMM"];
const MOCK_RESPONSE = [
    {
        rank: 1,
        source: "GLOC",
        notification: "",
        work_order: "",
        functional_location: "",
        platform: "",
        equipment: "BN-37",
        status: "",
        match_score: "90%",
        reason: "Closest match based on equipment (BN-37) and finding description mentioning corroded component causing leak, which aligns with observation of BN37L SSV packing leak"
    },
    {
        rank: 2,
        source: "AIF",
        notification: "25415354",
        work_order: "82932152",
        functional_location: "",
        platform: "",
        equipment: "Piping Non-Hydrocarbon",
        status: "",
        match_score: "90%",
        reason: "Best match based on SSV packing leak mentioned in observation matches with notification 25415354 which describes 'A leak was found' on piping system"
    },
    {
        rank: 3,
        source: "AIF",
        notification: "",
        work_order: "",
        functional_location: "",
        platform: "",
        equipment: "",
        status: "",
        match_score: "0",
        reason: "No matching records found for BN37L SSV packing leak"
    }
];
/* ─────────────────────────── Helper Components ───────────────────── */
const PanelHeader = ({ title, icon: Icon, children, borderColor = "border-border" }) => (<div className={`drag-handle cursor-move p-3 border-b flex items-center justify-between bg-surface rounded-t-xl shrink-0 ${borderColor}`}>
    <div className="flex items-center gap-2">
      <GripVertical className="w-4 h-4 text-text-subtle"/>
      {Icon && <Icon className="w-4 h-4 text-brand"/>}
      <h2 className="text-text-primary font-bold text-[16px] tracking-tight uppercase">{title}</h2>
    </div>
    <div className="flex items-center gap-3">
      {children}
      <MoreVertical className="w-4 h-4 text-text-subtle cursor-pointer hover:text-text-secondary transition-colors"/>
    </div>
  </div>);
const initialLayouts = {
    lg: [
        { i: "observation", x: 0, y: 0, w: 6, h: 5 },
        { i: "site", x: 6, y: 0, w: 6, h: 5 },
        { i: "results", x: 0, y: 5, w: 12, h: 6 }
    ],
    md: [
        { i: "observation", x: 0, y: 0, w: 5, h: 5 },
        { i: "site", x: 5, y: 0, w: 5, h: 5 },
        { i: "results", x: 0, y: 5, w: 10, h: 6 }
    ],
};
/* ─────────────────────────── Main Page ─────────────────────────── */
export default function NotificationObservationPage() {
    const router = useRouter();
    const { width, containerRef, mounted } = useContainerWidth();
    const matchMutation = useMatchObservation();

    const [observation, setObservation] = useState("");
    const [selectedSite, setSelectedSite] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [layouts, setLayouts] = useState(initialLayouts);
    const [selectedRanks, setSelectedRanks] = useState([]);
    const [analysisResults, setAnalysisResults] = useState([]);
    const [error, setError] = useState(null);

    const isSubmitting = matchMutation.isPending;

    const fetchAnalysis = async (site) => {
        setError(null);
        try {
            const data = await matchMutation.mutateAsync({ observation: observation, platform: site });
            setAnalysisResults(Array.isArray(data) ? data : []);
            setShowResults(true);
        }
        catch (err) {
            setError(err.message || "An unexpected error occurred");
        }
    };
    useEffect(() => {
        if (!observation) {
            setShowResults(false);
            setSelectedSite("");
            setIsDropdownOpen(false);
            setSelectedRanks([]);
        }
    }, [observation]);
    const filteredSites = SITES.filter(site => site.toLowerCase().includes(searchTerm.toLowerCase()));
    return (<>
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-border flex items-center justify-between px-6 bg-surface z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/maintenance-workflow")} className="p-2 hover:bg-surface-2 rounded-lg transition-colors group">
              <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-text-secondary"/>
            </button>
            <h1 className="text-[22px] font-bold text-text-primary tracking-tight uppercase">
              Notification Observation
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <TimeSelector />
            <button onClick={() => setLayouts(initialLayouts)} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-brand text-white rounded-lg hover:bg-brand-hover transition-all shadow-sm active:scale-95">
              Reset Layout
            </button>
            <button className="p-2 text-text-subtle hover:text-text-secondary transition-colors">
              <Bell className="w-5 h-5"/>
            </button>
          </div>
        </header>

        {/* ── grid canvas ── */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0 thin-scrollbar" ref={containerRef}>
          {mounted && (<ResponsiveGridLayout className="[&_.react-grid-placeholder]:bg-indigo-50/50! [&_.react-grid-placeholder]:rounded-xl! [&_.react-grid-placeholder]:opacity-50!" width={width} layouts={layouts} onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)} breakpoints={{ lg: 1200, md: 996 }} cols={{ lg: 12, md: 10 }} rowHeight={60} dragConfig={{ handle: ".drag-handle" }} margin={[20, 20]}>
              {/* Observation Container */}
              <div key="observation" className="bg-surface rounded-xl border border-black shadow-sm flex flex-col overflow-hidden h-full">
                <PanelHeader title="Observation Details" icon={ClipboardList} borderColor="border-black"/>
                <div className="p-6 flex-1 flex flex-col space-y-2 min-h-0">
                  <label className="text-xs font-bold text-text-primary uppercase tracking-widest">
                    Describe what you observed
                  </label>
                  <textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="e.g., Found BN37L SSV packing leak, and cause process leak." className="w-full flex-1 min-h-0 p-4 bg-canvas border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none text-text-secondary font-medium placeholder:text-text-subtle"/>
                </div>
              </div>

              {/* Select Site Container */}
              {/* Select Site Container */}
               <div key="site" className={`bg-surface rounded-xl border border-black shadow-sm flex flex-col overflow-visible z-20 transition-opacity duration-300 h-full ${!observation ? "opacity-60 cursor-not-allowed" : ""}`}>
                <PanelHeader title="Select Site / Location" icon={MapPin} borderColor="border-black"/>
                <div className="p-6 flex-1 flex flex-col min-h-0">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-text-primary uppercase tracking-widest">
                      Search and Select Platform
                    </label>
                    <div className="relative">
                      <div onClick={() => observation && setIsDropdownOpen(!isDropdownOpen)} className={`w-full p-4 bg-canvas border border-border rounded-xl flex items-center justify-between transition-all select-none ${observation ? "cursor-pointer hover:border-border-strong" : "cursor-not-allowed"}`}>
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          <Target className={`w-4 h-4 shrink-0 ${observation ? "text-brand" : "text-border-strong"}`}/>
                          <span className={`truncate ${selectedSite ? "text-text-primary font-semibold" : "text-text-subtle font-medium"}`}>
                            {!observation ? "Fill observation first..." : (selectedSite || "Choose a platform...")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedSite && observation && (<div onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSite("");
                    setShowResults(false);
                    setAnalysisResults([]);
                    setError(null);
                }} className="p-1 hover:bg-surface-2 rounded-full transition-colors group/clear">
                              <X className="w-4 h-4 text-text-subtle group-hover/clear:text-red-500"/>
                            </div>)}
                          <ChevronDown className={`w-4 h-4 text-text-subtle transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}/>
                        </div>
                      </div>

                      {isDropdownOpen && (<div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-3 border-b border-border/40 bg-canvas/50">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle"/>
                              <input type="text" placeholder="Filter sites..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-[16px] focus:ring-2 focus:ring-brand outline-none" onClick={(e) => e.stopPropagation()}/>
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredSites.map((site) => (<div key={site} onClick={() => {
                        setSelectedSite(site);
                        setIsDropdownOpen(false);
                        if (observation) {
                            fetchAnalysis(site);
                        }
                    }} className="px-4 py-3 hover:bg-brand-muted cursor-pointer text-[16px] font-semibold text-text-secondary transition-colors flex items-center justify-between group">
                                {site}
                                {selectedSite === site && <CheckCircle2 className="w-4 h-4 text-brand"/>}
                              </div>))}
                            {filteredSites.length === 0 && (<div className="px-4 py-6 text-center text-text-subtle text-[16px] italic">
                                No matching sites found
                              </div>)}
                          </div>
                        </div>)}
                    </div>
                  </div>
                  
                  {isSubmitting && (<div className="mt-auto pt-2 flex items-center justify-center gap-3 text-text-muted font-bold text-[14px] uppercase tracking-widest animate-pulse">
                      <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin"></div>
                      Analyzing Observation...
                    </div>)}

                  {error && (<div className="mt-auto pt-2 flex items-center justify-center gap-3 text-red-500 font-bold text-xs uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4"/>
                      {error}
                    </div>)}
                </div>
              </div>

              {/* Results Container */}
              {showResults ? (<div key="results" className="bg-surface rounded-xl border border-black shadow-sm flex flex-col overflow-hidden h-full">
                  <PanelHeader title="Observation Analysis Results" icon={Activity} borderColor="border-black">
                    <button disabled={!observation} onClick={() => {
                    const firstSelected = analysisResults.find(r => selectedRanks.includes(r.rank));
                    const params = new URLSearchParams();
                    // Use notification_id if a row is selected and has one, otherwise use observation
                    const notificationId = firstSelected?.notification_id || firstSelected?.notification;
                    if (notificationId && notificationId !== "-") {
                        params.set("notification_id", notificationId);
                    }
                    else {
                        params.set("observation", observation);
                    }
                    router.push(`/notification-details?${params.toString()}`);
                }} className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-black shadow-sm ${observation
                    ? "bg-brand text-white hover:bg-brand-hover active:scale-95 cursor-pointer"
                    : "bg-surface-2 text-text-primary cursor-not-allowed"}`}>
                      <Send className="w-3 h-3"/>
                      Generate Notification
                    </button>
                  </PanelHeader>
                  <div className="flex-1 overflow-auto min-h-0">
                    <table className="w-full text-sm border-separate border-spacing-0">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-canvas border-b border-border">
                          {[
                    "Select",
                    "Rank",
                    "Source",
                    "Notification",
                    "Work Order",
                    "Equipment",
                    "Status",
                    "Score",
                    "Reasoning",
                ].map((head) => (<th key={head} className="px-4 py-2.5 text-left text-[14px] font-bold text-text-subtle uppercase tracking-widest whitespace-nowrap">
                              {head}
                            </th>))}
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResults.map((row, idx) => {
                    const isSelected = selectedRanks.includes(row.rank);
                    const toggleSelection = () => {
                        setSelectedRanks(prev => prev.includes(row.rank)
                            ? prev.filter(r => r !== row.rank)
                            : [...prev, row.rank]);
                    };
                    // Handle match_score formatting (convert 0.95 to 95%)
                    let displayScore = row.match_score;
                    if (displayScore && !displayScore.toString().includes('%')) {
                        const scoreNum = parseFloat(displayScore);
                        if (!isNaN(scoreNum) && scoreNum <= 1) {
                            displayScore = `${(scoreNum * 100).toFixed(0)}%`;
                        }
                    }
                    return (<tr key={idx} onClick={toggleSelection} className={`border-b border-border/40 cursor-pointer transition-colors ${isSelected
                            ? "bg-brand-muted"
                            : idx % 2 === 0
                                ? "bg-surface hover:bg-canvas"
                                : "bg-canvas/50 hover:bg-surface-2"}`}>
                             <td className="px-4 py-3 whitespace-nowrap">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? "bg-brand border-brand" : "bg-surface border-border-strong"}`}>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white"/>}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-bold transition-colors ${isSelected ? "bg-brand text-white" : "bg-surface-2 text-text-secondary"}`}>
                                  {row.rank}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${row.source === "GLOC" ? "bg-warning/10 text-warning border border-warning/20" : "bg-purple-50 text-purple-700 border border-purple-100"}`}>
                                  {row.source}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-brand underline">
                                {row.notification || row.notification_id || "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-black text-text-secondary">
                                {row.wo_number || row.work_order || "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-text-primary">
                                {row.equipment_ref || row.equipment || "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="flex items-center gap-1.5 text-[14px] text-text-muted font-medium">
                                  <div className={`w-1.5 h-1.5 rounded-full ${row.status === "Closed" ? "bg-border-strong" : "bg-success"}`}></div>
                                  {row.status || "Active"}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`text-xs font-black ${parseFloat(row.match_score) > 0.5 || parseInt(row.match_score) > 50 ? "text-success" : "text-text-subtle"}`}>
                                  {displayScore}
                                </span>
                              </td>
                              <td className="px-4 py-3 min-w-[300px]">
                                <p className="text-[14px] text-text-muted leading-relaxed font-medium line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                                  {row.reason}
                                </p>
                              </td>
                            </tr>);
                })}
                      </tbody>
                    </table>
                  </div>
                </div>) : (<div key="results" className="hidden"/>)}
            </ResponsiveGridLayout>)}
        </div>

    </>);
}
