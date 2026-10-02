import React from 'react';
const GrateClinkerCooler = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CL-COOLER-01", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Inlet Chute (Hot Side) */}
            <rect x="15" y="-20" width="40" height="20" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="10" y="-25" width="50" height="5" fill="#334155"/>
            
            {/* Exhaust Air Stack (Tertiary Air) */}
            <rect x="190" y="-30" width="30" height="30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="185" y="-35" width="40" height="5" fill="#334155"/>
            
            {/* Outlet Chute (Cold Side) */}
            <rect x="185" y="90" width="40" height="30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="180" y="120" width="50" height="5" fill="#334155"/>

            {/* Main Chamber - Status Color dynamically applied to stroke */}
            <rect x="0" y="0" width="240" height="90" rx="4" fill="#f8fafc" stroke={statusColor} strokeWidth="3"/>

            {/* Inspection Hatches */}
            <rect x="30" y="10" width="20" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5"/>
            <rect x="90" y="10" width="20" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5"/>
            <rect x="150" y="10" width="20" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5"/>

            {/* Stepped Grate Bed */}
            <path d="M 0 45 L 60 45 L 60 55 L 120 55 L 120 65 L 180 65 L 180 75 L 240 75" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>

            {/* Under-Grate Air Compartments */}
            <line x1="60" y1="55" x2="60" y2="90" stroke="#1e293b" strokeWidth="2"/>
            <line x1="120" y1="65" x2="120" y2="90" stroke="#1e293b" strokeWidth="2"/>
            <line x1="180" y1="75" x2="180" y2="90" stroke="#1e293b" strokeWidth="2"/>

            {/* Clinker Material Flow Simulation (Hot to Cold) */}
            <polygon points="15,35 55,35 55,43 15,43" fill="#ea580c" opacity="0.85"/>
            <polygon points="65,45 115,45 115,53 65,53" fill="#f59e0b" opacity="0.85"/>
            <polygon points="125,55 175,55 175,63 125,63" fill="#eab308" opacity="0.85"/>
            <polygon points="185,65 235,65 235,73 185,73" fill="#94a3b8" opacity="0.85"/>

            {/* Cooling Air Flow Arrows */}
            <path d="M 30 80 L 30 55 M 26 59 L 30 55 L 34 59" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 90 85 L 90 65 M 86 69 L 90 65 L 94 69" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 150 88 L 150 75 M 146 79 L 150 75 L 154 79" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 210 88 L 210 82 M 206 86 L 210 82 L 214 86" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinejoin="round"/>

            {/* Exhaust Air Flow Arrow */}
            <path d="M 205 -5 L 205 -20 M 201 -16 L 205 -20 L 209 -16" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round"/>

            {/* Under-Grate Cooling Fan 1 */}
            <rect x="22.5" y="90" width="15" height="15" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="30" cy="120" r="15" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 30 105 L 30 135 M 15 120 L 45 120" fill="none" stroke="#64748b" strokeWidth="2"/>

            {/* Under-Grate Cooling Fan 2 */}
            <rect x="82.5" y="90" width="15" height="15" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="90" cy="120" r="15" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 90 105 L 90 135 M 75 120 L 105 120" fill="none" stroke="#64748b" strokeWidth="2"/>

            {/* Under-Grate Cooling Fan 3 */}
            <rect x="142.5" y="90" width="15" height="15" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="150" cy="120" r="15" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 150 105 L 150 135 M 135 120 L 165 120" fill="none" stroke="#64748b" strokeWidth="2"/>

            {/* Under-Grate Cooling Fan 4 */}
            <rect x="202.5" y="90" width="15" height="15" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="210" cy="120" r="15" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 210 105 L 210 135 M 195 120 L 225 120" fill="none" stroke="#64748b" strokeWidth="2"/>

            {/* Equipment Label */}
            <text x="100" y="-15" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Dynamic Status LED Indicator */}
            <circle cx="240" cy="-15" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default GrateClinkerCooler;
