'use client';
import React from 'react';
export default function RawMill({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 0.7;
    // Helper to determine colors and speeds based on status
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textColor = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="millBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155"/>
                    <stop offset="50%" stopColor="#475569"/>
                    <stop offset="100%" stopColor="#1e293b"/>
                </linearGradient>

                <radialGradient id="chamberGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e293b"/>
                    <stop offset="100%" stopColor="#0f172a"/>
                </radialGradient>

                {/* Glow for Warning/Hazard */}
                <filter id="statusGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            {/* --- DYNAMIC STATUS INDICATORS --- */}
            
            {/* Pulsing Aura for Warning/Hazard */}
            {!isNormal && (<circle cx="5" cy="5" r="10" fill={statusColor} opacity="0.3" filter="url(#statusGlow)">
                    <animate attributeName="r" values="8;15;8" dur={isHazard ? "0.8s" : "2s"} repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0;0.4;0" dur={isHazard ? "0.8s" : "2s"} repeatCount="indefinite"/>
                </circle>)}

            {/* Status LED Indicator */}
            <circle cx="5" cy="5" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.5s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            {/* 1. Main Mill Structure */}
            <rect width="130" height="200" fill="url(#millBodyGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth={isNormal ? "1.5" : "3"} rx="4" className={isHazard ? "animate-pulse" : ""}/>

            {/* 2. Top Separator Section (Spinning Blades) */}
            <g transform="translate(15, 10)">
                <rect width="100" height="40" fill="#0f172a" stroke="#334155" rx="2"/>
                <g transform="translate(50, 20)">
                    {[0, 45, 90, 135].map((angle) => (<rect key={angle} x="-35" y="-1" width="70" height="2" fill={isHazard ? "#ef4444" : "#475569"} opacity="0.6" transform={`rotate(${angle})`}>
                            <animateTransform attributeName="transform" type="rotate" from={`${angle} 0 0`} to={`${angle + 360} 0 0`} dur={isHazard ? "1s" : isWarning ? "2s" : "4s"} repeatCount="indefinite"/>
                        </rect>))}
                    <circle r="6" fill="#1e293b" stroke="#475569"/>
                </g>
            </g>

            {/* 3. Internal Grinding Rollers (Vibration animation) */}
            <g transform="translate(15, 70)">
                <rect width="100" height="110" fill="url(#chamberGrad)" stroke="#1e293b" rx="2"/>

                {/* Roller 1 */}
                <g transform="translate(25, 60)">
                    <ellipse cx="0" cy="0" rx="15" ry="25" fill="#334155" stroke="#475569"/>
                    <animateTransform attributeName="transform" type="translate" values={isHazard ? "25 60; 28 63; 25 60" : "25 60; 26 61; 25 60"} dur={isHazard ? "0.05s" : "0.15s"} repeatCount="indefinite"/>
                </g>

                {/* Roller 2 */}
                <g transform="translate(75, 60)">
                    <ellipse cx="0" cy="0" rx="15" ry="25" fill="#334155" stroke="#475569"/>
                    <animateTransform attributeName="transform" type="translate" values={isHazard ? "75 60; 72 57; 75 60" : "75 60; 74 59; 75 60"} dur={isHazard ? "0.07s" : "0.18s"} repeatCount="indefinite"/>
                </g>
            </g>

            {/* 4. Bottom Motor Drive */}
            <rect x="35" y="200" width="60" height="12" fill="#0f172a" stroke={isNormal ? "#334155" : statusColor}/>

            {/* 5. Live Data Readouts */}
            <g transform="translate(145, 10)">
                {[
            { label: 'Diff_Press', val: isHazard ? '68.2 mB' : '42.5 mB', color: isHazard ? 'fill-danger' : 'fill-success', y: 0 },
            { label: 'Motor_Load', val: isWarning ? '3800 kW' : '3200 kW', color: isWarning ? 'fill-warning' : 'fill-info', y: 45 },
            { label: 'Exit_Temp', val: '85.4°C', color: 'fill-warning', y: 90 }
        ].map((d, i) => (<g key={i} transform={`translate(0, ${d.y})`}>
                        <rect width="90" height="35" rx="4" fill="#000" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1"/>
                        <text x="45" y="14" textAnchor="middle" className="fill-text-secondary font-mono text-[8px] uppercase">{d.label}</text>
                        <text x="45" y="28" textAnchor="middle" className={`${d.color} font-mono text-[11px] font-bold`}>{d.val}</text>
                    </g>))}
            </g>

            {/* Equipment Name */}
            <text x="65" y="240" textAnchor="middle" className={`${textColor} font-sans text-[20px] font-black uppercase tracking-tight`}>
                Raw Mill VRM
            </text>
        </g>);
}
