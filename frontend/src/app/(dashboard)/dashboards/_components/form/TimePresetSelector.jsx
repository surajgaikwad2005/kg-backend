import React from 'react';

export default function TimePresetSelector({ timePreset, setTimePreset, customStart, setCustomStart, customEnd, setCustomEnd, timePresets, isLive, setIsLive }) {
  return (
    <div className="py-2 border-b border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-label font-bold text-text-muted tracking-[0.12em] uppercase">Time Range</label>
        <button
          type="button"
          // disabled
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-extrabold tracking-wider uppercase transition-all     ${isLive
            ? 'border border-danger/35 bg-danger/10 text-danger'
            : 'border border-border bg-surface text-text-muted'
            }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {isLive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isLive ? 'bg-danger' : 'bg-text-muted'}`}></span>
          </span>
          Live
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {timePresets?.map(tp => {
          const val = tp.value !== undefined ? tp.value : tp.id;
          const isActive = timePreset === val;
          return (
            <button
              key={val}
              onClick={() => setTimePreset(val)}
              className={`h-7 px-2.5 rounded-full border-[1.5px] text-[10.5px] font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'border-brand bg-brand/10 text-brand shadow-sm shadow-brand/10' 
                  : 'border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {tp.label}
            </button>
          );
        })}
      </div>
      {timePreset === 'custom' && (
        <div className="grid grid-cols-2 gap-3 mt-3.5 p-3.5 bg-surface-2 rounded-xl border border-border">
          <div>
            <div className="text-[11px] font-bold text-text-muted mb-1.5">From</div>
            <input
              type="datetime-local"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              onClick={e => {
                try { e.target.showPicker(); } catch { }
              }}
              onFocus={e => {
                try { e.target.showPicker(); } catch { }
              }}
              className="w-full h-[38px] px-2.5 border border-border rounded-lg text-[12.5px] text-text-primary bg-surface cursor-pointer outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {!(isLive === true || isLive === 'True') ? (
            /* 1. WHEN FALSE: Show your normal calendar picker */
            <div>
              <div className="text-[11px] font-bold text-text-muted mb-1.5">To</div>
              <input
                type="datetime-local"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full h-[38px] px-2.5 border border-border rounded-lg text-[12.5px] text-text-primary bg-surface cursor-pointer outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          ) : (
            /* 2. WHEN TRUE: Show the "LIVE" badge */
            <div>
              <div className="text-[11px] font-bold text-text-muted mb-1.5">To</div>
              <div className="w-full h-[38px] px-3 border border-danger/35 rounded-lg bg-danger/10 flex items-center gap-2.5 select-none">

                {/* The pulsing radar dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                </span>

                <span className="text-[11.5px] font-extrabold tracking-widest text-danger uppercase">
                  Live
                </span>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
