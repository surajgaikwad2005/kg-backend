'use client';
import React from 'react';
import TimeSelector from '@/src/components/ui/TimeSelector';
import { Bell, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
export default function NotificationPage({ params }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const equipmentId = resolvedParams.id;
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);
    const equipmentName = EQUIPMENT_MAP[equipmentId] || 'Equipment';
    const data = {
        equipment: 'V-2470B',
        description: 'Vessel',
        functionalLocation: 'BP01-100-KN-2470B',
        functionalDescription: 'Vessel – Kiln Area',
        longText: 'Rotary equipment BP-KN-2470B requires detailed inspection and maintenance based on historical work order patterns. Previous records indicate recurring issues such as bearing wear, gearbox oil degradation, and operational stress due to overload conditions.',
        workCenter: 'KH1_MA',
        notificationDate: '2024-03-20',
        status: 'OSNO',
        type: 'M2 (Maintenance Request)',
        plannerGroup: 'MECH01',
        priority: 'Scheduled Maintenance',
        reportedBy: 'John Doe',
        startDate: '2024-03-24',
        endDate: '2024-03-29',
        shortText: 'Rotary Equipment BP-KN-2470B Inspection & Maintenance Required',
    };
    return (<>


        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-10 bg-white border-b shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push(`/compressor-details/${equipmentId}/investigation`)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors group">
                <ArrowLeft className="w-6 h-6 text-text-muted group-hover:text-text-primary transition-colors"/>
            </button>
            <div>
              <h1 className="text-xl font-black text-text-primary leading-tight">NOTIFICATION</h1>
              <p className="text-xs uppercase tracking-widest text-text-subtle font-bold">
                Equipment Notification Details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TimeSelector />
            <Bell className="w-5 h-5 text-text-subtle"/>
            <Settings className="w-5 h-5 text-text-subtle"/>
          </div>
        </header>

        <div className="flex-1 flex flex-col relative w-full h-full min-h-0 bg-surface-2">
            {isInitialLoading ? (<div className="absolute inset-0 flex items-center justify-center z-50">
                    <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-24 h-24 object-contain"/>
                </div>) : (<div className="p-6 space-y-6 overflow-auto w-full h-full">
                  {/* 🔷 WORK ORDER DETAILS */}
                  <Card title="Notification Details">
                    <Grid>
                      <Field label="Notification Date" value={data.notificationDate}/>
                      <Field label="Order Status" value={data.status}/>
                      <Field label="Order Description" value={data.shortText}/>

                      <Field label="Notification Number" value="57946826"/>
                      <Field label="Reported By" value={data.reportedBy}/>
                      <Field label="" value=""/>

                      <Field label="Order Number" value="91187567"/>

                      <Field label="Order Number" value="91187567"/>
                      <Field label="Equipment Number" value={data.equipment}/>
                      <Field label="Priority" value={data.priority}/>

                      <Field label="Order Type" value="PM01"/>
                      <Field label="Equipment Description" value={data.description}/>
                      <Field label="Planner Group" value={data.plannerGroup}/>

                      <Field label="Order Date" value="2024-03-25"/>
                      <Field label="Functional Location" value={data.functionalLocation}/>
                      <Field label="Order Description" value="—"/>

                      <Field label="Start Date" value={data.startDate}/>
                      <Field label="Functional Location Description" value={data.functionalDescription}/>
                      <Field label="" value=""/>

                      <Field label="End Date" value={data.endDate}/>
                    </Grid>
                  </Card>

                  <div className="fixed bottom-4 right-6 z-50">
                      <button onClick={() => router.push(`/compressor-details/${equipmentId}/investigation/work-order`)} className="px-8 py-2 bg-overlay text-white text-[14px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-black hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2">
                          <Bell className="w-4 h-4"/>
                          Generate Work Order
                      </button>
                  </div>
                </div>)}
        </div>
    </>);
}
/* 🔹 Card Wrapper */
function Card({ title, children }) {
    return (<div className="bg-white border rounded-2xl shadow-sm">
      <div className="px-6 py-4 border-b font-semibold text-text-secondary text-sm">
        {title}
      </div>
      <div className="p-6">{children}</div>
    </div>);
}
/* 🔹 Grid Layout */
function Grid({ children }) {
    return <div className="grid grid-cols-3 gap-x-10 gap-y-6">{children}</div>;
}
/* 🔹 Field */
function Field({ label, value }) {
    if (!label)
        return <div />;
    return (<div>
      <p className="text-xs text-text-subtle uppercase font-bold tracking-wider">
        {label}
      </p>
      <p className="mt-1 border-b pb-1 text-text-primary">{value}</p>
    </div>);
}
/* 🔹 Table Row */
function Row({ name, number, qty, desc }) {
    return (<tr className="border-b hover:bg-canvas">
      <td className="py-3">{name}</td>
      <td>{number}</td>
      <td>
        <span className="px-2 py-1 bg-warning/10 rounded-full text-xs">{qty}</span>
      </td>
      <td>
        <span className="px-2 py-1 border rounded text-xs">MAIN</span>
      </td>
      <td className="text-text-muted">{desc}</td>
    </tr>);
}
