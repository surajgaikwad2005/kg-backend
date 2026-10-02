'use client';
import React from 'react';
export default function LpSeparator({ x, y, onPointerDown, status = 'normal', label = 'LP Separator' }) {
    const scale = 1.0;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    // Standardized colors
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="lpVesselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#cbd5e1"/><stop offset="50%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#94a3b8"/>
                </linearGradient>
                <linearGradient id="lpGas"><stop offset="0%" stopColor="#fef08a"/><stop offset="100%" stopColor="#eab308"/></linearGradient>
                <linearGradient id="lpOil"><stop offset="0%" stopColor="#b45309"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
                <linearGradient id="lpWater"><stop offset="0%" stopColor="#7dd3fc"/><stop offset="100%" stopColor="#0284c7"/></linearGradient>
                <filter id="lpGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
                
                {/* THE FIX: Perfect clipping mask matching the vessel body */}
                <clipPath id="lpClip">
                    <rect width="80" height="120" rx="30"/>
                </clipPath>
            </defs>

            {/* Status Aura (Shrunk to fit the vessel without readouts) */}
            {!isNormal && (<rect width="125" height="185" x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.5" filter="url(#lpGlow)" rx="6">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            {/* Status LED Indicator */}
            <circle cx="105" cy="-5" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            <g transform="translate(10, 10)">
                {/* Main Vessel Background */}
                <rect width="80" height="120" rx="30" fill="#1e293b" stroke={isNormal ? "#475569" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                
                {/* Clipped Fluid Layers - These will no longer spill out! */}
                <g clipPath="url(#lpClip)">
                    {/* Gas */}
                    <path d="M -10 30 Q 40 20 90 30 L 90 80 L -10 80 Z" fill="url(#lpGas)" opacity="0.8">
                        <animate attributeName="opacity" values="0.6;0.9;0.6" dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
                    </path>
                    {/* Oil */}
                    <rect x="0" y="70" width="80" height="40" fill="url(#lpOil)" opacity="0.9">
                        <animate attributeName="y" values="68;72;68" dur={isHazard ? "1s" : "3s"} repeatCount="indefinite"/>
                    </rect>
                    {/* Water */}
                    <rect x="0" y="100" width="80" height="40" fill="url(#lpWater)" opacity="0.9"/>
                </g>
                
                {/* Glass Reflection Overlay */}
                <rect width="80" height="120" rx="30" fill="url(#lpVesselGrad)" opacity="0.3" pointerEvents="none"/>
                
                {/* Liquid Level Gauge */}
                <rect x="85" y="30" width="8" height="70" rx="4" fill="#334155"/>
                <rect x="86" y={isHazard ? "32" : "50"} width="6" height={isHazard ? "66" : "48"} rx="3" fill={statusColor} className="transition-all duration-1000"/>
            </g>

            {/* Standardized Equipment Name & Tag */}
            <text x="50" y="155" textAnchor="middle" className={`${textClassName} font-sans text-[16px] font-black uppercase tracking-tight`}>{label}</text>
            <text x="50" y="170" textAnchor="middle" className="fill-text-secondary font-sans text-[10px] font-bold uppercase tracking-widest">V-103 Stage B</text>
        </g>);
}
