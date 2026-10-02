import React from 'react';
const ProductionRiskPanel = ({ kpi1, secondaryKpis }) => {
    const label1Color = kpi1.color || 'text-text-muted';
    return (<div className="flex flex-col h-full bg-surface font-sans overflow-hidden">
            {/* Top Section: KPI-1 */}
            <div className="flex-1 flex flex-col justify-center px-4 py-2 bg-gradient-to-br from-surface to-surface-2/50">
                {kpi1.label && (<div className="mb-0.5">
                        <span className={"text-[11px] font-bold uppercase tracking-widest " + label1Color}>
                            {kpi1.label}
                        </span>
                    </div>)}
                <div className="flex items-end gap-2 whitespace-nowrap">
                    <span className="text-[50px] font-extrabold text-text-primary tracking-tighter drop-shadow-sm leading-none">
                        {kpi1.value}
                    </span>
                    <span className="text-text-subtle text-[20px] font-bold tracking-tight">
                        {kpi1.unit || 'm³/h'}
                    </span>
                </div>
            </div>

            {/* Bottom Section: KPI 2-4 (Optional) */}
            {secondaryKpis && secondaryKpis.length > 0 && (<div className="grid grid-cols-3 divide-x divide-border h-20 shrink-0 bg-surface-2/20 border-t border-border">
                    {secondaryKpis.map((kpi, idx) => {
                const kpiColor = kpi.color || 'text-text-subtle group-hover:text-brand';
                return (<div key={idx} className="flex flex-col justify-center px-4 py-3 hover:bg-surface-2 transition-all duration-200 group border-r last:border-r-0 border-border">
                                <span className={"text-[10px] uppercase font-bold tracking-widest mb-1 leading-tight " + kpiColor}>
                                    {kpi.label}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-text-primary font-black text-[22px] tracking-tight">
                                        {kpi.value}
                                    </span>
                                </div>
                            </div>);
            })}
                </div>)}
        </div>);
};
export default ProductionRiskPanel;
