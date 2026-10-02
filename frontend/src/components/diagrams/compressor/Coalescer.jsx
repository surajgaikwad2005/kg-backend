'use client';
import React from 'react';
export default function Coalescer({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 0.8;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="coalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1"/><stop offset="50%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#94a3b8"/>
                </linearGradient>
                <filter id="coalGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
            </defs>

            {!isNormal && (<rect width="250" height="110" x="-15" y="-15" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.5" filter="url(#coalGlow)" rx="6">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            <circle cx="125" cy="-5" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            <g transform="translate(10, 10)">
                <rect width="120" height="60" rx="15" fill="url(#coalGrad)" stroke={isNormal ? "#334155" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                
                <path d="M 30 15 L 90 15 L 30 45 L 90 45" stroke={isHazard ? "#ef4444" : "#475569"} strokeWidth="2" fill="none">
                    <animate attributeName="opacity" values="1;0.2;1" dur={isHazard ? "0.1s" : "1s"} repeatCount="indefinite"/>
                </path>
                <circle cx="60" cy="50" r="2" fill="#0284c7">
                    <animate attributeName="cy" values="30;55" dur={isHazard ? "0.5s" : "1.5s"} repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0" dur={isHazard ? "0.5s" : "1.5s"} repeatCount="indefinite"/>
                </circle>
            </g>

            

            {/* Standardized Equipment Name & Tag */}
            <text x="70" y="105" textAnchor="middle" className={`${textClassName} font-sans text-[16px] font-black uppercase tracking-tight`}>Coalescer</text>
            <text x="70" y="120" textAnchor="middle" className="fill-text-muted font-sans text-[10px] font-bold uppercase tracking-widest">Electrostatic</text>
        </g>);
}
