'use client';
import React from 'react';
const SecondStageCompressor = ({ x = 0, y = 0, scale = 1, status = 'normal', tagE = "V-2430B", onPointerDown, }) => {
    const isNormal = status === 'normal';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    const labelFontClass = "font-mono text-[20px] font-bold uppercase";
    return (
    // Rotated group (-90 deg around the origin (0,0))
    <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(-90)`} onPointerDown={onPointerDown} className="cursor-move">

            {/* 1. Trapezium Body Path (Rotated body) */}
            <path d="M 15,0 L 85,0 L 100,40 L 0,40 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* 2. Internal Heat Exchange Symbol (Zig-Zag) */}
            <path d="M 15,20 L 30,10 L 45,30 L 60,10 L 75,30 L 85,20" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>

            {/* 3. Nozzles (Now on the sides, rotated) */}
            <rect x="45" y="-8" width="10" height="8" fill="#334155"/>
            <rect x="45" y="40" width="10" height="8" fill="#334155"/>

            {/* 4. Process Gas Connections (Now on top/bottom, rotated) */}
            <rect x="-6" y="15" width="8" height="12" fill="#334155" transform="rotate(-15, -2, 21)"/>
            <rect x="98" y="15" width="8" height="12" fill="#334155" transform="rotate(15, 102, 21)"/>

            {/* 5. Equipment Identification (Counter-rotated text for readability) */}
            <g transform="translate(10, 70) rotate(90)">
                <text x="10" y="0" textAnchor="middle" className={`font-mono text-[20px] font-bold uppercase ${labelFontClass} pointer-events-none select-none`}>
                    {tagE}
                </text>
            </g>

            {/* 6. Status Indicator */}
            <circle cx="95" cy="-5" r="4" fill={statusColor} className={isHazard ? "animate-pulse" : ""}>
                {!isNormal && (<animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>)}
            </circle>
        </g>);
};
export default SecondStageCompressor;
