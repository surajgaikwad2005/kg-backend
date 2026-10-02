import React, { useEffect } from 'react';

export default function BucketIntervalSelector({
  interval,
  setInterval,
  timePreset = '24h',
  customStart,
  customEnd
}) {
  const getRangeDurationMinutes = () => {
    if (timePreset !== 'custom') {
      const presetMap = {
        '1h': 60,
        '3h': 180,
        '9h': 540,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200
      };
      return presetMap[timePreset] || Infinity;
    }
    if (customStart && customEnd) {
      const diffMs = new Date(customEnd) - new Date(customStart);
      if (!isNaN(diffMs) && diffMs > 0) {
        return diffMs / 60000;
      }
    }
    return Infinity;
  };

  const limitMinutes = getRangeDurationMinutes();

  const intervalOptions = [
    { label: '1m', value: '1m', mins: 1 },
    { label: '5m', value: '5m', mins: 5 },
    { label: '10m', value: '10m', mins: 10 },
    { label: '15m', value: '15m', mins: 15 },
    { label: '30m', value: '30m', mins: 30 },
    { label: '1h', value: '1h', mins: 60 },
    { label: '6h', value: '6h', mins: 360 },
    { label: '12h', value: '12h', mins: 720 },
    { label: '1d', value: '1d', mins: 1440 }
  ];

  const filteredOptions = intervalOptions.filter(opt => opt.mins < limitMinutes);
  const finalOptions = filteredOptions.length > 0 ? filteredOptions : [intervalOptions[0]];

  useEffect(() => {
    if (interval === null) return;
    const isValid = finalOptions.some(opt => opt.value === interval);
    if (!isValid && finalOptions.length > 0) {
      const bestFallback = finalOptions[finalOptions.length - 1].value;
      setInterval(bestFallback);
    }
  }, [interval, finalOptions, setInterval]);

  return (
    <div className="py-2 border-b border-border/50">
      <label className="block text-[10px] font-bold text-text-muted tracking-[0.12em] uppercase mb-2">Bucket Interval</label>
      <div className="flex flex-wrap gap-1.5">
        {finalOptions.map(opt => {
          const isActive = interval === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setInterval(opt.value)}
              className={`h-7 px-2.5 rounded-full border font-mono text-[10.5px] font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'border-brand bg-brand text-white shadow-sm shadow-brand/10' 
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-2'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
