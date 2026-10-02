'use client';
import React from 'react';
export default function CementMill({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 0.7;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    // Color logic based on status
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
            <defs>
                <linearGradient id="millShellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#475569"/>
                    <stop offset="50%" stopColor="#94a3b8"/>
                    <stop offset="100%" stopColor="#334155"/>
                </linearGradient>

                <linearGradient id="chamberInterior" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b"/>
                    <stop offset="100%" stopColor="#0f172a"/>
                </linearGradient>
                
                <filter id="millGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            {/* Status Aura (Only for Warning/Hazard) */}
            {!isNormal && (<rect width="230" height="95" x="-5" y="-5" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.5" filter="url(#millGlow)" rx="6">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite"/>
                </rect>)}

            {/* Status LED Indicator */}
            <circle cx="5" cy="-5" r="5" fill={statusColor} className="shadow-lg">
                <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
            </circle>

            {/* 1. Main Mill Body */}
            <rect width="220" height="85" fill="url(#millShellGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth={isNormal ? "2" : "3"} rx="5" className={isHazard ? "animate-pulse" : ""}/>

            {/* 2. Internal Mechanical Details */}
            <g transform="translate(10, 10)">
                <rect width="200" height="65" fill="url(#chamberInterior)" rx="2"/>
                <line x1="80" y1="0" x2="80" y2="65" stroke="#334155" strokeWidth="2" strokeDasharray="4,2"/>

                {/* Rotation Animation - Chamber 1 */}
                <g transform="translate(40, 32.5)">
                    <circle r="25" fill="none" stroke={isHazard ? "#ef4444" : "#475569"} strokeWidth="1.5" strokeDasharray="10,5">
                        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur={isHazard ? "0.8s" : isWarning ? "1.5s" : "3s"} repeatCount="indefinite"/>
                    </circle>
                </g>

                {/* Rotation Animation - Chamber 2 */}
                <g transform="translate(140, 32.5)">
                    <circle r="25" fill="none" stroke={isHazard ? "#ef4444" : "#475569"} strokeWidth="1.5" strokeDasharray="10,5">
                        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur={isHazard ? "0.6s" : isWarning ? "1.2s" : "2.5s"} repeatCount="indefinite"/>
                    </circle>
                </g>
            </g>

            {/* 3. Support Piers and Girth Gear */}
            <rect x="30" y="85" width="25" height="15" fill="#1e293b" stroke={isNormal ? "#475569" : statusColor} strokeWidth="1.5"/>
            <rect x="165" y="85" width="25" height="15" fill="#1e293b" stroke={isNormal ? "#475569" : statusColor} strokeWidth="1.5"/>
            <rect x="105" y="-5" width="10" height="95" fill={isHazard ? "#ef4444" : "#334155"} stroke="#1e293b" strokeWidth="1.5"/>

            {/* 4. Live Data Readouts */}
            <g transform="translate(240, 0)">
                {[
            { label: 'Prod_Rate', val: isHazard ? '45.2 t/h' : '120.5 t/h', color: isHazard ? 'fill-danger' : 'fill-success', y: 0 },
            { label: 'Blaine', val: '3250 cm²/g', color: 'fill-brand', y: 45 },
            { label: 'Separator', val: isHazard ? '1150 RPM' : '840 RPM', color: isHazard ? 'fill-danger' : 'fill-warning', y: 90 }
        ].map((d, i) => (<g key={i} transform={`translate(0, ${d.y})`}>
                        <rect width="90" height="35" rx="4" fill="#000" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1"/>
                        <text x="45" y="14" textAnchor="middle" className="fill-text-muted font-mono text-[8px] uppercase">{d.label}</text>
                        <text x="45" y="28" textAnchor="middle" className={`${d.color} font-mono text-[11px] font-bold`}>{d.val}</text>
                    </g>))}
            </g>

            {/* Equipment Name */}
            <text x="110" y="140" textAnchor="middle" className={`${textClassName} font-sans text-[20px] font-black uppercase tracking-tight`}>
                Cement Ball Mill
            </text>
            <text x="110" y="158" textAnchor="middle" className="fill-text-muted font-sans text-[12px] font-bold uppercase tracking-widest">
                Unit 01
            </text>
        </g>);
}
