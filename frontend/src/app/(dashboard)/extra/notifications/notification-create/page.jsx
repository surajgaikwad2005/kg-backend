"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Calendar, User, Activity, FileText, Hash, Layers, Settings, AlertTriangle, Clock, Package, MapPin, ClipboardList, Bell, CheckCircle2, Paperclip, TrendingUp, Cpu, FileUp, X, Zap, GripVertical } from "lucide-react";
import { useMatchObservation, useGenerateNotification } from "../_queries/useNotificationQueries";
import { useToast } from "@/src/components/ui/Toast";
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
/* ─────────────────────────── UI Components ───────────────────── */
const DetailInput = ({ label, placeholder, icon: Icon, type = "text", value, onChange, textarea = false, dark = false, onAttach }) => (<div className="flex flex-col space-y-2 group">
        {label && (<label className={`text-[10px] font-black uppercase tracking-[0.15em] pl-1.5 ${dark ? 'text-text-subtle' : 'text-text-muted'}`}>
                {label}
            </label>)}
        <div className="relative">
            {Icon && <Icon className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 ${dark ? 'text-text-muted group-focus-within:text-brand group-focus-within:scale-110' : 'text-text-subtle group-focus-within:text-brand group-focus-within:scale-110'}`}/>}
            {textarea ? (<div className="relative">
                    <textarea rows={6} value={value} onChange={onChange} placeholder={placeholder} className={`w-full border-2 rounded-[24px] p-6 text-[13px] font-black uppercase tracking-wider outline-none transition-all duration-300 shadow-sm ${dark
            ? 'bg-overlay-hover/50 border-slate-700/50 text-white placeholder:text-text-muted focus:border-brand focus:bg-overlay-hover focus:shadow-[0_0_15px_rgba(59,130,246,0.1)]'
            : 'bg-canvas border-border/40 text-text-primary placeholder:text-border focus:border-brand focus:bg-surface focus:shadow-[0_0_15px_rgba(59,130,246,0.05)]'}`}/>
                    <div onClick={onAttach} className={`absolute bottom-5 right-6 p-2.5 rounded-xl transition-all duration-300 ${dark ? 'text-text-muted hover:text-brand hover:bg-white/5' : 'text-border-strong hover:text-brand hover:bg-surface-2'} cursor-pointer group/attach`}>
                        <Paperclip className="w-5 h-5 group-hover/attach:rotate-12 transition-transform"/>
                    </div>
                </div>) : (<div className="relative flex items-center">
                    <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full border-2 rounded-[18px] py-4 ${Icon ? 'pl-14' : 'px-6'} pr-6 h-[54px] text-[13px] font-black uppercase tracking-wider outline-none transition-all duration-300 shadow-sm ${dark
            ? 'bg-overlay-hover/50 border-slate-700/50 text-white placeholder:text-text-muted focus:border-brand focus:bg-overlay-hover focus:shadow-[0_0_15px_rgba(59,130,246,0.1)]'
            : 'bg-canvas border-border/40 text-text-primary placeholder:text-border focus:border-brand focus:bg-surface focus:shadow-[0_0_15px_rgba(59,130,246,0.05)]'}`}/>
                </div>)}
        </div>
    </div>);
const SectionCard = React.forwardRef(({ title, icon: Icon, children, className = "", dark = false, style, onMouseDown, onMouseUp, onTouchEnd }, ref) => (<div ref={ref} style={style} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onTouchEnd={onTouchEnd} className={`${dark ? 'bg-[#101828] border-slate-800' : 'bg-surface border-black'} rounded-[20px] border-2 shadow-xl flex flex-col relative overflow-hidden transition-all duration-500 group ${className} pointer-events-auto`}>
        {dark && <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-bl-[160px] blur-3xl transition-transform group-hover:scale-110 -z-0"/>}
        <div className="flex items-center justify-between gap-5 px-8 pt-8 relative z-10 drag-handle cursor-move">
            <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border transition-all duration-300 group-hover:scale-105 ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-canvas border-black/5 text-text-primary'}`}>
                    <Icon className="w-6 h-6"/>
                </div>
                <div>
                    <h2 className={`text-[15px] font-black uppercase tracking-[0.2em] ${dark ? 'text-white' : 'text-text-primary'}`}>{title}</h2>
                    <div className={`h-1 w-12 rounded-full mt-2 transition-all duration-500 group-hover:w-20 ${dark ? 'bg-brand' : 'bg-overlay'}`}/>
                </div>
            </div>
            <GripVertical className="w-5 h-5 text-border-strong opacity-0 group-hover:opacity-100 transition-opacity"/>
        </div>
        <div className="flex-1 space-y-4 relative z-10 px-8 pb-8 overflow-y-auto hide-scrollbar">
            {children}
        </div>
    </div>));
SectionCard.displayName = "SectionCard";
export default function NotificationCreatePage() {
    const { error: toastError, warning: toastWarning } = useToast();
    const router = useRouter();
    const fileInputRef = useRef(null);
    const { width, containerRef, mounted } = useContainerWidth();

    const matchMutation = useMatchObservation();
    const generateMutation = useGenerateNotification();

    const [attachments, setAttachments] = useState([]);
    const [formData, setFormData] = useState({
        reportedBy: "NIKHIL BOKADE",
        date: "2026-03-30T14:24",
        status: "DRAFT",
        summary: "",
        description: "",
        number: "AUTO-GEN",
        type: "M2 - MALFUNCTION",
        priority: "P1 - HIGH",
        startDate: "",
        endDate: "",
        equipment: "",
        equipmentDesc: "",
        plannerGroup: "",
        mainWorkCenter: "",
        functionalLocation: "",
        functionalLocationDesc: ""
    });
    const [showSimilar, setShowSimilar] = useState(false);
    const [similarityResults, setSimilarityResults] = useState([]);

    const isLoadingSimilar = matchMutation.isPending;
    const isGenerating = generateMutation.isPending;

    const fetchSimilarObservations = async () => {
        if (!formData.description) {
            toastWarning('Missing field', 'Please provide a Detailed Log first.');
            return;
        }
        setShowSimilar(true);
        try {
            const data = await matchMutation.mutateAsync({ observation: formData.description, platform: "BNCP" });
            setSimilarityResults(Array.isArray(data) ? data.filter((item) => item.notification || item.notification_id) : []);
        }
        catch {
            setSimilarityResults([]);
        }
    };
    const handleGenerateNotification = async () => {
        if (!formData.description) {
            toastWarning('Missing field', 'Please provide a Detailed Log first.');
            return;
        }
        try {
            const result = await generateMutation.mutateAsync({ observation: formData.description });
            const data = result.data || result;
            // Map keys with spaces to camelCase keys used in state
            const mappedData = { ...formData };
            if (data["Reported By"])
                mappedData.reportedBy = data["Reported By"];
            if (data["Notification Date"])
                mappedData.date = `${data["Notification Date"]}T12:00`;
            if (data["Notification Number"])
                mappedData.number = data["Notification Number"];
            if (data["Notification Type"])
                mappedData.type = data["Notification Type"];
            if (data["Priority"])
                mappedData.priority = data["Priority"];
            if (data["Start Date"])
                mappedData.startDate = `${data["Start Date"]}T08:00`;
            if (data["End Date"])
                mappedData.endDate = `${data["End Date"]}T17:00`;
            if (data["Equipment"])
                mappedData.equipment = data["Equipment"];
            if (data["Equipment Description"])
                mappedData.equipmentDesc = data["Equipment Description"];
            if (data["Planner Group"])
                mappedData.plannerGroup = data["Planner Group"];
            if (data["Main Work Center"])
                mappedData.mainWorkCenter = data["Main Work Center"];
            if (data["Functional Location"])
                mappedData.functionalLocation = data["Functional Location"];
            if (data["Functional Location Description"])
                mappedData.functionalLocationDesc = data["Functional Location Description"];
            setFormData(mappedData);
        }
        catch {
            toastError('Generation failed', 'Failed to generate notification details.');
        }
    };
    const [layouts, setLayouts] = useState({
        lg: [
            { i: 'header_date', x: 0, y: 0, w: 4, h: 1, minW: 4, minH: 1 },
            { i: 'header_status', x: 4, y: 0, w: 4, h: 1, minW: 4, minH: 1 },
            { i: 'header_user', x: 8, y: 0, w: 4, h: 1, minW: 4, minH: 1 },
            { i: 'obs', x: 0, y: 1, w: 8, h: 4.1, minW: 8, minH: 4.1 },
            { i: 'meta', x: 8, y: 1, w: 4, h: 4.1, minW: 4, minH: 4.1 },
            { i: 'equip', x: 0, y: 5.1, w: 4, h: 3.4, minW: 4, minH: 3.4 },
            { i: 'res', x: 4, y: 5.1, w: 4, h: 3.4, minW: 4, minH: 3.4 },
            { i: 'time', x: 8, y: 5.1, w: 4, h: 3.4, minW: 4, minH: 3.4 },
            { i: 'similar_list', x: 0, y: 8.5, w: 12, h: 7, minW: 12, minH: 7 }
        ]
    });
    // Reset similarity list width to 12 upon activation to prevent cached scaling errors
    useEffect(() => {
        if (showSimilar) {
            setLayouts((prev) => ({
                ...prev,
                lg: prev.lg?.map((item) => item.i === 'similar_list' ? { ...item, x: 0, y: 8.5, w: 12, h: 7, minW: 12 } : item) || []
            }));
        }
    }, [showSimilar]);
    const handleFileUpload = (e) => {
        if (e.target.files) {
            setAttachments([...attachments, ...Array.from(e.target.files)]);
        }
    };
    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };
    const handleCreate = () => {
        router.push("/notifications");
    };
    return (<>

                {/* Navigation Header */}
                <header className="h-20 shrink-0 border-b border-black flex items-center justify-between px-10 bg-surface z-30 shadow-sm transition-all">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.push("/notifications")} className="w-11 h-11 rounded-2xl border-2 border-black flex items-center justify-center hover:bg-overlay hover:text-white transition-all duration-300 text-text-primary shadow-sm active:scale-95">
                            <ArrowLeft className="w-6 h-6"/>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[22px] font-black text-text-primary tracking-tight leading-none uppercase">
                                Notification Intake
                            </h1>
                            <p className="text-[10px] font-black text-text-subtle uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-brand"/>
                                Operational Maintenance Protocol
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={handleCreate} className="group px-12 py-4 bg-overlay text-white rounded-[20px] text-[12px] font-black uppercase tracking-[0.25em] flex items-center gap-5 hover:bg-brand active:scale-95 transition-all duration-300 outline-none shadow-[0_15px_40px_-5px_rgba(0,0,0,0.3)]">
                            Create Notification
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-surface group-hover:text-brand transition-all duration-300">
                                <Send className="w-4 h-4 -rotate-45"/>
                            </div>
                        </button>
                        <button className="w-14 h-14 border-2 border-black rounded-2xl flex items-center justify-center text-text-subtle hover:text-text-primary transition-all hover:bg-canvas group">
                            <Bell className="w-6 h-6 group-hover:animate-bounce"/>
                        </button>
                    </div>
                </header>

                {/* Dynamic Draggable Canvas */}
                <div className="flex-1 p-10 overflow-y-auto min-h-0 thin-scrollbar relative" ref={containerRef}>
                    {mounted && (<ResponsiveGridLayout width={width} className="layout [&_.react-grid-placeholder]:bg-brand/5! [&_.react-grid-placeholder]:rounded-[40px]! [&_.react-grid-placeholder]:border-2! [&_.react-grid-placeholder]:border-dashed! [&_.react-grid-placeholder]:border-brand/20!" layouts={layouts} onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)} breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} rowHeight={100} dragConfig={{ handle: ".drag-handle" }} margin={[24, 24]}>
                            <div key="header_date" data-grid={{ i: 'header_date', x: 0, y: 0, w: 4, h: 1, minW: 4 }}>
                                <div className="h-full bg-surface rounded-[20px] border-2 border-black p-5 flex items-center justify-between shadow-xl group hover:border-brand transition-all duration-500 drag-handle cursor-move">
                                    <div className="flex items-center gap-5">
                                        <div className="w-11 h-11 rounded-[16px] bg-canvas border-2 border-border/40 flex items-center justify-center text-brand shadow-inner group-hover:bg-brand-muted transition-colors">
                                            <Calendar className="w-6 h-6"/>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none">Intake Date</span>
                                            <span className="text-[14px] font-black text-text-primary mt-1 uppercase tracking-wider leading-none">{formData.date.replace("T", " ")}</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input type="datetime-local" className="bg-transparent text-transparent w-10 h-10 outline-none cursor-pointer absolute right-0 opacity-0 z-20" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}/>
                                        <button className="w-10 h-10 rounded-xl bg-canvas border-2 border-border/40 flex items-center justify-center text-text-subtle hover:text-brand transition-all">
                                            <Calendar className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div key="header_status" data-grid={{ i: 'header_status', x: 4, y: 0, w: 4, h: 1, minW: 4 }}>
                                <div className="h-full bg-surface rounded-[20px] border-2 border-black p-5 flex items-center justify-between shadow-xl group transition-all duration-500 hover:border-success drag-handle cursor-move">
                                    <div className="flex items-center gap-5">
                                        <div className="w-11 h-11 rounded-[16px] bg-canvas border-2 border-border/40 flex items-center justify-center text-success shadow-inner group-hover:bg-success/10 transition-colors">
                                            <CheckCircle2 className="w-6 h-6"/>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none">Workflow State</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"/>
                                                <span className="text-[14px] font-black text-success uppercase tracking-[0.15em] leading-none">{formData.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-canvas border-2 border-border/40 flex items-center justify-center text-border group-hover:text-text-subtle transition-all">
                                        <Settings className="w-5 h-5"/>
                                    </div>
                                </div>
                            </div>

                            <div key="header_user" data-grid={{ i: 'header_user', x: 8, y: 0, w: 4, h: 1, minW: 4 }}>
                                <div className="h-full bg-surface rounded-[20px] border-2 border-black p-5 flex items-center justify-between shadow-xl group transition-all duration-500 hover:border-brand drag-handle cursor-move">
                                    <div className="flex items-center gap-5">
                                        <div className="w-11 h-11 rounded-[16px] bg-canvas border-2 border-border/40 flex items-center justify-center text-brand shadow-inner group-hover:bg-brand-muted transition-colors">
                                            <User className="w-6 h-6"/>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none">Reported By</span>
                                            <span className="text-[14px] font-black text-text-primary mt-1 uppercase tracking-wider leading-none">{formData.reportedBy}</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-canvas border-2 border-border/40 flex items-center justify-center text-border group-hover:text-brand transition-all">
                                        <TrendingUp className="w-5 h-5"/>
                                    </div>
                                </div>
                            </div>

                            <div key="obs" data-grid={{ i: 'obs', x: 0, y: 1, w: 8, h: 4.1, minW: 8 }}>
                                <SectionCard title="Observation Intelligence" icon={FileText}>
                                    <DetailInput label="Summary" placeholder="BRIEF HEADER..." icon={Hash} value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })}/>
                                    <div className="space-y-6">
                                        <DetailInput label="Detailed Log" textarea={true} rows={4} placeholder="DESCRIBE FINDINGS..." value={formData.description} onAttach={() => fileInputRef.current?.click()} onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
                                        <div className="flex items-center justify-between">
                                            <button onClick={fetchSimilarObservations} disabled={isLoadingSimilar} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-md group/similar ${isLoadingSimilar ? 'bg-brand text-white animate-pulse' : 'bg-overlay text-white hover:bg-brand'}`}>
                                                {isLoadingSimilar ? 'Matching Observations...' : 'Similar Observations'}
                                                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center group-hover/similar:bg-surface group-hover/similar:text-brand">
                                                    {isLoadingSimilar ? <Activity className="w-3 h-3 animate-spin"/> : <Layers className="w-3 h-3"/>}
                                                </div>
                                            </button>

                                            <button onClick={handleGenerateNotification} disabled={isGenerating} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 active:scale-95 transition-all shadow-lg group/generate ${isGenerating ? 'bg-success text-white animate-pulse' : 'bg-overlay text-white hover:bg-success'}`}>
                                                {isGenerating ? 'Generating...' : 'Generate Notification'}
                                                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center group-hover/generate:bg-surface group-hover/generate:text-success">
                                                    {isGenerating ? <Zap className="w-3 h-3 animate-pulse"/> : <Zap className="w-3 h-3"/>}
                                                </div>
                                            </button>
                                        </div>
                                        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload}/>

                                        {attachments.length > 0 && (<div className="flex flex-wrap gap-5 p-6 bg-canvas rounded-[28px] border-2 border-dashed border-border">
                                                {attachments.map((file, idx) => (<div key={idx} className="flex items-center gap-4 bg-surface px-4 py-3 rounded-2xl border-2 border-border/40 shadow-md">
                                                        <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center text-brand">
                                                            <FileUp className="w-5 h-5"/>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-text-primary truncate w-24 uppercase">{file.name}</span>
                                                            <span className="text-[9px] font-black text-text-subtle uppercase">{(file.size / 1024).toFixed(0)} KB</span>
                                                        </div>
                                                        <button onClick={() => removeAttachment(idx)} className="w-8 h-8 flex items-center justify-center hover:bg-danger/10 rounded-xl text-border hover:text-danger transition-all">
                                                            <X className="w-4 h-4"/>
                                                        </button>
                                                    </div>))}
                                            </div>)}
                                    </div>
                                </SectionCard>
                            </div>

                            <div key="equip" data-grid={{ i: 'equip', x: 0, y: 5.1, w: 4, h: 3.4, minW: 4 }}>
                                <SectionCard title="Asset Context" icon={Package}>
                                    <DetailInput label="Equipment ID" placeholder="UNIT REF ID..." icon={Layers} value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}/>
                                    <DetailInput label="Description" placeholder="FUNCTIONALITY..." value={formData.equipmentDesc} onChange={(e) => setFormData({ ...formData, equipmentDesc: e.target.value })}/>
                                    <DetailInput label="Functional Location" icon={MapPin} placeholder="MAP-01..." value={formData.functionalLocation} onChange={(e) => setFormData({ ...formData, functionalLocation: e.target.value })}/>
                                </SectionCard>
                            </div>

                            <div key="res" data-grid={{ i: 'res', x: 4, y: 5.1, w: 4, h: 3.4, minW: 4 }}>
                                <SectionCard title="Operational Control" icon={Settings}>
                                    <DetailInput label="Work Center" placeholder="TEAM-CTRL..." icon={Cpu} value={formData.mainWorkCenter} onChange={(e) => setFormData({ ...formData, mainWorkCenter: e.target.value })}/>
                                    <DetailInput label="Planner Group" icon={ClipboardList} placeholder="GRP-ENTRY..." value={formData.plannerGroup} onChange={(e) => setFormData({ ...formData, plannerGroup: e.target.value })}/>
                                    <div className="pt-4 px-6 py-5 bg-success/10 border-2 border-success/20 rounded-[28px] flex items-center justify-between group/verify">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success shadow-sm transition-transform group-hover/verify:scale-110">
                                                <CheckCircle2 className="w-5 h-5"/>
                                            </div>
                                            <span className="text-[11px] font-black text-success uppercase tracking-[0.1em]">Verified</span>
                                        </div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"/>
                                    </div>
                                </SectionCard>
                            </div>

                            <div key="meta" data-grid={{ i: 'meta', x: 8, y: 1, w: 4, h: 4.1, minW: 4 }}>
                                <SectionCard title="Registry Tracking" icon={TrendingUp}>
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest pl-2">Priority Matrix</label>
                                        <div className="flex items-center gap-5 px-6 py-4 bg-warning/10 border-2 border-warning/20 rounded-[22px] shadow-sm">
                                            <AlertTriangle className="w-6 h-6 text-warning"/>
                                            <span className="text-[15px] font-black text-warning uppercase tracking-[0.2em]">{formData.priority}</span>
                                        </div>
                                    </div>
                                    <DetailInput dark={false} label="Notice ID" icon={Hash} value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })}/>
                                    <DetailInput dark={false} label="Notice Type" icon={Layers} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}/>
                                </SectionCard>
                            </div>

                            <div key="time" data-grid={{ i: 'time', x: 8, y: 5.1, w: 4, h: 3.4, minW: 4 }}>
                                <SectionCard title="Execution Windows" icon={Clock}>
                                    <div className="space-y-8">
                                        <DetailInput label="Proposed Start" type="datetime-local" icon={Clock} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}/>
                                        <DetailInput label="Proposed End" type="datetime-local" icon={Clock} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}/>
                                    </div>
                                </SectionCard>
                            </div>

                            {showSimilar && (<div key="similar_list" data-grid={{ i: 'similar_list', x: 0, y: 8.5, w: 12, h: 7, minW: 12 }}>
                                    <SectionCard title="Historical Similarity Report" icon={Activity} className="border-brand/30">
                                        <div className="absolute top-8 right-16">
                                            <button onClick={() => setShowSimilar(false)} className="w-10 h-10 rounded-xl bg-canvas border-2 border-border/40 flex items-center justify-center text-text-subtle hover:text-danger transition-all">
                                                <X className="w-5 h-5"/>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {isLoadingSimilar ? (<div className="flex flex-col items-center justify-center py-10 gap-6">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full animate-pulse"/>
                                                        <img src="/images/Aviee_collectingdata.gif" alt="AI Matching..." className="w-64 h-64 object-contain relative z-10 drop-shadow-2xl"/>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                                        <div className="flex gap-1">
                                                            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]"/>
                                                            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]"/>
                                                            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"/>
                                                        </div>
                                                    </div>
                                                </div>) : similarityResults.length > 0 ? (similarityResults.map((item, idx) => (<div key={idx} className="p-6 bg-canvas rounded-2xl border-2 border-border/20 flex flex-col gap-4 hover:border-brand/30 transition-all group/item shadow-sm">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-12 h-12 rounded-xl bg-surface border-2 border-border/40 flex flex-col items-center justify-center shadow-sm">
                                                                    <span className="text-[14px] font-black text-brand leading-none">
                                                                        {item.match_score ? (parseFloat(item.match_score) * 100).toFixed(0) + '%' : '--'}
                                                                    </span>
                                                                    <span className="text-[7px] font-bold text-text-subtle uppercase mt-1 leading-none">Match</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">{item.notification_id || item.notification || 'N/A'}</span>
                                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${(item.status || item.final_status) === 'CLOSED' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                                                            {item.status || item.final_status || 'OPEN'}
                                                                        </span>
                                                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-brand-muted text-brand uppercase">
                                                                            {item.source || 'SAP'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-[13px] font-black text-text-primary uppercase mt-1 group-hover/item:text-brand transition-colors">
                                                                        {item.fault_code ? `${item.fault_code} - ` : ''}
                                                                        {item.equipment_ref || 'General Maintenance'}
                                                                    </h4>
                                                                    <div className="flex items-center gap-4 mt-2">
                                                                        <span className="text-[9px] font-bold text-text-subtle uppercase tracking-wider flex items-center gap-1.5">
                                                                            <Hash className="w-3 h-3"/>
                                                                            WO: {item.wo_number || 'N/A'}
                                                                        </span>
                                                                        <span className="text-[9px] font-bold text-text-subtle uppercase tracking-wider flex items-center gap-1.5">
                                                                            <Activity className="w-3 h-3"/>
                                                                            Rank: {item.rank}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-xl bg-surface border-2 border-border/40 flex items-center justify-center text-border group-hover/item:text-brand transition-all shadow-sm">
                                                                <ArrowLeft className="w-5 h-5 rotate-180"/>
                                                            </div>
                                                        </div>

                                                        {item.reason && (<div className="ml-[72px] p-4 bg-surface/50 rounded-xl border border-brand/10">
                                                                <p className="text-[11px] leading-relaxed text-text-muted font-medium italic">
                                                                    <span className="text-brand font-bold uppercase text-[9px] mr-2 not-italic">AI Rationale:</span>
                                                                    "{item.reason}"
                                                                </p>
                                                            </div>)}
                                                    </div>))) : (<div className="flex flex-col items-center justify-center py-20 gap-4">
                                                    <Layers className="w-10 h-10 text-border"/>
                                                    <span className="text-[11px] font-black text-text-subtle uppercase tracking-widest text-center">
                                                        No matching observations found.<br />Try adjusting the detailed log.
                                                    </span>
                                                </div>)}
                                        </div>
                                    </SectionCard>
                                </div>)}
                        </ResponsiveGridLayout>)}
                </div>

        </>);
}
