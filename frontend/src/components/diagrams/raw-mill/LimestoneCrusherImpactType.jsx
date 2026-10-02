import React from 'react';
const LimestoneCrusher = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CR-101", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Base Foundation & Mounts */}
            <rect x="10" y="145" width="180" height="15" fill="#475569" stroke="#1e293b" strokeWidth="3"/>
            <path d="M 20 160 L 180 160 L 190 175 L 10 175 Z" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <line x1="30" y1="160" x2="30" y2="175" stroke="#1e293b" strokeWidth="2"/>
            <line x1="170" y1="160" x2="170" y2="175" stroke="#1e293b" strokeWidth="2"/>

            {/* Outlet Chute (Rendered behind main housing) */}
            <rect x="60" y="120" width="80" height="20" fill="#64748b" stroke="#0f172a" strokeWidth="2"/>
            <path d="M 65 140 L 70 165 L 130 165 L 135 140 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2"/>
            <line x1="85" y1="140" x2="85" y2="165" stroke="#0f172a" strokeWidth="1"/>
            <line x1="115" y1="140" x2="115" y2="165" stroke="#0f172a" strokeWidth="1"/>

            {/* Main Lower Housing Block */}
            <rect x="30" y="70" width="140" height="50" fill="#cbd5e1" stroke="#0f172a" strokeWidth="3"/>
            
            {/* Heavy Duty Top Housing Polygon */}
            <path d="M 30 70 L 45 20 L 155 20 L 170 70 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="3"/>

            {/* Structural Housing Ribs */}
            <line x1="55" y1="20" x2="45" y2="70" stroke="#64748b" strokeWidth="2"/>
            <line x1="100" y1="20" x2="100" y2="70" stroke="#64748b" strokeWidth="2"/>
            <line x1="145" y1="20" x2="155" y2="70" stroke="#64748b" strokeWidth="2"/>
            <line x1="45" y1="70" x2="45" y2="120" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="155" y1="70" x2="155" y2="120" stroke="#94a3b8" strokeWidth="2"/>
            
            {/* Center Flange Joint line */}
            <line x1="28" y1="70" x2="172" y2="70" stroke="#0f172a" strokeWidth="4"/>

            {/* Inlet Chute Assembly */}
            <rect x="35" y="-15" width="40" height="5" fill="#475569" stroke="#0f172a" strokeWidth="2"/>
            <path d="M 45 20 L 35 -10 L 75 -10 L 80 20 Z" fill="#64748b" stroke="#0f172a" strokeWidth="2"/>
            <polygon points="37,-10 73,-10 65,-2 45,-2" fill="#1e293b"/>
            
            {/* Raw Limestone Entering */}
            <path d="M 45 -8 L 52 -10 L 55 -3 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
            <path d="M 58 -6 L 65 -12 L 68 -4 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1"/>

            {/* Inner Crusher Cutaway Reveal */}
            <circle cx="100" cy="70" r="44" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="100" cy="70" r="41" fill="#0f172a" stroke="#0f172a" strokeWidth="1"/>

            {/* Internal Breaker Plates / Anvils */}
            <path d="M 65 45 L 75 30" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round"/>
            <path d="M 135 45 L 125 30" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round"/>
            <path d="M 63 92 L 73 105" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round"/>
            <path d="M 137 92 L 127 105" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round"/>

            {/* Crushed Limestone Particles Falling */}
            <circle cx="80" cy="95" r="2.5" fill="#cbd5e1"/>
            <circle cx="88" cy="102" r="1.5" fill="#94a3b8"/>
            <circle cx="115" cy="92" r="2" fill="#cbd5e1"/>
            <circle cx="108" cy="104" r="1.5" fill="#f8fafc"/>

            {/* Dynamic Rotor Assembly (Hammers and Disk) */}
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 100 70" to="360 100 70" dur="0.8s" repeatCount="indefinite"/>
                
                {/* Central Rotor Disk */}
                <circle cx="100" cy="70" r="14" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

                {/* Hammer 1 (Top) */}
                <rect x="96" y="38" width="8" height="12" rx="1" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5"/>
                <line x1="100" y1="50" x2="100" y2="58" stroke="#cbd5e1" strokeWidth="3"/>

                {/* Hammer 2 (Bottom) */}
                <rect x="96" y="90" width="8" height="12" rx="1" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5"/>
                <line x1="100" y1="82" x2="100" y2="90" stroke="#cbd5e1" strokeWidth="3"/>

                {/* Hammer 3 (Left) */}
                <rect x="68" y="66" width="12" height="8" rx="1" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5"/>
                <line x1="80" y1="70" x2="88" y2="70" stroke="#cbd5e1" strokeWidth="3"/>

                {/* Hammer 4 (Right) */}
                <rect x="120" y="66" width="12" height="8" rx="1" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5"/>
                <line x1="112" y1="70" x2="120" y2="70" stroke="#cbd5e1" strokeWidth="3"/>

                {/* Rotor Shaft Bolt */}
                <circle cx="100" cy="70" r="4" fill="#f8fafc" stroke="#0f172a" strokeWidth="1"/>
            </g>

            {/* External Motor Drive Belt Guard */}
            <path d="M 100 70 L 175 115" stroke="#1e293b" strokeWidth="16" strokeLinecap="round"/>
            <path d="M 100 70 L 175 115" stroke="#eab308" strokeWidth="10" strokeLinecap="round"/>
            
            {/* Front Pulley Cover */}
            <circle cx="100" cy="70" r="10" fill="#334155" stroke="#0f172a" strokeWidth="2"/>

            {/* Main Drive Motor */}
            <rect x="160" y="95" width="35" height="50" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
            {/* Motor Cooling Fins */}
            <rect x="160" y="102" width="35" height="3" fill="#1e293b"/>
            <rect x="160" y="110" width="35" height="3" fill="#1e293b"/>
            <rect x="160" y="118" width="35" height="3" fill="#1e293b"/>
            <rect x="160" y="126" width="35" height="3" fill="#1e293b"/>
            <rect x="160" y="134" width="35" height="3" fill="#1e293b"/>
            {/* Motor Shaft Shield */}
            <circle cx="175" cy="115" r="10" fill="#475569" stroke="#0f172a" strokeWidth="2"/>

            {/* Status Indicator Panel (Mounted on housing side) */}
            <rect x="12" y="25" width="16" height="30" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
            <circle cx="20" cy="33" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="20" cy="47" r="4" fill={statusColor}/>

            {/* Equipment Tag / Label */}
            <text x="100" y="-30" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default LimestoneCrusher;
