'use client';
import React from 'react';
export default function ExportCompressor({ x, y, onPointerDown, onDoubleClick, status = 'normal', label = 'Compressor' }) {
    const scale = 1.0;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} onDoubleClick={onDoubleClick} // <--- ATTACHED HANDLER
     className="cursor-pointer select-none group" // <--- CHANGED TO POINTER AND ADDED GROUP
    >
            <defs>
                <linearGradient id="compGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1"/><stop offset="50%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#94a3b8"/>
                </linearGradient>
                <filter id="compGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
            </defs>

            {/* Hover highlight bounding box to show it's clickable */}
            <rect width="180" height="230" x="-20" y="-15" fill="#f8fafc" fillOpacity="0" stroke="#475569" strokeWidth="1" strokeDasharray="4" rx="8" className="group-hover:fill-opacity-10 transition-all duration-300"/>

            {!isNormal && (<rect width="170" height="220" x="-15" y="-10" fill="none" stroke={statusColor} strokeWidth="2.5" opacity="0.8" filter="url(#compGlow)" rx="8" strokeDasharray="4 4">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            <circle cx="125" cy="-5" r="5" fill={statusColor} stroke="#ffffff" strokeWidth="1" className="shadow-lg">
                <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            {/* Train A */}
            <g transform="translate(10, 10)">
                <polygon points="0,0 40,10 40,30 0,40" fill="url(#compGrad)" stroke={isNormal ? "#64748b" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                <line x1="40" y1="20" x2="80" y2="20" stroke={isHazard ? "#ef4444" : "#64748b"} strokeWidth="3" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="16" to="0" dur={isHazard ? "0.1s" : isWarning ? "0.3s" : "0.5s"} repeatCount="indefinite"/>
                </line>
                <polygon points="80,10 120,0 120,40 80,30" fill="url(#compGrad)" stroke={isNormal ? "#64748b" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                <text x="60" y="55" textAnchor="middle" className="fill-text-muted font-sans text-[10px] font-bold uppercase pointer-events-none">Train A</text>
            </g>

            {/* Train B */}
            <g transform="translate(10, 90)">
                <polygon points="0,0 40,10 40,30 0,40" fill="url(#compGrad)" stroke={isNormal ? "#64748b" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                <line x1="40" y1="20" x2="80" y2="20" stroke={isHazard ? "#ef4444" : "#64748b"} strokeWidth="3" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="16" to="0" dur={isHazard ? "0.1s" : isWarning ? "0.3s" : "0.5s"} repeatCount="indefinite"/>
                </line>
                <polygon points="80,10 120,0 120,40 80,30" fill="url(#compGrad)" stroke={isNormal ? "#64748b" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                <text x="60" y="55" textAnchor="middle" className="fill-text-muted font-sans text-[10px] font-bold uppercase pointer-events-none">Train B</text>
            </g>

            {/* Standardized Equipment Name & Tag */}
            <text x="70" y="180" textAnchor="middle" className={`${textClassName} font-sans text-[16px] font-black uppercase tracking-tight pointer-events-none`}>{label}</text>
            <text x="70" y="195" textAnchor="middle" className="fill-text-muted font-sans text-[10px] font-bold uppercase tracking-widest pointer-events-none">V-2450B</text>
        </g>);
}
