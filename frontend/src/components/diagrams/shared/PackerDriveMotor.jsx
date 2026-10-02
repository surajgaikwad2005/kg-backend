import React from 'react';
const PackerDriveMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "M-3050-PKR", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    // Colors typically seen in DCS screens: Green for running/normal, Yellow for warn, Red for hazard/trip
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#22c55e';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Electrical Conduit Line */}
            <path d="M 77,0 L 77,-15 L 10,-15" fill="none" stroke="#64748b" strokeWidth="3"/>

            {/* Base Mounting Bracket */}
            <path d="M 45,80 L 35,95 L 125,95 L 115,80 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            
            {/* Base Mounting Bolts */}
            <circle cx="45" cy="90" r="2.5" fill="#0f172a"/>
            <circle cx="115" cy="90" r="2.5" fill="#0f172a"/>

            {/* Rear Motor Shield (Cooling Fan Cover) */}
            <path d="M 40,20 C 15,20 15,80 40,80 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Main Motor Frame (Stator Housing) */}
            <rect x="40" y="20" width="80" height="60" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>

            {/* Motor Frame Highlights (Top reflection) */}
            <line x1="42" y1="23" x2="118" y2="23" stroke="#ffffff" strokeWidth="2" opacity="0.8"/>

            {/* Cooling Fins */}
            <line x1="40" y1="28" x2="120" y2="28" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="40" y1="34" x2="120" y2="34" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="40" y1="40" x2="120" y2="40" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="40" y1="46" x2="120" y2="46" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="40" y1="54" x2="120" y2="54" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="40" y1="60" x2="120" y2="60" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="40" y1="66" x2="120" y2="66" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="40" y1="72" x2="120" y2="72" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Front Flange */}
            <rect x="120" y="15" width="12" height="70" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <line x1="120" y1="25" x2="132" y2="25" stroke="#1e293b" strokeWidth="2"/>
            <line x1="120" y1="75" x2="132" y2="75" stroke="#1e293b" strokeWidth="2"/>

            {/* Rotating Drive Shaft */}
            <rect x="132" y="42" width="28" height="16" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <line x1="140" y1="46" x2="155" y2="46" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="140" y1="54" x2="155" y2="54" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Carousel Coupling Gear */}
            <rect x="160" y="35" width="16" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="2" rx="2"/>
            <line x1="165" y1="35" x2="165" y2="65" stroke="#475569" strokeWidth="1.5"/>
            <line x1="171" y1="35" x2="171" y2="65" stroke="#475569" strokeWidth="1.5"/>

            {/* Terminal Box (Electrical connection point) */}
            <rect x="65" y="0" width="24" height="20" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="77" cy="10" r="3" fill="#1e293b"/>

            {/* Standard Motor Symbol Plate (Masks the center of the cooling fins) */}
            <circle cx="80" cy="50" r="15" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <text x="80" y="55" textAnchor="middle" className="fill-text-primary text-[14px] font-black pointer-events-none select-none">
                M
            </text>

            {/* Dynamic Status Indicator Lamp */}
            <circle cx="102" cy="10" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Tag/Label */}
            <text x="80" y="-25" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default PackerDriveMotor;
