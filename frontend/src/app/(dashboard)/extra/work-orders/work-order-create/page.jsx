"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TimeSelector from "@/src/components/ui/TimeSelector";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import { ArrowLeft, Send, Activity, ClipboardList, Plus, Trash2, DollarSign, Cpu, Settings, Layers, RefreshCw, History } from "lucide-react";
import { useAllNotifications, useMatchObservation, useGenerateWorkorder, useGenerateNotification } from "@/src/app/(dashboard)/extra/notifications/_queries/useNotificationQueries";
import { useToast } from "@/src/components/ui/Toast";
/* ─────────────────────────── Constants ─────────────────────────── */
const STORAGE_KEY = 'wo_create_layouts_v1';
/* ─────────────────────────── Section Card Template ─────────────────────────── */
const SectionCard = ({ title, icon: Icon, children, className = "", badge = null, headerAction = null }) => (<div className={`bg-surface rounded-[32px] border-2 border-black flex flex-col overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] group transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] ${className}`}>
        <div className="p-6 border-b border-black flex items-center justify-between bg-surface relative shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center text-text-primary border border-black/5 group-hover:bg-overlay group-hover:text-white transition-all duration-500">
                    <Icon className="w-6 h-6" strokeWidth={1.5}/>
                </div>
                <div>
                    <h2 className="text-[14px] font-black text-text-primary uppercase tracking-widest leading-none">{title}</h2>
                    <div className="flex items-center gap-2 mt-1.5 font-bold uppercase tracking-[0.1em]">
                        {badge}
                    </div>
                </div>
            </div>
            {headerAction}
        </div>
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {children}
        </div>
    </div>);
/* ─────────────────────────── Sub-Component: Input Field ───────────────────── */
const InputField = ({ label, value, onChange, placeholder = "", type = "text", readOnly = false, className = "" }) => (<div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.15em] ml-1">{label}</label>
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readOnly} className={`px-5 py-3 bg-canvas border border-border rounded-2xl text-[12px] font-bold text-text-secondary outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all ${readOnly ? 'bg-surface-2 cursor-not-allowed border-dashed opacity-75' : ''}`}/>
    </div>);
/* ───────────────────────── Main Page Content ───────────────────────── */
export default function WorkOrderCreatePage() {
    const { error: toastError, warning: toastWarning } = useToast();
    const router = useRouter();
    const { width, containerRef, mounted } = useContainerWidth();

    const notifQuery = useAllNotifications();
    const genWoMutation = useGenerateWorkorder();
    const matchMutation = useMatchObservation();
    const genNotifMutation = useGenerateNotification();

    const [similarityResults, setSimilarityResults] = useState([]);
    const [selectedNotifNum, setSelectedNotifNum] = useState(null);
    const [showSimilar, setShowSimilar] = useState(false);
    const [activeTab, setActiveTab] = useState("header");
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const allNotifications = React.useMemo(
        () => (Array.isArray(notifQuery.data?.data) ? notifQuery.data.data : (Array.isArray(notifQuery.data) ? notifQuery.data : [])),
        [notifQuery.data]
    );
    const isLoadingNotifications = notifQuery.isLoading;
    const isLoadingSimilar = matchMutation.isPending;
    const isGenerating = genWoMutation.isPending || genNotifMutation.isPending;

    /* ─── State Management: Header Data ─────────────────────────── */
    const [headerData, setHeaderData] = useState({
        order_type: "",
        order_number: "",
        order_description: "",
        order_date: "",
        equipment_number: "",
        equipment_description: "",
        functional_location: "",
        functional_description: "",
        start_date: "",
        end_date: "",
        planner_group: "",
        priority: ""
    });
    /* ─── State Management: Operations ──────────────────────────── */
    const [operationsList, setOperationsList] = useState([
        { operationNo: "0010", operationDescription: "", mainWorkcenter: "", duration: "", controlKey: "PM01", plannedManpower: "" }
    ]);
    /* ─── State Management: Components ──────────────────────────── */
    const [components, setComponents] = useState([
        { id: 1, material: "MAT-221054", desc: "Mechanical Seal Assembly", qty: "1", storage: "WH-01", reservation: "1054231", condition: "NEW" }
    ]);
    /* ─── State Management: Costs ───────────────────────────────── */
    const [costs, setCosts] = useState({
        cost_center: "",
        cost_description: "",
        estimated_cost: "",
        settlement_receiver: "",
        assembly: ""
    });
    const addComponent = () => {
        setComponents([...components, { id: Date.now(), material: "", desc: "", qty: "", storage: "", reservation: "", condition: "NEW" }]);
    };
    const removeComponent = (id) => {
        setComponents(components.filter(c => c.id !== id));
    };

    const handleSelectNotification = async (notif) => {
        setSelectedNotifNum(notif["Notification Number"]);
        setShowGenerateModal(false);
        try {
            const data = await genWoMutation.mutateAsync({ notification: notif });
            // Map Header Data (Robust handling for new and old formats)
            const h = data.Header || data.headerData || {};
            if (h) {
                setHeaderData(prev => ({
                    ...prev,
                    order_type: h["Order Type"] || h.orderType || prev.order_type,
                    order_number: h["Order Number"]?.toString() || h.orderNumber?.toString() || prev.order_number,
                    order_description: h["Order Description"] || h.orderDescription || prev.order_description,
                    order_date: h["Order Date"] || h["Notification Date"] || h.orderDate || h.notificationDate || prev.order_date,
                    equipment_number: h["Equipment Number"] || h.equipmentNumber || prev.equipment_number,
                    equipment_description: h["Equipment Description"] || h.equipmentDescription || prev.equipment_description,
                    functional_location: h["Functional Location"] || h.functionalLocation || prev.functional_location,
                    functional_description: h["Functional Location Description"] || h.functionalLocationDescription || prev.functional_description,
                    planner_group: h["Planner Group"] || h.plannerGroup || prev.planner_group,
                    priority: h["Priority"] || h.priority || prev.priority,
                    start_date: h["Start Date"] || h.startDate || prev.start_date,
                    end_date: h["End Date"] || h.endDate || prev.end_date,
                }));
            }
            // Map Operations
            const ops = data.Operations || data.operationsData;
            if (ops && Array.isArray(ops)) {
                setOperationsList(ops.map((op) => ({
                    operationNo: op["Operation No"] || op.operationNo || "",
                    operationDescription: op["Operation Description"] || op.operationDescription || "",
                    mainWorkcenter: op["Main Workcenter"] || op.mainWorkcenter || "",
                    duration: (op["Duration"] ?? op.duration ?? "").toString(),
                    controlKey: op["Control Key"] || op.controlKey || "PM01",
                    plannedManpower: (op["Planned Manpower"] ?? op.plannedManpower ?? "").toString()
                })));
            }
            // Map Components
            const comp = data.Components || data.componentsData;
            if (comp && Array.isArray(comp)) {
                const mappedComponents = comp.map((c, idx) => ({
                    id: Date.now() + idx,
                    material: c["Material Number"] || c.materialNumber || "",
                    desc: c["Material Description"] || c.materialDescription || "",
                    qty: (c["Quantity"] ?? c.quantity ?? "").toString(),
                    storage: c["Storage Location"] || c.storageLocation || "",
                    reservation: c["Reservation No"] || c.reservationNo || "",
                    condition: (c["System Condition"] || c.systemCondition || "NEW").toUpperCase()
                }));
                setComponents(mappedComponents);
            }
            // Map Costs
            const costsData = data.Costs || data.costsData;
            if (costsData) {
                setCosts({
                    cost_center: costsData["Cost Center"] || costsData.costCenter || costsData.cost_center || "",
                    cost_description: costsData["Cost Center Description"] || costsData.costCenterDescription || costsData.cost_description || "",
                    estimated_cost: (costsData["Estimated Costs"] ?? costsData.estimatedCosts ?? costsData.estimated_cost ?? 0).toString(),
                    settlement_receiver: costsData["Settlement Receiver"] || costsData.settlementReceiver || costsData.settlement_receiver || "",
                    assembly: costsData["Assembly"] || costsData.assembly || ""
                });
            }
        }
        catch {
            toastError('Generation failed', 'Failed to synthesize work order. Please try again.');
        }
    };
    const fetchSimilarObservations = async () => {
        if (!headerData.order_description) {
            toastWarning('Missing field', 'Please provide a description first.');
            return;
        }
        setShowSimilar(true);
        try {
            const data = await matchMutation.mutateAsync({ observation: headerData.order_description, platform: "BNCP" });
            setSimilarityResults(Array.isArray(data) ? data : []);
        }
        catch {
            setSimilarityResults([]);
        }
    };
    const handleGenerateWorkOrder = async () => {
        if (!headerData.order_description) {
            toastWarning('Missing field', 'Please provide a description first.');
            return;
        }
        try {
            const result = await genNotifMutation.mutateAsync({ observation: headerData.order_description });
            const data = result.data || result;
            // Map data to states
            setHeaderData(prev => ({
                ...prev,
                order_type: data["Notification Type"] || prev.order_type,
                order_number: data["Notification Number"] || prev.order_number,
                order_date: data["Notification Date"] || prev.order_date,
                equipment_number: data["Equipment"] || prev.equipment_number,
                equipment_description: data["Equipment Description"] || prev.equipment_description,
                functional_location: data["Functional Location"] || prev.functional_location,
                functional_description: data["Functional Location Description"] || prev.functional_description,
                planner_group: data["Planner Group"] || prev.planner_group,
                priority: data["Priority"] || prev.priority,
                start_date: data["Start Date"] || prev.start_date,
                end_date: data["End Date"] || prev.end_date,
            }));
            setOperationsList([{
                    operationNo: "0010",
                    operationDescription: "AI Generated Task from Observation",
                    mainWorkcenter: data["Main Work Center"] || "MECH",
                    duration: "2.0",
                    controlKey: "PM01",
                    plannedManpower: "1"
                }]);
        }
        catch {
            toastError('Generation failed', 'Failed to generate work order details.');
        }
    };
    const initialLayouts = {
        lg: [
            { i: 'intelligence', x: 0, y: 0, w: 12, h: 3, minW: 10, minH: 3 },
            { i: 'main_terminal', x: 0, y: 3, w: 12, h: 5, minW: 10, minH: 4 },
            { i: 'similar_list', x: 0, y: 8, w: 12, h: 5, minW: 10, minH: 4 }
        ],
        md: [
            { i: 'intelligence', x: 0, y: 0, w: 10, h: 3 },
            { i: 'main_terminal', x: 0, y: 3, w: 10, h: 6 },
            { i: 'similar_list', x: 0, y: 9, w: 10, h: 5 }
        ]
    };
    const [layouts, setLayouts] = useState(initialLayouts);
    useEffect(() => {
        if (mounted) {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setLayouts(JSON.parse(saved));
                }
                catch (e) {
                }
            }
            window.dispatchEvent(new Event('resize'));
        }
    }, [mounted]);
    const tabs = [
        { id: "header", label: "Header Data", icon: Layers },
        { id: "operations", label: "Operations Tab", icon: Settings },
        { id: "components", label: "Components", icon: ClipboardList },
        { id: "costs", label: "Costs", icon: DollarSign }
    ];
    return (<>

                <header className="h-[90px] shrink-0 border-b border-black flex items-center justify-between px-10 bg-surface/80 backdrop-blur-xl z-30 shadow-sm transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.push("/work-orders")} className="w-12 h-12 rounded-2xl border border-black/10 flex items-center justify-center hover:bg-overlay hover:text-white hover:border-black transition-all duration-300 shadow-sm">
                            <ArrowLeft className="w-5 h-5"/>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[26px] font-black text-text-primary tracking-tight leading-none uppercase">
                                Create Work Order
                            </h1>
                            <div className="flex items-center gap-4 mt-1.5">
                                <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">Technical Intake Terminal</span>
                                <div className="h-1 w-1 rounded-full bg-border-strong shadow-[0_0_10px_rgba(0,0,0,0.2)]"/>
                                <span className="text-[10px] font-black text-brand uppercase tracking-widest">Awaiting Direct Execution Order</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <TimeSelector />
                        <button onClick={() => { }} className="group px-12 py-4 bg-overlay text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.25em] flex items-center gap-5 hover:bg-brand active:scale-95 transition-all duration-300 outline-none shadow-[0_15px_40px_-5px_rgba(0,0,0,0.3)]">
                            Submit Order
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-brand transition-all duration-300">
                                <Send className="w-4 h-4 -rotate-45"/>
                            </div>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-[24px] overflow-y-auto thin-scrollbar relative" ref={containerRef}>
                    {/* Similarity Loading Overlay */}
                    {isLoadingSimilar && (<div className="absolute inset-0 z-[100] bg-surface/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-r from-brand to-success rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"/>
                                <RefreshCw className="w-16 h-16 text-brand animate-spin"/>
                            </div>
                            <div className="mt-8 flex flex-col items-center gap-3">
                                <p className="text-[14px] font-black uppercase tracking-[0.2em] text-text-primary">Searching Historical Parity</p>
                                <div className="h-1 w-48 bg-surface-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand w-1/2 animate-shimmer"/>
                                </div>
                            </div>
                        </div>)}

                    {showGenerateModal && (<div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-0">
                            <div className="absolute inset-0 bg-overlay/60 backdrop-blur-md" onClick={() => setShowGenerateModal(false)}/>
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="confirm-synthesis-modal-title"
                                className="relative bg-surface w-full max-w-md rounded-[40px] border-4 border-black overflow-hidden shadow-2xl animate-in zoom-in duration-300"
                            >
                                <div className="p-10 text-center">
                                    <div className="w-20 h-20 bg-brand-muted rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-brand/20">
                                        <Activity className="w-10 h-10 text-brand"/>
                                    </div>
                                    <h2 id="confirm-synthesis-modal-title" className="text-[24px] font-black text-text-primary uppercase tracking-tighter leading-none mb-4">
                                        Confirm Synthesis
                                    </h2>
                                    <p className="text-[13px] font-bold text-text-muted leading-relaxed mb-10 px-4">
                                        Are you sure you want to generate a full technical Work Order from Notification #{selectedNotifNum}?
                                        AVIEE will synchronize components, operations, and technical headers.
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        <button onClick={() => {
                const notif = allNotifications.find(n => n["Notification Number"] === selectedNotifNum);
                if (notif)
                    handleSelectNotification(notif);
            }} className="w-full py-5 bg-overlay text-white rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-success transition-all shadow-xl active:scale-95">
                                            Confirm & Generate
                                        </button>
                                        <button onClick={() => setShowGenerateModal(false)} className="w-full py-5 text-text-subtle text-[11px] font-black uppercase tracking-widest hover:text-text-secondary transition-all">
                                            Back to Browser
                                        </button>
                                    </div>
                                </div>
                                <div className="h-2 bg-surface-2">
                                    <div className="h-full bg-brand w-1/3 animate-ping"/>
                                </div>
                            </div>
                        </div>)}

                    {isGenerating && (<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-overlay/40 backdrop-blur-xl animate-in fade-in duration-700">
                            <div className="relative group">
                                <div className="absolute -inset-20 bg-brand/20 rounded-full blur-[100px] animate-pulse"/>
                                <img src="/images/Aviee_collectingdata.gif" alt="AI Generating" className="w-80 h-80 object-cover rounded-[60px] shadow-2xl relative z-10 border-4 border-white/20 scale-110"/>
                            </div>
                            <div className="mt-8 flex flex-col items-center gap-3">
                                <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">
                                    AI Synthesis in Progress
                                </h2>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-overlay text-[10px] font-black text-white rounded-full uppercase tracking-widest shadow-xl">
                                    <Activity className="w-3 h-3 text-success animate-pulse"/>
                                    Analyzing Observation Context
                                </div>
                            </div>
                        </div>)}

                    {mounted && (<ResponsiveGridLayout key={width > 0 ? `grid-${width}` : 'grid-0'} width={width} className="layout pointer-events-auto [&_.react-grid-placeholder]:bg-brand/10! [&_.react-grid-placeholder]:rounded-[32px]! [&_.react-grid-placeholder]:opacity-50! [&_.react-grid-placeholder]:border-2! [&_.react-grid-placeholder]:border-dashed! [&_.react-grid-placeholder]:border-brand!" layouts={layouts} breakpoints={{ lg: 1200, md: 996 }} cols={{ lg: 12, md: 10 }} rowHeight={100} margin={[24, 24]} dragConfig={{ handle: ".drag-handle" }} onLayoutChange={(c, a) => {
                setLayouts(a);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
            }}>
                            <div key="intelligence" className="cursor-default">
                                <SectionCard title="Notification Registry Browser" icon={Cpu} className="h-full" badge={<span className="text-[10px] text-brand tracking-widest uppercase">Transition Intelligence</span>} headerAction={<div className="flex items-center gap-4">
                                            <button onClick={fetchSimilarObservations} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 border-2 transition-all active:scale-0 ${showSimilar
                    ? 'bg-overlay border-overlay text-white'
                    : 'border-overlay text-text-primary hover:bg-canvas'}`}>
                                                <History className="w-4 h-4"/>
                                                Similar Work Order
                                            </button>
                                            <button onClick={() => {
                    const notif = allNotifications.find(n => n["Notification Number"] === selectedNotifNum);
                    if (notif)
                        setShowGenerateModal(true);
                    else
                        toastWarning('No notification selected', 'Please select a notification from the list first.');
                }} disabled={isGenerating || !selectedNotifNum} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${isGenerating ? 'bg-surface-2 text-text-subtle' : 'bg-overlay text-white hover:bg-success shadow-md active:scale-95'} disabled:opacity-50`}>
                                                <Activity className="w-4 h-4"/>
                                                Generate Work Order
                                            </button>
                                        </div>}>
                                    <div className="h-full flex flex-col">
                                        {isLoadingNotifications ? (<div className="flex-1 flex items-center justify-center">
                                                <RefreshCw className="w-8 h-8 text-brand animate-spin"/>
                                            </div>) : (<div className="flex-1 overflow-scroll min-h-[500px]">
                                                <table className="w-[1800px] text-left border-collapse table-fixed bg-surface">
                                                    <colgroup>
                                                        <col className="w-[100px]"/><col className="w-[150px]"/><col className="w-[120px]"/>
                                                        <col className="w-[150px]"/><col className="w-[120px]"/><col className="w-[250px]"/>
                                                        <col className="w-[100px]"/><col className="w-[150px]"/><col className="w-[250px]"/>
                                                        <col className="w-[120px]"/><col className="w-[100px]"/><col className="w-[120px]"/>
                                                        <col className="w-[120px]"/><col className="w-[100px]"/>
                                                    </colgroup>
                                                    <thead>
                                                        <tr className="text-[10px] font-black text-text-subtle uppercase tracking-widest bg-canvas border-b border-border">
                                                            <th className="px-5 py-4">ID</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Notif Date</th>
                                                            <th className="px-5 py-4">Reported By</th><th className="px-5 py-4">Equipment</th><th className="px-5 py-4">Eq. Description</th>
                                                            <th className="px-5 py-4">Priority</th><th className="px-5 py-4">Functional Loc</th><th className="px-5 py-4">FL Description</th>
                                                            <th className="px-5 py-4">Work Center</th><th className="px-5 py-4">Planner</th><th className="px-5 py-4">Start Date</th>
                                                            <th className="px-5 py-4">End Date</th><th className="px-5 py-4 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {allNotifications.map((notif, idx) => {
                    const isSelected = selectedNotifNum === notif["Notification Number"];
                    return (<tr key={idx} onClick={() => {
                            setSelectedNotifNum(notif["Notification Number"]);
                        }} className={`cursor-pointer select-none border-b border-border/40 ${isSelected ? 'bg-brand' : 'bg-surface hover:bg-canvas'}`}>
                                                                    <td className={`px-5 h-14 font-black text-[12px] ${isSelected ? 'text-white' : 'text-text-primary'}`}>#{notif["Notification Number"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{notif["Notification Type"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] tabular-nums ${isSelected ? 'text-white/70' : 'text-text-subtle'}`}>{notif["Notification Date"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{notif["Reported By"]}</td>
                                                                    <td className={`px-5 h-14 font-black text-[11px] uppercase ${isSelected ? 'text-white' : 'text-text-primary'}`}>{notif["Equipment"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] truncate ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{notif["Equipment Description"]}</td>
                                                                    <td className={`px-5 h-14`}>
                                                                        <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-muted'}`}>{notif["Priority"]}</span>
                                                                    </td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{notif["Functional Location"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] truncate ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{notif["Functional Location Description"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{notif["Main Work Center"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{notif["Planner Group"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] tabular-nums ${isSelected ? 'text-white/70' : 'text-text-subtle'}`}>{notif["Start Date"]}</td>
                                                                    <td className={`px-5 h-14 font-bold text-[11px] tabular-nums ${isSelected ? 'text-white/70' : 'text-text-subtle'}`}>{notif["End Date"]}</td>
                                                                    <td className={`px-5 h-14 text-right`}>
                                                                        <div className="flex items-center justify-end">
                                                                            <div className={`w-2 h-2 rounded-full mr-2 ${isSelected ? 'bg-white' : 'bg-success'}`}/>
                                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-text-primary'}`}>OPEN</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>);
                })}
                                                    </tbody>
                                                </table>
                                            </div>)}
                                    </div>
                                </SectionCard>
                            </div>

                            <div key="main_terminal" className="h-full">
                                <div className="h-full bg-surface rounded-[32px] border-2 border-black flex flex-col overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
                                    <div className="bg-canvas border-b border-black flex items-center px-8 shrink-0">
                                        {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-8 py-6 h-full flex items-center gap-3 border-b-4 relative group ${activeTab === tab.id
                    ? 'border-brand bg-surface text-text-primary'
                    : 'border-transparent text-text-subtle hover:text-text-secondary bg-transparent'}`}>
                                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand' : 'text-border-strong'}`}/>
                                                <span className="text-[12px] font-black uppercase tracking-widest">{tab.label}</span>
                                            </button>))}
                                    </div>

                                    <div className="flex-1 p-10 overflow-y-auto thin-scrollbar bg-surface">
                                        {activeTab === "header" && (<div className="grid grid-cols-4 gap-x-10 gap-y-8 animate-in fade-in duration-500">
                                                <InputField label="Order Type" value={headerData.order_type} onChange={v => setHeaderData({ ...headerData, order_type: v })}/>
                                                <InputField label="Order Number" value={headerData.order_number} readOnly/>
                                                <InputField label="Order Date" value={headerData.order_date} type="date"/>
                                                <InputField label="Priority" value={headerData.priority} onChange={v => setHeaderData({ ...headerData, priority: v })}/>
                                                <InputField label="Equipment #" value={headerData.equipment_number} onChange={v => setHeaderData({ ...headerData, equipment_number: v })}/>
                                                <InputField label="Equipment Description" value={headerData.equipment_description} onChange={v => setHeaderData({ ...headerData, equipment_description: v })}/>
                                                <InputField label="Functional Loc." value={headerData.functional_location} onChange={v => setHeaderData({ ...headerData, functional_location: v })}/>
                                                <InputField label="Functional Description" value={headerData.functional_description} onChange={v => setHeaderData({ ...headerData, functional_description: v })}/>
                                                <InputField label="Planner Group" value={headerData.planner_group} onChange={v => setHeaderData({ ...headerData, planner_group: v })}/>
                                                <InputField label="Start Date" value={headerData.start_date} type="date"/>
                                                <InputField label="End Date" value={headerData.end_date} type="date"/>
                                            </div>)}

                                        {activeTab === "operations" && (<div className="animate-in fade-in duration-500 overflow-auto">
                                                <table className="w-full text-left border-separate border-spacing-y-4">
                                                    <thead>
                                                        <tr className="text-[10px] font-black text-text-subtle uppercase tracking-widest">
                                                            <th className="px-4 py-2">Op #</th>
                                                            <th className="px-4 py-2">Description</th>
                                                            <th className="px-4 py-2">Work Center</th>
                                                            <th className="px-4 py-2">Duration</th>
                                                            <th className="px-4 py-2">Manpower</th>
                                                            <th className="px-4 py-2">Control Key</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {operationsList.map((op, idx) => (<tr key={idx} className="bg-canvas/50 rounded-[20px]">
                                                                <td className="p-5 font-black text-[12px] text-brand tabular-nums">{op.operationNo}</td>
                                                                <td className="p-5 font-bold text-[12px] min-w-[300px]">
                                                                    <input value={op.operationDescription} onChange={e => {
                        const newList = [...operationsList];
                        newList[idx].operationDescription = e.target.value;
                        setOperationsList(newList);
                    }} className="bg-transparent outline-none w-full border-b border-transparent focus:border-border-strong transition-all"/>
                                                                </td>
                                                                <td className="p-5 font-bold text-[11px] uppercase">{op.mainWorkcenter}</td>
                                                                <td className="p-5 font-black text-[12px] tabular-nums text-text-muted">{op.duration} H</td>
                                                                <td className="p-5 font-black text-[12px] tabular-nums text-text-muted">{op.plannedManpower}</td>
                                                                <td className="p-5 font-black text-[10px] text-text-subtle uppercase">{op.controlKey}</td>
                                                            </tr>))}
                                                    </tbody>
                                                </table>
                                            </div>)}

                                        {activeTab === "components" && (<div className="animate-in fade-in duration-500">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h3 className="text-[14px] font-black text-text-primary uppercase tracking-widest">Inventory List</h3>
                                                    </div>
                                                    <button onClick={addComponent} className="px-6 py-3 bg-overlay text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                                                        <Plus className="w-4 h-4"/> Add Material
                                                    </button>
                                                </div>
                                                <table className="w-full text-left border-separate border-spacing-y-4">
                                                    <thead>
                                                        <tr className="text-[10px] font-black text-text-subtle uppercase tracking-widest">
                                                            <th>Material #</th><th>Description</th><th>Qty</th><th>Storage</th><th>Res. #</th><th>Condition</th><th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {components.map((item, idx) => (<tr key={item.id} className="bg-canvas/50 rounded-[20px]">
                                                                <td className="p-5 font-bold text-[12px]"><input value={item.material} onChange={e => { const n = [...components]; n[idx].material = e.target.value; setComponents(n); }} className="bg-transparent outline-none w-full"/></td>
                                                                <td className="p-5 font-bold text-[12px]"><input value={item.desc} onChange={e => { const n = [...components]; n[idx].desc = e.target.value; setComponents(n); }} className="bg-transparent outline-none w-full"/></td>
                                                                <td className="p-5 text-center"><input value={item.qty} onChange={e => { const n = [...components]; n[idx].qty = e.target.value; setComponents(n); }} className="bg-transparent outline-none w-12 text-center"/></td>
                                                                <td className="p-5"><input value={item.storage} onChange={e => { const n = [...components]; n[idx].storage = e.target.value; setComponents(n); }} className="bg-transparent outline-none w-full"/></td>
                                                                <td className="p-5"><input value={item.reservation} onChange={e => { const n = [...components]; n[idx].reservation = e.target.value; setComponents(n); }} className="bg-transparent outline-none w-full text-text-subtle"/></td>
                                                                <td className="p-5">
                                                                    <select value={item.condition} onChange={e => { const n = [...components]; n[idx].condition = e.target.value; setComponents(n); }} className="bg-transparent outline-none uppercase font-black text-[11px]">
                                                                        <option>NEW</option><option>REFURB</option>
                                                                    </select>
                                                                </td>
                                                                <td className="p-5 text-right"><button onClick={() => removeComponent(item.id)} className="text-border-strong hover:text-danger"><Trash2 className="w-4 h-4"/></button></td>
                                                            </tr>))}
                                                    </tbody>
                                                </table>
                                            </div>)}

                                        {activeTab === "costs" && (<div className="grid grid-cols-1 gap-12 animate-in fade-in duration-500 max-w-lg">
                                                <InputField label="Cost Center" value={costs.cost_center} onChange={v => setCosts({ ...costs, cost_center: v })}/>
                                                <div className="p-10 bg-overlay rounded-[32px] text-white overflow-hidden relative group">
                                                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-bl-[120px]"/>
                                                    <DollarSign className="w-12 h-12 text-brand mb-6 relative z-10"/>
                                                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-2 relative z-10">Estimated Cost Analysis (USD)</label>
                                                    <div className="text-[54px] font-black tabular-nums tracking-tighter leading-none relative z-10">$ {costs.estimated_cost || "0.00"}</div>
                                                </div>
                                            </div>)}
                                    </div>
                                </div>
                            </div>

                            {/* --- Module: Similar Historical Records --- */}
                            {showSimilar && (<div key="similar_list" className="animate-in slide-in-from-bottom fade-in duration-700">
                                    <SectionCard title="Historical Reference Registry" icon={History} className="h-full" badge={<span className="text-[10px] text-warning tracking-widest leading-none">Similar Historical Orders</span>}>
                                        <div className="overflow-hidden">
                                            <table className="w-full text-left border-separate border-spacing-y-4">
                                                <thead>
                                                    <tr className="text-[10px] font-black text-text-subtle uppercase tracking-widest border-b border-black">
                                                        <th className="px-5 py-2">Order #</th>
                                                        <th className="px-5 py-2">Description</th>
                                                        <th className="px-5 py-2">Equipment</th>
                                                        <th className="px-5 py-2">Functional Loc.</th>
                                                        <th className="px-5 py-2">Status</th>
                                                        <th className="px-5 py-2 text-right">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {similarityResults.length > 0 ? similarityResults.map((order, idx) => (<tr key={idx} className="bg-canvas hover:bg-surface-2/50 transition-all cursor-pointer group/row border border-black/5 rounded-2xl overflow-hidden">
                                                            <td className="px-5 py-5 font-black text-[12px] text-text-primary first:rounded-l-2xl border-y border-transparent">
                                                                #{order.notification || order.notification_id || 'N/A'}
                                                            </td>
                                                            <td className="px-5 py-5 font-bold text-[12px] text-text-secondary border-y border-transparent max-w-[300px] truncate">
                                                                {order.reason || 'Similar maintenance finding detected.'}
                                                            </td>
                                                            <td className="px-5 py-5 font-black text-[11px] text-text-primary border-y border-transparent uppercase">
                                                                {order.equipment_ref || 'MT-ASSET'}
                                                            </td>
                                                            <td className="px-5 py-5 font-bold text-[11px] text-text-subtle border-y border-transparent uppercase tracking-wider">
                                                                {order.functional_location || 'BNCP-GEN'}
                                                            </td>
                                                            <td className="px-5 py-5 border-y border-transparent">
                                                                <span className="px-3 py-1 bg-brand-muted text-brand text-[10px] font-black uppercase rounded-lg border border-brand/20">
                                                                    Score: {order.match_score || '0.90'}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-5 text-right font-bold text-[11px] text-text-subtle last:rounded-r-2xl border-y border-transparent tabular-nums">
                                                                {order.source || 'GLOC'}
                                                            </td>
                                                        </tr>)) : (<tr>
                                                            <td colSpan={6} className="px-5 py-10 text-center text-text-subtle font-bold text-[12px]">
                                                                No historical matches found for this observation.
                                                            </td>
                                                        </tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </SectionCard>
                                </div>)}
                        </ResponsiveGridLayout>)}
                </div>
        </>);
}
