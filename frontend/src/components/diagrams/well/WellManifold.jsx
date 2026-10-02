'use client';
import React from 'react';
const WellManifold = ({ x = 0, y = 0, scale = 1, status = 'normal', wellCount = 3, label = "Well", tagM = "Manifolds", onPointerDown, }) => {
    const isNormal = status === 'normal';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    const labelFontClass = "font-mono font-black tracking-tighter uppercase";
    // Layout Constants
    const branchSpacing = 60;
    const headerWidth = wellCount * branchSpacing + 40;
    const branchHeight = 60;
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* 1. MAIN PRODUCTION HEADER (Thick Horizontal Pipe) */}
            <rect x="0" y="0" width={headerWidth} height="12" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2.5" rx="2"/>

            {/* 2. WELL BRANCHES */}
            {Array.from({ length: wellCount }).map((_, i) => {
            const bx = 30 + (i * branchSpacing);
            return (<g key={`branch-${i}`} transform={`translate(${bx}, 12)`}>
                        {/* Vertical Branch Pipe */}
                        <line x1="0" y1="0" x2="0" y2={branchHeight} stroke="#1e293b" strokeWidth="2.5"/>

                        {/* Isolation Valve (P&ID Triangle Style) */}
                        <g transform={`translate(-10, ${branchHeight / 2 - 7.5})`}>
                            <polygon points="0,0 0,15 10,7.5" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5"/>
                            <polygon points="20,0 20,15 10,7.5" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5"/>
                        </g>

                        {/* Well ID Label */}
                        <text x="0" y={branchHeight + 15} textAnchor="middle" className="fill-text-subtle text-[12px] font-mono font-bold">
                            W-{101 + i}
                        </text>
                    </g>);
        })}

            {/* 3. DISCHARGE OUTLET (Right Side) */}
            <path d={`M ${headerWidth} 6 L ${headerWidth + 20} 6`} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow-head)"/>

            {/* 4. Equipment Identification */}
            <g transform={`translate(${headerWidth / 2}, -15)`}>
                <text x="0" y="0" textAnchor="middle" className={`text-[30px] font-black fill-text-primary uppercase pointer-events-none ${labelFontClass} pointer-events-none select-none`}>
                    {label}
                </text>
            </g>

            {/* 5. Status Indicator */}
            <circle cx={headerWidth + 5} cy="-5" r="4" fill={statusColor} className={isHazard ? "animate-pulse" : ""}>
                {!isNormal && (<animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>)}
            </circle>

            {/* Definitions for Arrow Heads */}
            <defs>
                <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 Z" fill="#1e293b"/>
                </marker>
            </defs>
        </g>);
};
export default WellManifold;
