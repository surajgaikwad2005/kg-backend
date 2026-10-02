import React from 'react';
const CheckValve = ({ x, y, scale = 1, status = 'normal', flowDirection = 'right', label = 'CV-101', onPointerDown, }) => {
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    // P&ID Symbol Dimensions
    const vW = 50; // Valve width
    const vH = 30; // Valve height
    const midX = vW / 2;
    const midY = vH / 2;
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} className="cursor-pointer select-none" onPointerDown={onPointerDown}>
            <defs>
                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8"/>
                    <stop offset="50%" stopColor="#f1f5f9"/>
                    <stop offset="100%" stopColor="#475569"/>
                </linearGradient>
            </defs>

            {/* Status LED Indicator */}
            <circle cx="-12" cy="-8" r="4" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "3s"} repeatCount="indefinite"/>
            </circle>

            {/* 1. Flanges (The end connectors) */}
            <rect x="-4" y="0" width="4" height={vH} fill="#334155" rx="1"/>
            <rect x={vW} y="0" width="4" height={vH} fill="#334155" rx="1"/>

            {/* 2. Valve Body (The P&ID Triangles) */}
            <path d={`M 0,0 L 0,${vH} L ${vW},0 L ${vW},${vH} Z`} fill="url(#metalGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth="1.5" strokeLinejoin="round"/>

            {/* 3. The "Check" Flap (Standard P&ID Diagonal) */}
            <line x1={midX - 8} y1={midY + 10} x2={midX + 8} y2={midY - 10} stroke={statusColor} strokeWidth="2.5" strokeLinecap="round"/>

            {/* 4. Small Directional Arrow Indicator */}
            <path d={flowDirection === 'right'
            ? `M ${midX - 5} ${vH + 8} L ${midX + 5} ${vH + 8} M ${midX} ${vH + 4} L ${midX + 5} ${vH + 8} L ${midX} ${vH + 12}`
            : `M ${midX + 5} ${vH + 8} L ${midX - 5} ${vH + 8} M ${midX} ${vH + 4} L ${midX - 5} ${vH + 8} L ${midX} ${vH + 12}`} fill="none" stroke={isNormal ? "#64748b" : statusColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Equipment Label */}
            <text x={midX} y={vH + 28} textAnchor="middle" className={`${textClassName} font-mono text-[11px] font-bold uppercase tracking-wider`}>
                {label}
            </text>

            {/* Alarm Aura */}
            {!isNormal && (<rect width={vW + 20} height={vH + 20} x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.3" rx="6" strokeDasharray="4,2" className={isHazard ? "animate-pulse" : ""}/>)}
        </g>);
};
export default CheckValve;
