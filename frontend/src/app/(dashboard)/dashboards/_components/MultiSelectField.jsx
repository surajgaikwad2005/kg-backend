import React from 'react';
import ModalMetricInput from './ModalMetricInput';

export default function MultiSelectField({ label, items, setItems, placeholder, list, onEdit, onDelete }) {
  return (
    <div>
      {label && (
        <div className="text-[11.5px] font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
          {label} <span className="text-[10px] text-brand font-bold">multiple</span>
        </div>
      )}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map(item => {
            const found = list.find(x => String(x.id) === String(item));
            const displayName = found ? (found.label || found.name || item) : item;
            const isCustom = found?.isCustom || String(item).startsWith('CUSTOM_LOGIC_') || (found && isNaN(item) === false);
            
            return (
              <span 
                key={item} 
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[10.5px] font-bold tracking-wide transition-all ${
                  isCustom
                    ? 'bg-warning/10 border-warning/30 text-warning'
                    : 'bg-brand-muted border-brand-muted/50 text-brand'
                }`}
              >
                {isCustom && <span className="text-[9.5px]">✨</span>}
                <span>{displayName}</span>
                <button
                  onClick={() => setItems(items.filter(i => i !== item))}
                  className={`hover:text-white cursor-pointer w-4 h-4 rounded-full flex items-center justify-center transition-colors ml-0.5 ${
                    isCustom
                      ? 'text-warning hover:bg-warning'
                      : 'text-brand hover:bg-brand-hover'
                  }`}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}
      <ModalMetricInput
        value=""
        clearOnSelect={true}
        onChange={(val) => { if (val && !items.includes(val)) setItems([...items, val]); }}
        metricsList={list}
        placeholder={placeholder}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
