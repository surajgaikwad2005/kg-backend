import React from 'react';
const RotaryPacker8Spout = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "RP-800", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Label Box (Top) */}
            <rect x="60" y="-30" width="120" height="30" rx="4" fill="#f8fafc" stroke="#334155" strokeWidth="2"/>
            <text x="120" y="-9" textAnchor="middle" className="fill-text-primary text-[16px] font-mono font-black uppercase tracking-wider pointer-events-none select-none">
                {label}
            </text>

            {/* Outfeed Conveyor Belt (Bottom Right) */}
            <g>
                <rect x="120" y="215" width="130" height="30" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
                <rect x="120" y="217" width="130" height="26" fill="#475569"/>
                
                {/* Conveyor Rollers */}
                <rect x="130" y="215" width="4" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
                <rect x="150" y="215" width="4" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
                <rect x="170" y="215" width="4" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
                <rect x="190" y="215" width="4" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
                <rect x="210" y="215" width="4" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
                <rect x="230" y="215" width="4" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
                <rect x="250" y="215" width="4" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>

                {/* Cement Bags on Conveyor */}
                <rect x="155" y="219" width="28" height="22" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1"/>
                <line x1="160" y1="230" x2="178" y2="230" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2"/>
                
                <rect x="205" y="219" width="28" height="22" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1"/>
                <line x1="210" y1="230" x2="228" y2="230" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2"/>
            </g>

            {/* Main Base Framework (Static) */}
            <circle cx="120" cy="120" r="110" fill="#e2e8f0" stroke="#1e293b" strokeWidth="3"/>
            <circle cx="120" cy="120" r="100" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2"/>
            
            {/* Spill Grates */}
            <circle cx="120" cy="120" r="90" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4"/>
            <circle cx="120" cy="120" r="80" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4"/>
            <circle cx="120" cy="120" r="70" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4"/>

            {/* Rotating 8-Spout Assembly */}
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 120 120" to="360 120 120" dur="15s" repeatCount="indefinite"/>
                
                {/* Central Rotating Drum */}
                <circle cx="120" cy="120" r="60" fill="#cbd5e1" stroke="#334155" strokeWidth="3"/>
                <circle cx="120" cy="120" r="45" fill="none" stroke="#94a3b8" strokeWidth="2"/>

                {/* Spout 1 (0 deg) */}
                <g transform="rotate(0 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>

                {/* Spout 2 (45 deg) */}
                <g transform="rotate(45 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>

                {/* Spout 3 (90 deg) */}
                <g transform="rotate(90 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>

                {/* Spout 4 (135 deg) */}
                <g transform="rotate(135 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>

                {/* Spout 5 (180 deg) */}
                <g transform="rotate(180 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>

                {/* Spout 6 (225 deg) */}
                <g transform="rotate(225 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>

                {/* Spout 7 (270 deg) */}
                <g transform="rotate(270 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>

                {/* Spout 8 (315 deg) */}
                <g transform="rotate(315 120 120)">
                    <path d="M 108 60 L 112 25 L 128 25 L 132 60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="114" y="15" width="12" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
                    <circle cx="120" cy="20" r="3" fill="#0f172a"/>
                    <line x1="120" y1="60" x2="120" y2="25" stroke="#64748b" strokeWidth="1"/>
                </g>
            </g>

            {/* Static Feed Pipe (Incoming Left) */}
            <rect x="-10" y="105" width="105" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="90" y="95" width="10" height="50" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-15" y="100" width="10" height="40" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Flow Direction Arrow on Pipe */}
            <path d="M 30 120 L 50 120 M 50 120 L 45 115 M 50 120 L 45 125" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Feed Pipe Pressure Gauge */}
            <circle cx="50" cy="90" r="15" fill="#f8fafc" stroke="#334155" strokeWidth="2"/>
            <circle cx="50" cy="90" r="2" fill="#0f172a"/>
            <path d="M 50 90 L 58 85" stroke="#ef4444" strokeWidth="1.5"/>
            <line x1="50" y1="77" x2="50" y2="80" stroke="#64748b" strokeWidth="1"/>
            <line x1="61" y1="86" x2="58" y2="87" stroke="#64748b" strokeWidth="1"/>
            <line x1="39" y1="86" x2="42" y2="87" stroke="#64748b" strokeWidth="1"/>

            {/* Central Top Drop Connection */}
            <circle cx="120" cy="120" r="35" fill="#64748b" stroke="#1e293b" strokeWidth="3"/>
            <circle cx="120" cy="120" r="20" fill="#1e293b"/>
            <line x1="120" y1="105" x2="120" y2="135" stroke="#475569" strokeWidth="2" strokeDasharray="4 2"/>
            <line x1="105" y1="120" x2="135" y2="120" stroke="#475569" strokeWidth="2" strokeDasharray="4 2"/>

            {/* Electrical / Motor Control Panel (Top Right) */}
            <rect x="180" y="30" width="40" height="50" rx="4" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <rect x="185" y="55" width="30" height="20" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1"/>
            <line x1="188" y1="59" x2="212" y2="59" stroke="#94a3b8" strokeWidth="1"/>
            <line x1="188" y1="65" x2="212" y2="65" stroke="#94a3b8" strokeWidth="1"/>
            <line x1="188" y1="71" x2="212" y2="71" stroke="#94a3b8" strokeWidth="1"/>
            
            {/* Status Lights on Control Panel */}
            <circle cx="192" cy="42" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1"/>
            <circle cx="208" cy="42" r="4" fill={statusColor} stroke="#0f172a" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
            </circle>

        </g>);
};
export default RotaryPacker8Spout;
