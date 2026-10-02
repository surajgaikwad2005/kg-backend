'use client';
import React from 'react';
export default function Kiln({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 0.7;
    const isHazard = status === 'hazard';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="kilnShellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155"/>
                    <stop offset="50%" stopColor="#64748b"/>
                    <stop offset="100%" stopColor="#1e293b"/>
                </linearGradient>

                {/* Glow for Hazard Alert */}
                <filter id="hazardGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>

                <filter id="heatHazeFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="1">
                        <animate attributeName="seed" from="1" to="100" dur="2s" repeatCount="indefinite"/>
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" scale="4"/>
                </filter>
            </defs>

            {/* --- DYNAMIC HAZARD OVERLAY --- */}
            {isHazard && (<g transform="translate(380, -40)">
                    <circle r="15" className="fill-danger/30" filter="url(#hazardGlow)">
                        <animate attributeName="opacity" values="0;0.7;0" dur="1s" repeatCount="indefinite"/>
                        <animate attributeName="r" values="12;22;12" dur="1s" repeatCount="indefinite"/>
                    </circle>
                    <path d="M 0 -10 L 10 8 L -10 8 Z" className="fill-danger stroke-white stroke-[1.5]">
                        <animate attributeName="fill" values="#dc2626;#fca5a5;#dc2626" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                    <rect x="-1" y="-4" width="2" height="6" fill="white"/>
                    <circle cx="0" cy="5" r="1.2" fill="white"/>
                </g>)}

            {/* DYNAMIC STATUS LED */}
            <circle cx="5" cy="-25" r="6" className={isHazard ? "fill-danger" : "fill-success"}>
                <animate attributeName="opacity" values={isHazard ? "1;0.2;1" : "1;0.4;1"} dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
            </circle>

            {/* 1. Support Piers */}
            <g opacity="0.8">
                <rect x="60" y="55" width="30" height="25" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
                <rect x="360" y="55" width="30" height="25" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
            </g>

            {/* 2. Main Kiln Body */}
            <g transform="rotate(-2, 225, 30)">
                <rect width="450" height="75" fill="url(#kilnShellGrad)" stroke={isHazard ? "#ef4444" : "#475569"} // Red border if hazard
     strokeWidth={isHazard ? "3" : "2"} rx="2" className={isHazard ? "animate-pulse" : ""}/>
                
                {/* Internal Flow */}
                <line x1="10" y1="60" x2="440" y2="60" stroke={isHazard ? "#ef4444" : "#d97706"} strokeWidth="4" strokeDasharray="10, 15" opacity="0.6">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur={isHazard ? "2s" : "6s"} repeatCount="indefinite"/>
                </line>

                {/* Girth Gear */}
                <g transform="translate(200, -5)">
                    <rect width="30" height="85" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5"/>
                    <rect x="5" width="6" height="85" fill="#475569" opacity="0.4">
                        <animateTransform attributeName="transform" type="translate" from="-5 0" to="20 0" dur={isHazard ? "0.3s" : "1s"} repeatCount="indefinite"/>
                    </rect>
                </g>
            </g>

            {/* 3. The Flame */}
            <g transform="translate(440, 35)" filter="url(#heatHazeFilter)">
                <path d="M 0 0 Q -60 0 -150 0 L -120 -15 Q -60 -30 0 0" fill={isHazard ? "#b91c1c" : "#ea580c"} opacity="0.8">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="0.3s" repeatCount="indefinite"/>
                </path>
                <rect x="0" y="-10" width="60" height="20" fill="#0f172a" stroke="#334155" strokeWidth="1.5"/>
            </g>

            {/* 4. Live Data Readouts */}
            <g transform="translate(460, -20)">
                {[
            { label: 'BZ_Temp', val: isHazard ? '1680°C' : '1452°C', color: isHazard ? 'fill-danger' : 'fill-warning', y: 0 },
            { label: 'Kiln_Speed', val: '3.4 RPM', color: 'fill-success', y: 45 },
            { label: 'Torque', val: isHazard ? '92%' : '65%', color: isHazard ? 'fill-danger' : 'fill-info', y: 90 }
        ].map((d, i) => (<g key={i} transform={`translate(0, ${d.y})`}>
                        <rect width="85" height="35" rx="4" fill="#000" stroke={isHazard ? "#ef4444" : "#334155"} strokeWidth="1"/>
                        <text x="42.5" y="14" textAnchor="middle" className="fill-text-secondary font-mono text-[8px] uppercase">{d.label}</text>
                        <text x="42.5" y="28" textAnchor="middle" className={`${d.color} font-mono text-[11px] font-bold`}>{d.val}</text>
                    </g>))}
            </g>

            <text x="225" y="140" textAnchor="middle" className={`${isHazard ? 'fill-danger' : 'fill-text-primary'} font-sans text-[24px] font-black uppercase tracking-tight`}>
                Rotary Kiln
            </text>
        </g>);
}
