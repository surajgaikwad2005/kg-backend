import React from 'react';
const KilnTyre = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "TYRE-1 FEED", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Base/Foundation Pier */}
            <path d="M 60,130 L 140,130 L 150,170 L 50,170 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="50" y="170" width="100" height="15" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <line x1="60" y1="140" x2="140" y2="140" stroke="#cbd5e1" strokeWidth="1" opacity="0.6"/>
            <line x1="55" y1="155" x2="145" y2="155" stroke="#cbd5e1" strokeWidth="1" opacity="0.6"/>

            {/* Main Kiln Shell */}
            <rect x="30" y="30" width="170" height="70" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Shell 3D Shadow (Bottom curve shading) */}
            <rect x="30" y="70" width="170" height="30" fill="#000000" fillOpacity="0.15" pointerEvents="none"/>
            
            {/* Shell structural/rotation indication lines */}
            <line x1="30" y1="40" x2="200" y2="40" stroke="#f8fafc" strokeWidth="1.5" opacity="0.7"/>
            <line x1="30" y1="50" x2="200" y2="50" stroke="#f8fafc" strokeWidth="1" opacity="0.5"/>
            <line x1="30" y1="60" x2="200" y2="60" stroke="#94a3b8" strokeWidth="1" opacity="0.5"/>

            {/* Feed Hood / Inlet section (Left side) */}
            <path d="M 0,10 L 30,30 L 30,100 L 0,120 Z" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 0,10 L 10,30 L 10,100 L 0,120 Z" fill="#000000" fillOpacity="0.1" pointerEvents="none"/>
            
            {/* Feed chute pipe entering the hood */}
            <path d="M -20,40 L 0,40 L 0,90 L -20,90 Z" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-25" y="35" width="10" height="60" rx="1" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Cut-off Flange on the right (shell extension) */}
            <rect x="190" y="25" width="15" height="80" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="195" y="25" width="5" height="80" fill="#f8fafc" opacity="0.5" pointerEvents="none"/>

            {/* Tyre Pads / Chairs (Visible mounting parts beneath the tyre) */}
            <rect x="73" y="25" width="54" height="80" fill="#1e293b"/>

            {/* Kiln Tyre #1 (The massive structural steel ring) */}
            <rect x="78" y="10" width="44" height="110" rx="3" fill="#e2e8f0" stroke="#0f172a" strokeWidth="3"/>
            <rect x="85" y="10" width="30" height="110" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
            
            {/* Tyre 3D shadow and top reflection */}
            <rect x="78" y="75" width="44" height="45" rx="3" fill="#000000" fillOpacity="0.25" pointerEvents="none"/>
            <rect x="80" y="12" width="40" height="5" fill="#ffffff" fillOpacity="0.6" pointerEvents="none"/>

            {/* Supporting Trunnion Rollers */}
            <circle cx="75" cy="125" r="18" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="75" cy="125" r="7" fill="#334155"/>
            
            <circle cx="125" cy="125" r="18" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="125" cy="125" r="7" fill="#334155"/>

            {/* Bearing Housings supporting the rollers */}
            <path d="M 60,130 L 90,130 L 95,145 L 55,145 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <path d="M 110,130 L 140,130 L 145,145 L 105,145 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>

            {/* DCS Instrumentation Probe & Line measuring tyre temperature */}
            <path d="M 100,10 L 100,-15 L 125,-15" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/>
            <polygon points="96,4 104,4 100,10" fill="#1e293b"/>
            
            {/* DCS Readout Panel 1: Shell Temperature */}
            <rect x="125" y="-35" width="65" height="40" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
            <text x="157.5" y="-22" textAnchor="middle" fill="#0ea5e9" fontSize="11" fontFamily="monospace" fontWeight="bold">TEMP</text>
            <text x="157.5" y="-8" textAnchor="middle" fill={statusColor} fontSize="14" fontFamily="monospace" fontWeight="bold">420°C</text>

            {/* DCS Readout Panel 2: Kiln Rotation Speed */}
            <rect x="-40" y="-35" width="60" height="40" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
            <text x="-10" y="-22" textAnchor="middle" fill="#0ea5e9" fontSize="11" fontFamily="monospace" fontWeight="bold">RPM</text>
            <text x="-10" y="-8" textAnchor="middle" fill="#22c55e" fontSize="14" fontFamily="monospace" fontWeight="bold">2.45</text>

            {/* Feed Status Indicator LED */}
            <circle cx="10" cy="-15" r="7" fill={statusColor} stroke="#0f172a" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* Main Equipment Label */}
            <text x="100" y="-45" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default KilnTyre;
