'use client';
import React from 'react';
export default function TegUnit({ x, y, onPointerDown, onDoubleClick, status = 'normal' }) {
    const scale = 0.8;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} onDoubleClick={onDoubleClick} // Attached Double Click Handler
     className="cursor-pointer select-none group" // Changed to cursor-pointer to indicate it's clickable
    >
            <defs>
                <linearGradient id="tegGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#cbd5e1"/>
                    <stop offset="50%" stopColor="#f8fafc"/>
                    <stop offset="100%" stopColor="#94a3b8"/>
                </linearGradient>
                <filter id="tegGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            {/* Hover highlight for interactivity */}
            <rect width="140" height="130" fill="#f8fafc" fillOpacity="0" stroke="#475569" strokeWidth="1" strokeDasharray="4" rx="4" className="group-hover:fillOpacity-5 transition-all"/>

            {/* Status Aura */}
            {!isNormal && (<rect width="160" height="150" x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.5" filter="url(#tegGlow)" rx="6">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            {/* Status LED Indicator */}
            <circle cx="130" cy="-5" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            <g transform="translate(10, 10)">
                <rect width="40" height="110" rx="20" fill="url(#tegGrad)" stroke={isNormal ? "#334155" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                <path d="M 5 20 L 35 100 M 35 20 L 5 100 M 5 40 L 35 80 M 35 40 L 5 80" stroke="#64748b" strokeWidth="1">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur={isHazard ? "0.4s" : "1.5s"} repeatCount="indefinite"/>
                </path>
            </g>

            <g transform="translate(90, 40)">
                <rect width="30" height="80" rx="15" fill="url(#tegGrad)" stroke={isNormal ? "#334155" : statusColor} strokeWidth={isNormal ? "2" : "3"} className={isHazard ? "animate-pulse" : ""}/>
                <circle cx="15" cy="60" r="4" fill={isHazard ? "#ef4444" : "#eab308"} opacity="0.6">
                    <animate attributeName="cy" values="60;20" dur={isHazard ? "0.8s" : "2s"} repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0" dur={isHazard ? "0.8s" : "2s"} repeatCount="indefinite"/>
                </circle>
            </g>

            <g stroke="#334155" strokeWidth="2" fill="none">
                <path d="M 30 105 L 105 105"/>
                <path d="M 105 40 L 105 25 L 30 25"/>
            </g>

            {/* Standardized Equipment Name & Tag */}
            <text x="70" y="155" textAnchor="middle" className={`${textClassName} font-sans text-[16px] font-black uppercase tracking-tight`}>TEG Unit</text>
            <text x="70" y="170" textAnchor="middle" className="fill-text-secondary font-sans text-[10px] font-bold uppercase tracking-widest">Dehydrator</text>
        </g>);
}
