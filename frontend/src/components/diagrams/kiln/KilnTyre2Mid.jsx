import React from 'react';
const KilnTyreMid = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "KILN-TYRE-2", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Equipment Drop Shadow / Base Alignment Line */}
            <line x1="-10" y1="155" x2="210" y2="155" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4"/>

            {/* Main Kiln Body - Left Side */}
            <rect x="0" y="40" width="80" height="60" fill="#cbd5e1" stroke="#334155" strokeWidth="2"/>
            <line x1="0" y1="45" x2="80" y2="45" stroke="#f8fafc" strokeWidth="1" opacity="0.6"/>
            <line x1="0" y1="95" x2="80" y2="95" stroke="#94a3b8" strokeWidth="1"/>
            
            {/* Main Kiln Body - Right Side */}
            <rect x="120" y="40" width="80" height="60" fill="#cbd5e1" stroke="#334155" strokeWidth="2"/>
            <line x1="120" y1="45" x2="200" y2="45" stroke="#f8fafc" strokeWidth="1" opacity="0.6"/>
            <line x1="120" y1="95" x2="200" y2="95" stroke="#94a3b8" strokeWidth="1"/>

            {/* Kiln Tyre #2 (Mid) - The massive central support ring */}
            <rect x="80" y="30" width="40" height="80" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="3"/>
            <rect x="85" y="32" width="30" height="76" fill="#e2e8f0" stroke="none"/>
            <line x1="88" y1="30" x2="88" y2="110" stroke="#ffffff" strokeWidth="2" opacity="0.7"/>
            <line x1="108" y1="30" x2="108" y2="110" stroke="#64748b" strokeWidth="2" opacity="0.5"/>

            {/* Tyre Riding Pads (Inner Support Blocks) */}
            <rect x="75" y="45" width="5" height="8" fill="#1e293b"/>
            <rect x="75" y="65" width="5" height="8" fill="#1e293b"/>
            <rect x="75" y="85" width="5" height="8" fill="#1e293b"/>
            <rect x="120" y="45" width="5" height="8" fill="#1e293b"/>
            <rect x="120" y="65" width="5" height="8" fill="#1e293b"/>
            <rect x="120" y="85" width="5" height="8" fill="#1e293b"/>

            {/* Support Rollers (Trunnion Rollers) */}
            {/* Left Roller */}
            <circle cx="85" cy="115" r="14" fill="#64748b" stroke="#0f172a" strokeWidth="2"/>
            <circle cx="85" cy="115" r="4" fill="#1e293b"/>
            <path d="M 73 115 A 12 12 0 0 1 97 115" fill="none" stroke="#f8fafc" strokeWidth="1" opacity="0.4"/>

            {/* Right Roller */}
            <circle cx="115" cy="115" r="14" fill="#64748b" stroke="#0f172a" strokeWidth="2"/>
            <circle cx="115" cy="115" r="4" fill="#1e293b"/>
            <path d="M 103 115 A 12 12 0 0 1 127 115" fill="none" stroke="#f8fafc" strokeWidth="1" opacity="0.4"/>

            {/* Roller Base / Bearing Housing */}
            <rect x="65" y="125" width="70" height="15" rx="1" fill="#475569" stroke="#0f172a" strokeWidth="2"/>
            <rect x="70" y="130" width="60" height="4" fill="#1e293b" stroke="none"/>
            <polygon points="50,140 150,140 160,155 40,155" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
            <line x1="55" y1="145" x2="145" y2="145" stroke="#64748b" strokeWidth="1"/>

            {/* Lubrication Lines */}
            <path d="M 115 132 L 180 132 L 180 148" fill="none" stroke="#64748b" strokeWidth="2"/>
            <circle cx="180" cy="148" r="3" fill="#38bdf8" stroke="#0f172a" strokeWidth="1"/>
            
            <path d="M 85 132 L 20 132 L 20 148" fill="none" stroke="#64748b" strokeWidth="2"/>
            <circle cx="20" cy="148" r="3" fill="#38bdf8" stroke="#0f172a" strokeWidth="1"/>

            {/* Rotation Direction Indicator */}
            <path d="M 85 15 Q 100 5 115 15" fill="none" stroke={statusColor} strokeWidth="2"/>
            <polygon points="113,12 120,17 111,18" fill={statusColor}/>

            {/* DCS Equipment Label */}
            <text x="100" y="-10" textAnchor="middle" className="fill-text-secondary text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Main Status Indicator Light */}
            <circle cx="190" cy="-15" r="5" fill={statusColor} stroke="#0f172a" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* --- STRICT MANUAL DCS READOUTS --- */}
            {/* Readout 1: Shell Temperature */}
            <g transform="translate(0, 165)">
                <rect x="0" y="0" width="60" height="22" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <rect x="0" y="0" width="60" height="7" fill="#1e293b"/>
                <text x="30" y="5.5" textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace" fontWeight="bold">SHL TMP</text>
                <text x="30" y="17" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">385 °C</text>
            </g>

            {/* Readout 2: Tyre Slip Measurement */}
            <g transform="translate(70, 165)">
                <rect x="0" y="0" width="60" height="22" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <rect x="0" y="0" width="60" height="7" fill="#1e293b"/>
                <text x="30" y="5.5" textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace" fontWeight="bold">TYR SLP</text>
                <text x="30" y="17" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">12 mm</text>
            </g>

            {/* Readout 3: Roller Stress */}
            <g transform="translate(140, 165)">
                <rect x="0" y="0" width="60" height="22" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <rect x="0" y="0" width="60" height="7" fill="#1e293b"/>
                <text x="30" y="5.5" textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace" fontWeight="bold">RLR STR</text>
                <text x="30" y="17" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">2.4 MPa</text>
            </g>
        </g>);
};
export default KilnTyreMid;
