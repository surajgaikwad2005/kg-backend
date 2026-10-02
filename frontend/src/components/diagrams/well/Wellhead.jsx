'use client';
import React from 'react';
export default function Wellhead({ x, y, onPointerDown, status = 'normal', name = "Wellhead" }) {
    const scale = 1.0;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    // Standardized color logic
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                {/* Metallic Gradient */}
                <linearGradient id="wellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#cbd5e1"/>
                    <stop offset="50%" stopColor="#f8fafc"/>
                    <stop offset="100%" stopColor="#94a3b8"/>
                </linearGradient>
                
                <filter id="wellGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            {/* Status Aura (Only for Warning/Hazard) */}
            {!isNormal && (<rect width="180" height="120" x="-15" y="-30" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.5" filter="url(#wellGlow)" rx="6">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            {/* Status LED Indicator */}
            <circle cx="155" cy="-20" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            {/* 1. Wellhead Valves & Body */}
            <g transform="translate(0, 0)">
                <rect x="0" y="0" width="40" height="40" rx="4" fill="url(#wellGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                <path d="M -10 20 L 0 20 M 40 20 L 50 20 M 20 -10 L 20 0 M 20 40 L 20 60" stroke="#334155" strokeWidth="4"/>
                
                {/* Animated Valve Wheel */}
                <circle cx="20" cy="-10" r="8" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 2">
                    <animateTransform attributeName="transform" type="rotate" from="0 20 -10" to="360 20 -10" dur={isHazard ? "0.5s" : isWarning ? "1.2s" : "3s"} repeatCount="indefinite"/>
                </circle>
            </g>


            {/* Equipment Name */}
            <text x="20" y="90" textAnchor="middle" className={`${textClassName} font-sans text-[16px] font-black uppercase tracking-tight`}>
                {name}
            </text>
            <text x="20" y="105" textAnchor="middle" className="fill-text-secondary font-sans text-[10px] font-bold uppercase tracking-widest">
                WH-X01
            </text>
        </g>);
}
