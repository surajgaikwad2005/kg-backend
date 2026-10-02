'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, ArrowLeft, Calendar, Loader2, AlertCircle, GripVertical, MoreVertical, ClipboardList } from 'lucide-react';
import { useGenerateNotification, useGenerateWorkorder } from "../_queries/useNotificationQueries";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
const InputField = ({ label, value, readOnly = true, icon: Icon, fullWidth = false }) => (<div className={`flex flex-col gap-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
      {label}
    </label>
    <div className="relative group/field">
      <input type="text" value={value || ''} readOnly={readOnly} className={`w-full bg-canvas/50 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary font-medium outline-none transition-all ${readOnly ? 'cursor-default' : 'focus:border-brand focus:bg-surface'}`}/>
      {Icon && (<div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle">
          <Icon className="w-4 h-4"/>
        </div>)}
    </div>
  </div>);
const TextAreaField = ({ label, value, rows = 4 }) => (<div className="flex flex-col gap-1.5 col-span-full">
    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
      {label}
    </label>
    <textarea value={value || ''} readOnly rows={rows} className="w-full bg-canvas/50 border border-border rounded-lg px-4 py-3 text-sm text-text-primary font-medium outline-none resize-none cursor-default"/>
  </div>);
const initialLayouts = {
    lg: [{ i: "details", x: 0, y: 0, w: 12, h: 9.5 }],
    md: [{ i: "details", x: 0, y: 0, w: 10, h: 11 }],
};
function NotificationDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const notificationId = searchParams.get('notification_id');
    const observation = searchParams.get('observation');
    const { width, containerRef, mounted } = useContainerWidth();

    const generateNotifMutation = useGenerateNotification();
    const generateWoMutation = useGenerateWorkorder();

    const [layouts, setLayouts] = useState(initialLayouts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [details, setDetails] = useState(null);

    const generatingWO = generateWoMutation.isPending;

    const generateWorkOrder = async () => {
        try {
            const data = await generateWoMutation.mutateAsync({ notification: details });
            localStorage.setItem('generatedWorkOrder', JSON.stringify(data));
            router.push('/work-order-details');
        }
        catch (err) {
        }
    };
    useEffect(() => {
        async function fetchDetails() {
            setLoading(true);
            setError(null);
            try {
                const payload = notificationId
                    ? { notification_id: notificationId }
                    : { observation: observation };
                const data = await generateNotifMutation.mutateAsync(payload);
                setDetails(data);
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        }
        if (notificationId || observation) {
            fetchDetails();
        }
        else {
            setLoading(false);
            setError("No notification ID or observation provided.");
        }
    }, [notificationId, observation]);
    return (<>
        <header className="h-16 shrink-0 border-b border-border flex items-center justify-between px-6 bg-surface z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-2 rounded-lg transition-colors group">
              <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-text-primary"/>
            </button>
            <h1 className="text-xl font-bold text-text-primary tracking-tight uppercase">
              Notification Details
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setLayouts(initialLayouts)} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-brand text-white rounded-lg hover:bg-brand-hover transition-all shadow-sm active:scale-95">
              Reset Layout
            </button>
            <Bell className="w-5 h-5 text-text-subtle cursor-pointer hover:text-text-secondary transition-colors"/>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4  bg-canvas/30" ref={containerRef}>
          <div className="max-w-[1350px] mx-auto w-full">
          {loading ? (<div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-brand animate-spin"/>
              <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] animate-pulse">
                Analyzing Observation Data...
              </p>
            </div>) : error ? (<div className="h-full flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center border border-danger/20">
                <AlertCircle className="w-8 h-8 text-danger"/>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-primary uppercase tracking-tight">Generation Failed</h3>
                <p className="text-sm text-text-muted">{error}</p>
              </div>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg">
                Try Again
              </button>
            </div>) : mounted && (<ResponsiveGridLayout className="[&_.react-grid-placeholder]:bg-indigo-50/50! [&_.react-grid-placeholder]:rounded-xl! [&_.react-grid-placeholder]:opacity-50!" width={width} layouts={layouts} onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)} breakpoints={{ lg: 1200, md: 996 }} cols={{ lg: 12, md: 10 }} rowHeight={60} dragConfig={{ handle: ".drag-handle" }} margin={[12, 16]} containerPadding={[16, 0]}>
              <div key="details" className="bg-surface rounded-lg border border-black shadow-sm flex flex-col overflow-hidden h-full">
                <div className="drag-handle cursor-move p-3 border-b border-black flex items-center justify-between bg-surface rounded-t-xl shrink-0">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-text-subtle"/>
                    <label className="text-xs font-bold text-text-primary uppercase tracking-widest">
                      General Notification Information
                    </label>
                  </div>
                  <MoreVertical className="w-4 h-4 text-text-subtle cursor-pointer"/>
                </div>

                <div className="p-6 flex-1 overflow-auto thin-scrollbar">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <InputField label="Reported By" value={details?.["Reported By"]}/>
                      <InputField label="Notification Date" value={details?.["Notification Date"]} icon={Calendar}/>
                      <InputField label="Notification Status" value="DRAFT / NEW"/>

                      <div className="col-span-full flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                          Notification Summary
                        </label>
                        <input type="text" value={observation || "Platform Maintenance Requirement"} readOnly className="w-full bg-canvas/50 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary font-bold outline-none"/>
                      </div>

                      <TextAreaField label="Detailed Description" value={observation || ""}/>
                    </div>

                    <div className="pt-4 border-t border-border/40">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputField label="Notification Number" value={details?.["Notification Number"]}/>
                        <InputField label="Notification Type" value={details?.["Notification Type"]}/>
                        <InputField label="Priority" value={details?.["Priority"]}/>

                        <InputField label="Start Date" value={details?.["Start Date"]} icon={Calendar}/>
                        <InputField label="End Date" value={details?.["End Date"]} icon={Calendar}/>
                        <InputField label="Equipment" value={details?.["Equipment"]}/>

                        <InputField label="Equipment Description" value={details?.["Equipment Description"]}/>
                        <InputField label="Planner Group" value={details?.["Planner Group"]}/>
                        <InputField label="Main Work Center" value={details?.["Main Work Center"]}/>

                        <InputField label="Functional Location" value={details?.["Functional Location"]}/>
                        <InputField label="Functional Location Description" value={details?.["Functional Location Description"]} fullWidth/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResponsiveGridLayout>)}
          </div>
        </div>

        {/* Floating Work Order Action */}
        <div className="fixed bottom-6 right-8 z-50">
          <button onClick={generateWorkOrder} disabled={generatingWO} className="px-8 py-2.5 bg-overlay text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-2xl hover:bg-black hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10">
            {generatingWO ? (<Loader2 className="w-4 h-4 animate-spin text-white/70"/>) : (<ClipboardList className="w-4 h-4"/>)}
            Generate Work-order
          </button>
        </div>

    </>);
}
export default function NotificationDetailsPage() {
    return (<Suspense fallback={<div className="h-screen w-full bg-canvas flex items-center justify-center text-text-subtle text-xs font-black uppercase tracking-[0.3em]">
        Loading System Engine...
      </div>}>
      <NotificationDetailsContent />
    </Suspense>);
}
