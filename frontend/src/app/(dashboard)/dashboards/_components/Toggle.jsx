import React from 'react';

export default function Toggle({ checked, onChange }) {
  return (
    <label className="relative w-8 h-[18px] inline-block shrink-0 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="opacity-0 w-0 h-0 absolute" />
      <span
        className={`absolute inset-0 rounded-[9px] transition-colors duration-150 ${checked ? 'bg-brand' : 'bg-border-strong'}`}
      >
        <span 
          className={`absolute w-3.5 h-3.5 rounded-full bg-white top-0.5 left-0.5 shadow-[0_1px_2px_rgba(15,23,42,0.20)] transition-transform duration-150 ${checked ? 'translate-x-[14px]' : 'translate-x-0'}`} 
        />
      </span>
    </label>
  );
}
