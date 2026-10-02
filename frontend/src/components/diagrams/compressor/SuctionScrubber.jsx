'use client';
import React from 'react';
export default function SuctionScrubber({ x, y, name = "Suction Scrubber V-2440A", status = 'normal', onPointerDown }) {
    const isNormal = status === 'normal';
    const statusColor = status === 'hazard' ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    // Scrubber specific dimensions from your code
    const w = 60;
    const h = 100;
    return (<g transform={`translate(${x}, ${y})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="lightMetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e2e8f0"/>
                    <stop offset="50%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#cbd5e1"/>
                </linearGradient>
                <filter id="softShadow">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.08"/>
                </filter>
            </defs>

            {/* Status Warning Ring */}
            {!isNormal && (<rect width={w + 20} height={h + 20} x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.6" rx="35" // Matches the rounded nature of the vessel
         strokeDasharray="4 4">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            {/* Scrubber Body */}
            <g>
                <rect width={w} height={h} rx="30" // Creates the cylindrical/capsule shape
     fill="url(#lightMetalGrad)" stroke={isNormal ? '#475569' : statusColor} strokeWidth="2" filter="url(#softShadow)"/>
                {/* Internal Demister/Grid line */}
                <line x1="10" y1="20" x2="50" y2="20" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3"/>
            </g>

            {/* Status LED Indicator */}
            <circle cx={w + 5} cy="-5" r="5" fill={statusColor} stroke="#fff" strokeWidth="1.5"/>

            {/* Name Label */}
            <text y={h + 26} x={w / 2} textAnchor="middle" className="text-[10px] font-black fill-text-secondary uppercase pointer-events-none">
                {name}
            </text>
        </g>);
}
