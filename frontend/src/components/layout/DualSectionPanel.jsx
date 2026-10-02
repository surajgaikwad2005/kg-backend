import React from 'react';
const DualSectionPanel = ({ section1, section2 }) => {
    const renderSection = (section, isLast) => (<div className={`flex flex-col ${!isLast ? 'border-b border-border/40' : ''}`}>
            <div className="px-4 py-2 bg-canvas/50">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                    {section.title}
                </h3>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border bg-white">
                {section.kpis.map((kpi, idx) => (<div key={idx} className="flex flex-col justify-center px-4 py-3 hover:bg-canvas/50 transition-all duration-200 group border-r last:border-r-0 border-border/40">
                        <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 leading-tight ${kpi.color || 'text-text-subtle'}`}>
                            {kpi.label}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[#0B1221] font-black text-[22px] tracking-tight">
                                {kpi.value}
                            </span>
                        </div>
                    </div>))}
            </div>
        </div>);
    return (<div className="flex flex-col h-full bg-surface font-sans overflow-hidden">
            {renderSection(section1, false)}
            {renderSection(section2, true)}
        </div>);
};
export default DualSectionPanel;
