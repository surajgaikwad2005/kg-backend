import React from 'react';
const KilnMainGearbox = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "GBX-101", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Mounting Base Plate */}
            <path d="M 5 100 L 155 100 L 155 106 L 5 106 Z" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Lube Oil Pump & Lines (Background Layer) */}
            <path d="M 60 113 L 110 113 L 110 95" fill="none" stroke="#eab308" strokeWidth="2.5"/>
            <path d="M 110 50 L 110 30 L 145 30 L 145 45" fill="none" stroke="#eab308" strokeWidth="2.5"/>

            {/* Stage 1 Casing (Input - High Speed) */}
            <path d="M 20 40 L 70 40 L 70 100 L 20 100 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Stage 2 Casing (Output - High Torque) */}
            <path d="M 70 10 L 140 10 L 140 100 L 70 100 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Casing Structural Ribs */}
            <line x1="45" y1="40" x2="45" y2="100" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="90" y1="10" x2="90" y2="100" stroke="#e2e8f0" strokeWidth="2"/>
            <line x1="115" y1="10" x2="115" y2="100" stroke="#e2e8f0" strokeWidth="2"/>

            {/* Input Shaft & Coupling */}
            <rect x="-10" y="64" width="30" height="12" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-20" y="58" width="10" height="24" fill="#334155" stroke="#1e293b" strokeWidth="2" rx="2"/>
            <line x1="-20" y1="70" x2="-10" y2="70" stroke="#0f172a" strokeWidth="1" strokeDasharray="2,2"/>

            {/* Output Shaft & Main Girth Coupling */}
            <rect x="140" y="45" width="35" height="30" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="175" y="25" width="15" height="70" fill="#334155" stroke="#1e293b" strokeWidth="2" rx="2"/>
            <line x1="140" y1="60" x2="175" y2="60" stroke="#0f172a" strokeWidth="1" strokeDasharray="4,4"/>

            {/* Internal Gears (Dashed Symbolism) */}
            <circle cx="45" cy="70" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,2"/>
            <circle cx="75" cy="60" r="22" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,2"/>
            <circle cx="110" cy="60" r="32" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,2"/>

            {/* Bearing Housings (External Bumps) */}
            <circle cx="20" cy="70" r="10" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="140" cy="60" r="18" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* Heavy Duty Bolts (Stage 1) */}
            <circle cx="30" cy="45" r="1.5" fill="#1e293b"/>
            <circle cx="60" cy="45" r="1.5" fill="#1e293b"/>
            <circle cx="30" cy="95" r="1.5" fill="#1e293b"/>
            <circle cx="60" cy="95" r="1.5" fill="#1e293b"/>

            {/* Heavy Duty Bolts (Stage 2) */}
            <circle cx="80" cy="15" r="1.5" fill="#1e293b"/>
            <circle cx="130" cy="15" r="1.5" fill="#1e293b"/>
            <circle cx="80" cy="95" r="1.5" fill="#1e293b"/>
            <circle cx="130" cy="95" r="1.5" fill="#1e293b"/>

            {/* Auxiliary Lube Oil Pump */}
            <rect x="40" y="106" width="24" height="14" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" rx="1"/>
            <circle cx="52" cy="113" r="6" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="52" cy="113" r="2" fill="#1e293b"/>

            {/* External Sensors (Temp & Vib) */}
            <rect x="35" y="40" width="6" height="12" fill="#ef4444" stroke="#1e293b" strokeWidth="1"/>
            <rect x="105" y="10" width="6" height="12" fill="#ef4444" stroke="#1e293b" strokeWidth="1"/>
            <rect x="125" y="10" width="8" height="8" fill="#3b82f6" stroke="#1e293b" strokeWidth="1"/>

            {/* Sensor Wiring Conduits */}
            <path d="M 38 40 L 38 25 L 60 25" fill="none" stroke="#64748b" strokeWidth="1.5"/>
            <path d="M 108 10 L 108 -5 L 60 -5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
            <path d="M 129 10 L 129 -5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
            
            {/* Junction Box */}
            <rect x="45" y="-12" width="15" height="40" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" rx="2"/>

            {/* Data Readout 1: Input Bearing Temperature */}
            <g transform="translate(-15, -35)">
                <rect width="42" height="18" fill="#0f172a" rx="2" stroke="#334155" strokeWidth="1"/>
                <text x="21" y="13" textAnchor="middle" fill="#10b981" className="text-[10px] font-mono font-bold">68.2</text>
                <line x1="21" y1="18" x2="35" y2="40" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2"/>
            </g>

            {/* Data Readout 2: Output Bearing Temperature */}
            <g transform="translate(70, -35)">
                <rect width="42" height="18" fill="#0f172a" rx="2" stroke="#334155" strokeWidth="1"/>
                <text x="21" y="13" textAnchor="middle" fill="#10b981" className="text-[10px] font-mono font-bold">74.5</text>
                <line x1="21" y1="18" x2="35" y2="45" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2"/>
            </g>

            {/* Data Readout 3: Gear Casing Vibration */}
            <g transform="translate(130, -35)">
                <rect width="42" height="18" fill="#0f172a" rx="2" stroke="#334155" strokeWidth="1"/>
                <text x="21" y="13" textAnchor="middle" fill="#f59e0b" className="text-[10px] font-mono font-bold">2.1</text>
                <line x1="21" y1="18" x2="-1" y2="45" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2"/>
            </g>

            {/* Equipment Label */}
            <text x="80" y="145" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Dynamic Status Indicator Core */}
            <circle cx="185" cy="0" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* Dynamic Status Highlight Border on the Main Coupling */}
            <rect x="175" y="25" width="15" height="70" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" rx="2" pointerEvents="none">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.2s" repeatCount="indefinite"/>
            </rect>
        </g>);
};
export default KilnMainGearbox;
