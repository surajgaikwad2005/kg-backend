import React from 'react';
const CoolerVentFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CVF-2", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Status Outer Glow / Indicator */}
            <circle cx="60" cy="55" r="48" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.8"/>

            {/* Duct Flange (Top) */}
            <rect x="25" y="-30" width="70" height="5" fill="#334155" stroke="#1e293b" strokeWidth="1"/>
            
            {/* Exhaust Duct */}
            <rect x="35" y="-25" width="50" height="40" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Exhaust Airflow Arrow */}
            <path d="M 60,-18 L 65,-8 L 62,-8 L 62,2 L 58,2 L 58,-8 L 55,-8 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>

            {/* Motor Base Box */}
            <rect x="40" y="90" width="40" height="30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Motor Mounting Feet */}
            <rect x="30" y="120" width="60" height="6" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Motor Heat Fins / Vents */}
            <line x1="45" y1="98" x2="75" y2="98" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
            <line x1="45" y1="104" x2="75" y2="104" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
            <line x1="45" y1="110" x2="75" y2="110" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>

            {/* Main Fan Housing */}
            <circle cx="60" cy="55" r="45" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Inner Fan Housing Edge */}
            <circle cx="60" cy="55" r="38" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>

            {/* Rotating Fan Blades */}
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 60 55" to="360 60 55" dur="3s" repeatCount="indefinite"/>
                {/* Top Blade */}
                <path d="M 57,55 L 63,55 L 68,22 L 52,22 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round"/>
                {/* Right Blade */}
                <path d="M 60,52 L 60,58 L 93,63 L 93,47 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round"/>
                {/* Bottom Blade */}
                <path d="M 57,55 L 63,55 L 68,88 L 52,88 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round"/>
                {/* Left Blade */}
                <path d="M 60,52 L 60,58 L 27,63 L 27,47 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round"/>
            </g>

            {/* Fan Guard / Grill Rings */}
            <circle cx="60" cy="55" r="40" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.6"/>
            <circle cx="60" cy="55" r="28" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.6"/>
            <circle cx="60" cy="55" r="16" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.6"/>
            
            {/* Fan Guard / Grill Spokes */}
            <line x1="15" y1="55" x2="105" y2="55" stroke="#64748b" strokeWidth="1.5" opacity="0.6"/>
            <line x1="60" y1="10" x2="60" y2="100" stroke="#64748b" strokeWidth="1.5" opacity="0.6"/>
            <line x1="28" y1="23" x2="92" y2="87" stroke="#64748b" strokeWidth="1.5" opacity="0.6"/>
            <line x1="28" y1="87" x2="92" y2="23" stroke="#64748b" strokeWidth="1.5" opacity="0.6"/>

            {/* Center Motor Hub */}
            <circle cx="60" cy="55" r="12" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="60" cy="55" r="4" fill="#94a3b8"/>

            {/* Side Control Box Connection Wire */}
            <path d="M 105,55 L 98,55" fill="none" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Side Control Box */}
            <rect x="105" y="43" width="22" height="24" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Status LED with constant pulsing */}
            <circle cx="116" cy="55" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Label */}
            <text x="60" y="-40" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default CoolerVentFan;
