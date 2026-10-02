'use client';
import React from 'react';
export default function Preheater({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 0.7;
    const stages = [30, 100, 170, 240, 310];
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    // Logic for colors and speeds
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    const swirlSpeed = isHazard ? "0.8s" : isWarning ? "1.5s" : "3s";
    const gasSpeed = isHazard ? "1s" : "3s";
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="preheaterBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b"/>
                    <stop offset="50%" stopColor="#334155"/>
                    <stop offset="100%" stopColor="#0f172a"/>
                </linearGradient>

                <linearGradient id="cycloneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#475569"/>
                    <stop offset="50%" stopColor="#94a3b8"/>
                    <stop offset="100%" stopColor="#334155"/>
                </linearGradient>
            </defs>

            {/* Status LED Indicator */}
            <circle cx="5" cy="5" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
            </circle>

            {/* 1. Main Tower Structure */}
            <rect width="100" height="380" fill="url(#preheaterBodyGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth={isNormal ? "1.5" : "3"} rx="2" className={isHazard ? "animate-pulse" : ""}/>

            {/* 2. Cyclone Stages */}
            {stages.map((yPos, index) => (<g key={index} transform={`translate(15, ${yPos})`}>
                    <path d="M 0 0 H 70 L 55 40 H 15 Z" fill="url(#cycloneGrad)" stroke={isNormal ? "#1e293b" : statusColor} strokeWidth="1.5"/>

                    {/* Internal Gas Swirl */}
                    <path d="M 20 10 Q 35 5 50 10 Q 35 15 20 10" fill="none" stroke={isHazard ? "#fca5a5" : "#cbd5e1"} strokeWidth="1.5" opacity="0.6">
                        <animateTransform attributeName="transform" type="rotate" from="0 35 10" to="360 35 10" dur={swirlSpeed} repeatCount="indefinite"/>
                    </path>

                    {/* Connecting Pipes */}
                    {index < stages.length - 1 && (<rect x="31" y="40" width="8" height="30" fill="#0f172a" stroke={isNormal ? "#1e293b" : statusColor}/>)}
                </g>))}

            {/* 3. Rising Hot Gas Animation */}
            <g transform="translate(8, 20)">
                <path d="M 0 340 V 0" stroke={isHazard ? "#ef4444" : "#f97316"} strokeWidth={isHazard ? "4" : "2"} strokeDasharray="5, 10" opacity="0.8">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur={gasSpeed} repeatCount="indefinite"/>
                </path>
            </g>

            {/* 4. Live Data Readouts */}
            <g transform="translate(115, 20)">
                {[
            { label: 'Exit_Temp', val: isHazard ? '485.5°C' : '342.1°C', color: isHazard ? 'fill-danger' : 'fill-success', y: 0 },
            { label: 'ID_Fan_Pr', val: isHazard ? '-12.0 mB' : '-45.2 mB', color: isHazard ? 'fill-danger' : 'fill-info', y: 45 },
            { label: 'Feed_Rate', val: isWarning ? '180 t/h' : '245 t/h', color: isWarning ? 'fill-warning' : 'fill-warning', y: 300 }
        ].map((d, i) => (<g key={i} transform={`translate(0, ${d.y})`}>
                        <rect width="85" height="35" rx="4" fill="#000" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1"/>
                        <text x="42.5" y="14" textAnchor="middle" className="fill-text-secondary font-mono text-[8px] uppercase">{d.label}</text>
                        <text x="42.5" y="28" textAnchor="middle" className={`${d.color} font-mono text-[11px] font-bold`}>{d.val}</text>
                    </g>))}
            </g>

            {/* Equipment Name */}
            <text x="50" y="420" textAnchor="middle" className={`${textClassName} font-sans text-[20px] font-black uppercase tracking-tight`}>
                Preheater Tower
            </text>
        </g>);
}
