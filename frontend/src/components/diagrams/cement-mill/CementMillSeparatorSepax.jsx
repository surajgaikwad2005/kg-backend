import React from 'react';
const CementMillSeparator = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "SEP-01", onPointerDown, }) => {
    // Process strictly outside of JSX
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Equipment Label */}
            <text x="100" y="-15" textAnchor="middle" className="fill-text-secondary text-[20px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Motor Drive Unit (Top) */}
            <rect x="80" y="10" width="40" height="40" rx="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="3"/>
            <line x1="80" y1="20" x2="120" y2="20" stroke="#1e293b" strokeWidth="2"/>
            <line x1="80" y1="30" x2="120" y2="30" stroke="#1e293b" strokeWidth="2"/>
            <line x1="80" y1="40" x2="120" y2="40" stroke="#1e293b" strokeWidth="2"/>
            <rect x="70" y="50" width="60" height="8" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2"/>

            {/* Drive Shaft */}
            <rect x="94" y="58" width="12" height="22" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* Feed Inlet Duct (Left Top Side) */}
            <polygon points="40,90 10,60 30,50 60,80" fill="#e2e8f0" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
            <line x1="5" y1="65" x2="25" y2="45" stroke="#334155" strokeWidth="6"/>
            {/* Feed Inlet Arrow Direction */}
            <path d="M 15,55 L 35,75 M 25,75 L 35,75 L 35,65" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Main Housing Body (Cylinder + Cone) */}
            <polygon points="40,80 160,80 160,180 110,260 90,260 40,180" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
            
            {/* Depth Highlights for 3D DCS Look */}
            <polygon points="45,85 55,85 55,178 95,250 90,250 45,178" fill="#ffffff" opacity="0.6" pointerEvents="none"/>
            <polygon points="145,85 155,85 155,178 110,250 105,250 145,178" fill="#cbd5e1" opacity="0.4" pointerEvents="none"/>

            {/* Internal Rotating Cage Frame (SEPAX Rotor) */}
            <rect x="50" y="90" width="100" height="80" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4"/>
            
            {/* Vertical Rotor Blades (Strictly avoiding .map arrays per rules) */}
            <line x1="60" y1="90" x2="60" y2="170" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="75" y1="90" x2="75" y2="170" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="90" y1="90" x2="90" y2="170" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="110" y1="90" x2="110" y2="170" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="125" y1="90" x2="125" y2="170" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="140" y1="90" x2="140" y2="170" stroke="#94a3b8" strokeWidth="2"/>

            {/* Rotor Hub Structure */}
            <circle cx="100" cy="130" r="14" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="100" cy="130" r="6" fill="#334155"/>

            {/* Air + Fines Outlet Duct (Right Top Side) */}
            <polygon points="160,100 220,80 220,130 160,130" fill="#e2e8f0" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
            <rect x="215" y="75" width="10" height="60" rx="1" fill="#334155"/>
            {/* Outlet Arrow Direction */}
            <path d="M 175,110 L 200,110 M 190,100 L 200,110 L 190,120" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Primary Air Inlet Duct (Left Bottom Side) */}
            <polygon points="40,160 -20,160 -20,200 40,180" fill="#e2e8f0" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
            <rect x="-25" y="155" width="10" height="50" rx="1" fill="#334155"/>
            {/* Inlet Arrow Direction */}
            <path d="M -5,175 L 25,175 M 15,165 L 25,175 L 15,185" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Coarse Material Return Pipe (Bottom) */}
            <rect x="90" y="260" width="20" height="30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="3"/>
            <rect x="85" y="285" width="30" height="10" rx="1" fill="#334155"/>
            {/* Bottom Outlet Arrow Direction */}
            <path d="M 100,265 L 100,280 M 92,272 L 100,280 L 108,272" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Status Indicator Panel */}
            <rect x="155" y="10" width="40" height="40" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="175" cy="30" r="10" fill={statusColor} stroke="#1e293b" strokeWidth="2">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>
            <text x="175" y="55" textAnchor="middle" className="fill-text-muted text-[10px] font-bold font-sans pointer-events-none select-none">
                STATUS
            </text>
        </g>);
};
export default CementMillSeparator;
