import React from 'react';
import { useRouter } from 'next/navigation';

export function BuilderTopbar({ title, onTitleChange, onDiscard, onSave, saveStatus }) {
  const router = useRouter();

  const getSaveBtnClass = () => {
    let base = "inline-flex items-center gap-1.5 h-9 px-4 border-none rounded-lg text-[12.5px] font-semibold shadow-[0_2px_6px_rgba(15,23,42,0.22)] transition-colors duration-200 ";
    if (saveStatus === 'saving') {
      return base + "bg-brand text-white opacity-75 cursor-not-allowed";
    }
    if (saveStatus === 'saved') {
      return base + "bg-success text-white cursor-pointer";
    }
    if (saveStatus === 'error') {
      return base + "bg-danger text-white cursor-pointer";
    }
    return base + "bg-brand hover:bg-brand-hover text-white cursor-pointer";
  };

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 h-16 px-6 bg-surface border-b border-border shrink-0 z-10">
      <div className="flex items-center gap-2 text-xs text-text-muted min-w-0">
        <button onClick={() => router.push('/home')} className="bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer p-0 text-xs font-medium transition-colors">Home</button>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3 text-text-subtle shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
        <button onClick={() => router.push('/dashboards')} className="bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer p-0 text-xs font-medium transition-colors">Dashboards</button>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3 text-text-subtle shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
        <span className="text-text-primary font-bold">Create Visual</span>
      </div>

      <div className="flex items-center gap-2 justify-self-center min-w-[360px]">
        <input value={title} onChange={e => onTitleChange(e.target.value)}
          className="text-lg font-bold text-text-primary tracking-tight border-none outline-none bg-transparent py-1 px-2 border-b-2 border-border text-center min-w-[240px] focus:border-brand transition-colors" />
        <span className="text-[10.5px] font-semibold text-text-muted tracking-wider uppercase bg-surface-2 px-2 py-0.5 rounded-full">Draft · v0.1</span>
      </div>

      <div className="flex items-center gap-2 justify-self-end">
        <button onClick={onDiscard} className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-border rounded-lg bg-surface hover:bg-surface-2 text-text-secondary text-[12.5px] font-semibold cursor-pointer transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          Discard
        </button>
        <button onClick={onSave} disabled={saveStatus === 'saving'} className={getSaveBtnClass()}>
          {saveStatus === 'saving' ? '…Saving' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Retry' : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              Save
            </>
          )}
        </button>
      </div>
    </header>
  );
}
