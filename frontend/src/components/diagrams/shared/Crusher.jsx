'use client';
import React from 'react';
export default function Crusher({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 0.7;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    // Dynamic styles based on status
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    // Animation speeds
    const jawSpeed = isHazard ? "0.05s" : isWarning ? "0.1s" : "0.15s";
    const flywheelSpeed = isHazard ? "0.2s" : "0.5s";
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="crusherBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155"/>
                    <stop offset="50%" stopColor="#475569"/>
                    <stop offset="100%" stopColor="#1e293b"/>
                </linearGradient>

                <linearGradient id="pitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a"/>
                    <stop offset="100%" stopColor="#020617"/>
                </linearGradient>

                <filter id="crusherGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            {/* Status LED Indicator */}
            <circle cx="5" cy="5" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
            </circle>

            {/* 1. Main Crusher Frame */}
            <rect width="120" height="150" fill="url(#crusherBodyGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth={isNormal ? "1.5" : "3"} rx="2" className={isHazard ? "animate-pulse" : ""}/>

            {/* 2. Intake Hopper (Top) */}
            <path d="M 0 0 L 120 0 L 100 40 L 20 40 Z" fill="#1e293b" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1.5"/>

            {/* 3. Crushing Chamber (Internal) */}
            <g transform="translate(15, 50)">
                <rect width="90" height="85" fill="url(#pitGrad)" stroke="#1e293b" rx="1"/>

                {/* Fixed Jaw (Left) */}
                <rect x="5" y="5" width="8" height="75" fill="#334155" stroke="#475569"/>

                {/* Swing Jaw (Right - Animated Vibration) */}
                <g>
                    <path d="M 75 5 L 60 75 L 85 75 L 85 5 Z" fill={isHazard ? "#991b1b" : "#475569"} stroke={isNormal ? "#64748b" : statusColor} strokeWidth="1">
                        <animateTransform attributeName="transform" type="translate" values={isHazard ? "0 0; -8 0; 0 0" : "0 0; -4 0; 0 0"} dur={jawSpeed} repeatCount="indefinite"/>
                    </path>
                </g>

                {/* Crushing Particles (Rocks) */}
                {[...Array(5)].map((_, i) => (<circle key={i} r="2.5" fill={isHazard ? "#fca5a5" : "#94a3b8"} opacity="0.8">
                        <animate attributeName="cx" values="40;50;45" dur={`${0.3 + i * 0.1}s`} repeatCount="indefinite"/>
                        <animate attributeName="cy" values="20;80" dur={`${0.4 + i * 0.2}s`} repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0;1;0" dur={`${0.4 + i * 0.2}s`} repeatCount="indefinite"/>
                    </circle>))}
            </g>

            {/* 4. Eccentric Drive / Flywheel */}
            <circle cx="105" cy="130" r="15" fill="#0f172a" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1.5"/>
            <circle cx="105" cy="130" r="12" fill="none" stroke={statusColor} strokeWidth="2" strokeDasharray="4,2">
                <animateTransform attributeName="transform" type="rotate" from="0 105 130" to="360 105 130" dur={flywheelSpeed} repeatCount="indefinite"/>
            </circle>

            {/* 5. Live Data Readouts */}
            <g transform="translate(135, 10)">
                {[
            { label: 'Feed_Rate', val: isHazard ? '1200 t/h' : '850 t/h', color: isHazard ? 'fill-danger' : 'fill-success', y: 0 },
            { label: 'Motor_Amp', val: isHazard ? '580 A' : '420 A', color: isHazard ? 'fill-danger' : 'fill-info', y: 45 },
            { label: 'CSS_Setting', val: isWarning ? '110 mm' : '125 mm', color: isWarning ? 'fill-warning' : 'fill-warning', y: 90 }
        ].map((d, i) => (<g key={i} transform={`translate(0, ${d.y})`}>
                        <rect width="85" height="35" rx="4" fill="#000" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1"/>
                        <text x="42.5" y="14" textAnchor="middle" className="fill-text-secondary font-mono text-[8px] uppercase">{d.label}</text>
                        <text x="42.5" y="28" textAnchor="middle" className={`${d.color} font-mono text-[11px] font-bold`}>{d.val}</text>
                    </g>))}
            </g>

            {/* Equipment Name */}
            <text x="60" y="190" textAnchor="middle" className={`${textClassName} font-sans text-[20px] font-black uppercase tracking-tight`}>
                Primary Crusher
            </text>
        </g>);
}
