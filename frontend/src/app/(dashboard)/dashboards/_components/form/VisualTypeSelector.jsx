import React from 'react';

export default function VisualTypeSelector({ chartType, setChartType, setChartTypeSelected, equipmentSectionRef, equipmentInputRef, modalChartCategories }) {
  return (
    <div className="py-2">
      <label className="block text-[10px] font-bold text-text-muted tracking-[0.12em] uppercase mb-3.5">Visualization Type <span className="text-danger">*</span></label>
      <div className="flex flex-col gap-3.5">
        {modalChartCategories?.map(cat => (
          <div key={cat.label}>
            <div className="text-[9.5px] font-bold text-text-subtle tracking-[0.12em] uppercase mb-2">{cat.label}</div>
            <div className="grid grid-cols-2 gap-2">
              {cat.types.map(ct => {
                const isActive = chartType === ct.id;
                return (
                  <button
                    key={ct.id}
                    onClick={() => {
                      setChartType(ct.id);
                      setChartTypeSelected(cat.label);
                      setTimeout(() => {
                        equipmentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        equipmentInputRef.current?.focus();
                      }, 300);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 border-[1.5px] rounded-md transition-all duration-150 cursor-pointer w-full ${
                      isActive 
                        ? 'border-brand bg-brand/10 shadow-sm shadow-brand/10' 
                        : 'border-border bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded grid place-items-center shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-brand text-white' 
                        : 'bg-surface-2 text-text-muted dark:bg-surface-2 dark:text-text-subtle'
                    }`}>
                      {ct.icon}
                    </span>
                    <span className={`text-[10.5px] font-bold whitespace-nowrap ${
                      isActive 
                        ? 'text-brand' 
                        : 'text-text-secondary'
                    }`}>
                      {ct.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
