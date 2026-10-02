import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import AlertsPanel from '@/src/components/dashboard/AlertsPanel';
import DualSectionPanel from '@/src/components/layout/DualSectionPanel';
import ProductionRiskPanel from '@/src/components/dashboard/ProductionRiskPanel';
import FlowChart from '@/src/components/charts/FlowChart';
import { Settings } from 'lucide-react';

const DUMMY_KPI_DATA = {
    kpi1: { label: 'Risk Factor', value: 'High', color: 'text-danger', unit: '' },
    secondaryKpis: [
        { label: 'Temp', value: '450°C' },
        { label: 'Press', value: '25 bar' },
        { label: 'Flow', value: '100m3' }
    ]
};

const DUMMY_DUAL_DATA = {
    section1: {
        title: 'Input Feed',
        kpis: [
            { label: 'Flow', value: '110' },
            { label: 'Temp', value: '35°C' },
            { label: 'Press', value: '5 bar' }
        ]
    },
    section2: {
        title: 'Output Feed',
        kpis: [
            { label: 'Flow', value: '108' },
            { label: 'Temp', value: '45°C' },
            { label: 'Press', value: '12 bar' }
        ]
    }
};

const WIDGET_MAP = {
    AlertsPanel,
    DualSectionPanel,
    ProductionRiskPanel,
    FlowChart,
};

const WidgetNode = ({ data, selected }) => {
    const widgetType = data.widgetType;
    const WidgetComponent = widgetType ? WIDGET_MAP[widgetType] : null;

    return (
        <div
            className={`rounded-xl bg-white flex flex-col transition-all duration-200 ${
                selected ? 'ring-4 ring-highlight shadow-xl' : 'shadow-md border-2 border-border hover:border-highlight'
            } ${data.isConnecting ? 'ring-4 ring-brand ring-offset-2' : ''}`}
            style={{ width: 380, height: 320 }}
            onClick={(e) => e.stopPropagation()}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-highlight rounded-full border-2 border-white" />

            <div className="bg-overlay-hover text-white p-2 drag-handle cursor-move flex items-center justify-between shrink-0 rounded-t-lg">
                <span className="text-caption font-bold uppercase tracking-widest">{data.label}</span>
                <Settings className="w-4 h-4 text-text-subtle" />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full bg-white rounded-b-lg">
                {WidgetComponent ? (
                    <div className="h-full w-full nodrag">
                        {widgetType === 'ProductionRiskPanel' && <WidgetComponent {...DUMMY_KPI_DATA} />}
                        {widgetType === 'DualSectionPanel' && <WidgetComponent {...DUMMY_DUAL_DATA} />}
                        {(widgetType === 'AlertsPanel' || widgetType === 'FlowChart') && <WidgetComponent />}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-subtle text-sm font-bold uppercase tracking-widest bg-canvas">
                        Unknown UI Widget
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-highlight rounded-full border-2 border-white" />
            <Handle type="source" id="right" position={Position.Right} className="w-3 h-3 bg-highlight rounded-full border-2 border-white" />
            <Handle type="target" id="left" position={Position.Left} className="w-3 h-3 bg-highlight rounded-full border-2 border-white" />
        </div>
    );
};

export default memo(WidgetNode);
