'use client';
import React from 'react';
export default function WaterTreatment({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 0.8;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="wtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe"/>
                    <stop offset="100%" stopColor="#0284c7"/>
                </linearGradient>
                <filter id="wtGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            {/* FIXED: Aura now tightly fits the smaller body footprint */}
            {!isNormal && (<rect width="140" height="60" x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.5" filter="url(#wtGlow)" rx="6">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            {/* Status LED Indicator - Repositioned to the top right of the unit */}
            <circle cx="120" cy="-5" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            <g transform="translate(0, 0)">
                {/* Main Tank Body */}
                <rect width="120" height="40" rx="4" fill="url(#wtGrad)" stroke={isNormal ? "#334155" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                
                {/* Skimmer Animation - Centered vertically and constrained to tank width */}
                <rect x="0" y="5" width="4" height="30" rx="1" fill="#1e293b" opacity="0.6">
                    <animate attributeName="x" values="10;105;10" dur={isHazard ? "1.5s" : "4s"} repeatCount="indefinite"/>
                </rect>
                
                {/* Decorative horizontal lines to show "Water Level" */}
                <line x1="10" y1="10" x2="110" y2="10" stroke="white" strokeWidth="1" opacity="0.3"/>
                <line x1="10" y1="20" x2="110" y2="20" stroke="white" strokeWidth="1" opacity="0.2"/>
            </g>

            {/* Standardized Equipment Name & Tag - Adjusted Y position for better spacing */}
            <text x="60" y="65" textAnchor="middle" className={`${textClassName} font-sans text-[14px] font-black uppercase tracking-tight`}>
                Water Treatment
            </text>
            <text x="60" y="80" textAnchor="middle" className="fill-text-secondary font-sans text-[10px] font-bold uppercase tracking-widest">
                Unit W-1
            </text>
        </g>);
}
