'use client';
import React from 'react';
const ExportPipeline = ({ x = 0, y = 0, scale = 1, status = 'normal', pressure = 850, flowRate = 120, tagPL = "", onPointerDown, }) => {
    const isNormal = status === 'normal';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    const labelFontClass = "font-mono font-black tracking-tighter uppercase";
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* 1. Main Pipeline Path (Heavy Gauge) */}
            <path d="M 0,0 L 250,0" stroke="#1e293b" strokeWidth="6" strokeLinecap="butt"/>

            {/* 2. Flow Direction Arrows (Animated) */}
            <g>
                {[40, 120, 200].map((pos) => (<path key={pos} d={`M ${pos}, -4 L ${pos + 10}, 0 L ${pos}, 4 Z`} fill="#eab308">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" begin={`${pos / 100}s`} repeatCount="indefinite"/>
                    </path>))}
            </g>

            {/* 3. Export Shutdown Valve (ESV) */}
            <g transform="translate(60, -15)">
                <polygon points="0,0 0,30 15,15" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
                <polygon points="30,0 30,30 15,15" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
                {/* Actuator Symbol (Square on top) */}
                <line x1="15" y1="15" x2="15" y2="-5" stroke="#1e293b" strokeWidth="2"/>
                <rect x="5" y="-15" width="20" height="10" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="15" y="45" textAnchor="middle" className="fill-text-muted text-[8px] font-bold">ESV-501</text>
            </g>

            {/* 4. Metering Orifice / Flow Element */}
            <g transform="translate(160, 0)">
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#1e293b" strokeWidth="2"/>
                <circle cx="0" cy="-25" r="12" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="0" y="-21" textAnchor="middle" className="fill-text-secondary text-[7px] font-black">FE</text>
            </g>

            {/* 5. Live Data Badge */}
            <g transform="translate(160, 25)">
                <rect x="-35" y="0" width="70" height="25" rx="4" fill="#0f172a"/>
                <text x="0" y="10" textAnchor="middle" className="fill-success text-[8px] font-mono font-bold">
                    {flowRate} MMSCFD
                </text>
                <text x="0" y="20" textAnchor="middle" className="fill-text-subtle text-[8px] font-mono font-bold">
                    {pressure} PSI
                </text>
            </g>

            {/* 6. Tag and Status */}
            <g transform="translate(125, -45)">
                <text x="20" y="10" textAnchor="middle" className="fill-white text-[18px] font-black tracking-tighter">
                    {tagPL}
                </text>
                <circle cx="65" cy="-5" r="4" fill={statusColor} className={isHazard ? "animate-pulse" : ""}/>
            </g>

            {/* 7. Boundary Break (Indicates continuation off-site) */}
            <path d="M 250,-10 L 240,0 L 250,10" fill="none" stroke="#1e293b" strokeWidth="2"/>
        </g>);
};
export default ExportPipeline;
