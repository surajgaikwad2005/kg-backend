'use client';
import React from 'react';
const CommonShaft = ({ x = 0, y = 0, width = 400, scale = 1, status = 'normal', rpm = 11500, label = "MAIN DRIVE SHAFT", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#64748b';
    const labelFontClass = "font-mono font-black tracking-tighter uppercase";
    return (<g transform={`translate(${x}, ${y}) scale(${scale}) rotate(90)`} onPointerDown={onPointerDown} className="cursor-move">
            {/* 1. Main Shaft Body (Heavy industrial stroke) */}
            <line x1="0" y1="0" x2={width} y2="0" stroke="#1e293b" strokeWidth="4" strokeLinecap="butt"/>

            {/* 2. Rotating "Texture" Overlay (Dash array animation) */}
            <line x1="0" y1="0" x2={width} y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="15,10">
                <animate attributeName="stroke-dashoffset" values="100;0" dur="0.8s" repeatCount="indefinite"/>
            </line>

            {/* 3. Coupling Flanges (Start and End) */}
            <rect x="-4" y="-10" width="8" height="20" fill="#334155" rx="1"/>
            <rect x={width - 4} y="-10" width="8" height="20" fill="#334155" rx="1"/>

            {/* 4. Shaft Label and Live Data */}
            <g transform={`translate(${width / 2}, 25)`}>
                <text x="0" y="0" textAnchor="middle" className={`fill-text-secondary text-[18px] ${labelFontClass} pointer-events-none select-none`}>
                    {label}
                </text>
            </g>

            {/* 5. Critical Vibration/Bearing Indicators */}
            <circle cx={width * 0.25} cy="0" r="3" fill={statusColor} stroke="#fff" strokeWidth="1"/>
            <circle cx={width * 0.75} cy="0" r="3" fill={statusColor} stroke="#fff" strokeWidth="1"/>
        </g>);
};
export default CommonShaft;
