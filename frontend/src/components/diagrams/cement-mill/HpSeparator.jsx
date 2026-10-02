'use client';
import React from 'react';
export default function HpSeparator({ x, y, onPointerDown, status = 'normal', label = 'HP Separator' }) {
    const scale = 1.0;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#3b82f6';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                {/* Vessel Metallic Gradient */}
                <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#64748b"/>
                    <stop offset="50%" stopColor="#cbd5e1"/>
                    <stop offset="100%" stopColor="#475569"/>
                </linearGradient>

                {/* Layer 1: Water (Bottom) */}
                <linearGradient id="waterLayer" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9"/>
                </linearGradient>

                {/* Layer 2: Oil (Middle) */}
                <linearGradient id="oilLayer" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.8"/>
                </linearGradient>

                {/* Layer 3: Gas/Mist (Top) */}
                <linearGradient id="gasLayer" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.4"/>
                </linearGradient>

                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Vessel Shadow/Aura */}
            {!isNormal && (<rect x="-8" y="-8" width="136" height="216" rx="60" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.4" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite"/>
                </rect>)}

            {/* 1. Main Vessel Body (Vertical Cylinder) */}
            <rect x="0" y="0" width="120" height="200" rx="55" fill="url(#vesselGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth="3"/>

            {/* 2. Internal Viewport / Layers */}
            <g clipPath="inset(10px 10px 10px 10px round 45px)">
                {/* Gas Phase (Top) */}
                <rect x="10" y="10" width="100" height="60" fill="url(#gasLayer)"/>
                
                {/* Oil Phase (Middle) */}
                <rect x="10" y="70" width="100" height="60" fill="url(#oilLayer)">
                    <animate attributeName="y" values="68;72;68" dur="4s" repeatCount="indefinite"/>
                </rect>

                {/* Water Phase (Bottom) */}
                <rect x="10" y="130" width="100" height="60" fill="url(#waterLayer)"/>

                {/* Bubbles animation in water */}
                <circle cx="40" cy="170" r="2" fill="white" opacity="0.4">
                    <animate attributeName="cy" from="180" to="135" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="80" cy="160" r="1.5" fill="white" opacity="0.4">
                    <animate attributeName="cy" from="185" to="140" dur="5s" repeatCount="indefinite"/>
                </circle>
            </g>

            {/* 3. External Fittings (Nozzles & Gauges) */}
            {/* Top Gas Outlet */}
            <rect x="50" y="-15" width="20" height="15" fill="#334155"/>
            <rect x="40" y="-20" width="40" height="8" rx="2" fill="#1e293b"/>

            {/* Bottom Liquid Outlet */}
            <rect x="50" y="200" width="20" height="15" fill="#334155"/>
            
            {/* Side Inlet */}
            <path d="M -15 80 L 5 80 L 5 100 L -15 100 Z" fill="#334155"/>
            {/* Labels */}
            <text x="60" y="235" textAnchor="middle" className={`${textClassName} font-sans text-[18px] font-black uppercase`}>
                {label}
            </text>
            <text x="60" y="252" textAnchor="middle" className="fill-text-muted font-sans text-[11px] font-bold uppercase tracking-[0.2em]">
                V-102 Stage A
            </text>

            {/* Status LED */}
            <circle cx="110" cy="10" r="6" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
        </g>);
}
