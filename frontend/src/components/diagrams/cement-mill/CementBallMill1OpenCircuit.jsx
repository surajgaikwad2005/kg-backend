import React from 'react';
const CementBallMill = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "MILL-101", onPointerDown, }) => {
    // Pre-calculate status color to strictly adhere to JSX variable rules
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* FOUNDATIONS */}
            <rect x="40" y="110" width="30" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
            <rect x="210" y="110" width="30" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
            <rect x="150" y="120" width="40" height="10" fill="#334155" stroke="#0f172a" strokeWidth="2"/>

            {/* TRUNNION BEARINGS */}
            <rect x="45" y="80" width="20" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="215" y="80" width="20" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="55" cy="95" r="4" fill="#94a3b8"/>
            <circle cx="225" cy="95" r="4" fill="#94a3b8"/>

            {/* MAIN ROTATING DRUM */}
            <rect x="65" y="60" width="150" height="50" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="3"/>
            
            {/* DRUM INTERNAL DETAILS (Hatched lines indicating lining) */}
            <path d="M 75,60 L 75,110 M 90,60 L 90,110 M 105,60 L 105,110 M 120,60 L 120,110 M 135,60 L 135,110 M 150,60 L 150,110 M 165,60 L 165,110" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" opacity="0.8"/>
            
            {/* STEEL GRINDING BALLS (Manual entries per rule #1) */}
            <circle cx="75" cy="102" r="3" fill="#64748b"/>
            <circle cx="83" cy="105" r="3" fill="#64748b"/>
            <circle cx="91" cy="101" r="3" fill="#64748b"/>
            <circle cx="99" cy="104" r="3" fill="#64748b"/>
            <circle cx="107" cy="102" r="3" fill="#64748b"/>
            <circle cx="115" cy="106" r="3" fill="#64748b"/>
            <circle cx="123" cy="103" r="3" fill="#64748b"/>
            <circle cx="131" cy="101" r="3" fill="#64748b"/>
            <circle cx="139" cy="105" r="3" fill="#64748b"/>
            <circle cx="147" cy="103" r="3" fill="#64748b"/>
            <circle cx="155" cy="106" r="3" fill="#64748b"/>
            <circle cx="163" cy="102" r="3" fill="#64748b"/>

            {/* GIRTH GEAR & PINION DRIVE */}
            <rect x="175" y="55" width="16" height="60" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
            <path d="M 175,58 L 191,58 M 175,64 L 191,64 M 175,70 L 191,70 M 175,76 L 191,76 M 175,82 L 191,82 M 175,88 L 191,88 M 175,94 L 191,94 M 175,100 L 191,100 M 175,106 L 191,106 M 175,112 L 191,112" stroke="#1e293b" strokeWidth="1"/>
            <rect x="175" y="105" width="16" height="12" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="155" y="100" width="20" height="20" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* FEED CHUTE (INLET) */}
            <polygon points="35,20 65,20 55,80 45,80" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="40" y="0" width="20" height="20" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 50,5 L 50,15 L 45,10 M 50,15 L 55,10" fill="none" stroke="#1e293b" strokeWidth="2"/>

            {/* DISCHARGE CASING (OUTLET) */}
            <rect x="235" y="50" width="25" height="60" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="240" y="110" width="15" height="30" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 247.5,115 L 247.5,135 L 242.5,130 M 247.5,135 L 252.5,130" fill="none" stroke="#1e293b" strokeWidth="2"/>

            {/* ROTATION INDICATOR */}
            <path d="M 125,75 L 145,75 L 140,70 M 145,75 L 140,80" stroke="#64748b" strokeWidth="2" fill="none"/>
            <path d="M 145,95 L 125,95 L 130,90 M 125,95 L 130,100" stroke="#64748b" strokeWidth="2" fill="none"/>

            {/* MAIN EQUIPMENT LABEL */}
            <text x="140" y="-15" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* STATUS ALERT LIGHT (Directly relies on {statusColor} rule) */}
            <circle cx="140" cy="15" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>
            <rect x="130" y="21" width="20" height="4" fill="#334155"/>

            {/* DCS DATA READOUTS - BRG T-NDE */}
            <g transform="translate(0, 145)">
                <rect x="10" y="0" width="60" height="24" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <rect x="10" y="0" width="4" height="24" fill={statusColor}/>
                <text x="42" y="-4" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="sans-serif" className="font-bold">BRG T-NDE</text>
                <text x="42" y="16" fill="#4ade80" fontSize="12" textAnchor="middle" fontFamily="monospace" className="font-bold">48 °C</text>
            </g>

            {/* DCS DATA READOUTS - MOTOR AMPS */}
            <g transform="translate(110, 145)">
                <rect x="10" y="0" width="60" height="24" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <rect x="10" y="0" width="4" height="24" fill={statusColor}/>
                <text x="42" y="-4" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="sans-serif" className="font-bold">MOTOR PWR</text>
                <text x="42" y="16" fill="#4ade80" fontSize="12" textAnchor="middle" fontFamily="monospace" className="font-bold">185 A</text>
            </g>

            {/* DCS DATA READOUTS - BRG T-DE */}
            <g transform="translate(220, 145)">
                <rect x="10" y="0" width="60" height="24" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <rect x="10" y="0" width="4" height="24" fill={statusColor}/>
                <text x="42" y="-4" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="sans-serif" className="font-bold">BRG T-DE</text>
                <text x="42" y="16" fill="#4ade80" fontSize="12" textAnchor="middle" fontFamily="monospace" className="font-bold">53 °C</text>
            </g>
        </g>);
};
export default CementBallMill;
