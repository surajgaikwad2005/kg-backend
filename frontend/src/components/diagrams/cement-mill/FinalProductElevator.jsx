import React from 'react';
const FinalProductElevator = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "EL-100", onPointerDown, }) => {
    // Dynamic styles strictly calculated outside JSX
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* 1. Base Platform */}
            <rect x="0" y="250" width="100" height="8" rx="2" fill="#1e293b"/>
            <rect x="10" y="245" width="80" height="5" fill="#475569"/>

            {/* 2. Output Chute (Top Left) & Input Chute (Bottom Right) */}
            {/* Drawn before casings to layer cleanly underneath the head/boot housings */}
            <polygon points="15,25 -20,45 -15,55 20,35" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="-25" y="45" width="10" height="15" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>

            <polygon points="85,220 120,200 125,210 85,230" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M 115,185 L 140,185 L 130,205 L 115,205 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Live Fill Material level on Hopper mapped to statusColor */}
            <path d="M 117,195 L 135,195 L 128,205 L 115,205 Z" fill={statusColor} opacity="0.8"/>

            {/* 3. Main Casings (Trunk) */}
            <rect x="25" y="45" width="20" height="175" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="55" y="45" width="20" height="175" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>

            {/* 4. Internal Belts (Dashed lines) */}
            <line x1="35" y1="35" x2="35" y2="225" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5"/>
            <line x1="65" y1="35" x2="65" y2="225" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5"/>

            {/* 5. Right Casing Buckets (UP) - Manual entry, NO array loops */}
            <polygon points="60,65 70,65 68,75 62,75" fill="#64748b"/>
            <polygon points="60,105 70,105 68,115 62,115" fill="#64748b"/>
            <polygon points="60,145 70,145 68,155 62,155" fill="#64748b"/>
            <polygon points="60,185 70,185 68,195 62,195" fill="#64748b"/>

            {/* 6. Left Casing Buckets (DOWN) - Upside down shape, Manual entry */}
            <polygon points="32,65 38,65 40,75 30,75" fill="#64748b"/>
            <polygon points="32,105 38,105 40,115 30,115" fill="#64748b"/>
            <polygon points="32,145 38,145 40,155 30,155" fill="#64748b"/>
            <polygon points="32,185 38,185 40,195 30,195" fill="#64748b"/>

            {/* 7. Flow Directional Arrows */}
            <path d="M 65,48 L 60,56 L 70,56 Z" fill="#94a3b8"/>
            <path d="M 35,212 L 30,204 L 40,204 Z" fill="#94a3b8"/>

            {/* 8. Inspection Hatches */}
            <rect x="28" y="125" width="14" height="20" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
            <rect x="58" y="125" width="14" height="20" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* 9. Bottom Boot (Tail) */}
            <rect x="15" y="215" width="70" height="35" rx="6" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="50" cy="232.5" r="12" fill="#e2e8f0" stroke="#475569" strokeWidth="2"/>
            <circle cx="50" cy="232.5" r="4" fill="#1e293b"/>
            <rect x="40" y="222.5" width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2"/>

            {/* 10. Top Head (Drive) */}
            <rect x="15" y="10" width="70" height="35" rx="17.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="50" cy="27.5" r="12" fill="#e2e8f0" stroke="#475569" strokeWidth="2"/>
            <circle cx="50" cy="27.5" r="4" fill="#1e293b"/>

            {/* 11. Motor Drive on Top Head */}
            <rect x="45" y="4" width="10" height="6" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <rect x="35" y="-18" width="30" height="22" rx="4" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>

            {/* 12. Blinking Status Indicator Lamp */}
            <circle cx="50" cy="-22" r="4" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* 13. Equipment Label */}
            <text x="50" y="-40" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default FinalProductElevator;
