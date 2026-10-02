'use client';
import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ClipboardList, Package, DollarSign, Wrench, Settings } from 'lucide-react';
const EQUIPMENT_MAP = {
    'scrub_1': 'Suction Scrubber 1',
    'comp_1': '1st Stage Compressor',
    'cool_1': 'Cooler 1',
    'asv_1': 'Anti-Surge Valve 1',
    'scrub_2': 'Suction Scrubber 2',
    'comp_2': '2nd Stage Compressor',
    'cool_2': 'Cooler 2',
    'asv_2': 'Anti-Surge Valve 2',
    'header': 'Discharge Header',
    'contact': 'Glycol Contactor',
};
const WORK_ORDER_DATA = {
    notification: {
        notificationDate: '2024-04-19',
        notificationNumber: '57946826',
        orderDescription: 'Process Vessel CP-T-0001 Emergency Inspection & Repair Required',
        orderNumber: '', // Not provided
        orderStatus: 'OSNO',
        reportedBy: 'John Doe',
    },
    header: {
        endDate: '2024-04-25',
        equipmentDescription: 'Process Vessel (Main Unit)',
        equipmentNumber: 'CP-T-0001',
        functionalLocation: 'CP01-100-KN-0001',
        functionalLocationDescription: 'Process Area – Vessel Section',
        orderDate: '2024-04-19',
        orderDescription: 'Emergency inspection and corrective maintenance required',
        orderNumber: '', // Not provided
        orderType: 'M2',
        plannerGroup: 'MECH01',
        priority: 'Medium',
        startDate: '2024-04-20',
    },
    components: [
        {
            materialDescription: 'VESSEL INSPECTION KIT',
            materialNumber: '2000001001',
            quantity: 1,
            reservationNo: '',
            storageLocation: 'MAIN',
            systemCondition: 'Complete vessel inspection including shell integrity and joints',
        },
        {
            materialDescription: 'PRESSURE TESTING EQUIPMENT',
            materialNumber: '2000001002',
            quantity: 1,
            reservationNo: '',
            storageLocation: 'MAIN',
            systemCondition: 'Pressure imbalance and leakage detection',
        },
        {
            materialDescription: 'REPAIR TOOLKIT (MECHANICAL)',
            materialNumber: '2000001003',
            quantity: 1,
            reservationNo: '',
            storageLocation: 'MAIN',
            systemCondition: 'Mechanical repair and restoration activity',
        },
    ],
    costs: {
        assembly: '',
        costCenter: 'MECH01',
        costCenterDescription: 'Mechanical Maintenance',
        estimatedCosts: 7500.0,
        settlementReceiver: 'MECH01',
    },
    operations: {
        controlKey: '',
        duration: '',
        mainWorkcenter: 'MECH01',
        operationDescription: 'Perform emergency inspection and repair of Process Vessel CP-T-0001 including failure analysis, structural inspection, pressure testing, and restoration of operational condition.',
        operationNo: '',
        plannedManpower: 3,
    },
};
const SectionHeader = ({ title, icon: Icon }) => (<div className="p-3 border-b border-black flex items-center gap-2 bg-canvas shrink-0">
        <Icon className="w-4 h-4 text-brand"/>
        <h2 className="text-text-primary font-bold text-[16px] tracking-tight">{title}</h2>
    </div>);
const Field = ({ label, value }) => (<div className="flex flex-col gap-0.5 py-2 border-b border-border last:border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">{label}</span>
        <span className="text-[16px] font-semibold text-text-primary">{value !== '' && value !== undefined ? String(value) : <span className="text-text-subtle text-[14px] italic">—</span>}</span>
    </div>);
// ── MAIN CONTENT ──
function WorkOrderContent({ params }) {
    const equipmentId = params.id;
    const wo = WORK_ORDER_DATA;
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);
    if (isInitialLoading) {
        return (<div className="absolute inset-0 flex items-center justify-center bg-canvas z-50">
                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-24 h-24 object-contain"/>
            </div>);
    }
    return (<div className="flex-1 overflow-y-auto min-h-0 p-6">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* ── Work Order Details ── */}
                <div className="bg-white rounded-xl border border-black shadow-sm overflow-hidden">
                    <SectionHeader title="Work Order Details" icon={ClipboardList}/>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-0 px-5 py-2 divide-x divide-border">
                        <div className="pr-6 space-y-0.5">
                            <Field label="Notification Date" value={wo.notification.notificationDate}/>
                            <Field label="Notification Number" value={wo.notification.notificationNumber}/>
                            <Field label="Order Number" value={wo.notification.orderNumber}/>
                        </div>
                        <div className="px-6 space-y-0.5">
                            <Field label="Order Status" value={wo.notification.orderStatus}/>
                            <Field label="Reported By" value={wo.notification.reportedBy}/>
                        </div>
                        <div className="pl-6 space-y-0.5">
                            <Field label="Order Description" value={wo.notification.orderDescription}/>
                        </div>
                    </div>
                </div>

                {/* ── Header Data ── */}
                <div className="bg-white rounded-xl border border-black shadow-sm overflow-hidden">
                    <SectionHeader title="Header Data" icon={Settings}/>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-0 px-5 py-2 divide-x divide-border">
                        <div className="pr-6 space-y-0.5">
                            <Field label="Order Number" value={wo.header.orderNumber}/>
                            <Field label="Order Type" value={wo.header.orderType}/>
                            <Field label="Order Date" value={wo.header.orderDate}/>
                            <Field label="Start Date" value={wo.header.startDate}/>
                            <Field label="End Date" value={wo.header.endDate}/>
                        </div>
                        <div className="px-6 space-y-0.5">
                            <Field label="Equipment Number" value={wo.header.equipmentNumber}/>
                            <Field label="Equipment Description" value={wo.header.equipmentDescription}/>
                            <Field label="Functional Location" value={wo.header.functionalLocation}/>
                            <Field label="Functional Location Description" value={wo.header.functionalLocationDescription}/>
                        </div>
                        <div className="pl-6 space-y-0.5">
                            <Field label="Priority" value={wo.header.priority}/>
                            <Field label="Planner Group" value={wo.header.plannerGroup}/>
                            <Field label="Order Description" value={wo.header.orderDescription}/>
                        </div>
                    </div>
                </div>

                {/* ── Components Data ── */}
                <div className="bg-white rounded-xl border border-black shadow-sm overflow-hidden">
                    <SectionHeader title="Components Data" icon={Package}/>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[16px] text-left">
                            <thead className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas border-b border-black">
                                <tr>
                                    <th className="px-5 py-3">Material Description</th>
                                    <th className="px-5 py-3">Material Number</th>
                                    <th className="px-5 py-3 text-center">Quantity</th>
                                    <th className="px-5 py-3">Reservation No</th>
                                    <th className="px-5 py-3">Storage Location</th>
                                    <th className="px-5 py-3">System Condition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {wo.components.map((comp, i) => (<tr key={i} className="hover:bg-canvas transition-colors">
                                        <td className="px-5 py-3 font-semibold text-text-primary">{comp.materialDescription}</td>
                                        <td className="px-5 py-3 font-mono text-text-secondary">{comp.materialNumber}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-[14px] font-bold">{comp.quantity}</span>
                                        </td>
                                        <td className="px-5 py-3 text-text-subtle text-[14px] italic">{comp.reservationNo || '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className="px-2 py-0.5 bg-surface-2 text-text-secondary border border-black rounded text-[14px] font-semibold">{comp.storageLocation}</span>
                                        </td>
                                        <td className="px-5 py-3 text-text-muted text-[14px]">{comp.systemCondition}</td>
                                    </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Costs & Operations ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Costs */}
                    <div className="bg-white rounded-xl border border-black shadow-sm overflow-hidden">
                        <SectionHeader title="Costs Data" icon={DollarSign}/>
                        <div className="px-5 py-2 space-y-0.5">
                            <Field label="Cost Center" value={wo.costs.costCenter}/>
                            <Field label="Cost Center Description" value={wo.costs.costCenterDescription}/>
                            <Field label="Estimated Costs" value={`${wo.costs.estimatedCosts.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}/>
                            <Field label="Settlement Receiver" value={wo.costs.settlementReceiver}/>
                            <Field label="Assembly" value={wo.costs.assembly}/>
                        </div>
                    </div>

                    {/* Operations */}
                    <div className="bg-white rounded-xl border border-black shadow-sm overflow-hidden">
                        <SectionHeader title="Operations Data" icon={Wrench}/>
                        <div className="px-5 py-2 space-y-0.5">
                            <Field label="Operation No" value={wo.operations.operationNo}/>
                            <Field label="Main Workcenter" value={wo.operations.mainWorkcenter}/>
                            <Field label="Control Key" value={wo.operations.controlKey}/>
                            <Field label="Duration" value={wo.operations.duration}/>
                            <Field label="Planned Manpower" value={wo.operations.plannedManpower}/>
                            <Field label="Operation Description" value={wo.operations.operationDescription}/>
                        </div>
                    </div>
                </div>

            </div>
        </div>);
}
// ── MAIN SHELL (SHELL-FIRST HYDRATION) ──
export default function WorkOrderPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const equipmentId = resolvedParams.id;
    const equipmentName = EQUIPMENT_MAP[equipmentId] || 'Equipment';
    const wo = WORK_ORDER_DATA;
    return (<>
                <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-white shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push(`/compressor-details/${equipmentId}/investigation`)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors group">
                            <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors"/>
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[20px] font-bold text-text-primary tracking-tight uppercase">
                                Work Order
                            </h1>
                            <span className="text-text-subtle">|</span>
                            <span className="text-[16px] font-semibold text-text-muted">{equipmentName}</span>
                            <span className="px-2.5 py-1 bg-info/10 text-info border border-info/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {wo.notification.orderStatus}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-[14px] text-text-muted font-semibold">
                            Order # <span className="text-text-primary font-bold">{wo.notification.orderNumber}</span>
                        </div>
                        <Bell className="w-5 h-5 text-text-subtle cursor-pointer hover:text-text-secondary transition-colors"/>
                    </div>
                </header>

                {/* Hydration-Protected Content Area */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-canvas font-black uppercase tracking-widest text-text-subtle">
                            Loading Work Order...
                        </div>}>
                        <WorkOrderContent params={resolvedParams}/>
                    </React.Suspense>
                </div>
        </>);
}
