import React from 'react';
const IntercoolerA1 = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "V-2460A", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    const labelFontClass = "font-mono font-black tracking-tighter uppercase";
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* 1. Shell Body (Main horizontal cylinder) */}
            <rect width="120" height="45" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>

            {/* 2. Internal Tube Bundle (Zig-zag representation) */}
            <path d="M 10,22.5 L 25,10 L 40,35 L 55,10 L 70,35 L 85,10 L 100,35 L 110,22.5" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/>

            {/* 3. Nozzles (Piping Connections) */}
            {/* Shell Side (Cooling Medium) */}
            <rect x="25" y="-8" width="12" height="8" fill="#334155"/>
            <rect x="85" y="45" width="12" height="8" fill="#334155"/>

            {/* Tube Side (Process Gas) */}
            <rect x="-8" y="15" width="8" height="15" fill="#334155"/>
            <rect x="120" y="15" width="8" height="15" fill="#334155"/>
            
            {/* 5. Equipment Label */}
            <text x="40" y="65" textAnchor="middle" className={`font-mono text-[18px] font-bold uppercase ${labelFontClass}`}>
                {label}
            </text>

            {/* Status LED */}
            <circle cx="135" cy="0" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.6s" : "2s"} repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default IntercoolerA1;
