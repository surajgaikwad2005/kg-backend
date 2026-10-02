import React from 'react';
const KilnBurner = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "KB-100", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* --- Data Readout Panels (Manual Implementation) --- */}
            {/* Readout 1: Air */}
            <rect x="25" y="-55" width="40" height="18" fill="#1e293b" rx="2" stroke="#334155" strokeWidth="1"/>
            <text x="45" y="-42" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">AIR</text>
            <path d="M 45,-37 L 45,-15" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2"/>

            {/* Readout 2: Fuel */}
            <rect x="75" y="-55" width="40" height="18" fill="#1e293b" rx="2" stroke="#334155" strokeWidth="1"/>
            <text x="95" y="-42" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">FUEL</text>
            <path d="M 95,-37 L 95,50" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2"/>

            {/* Readout 3: Ignition/Temp */}
            <rect x="125" y="-55" width="40" height="18" fill="#1e293b" rx="2" stroke="#334155" strokeWidth="1"/>
            <text x="145" y="-42" fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">IGN</text>
            <path d="M 145,-37 L 145,20" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2"/>

            {/* --- Structural Equipment --- */}
            
            {/* Back Mount Plate */}
            <rect x="0" y="10" width="12" height="60" fill="#475569" stroke="#0f172a" strokeWidth="2" rx="1"/>
            
            {/* Primary Air Inlet (Top) */}
            <path d="M 30,25 L 30,-10 L 50,-10 L 50,25 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <rect x="25" y="-15" width="30" height="6" fill="#64748b" stroke="#1e293b" strokeWidth="2" rx="1"/>
            <circle cx="30" cy="-12" r="1.5" fill="#0f172a"/>
            <circle cx="50" cy="-12" r="1.5" fill="#0f172a"/>

            {/* Fuel Inlet (Bottom angled) */}
            <path d="M 80,55 L 80,85 L 95,85 L 95,55 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="75" y="85" width="25" height="6" fill="#64748b" stroke="#1e293b" strokeWidth="2" rx="1"/>
            <circle cx="80" cy="88" r="1.5" fill="#0f172a"/>
            <circle cx="95" cy="88" r="1.5" fill="#0f172a"/>
            {/* Fuel Pipe Joint Detail */}
            <rect x="77" y="65" width="21" height="4" fill="#475569" stroke="#1e293b" strokeWidth="1"/>

            {/* Main Burner Cylinder */}
            <rect x="12" y="25" width="158" height="30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            {/* Burner Detail Lines (Internal Pipe Indication) */}
            <line x1="12" y1="33" x2="170" y2="33" stroke="#94a3b8" strokeWidth="1" opacity="0.5"/>
            <line x1="12" y1="47" x2="170" y2="47" stroke="#94a3b8" strokeWidth="1" opacity="0.5"/>
            
            {/* Assembly Joints on Main Cylinder */}
            <rect x="60" y="23" width="6" height="34" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" rx="1"/>
            <rect x="115" y="23" width="6" height="34" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" rx="1"/>

            {/* Kiln Refractory Wall Section (Cutaway) */}
            <rect x="140" y="-10" width="20" height="100" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
            {/* Wall Texture Lines */}
            <path d="M 140,10 L 160,20 M 140,70 L 160,80 M 140,40 L 160,50" stroke="#1e293b" strokeWidth="2" opacity="0.4"/>
            {/* Cutout hole for burner pipe */}
            <rect x="135" y="20" width="30" height="40" fill="#0f172a" opacity="0.3"/>

            {/* Burner Nozzle Tip */}
            <polygon points="170,25 185,30 185,50 170,55" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <line x1="185" y1="35" x2="185" y2="45" stroke="#0f172a" strokeWidth="2"/>

            {/* --- Combustion / Flame Area --- */}
            {/* Outer Flame Envelope colored by status */}
            <path d="M 185,40 Q 210,15 250,40 Q 210,65 185,40" fill={statusColor} opacity="0.5" stroke={statusColor} strokeWidth="2">
                <animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.8s" repeatCount="indefinite"/>
                <animate attributeName="d" values="M 185,40 Q 210,15 250,40 Q 210,65 185,40; M 185,40 Q 215,20 260,40 Q 215,60 185,40; M 185,40 Q 210,15 250,40 Q 210,65 185,40" dur="0.8s" repeatCount="indefinite"/>
            </path>
            
            {/* Inner Core Flame colored by status */}
            <path d="M 185,40 Q 200,28 220,40 Q 200,52 185,40" fill={statusColor} opacity="0.9">
                <animate attributeName="opacity" values="1;0.6;1" dur="0.4s" repeatCount="indefinite"/>
            </path>

            {/* --- Labels and Indicators --- */}
            {/* Equipment Tag Plate */}
            <rect x="40" y="100" width="80" height="22" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" rx="3"/>
            <text x="80" y="115" textAnchor="middle" className="fill-text-secondary text-[14px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Status Indicator LED (Base Plate) */}
            <rect x="-6" y="15" width="8" height="15" fill="#334155" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="-2" cy="22.5" r="3" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
            </circle>

        </g>);
};
export default KilnBurner;
