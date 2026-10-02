'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Settings, Package, Wrench, DollarSign, CheckCircle2, Calendar, Hash, MapPin, Tag, Clock, Users } from 'lucide-react';
const SectionHeader = ({ title, icon: Icon }) => (<div className="px-4 py-3 border-b border-black flex items-center gap-2 bg-canvas/50">
    <Icon className="w-4 h-4 text-brand"/>
    <h2 className="text-xs font-black uppercase tracking-widest text-text-primary">{title}</h2>
  </div>);
const DataField = ({ label, value, icon: Icon }) => (<div className="flex flex-col gap-1 py-3 border-b border-border/40 last:border-b-0 group/field transition-all">
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">{label}</span>
      {Icon && <Icon className="w-3 h-3 text-border-strong group-hover/field:text-brand transition-colors"/>}
    </div>
    <span className="text-sm font-bold text-text-primary leading-tight">
      {value || <span className="text-border-strong italic font-normal">Not Specified</span>}
    </span>
  </div>);
export default function WorkOrderDetailsPage() {
    const router = useRouter();
    const [workOrder, setWorkOrder] = useState(null);
    useEffect(() => {
        const savedData = localStorage.getItem('generatedWorkOrder');
        if (savedData) {
            setWorkOrder(JSON.parse(savedData));
        }
    }, []);
    if (!workOrder) {
        return (<div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"/>
        <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.3em]">Loading Work Order...</p>
      </div>);
    }
    const header = workOrder.Header || workOrder.headerData || workOrder["Header Data"];
    const components = workOrder.Components || workOrder.componentsData || workOrder["Components Data"] || [];
    const operations = workOrder.Operations || workOrder.operationsData || workOrder["Operations Data"] || [];
    const costs = workOrder.Costs || workOrder.costsData || workOrder["Costs Data"];
    return (<>
        <header className="h-16 shrink-0 border-b border-border flex items-center justify-between px-6 bg-surface z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-2 rounded-lg transition-colors group">
              <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-text-primary"/>
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-text-primary tracking-tight uppercase">
                Work Order Details
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">
                  Order # {header?.orderNumber || header?.["Order Number"]}
                </span>
                <span className="w-1 h-1 rounded-full bg-border-strong"/>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-[9px] font-black uppercase tracking-widest">
                  {header?.orderStatus || header?.["Order Status"]}
                </span>
              </div>
            </div>
          </div>
          <Bell className="w-5 h-5 text-text-subtle cursor-pointer hover:text-text-secondary transition-colors"/>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas/30 thin-scrollbar">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Header Data Section */}
            <div className="bg-surface rounded-lg border border-black shadow-sm overflow-hidden transition-all hover:shadow-md">
              <SectionHeader title="Header Information" icon={Settings}/>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-2">
                <div className="space-y-1">
                  <DataField label="Order Number" value={header?.orderNumber || header?.["Order Number"]} icon={Hash}/>
                  <DataField label="Order Type" value={header?.orderType || header?.["Order Type"]} icon={Tag}/>
                  <DataField label="Order Date" value={header?.orderDate || header?.["Order Date"]} icon={Calendar}/>
                </div>
                <div className="space-y-1">
                  <DataField label="Equipment Number" value={header?.equipmentNumber || header?.["Equipment Number"]} icon={Settings}/>
                  <DataField label="Equipment Description" value={header?.equipmentDescription || header?.["Equipment Description"]}/>
                  <DataField label="Functional Location" value={header?.functionalLocation || header?.["Functional Location"]} icon={MapPin}/>
                </div>
                <div className="space-y-1">
                  <DataField label="Priority" value={header?.priority || header?.["Priority"]}/>
                  <DataField label="Planner Group" value={header?.plannerGroup || header?.["Planner Group"]} icon={Users}/>
                  <DataField label="Order Status" value={header?.orderStatus || header?.["Order Status"]} icon={CheckCircle2}/>
                </div>
                <div className="col-span-full pt-4 border-t border-border/20 mt-2">
                  <DataField label="Order Description" value={header?.orderDescription || header?.["Order Description"]}/>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Operations Data */}
              <div className="bg-surface rounded-lg border border-black shadow-sm overflow-hidden flex flex-col">
                <SectionHeader title="Operations" icon={Wrench}/>
                <div className="p-6 space-y-2 flex-1">
                  {operations.map((op, i) => (<div key={i} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <DataField label="Operation No" value={op.operationNo || op["Operation No"]}/>
                        <DataField label="Main Workcenter" value={op.mainWorkcenter || op["Main Workcenter"]}/>
                        <DataField label="Control Key" value={op.controlKey || op["Control Key"]}/>
                        <DataField label="Duration" value={op.duration || op["Duration"]} icon={Clock}/>
                        <DataField label="Planned Manpower" value={op.plannedManpower || op["Planned Manpower"]} icon={Users}/>
                      </div>
                      <DataField label="Description" value={op.operationDescription || op["Description"] || op["Operation Description"]}/>
                    </div>))}
                </div>
              </div>

              {/* Costs Data */}
              <div className="bg-surface rounded-lg border border-black shadow-sm overflow-hidden flex flex-col">
                <SectionHeader title="Costs & Settlement" icon={DollarSign}/>
                <div className="p-6 space-y-2 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <DataField label="Cost Center" value={costs?.costCenter || costs?.["Cost Center"]}/>
                    <DataField label="Settlement Receiver" value={costs?.settlementReceiver || costs?.["Settlement Receiver"]}/>
                    <div className="col-span-full py-4 px-6 bg-brand-muted/50 border border-brand/20 rounded-xl mt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand/60">Estimated Total Costs</span>
                        <span className="text-3xl font-black text-[#0052CC]">
                          ${(costs?.estimatedCosts || costs?.["Estimated Costs"])?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DataField label="Cost Center Description" value={costs?.costCenterDescription || costs?.["Cost Center Description"]}/>
                  <DataField label="Assembly" value={costs?.assembly || costs?.["Assembly"]}/>
                </div>
              </div>
            </div>

            {/* Components Data Table */}
            <div className="bg-surface rounded-lg border border-black shadow-sm overflow-hidden">
              <SectionHeader title="Required Components" icon={Package}/>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-canvas/50 border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Material Description</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Material #</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle text-center">Qty</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Storage Location</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {components.map((comp, i) => (<tr key={i} className="group hover:bg-canvas/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-text-primary">
                            {comp.materialDescription || comp["Material Description"]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-mono text-text-muted bg-surface-2 px-2 py-1 rounded">
                            {comp.materialNumber || comp["Material Number"]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-brand-muted text-brand rounded-full text-xs font-black">
                            {comp.quantity || comp["Quantity"]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-border-strong"/>
                            <span className="text-xs font-bold text-text-secondary">
                              {comp.storageLocation || comp["Storage Location"]}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-surface-2 text-text-secondary border border-border rounded text-[10px] font-black uppercase tracking-widest">
                            {comp.systemCondition || comp["System Condition"]}
                          </span>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

    </>);
}
