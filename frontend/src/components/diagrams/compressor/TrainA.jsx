import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SuctionScrubber from './SuctionScrubberInlet';
import CompressionTrain from './TwoStageCompressor';
import Intercooler from './InterCoolerA';
import SecondStageCompressor from './CompressorSecondStagek2450A';
import SuctionScrubberB from './SuctionScrubberB';
import IntercoolerA1 from './IntercoolerA1';
const TrainA = ({ x = 0, y = 0, scale = 1, status = 'normal', liquidLevel = 45, onPointerDown, allowInternalNavigation = false, }) => {
    const router = useRouter();
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    // Internal positions for components
    const [positions, setPositions] = useState({
        v101: { x: 0, y: 150 },
        k2410a: { x: 150, y: 50 },
        e2415: { x: 150, y: 240 },
        v2440a: { x: 300, y: 215 },
        k2450b: { x: 470, y: 220 },
        v2460a: { x: 400, y: 50 }
    });
    const [hoverData, setHoverData] = useState(null);
    const [activeComp, setActiveComp] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const handlePointerDown = (id) => (e) => {
        setActiveComp(id);
        setDragStart({ x: e.clientX, y: e.clientY });
        e.target.setPointerCapture(e.pointerId);
        e.stopPropagation();
    };
    const handlePointerMove = (e) => {
        if (!activeComp)
            return;
        const dx = (e.clientX - dragStart.x) / scale;
        const dy = (e.clientY - dragStart.y) / scale;
        setPositions(prev => ({
            ...prev,
            [activeComp]: {
                x: prev[activeComp].x + dx,
                y: prev[activeComp].y + dy
            }
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
    };
    const handlePointerUp = () => setActiveComp(null);
    const handleMouseEnter = (id, name) => (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Use a relative offset for the tooltip
        setHoverData({ id, x: positions[id].x + 50, y: positions[id].y - 20, name });
    };
    const handleMouseLeave = () => setHoverData(null);
    const handleEquipClick = (id) => (e) => {
        if (!allowInternalNavigation)
            return;
        e.stopPropagation();
        const map = {
            v101: 'scrub_1',
            k2410a: 'comp_1',
            e2415: 'cool_1',
            v2440a: 'scrub_2',
            k2450b: 'comp_2',
            v2460a: 'cool_2'
        };
        const mappedId = map[id];
        if (mappedId) {
            router.push(`/compressor-details/${mappedId}?train=A`);
        }
    };
    // Dynamic Piping Coordinates
    const scrA_out = { x: positions.v101.x + 30, y: positions.v101.y };
    const comp1_in = { x: positions.k2410a.x + 44, y: positions.k2410a.y + 36 };
    const comp1_out = { x: positions.k2410a.x + 68, y: positions.k2410a.y + 152 };
    const int1_in = { x: positions.e2415.x - 8, y: positions.e2415.y + 13 };
    const int1_out = { x: positions.e2415.x + 108, y: positions.e2415.y + 13 };
    const scrB_in = { x: positions.v2440a.x - 8, y: positions.v2440a.y + 35 };
    const scrB_out = { x: positions.v2440a.x + 30, y: positions.v2440a.y - 8 };
    const comp2_in = { x: positions.k2450b.x + 12, y: positions.k2450b.y + 4 };
    const comp2_out = { x: positions.k2450b.x + 12, y: positions.k2450b.y - 78 };
    const int2_in = { x: positions.v2460a.x + 85, y: positions.v2460a.y + 45 };
    const driver_out = { x: positions.k2410a.x + 92, y: positions.k2410a.y + 104 };
    const comp2_side = { x: positions.k2450b.x, y: positions.k2450b.y - 40 };
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
            {/* 0. Train Status Bounding Box (Movable Train) */}
            <rect x="-100" y="-60" width="780" height="500" fill="transparent" stroke={statusColor} strokeWidth="2" strokeDasharray="8,4" rx="20" opacity="1" className="cursor-move hover:fill-border/5 transition-colors" onPointerDown={onPointerDown} pointerEvents="auto" onClick={() => router.push('/compressor-details?train=A')}/>

            <g transform="translate(-100, -60)" onPointerDown={onPointerDown} className="cursor-pointer group" onClick={(e) => { e.stopPropagation(); router.push('/compressor-details?train=A'); }}>
                <rect width="250" height="40" rx="6" fill={statusColor} opacity="0.9" className="group-hover:brightness-110 transition-all"/>
                <text x="125" y="28" textAnchor="middle" className="fill-white font-mono text-[24px] font-black uppercase tracking-wider pointer-events-none select-none">
                    TRAIN A: {status === 'normal' ? 'HEALTHY' : status === 'warning' ? 'WARNING' : 'ANOMALY'}
                </text>
            </g>

            {/* 1. Piping Logic - Dynamic Connections */}
            <g fill="none" strokeLinecap="round">
                {/* 1.1 ScrubberA to 1st Stage */}
                <path d={`M ${scrA_out.x},${scrA_out.y} H ${comp1_in.x} V ${comp1_in.y}`} stroke="#64748b" strokeWidth="4"/>
                <path d={`M ${scrA_out.x},${scrA_out.y} H ${comp1_in.x} V ${comp1_in.y}`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x={(scrA_out.x + comp1_in.x) / 2} y={scrA_out.y - 5} className="fill-brand font-bold text-[15px]">3000</text>

                {/* 1.2 1st Stage to Intercooler */}
                <path d={`M ${comp1_out.x},${comp1_out.y} v 10 H ${int1_in.x} V ${int1_in.y}`} stroke="#64748b" strokeWidth="4"/>
                <path d={`M ${comp1_out.x},${comp1_out.y} v 10 H ${int1_in.x} V ${int1_in.y}`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x={(comp1_out.x + int1_in.x) / 2} y={comp1_out.y + 12} className="fill-brand font-bold text-[15px]">3000</text>

                {/* 1.3 Intercooler to ScrubberB */}
                <path d={`M ${int1_out.x},${int1_out.y} H ${scrB_in.x} V ${scrB_in.y}`} stroke="#64748b" strokeWidth="4"/>
                <path d={`M ${int1_out.x},${int1_out.y} H ${scrB_in.x} V ${scrB_in.y}`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x={(int1_out.x + scrB_in.x) / 2} y={int1_out.y - 5} className="fill-brand font-bold text-[15px]">3000</text>

                {/* 1.4 ScrubberB to 2nd Stage */}
                <path d={`M ${scrB_out.x},${scrB_out.y} V ${comp2_in.y} H ${comp2_in.x}`} stroke="#64748b" strokeWidth="4"/>
                <path d={`M ${scrB_out.x},${scrB_out.y} V ${comp2_in.y} H ${comp2_in.x}`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x={(scrB_out.x + comp2_in.x) / 2} y={comp2_in.y - 5} className="fill-brand font-bold text-[15px]">3000</text>

                {/* 1.5 2nd Stage to Final Intercooler */}
                <path d={`M ${comp2_out.x},${comp2_out.y} V ${int2_in.y} H ${int2_in.x}`} stroke="#64748b" strokeWidth="4"/>
                <path d={`M ${comp2_out.x},${comp2_out.y} V ${int2_in.y} H ${int2_in.x}`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x={(comp2_out.x + int2_in.x) / 2} y={int2_in.y - 5} className="fill-brand font-bold text-[15px]">3000</text>

                {/* 1.6 Middle Connection (Driver Cross-Link) */}
                <path d={`M ${driver_out.x},${driver_out.y} H ${comp2_side.x} v 20`} stroke="#64748b" strokeWidth="4"/>
                <path d={`M ${driver_out.x},${driver_out.y} H ${comp2_side.x} v 20`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x={(driver_out.x + comp2_side.x) / 2} y={driver_out.y - 5} className="fill-brand font-bold text-[15px]">3000</text>
            </g>

            {/* 2. Suction Scrubber (Inlet Separator) */}
            <g onClick={handleEquipClick('v101')} className={allowInternalNavigation ? "cursor-pointer" : ""} onMouseEnter={handleMouseEnter('v101', 'Suction Scrubber V-2410A')} onMouseLeave={handleMouseLeave}>
                <SuctionScrubber x={positions.v101.x} y={positions.v101.y} scale={1} status={status} liquidLevel={liquidLevel} onPointerDown={handlePointerDown('v101')}/>
            </g>

            {/* 3. Compression Stage */}
            <g onClick={handleEquipClick('k2410a')} className={allowInternalNavigation ? "cursor-pointer" : ""} onMouseEnter={handleMouseEnter('k2410a', '1st Stage Compressor K-2420A')} onMouseLeave={handleMouseLeave}>
                <CompressionTrain x={positions.k2410a.x} y={positions.k2410a.y} scale={0.8} status={status} onPointerDown={handlePointerDown('k2410a')}/>
            </g>

            {/* 4. Intercooler */}
            <g onClick={handleEquipClick('e2415')} className={allowInternalNavigation ? "cursor-pointer" : ""} onMouseEnter={handleMouseEnter('e2415', 'Intercooler E-2430A')} onMouseLeave={handleMouseLeave}>
                <Intercooler x={positions.e2415.x} y={positions.e2415.y} scale={0.9} status={status} onPointerDown={handlePointerDown('e2415')}/>
            </g>

            {/* 5. Suction Scrubber B */}
            <g onClick={handleEquipClick('v2440a')} className={allowInternalNavigation ? "cursor-pointer" : ""} onMouseEnter={handleMouseEnter('v2440a', 'Suction Scrubber V-2440A')} onMouseLeave={handleMouseLeave}>
                <SuctionScrubberB x={positions.v2440a.x} y={positions.v2440a.y} scale={1} status={status} onPointerDown={handlePointerDown('v2440a')}/>
            </g>

            {/* 6. Second Stage Compression Unit */}
            <g onClick={handleEquipClick('k2450b')} className={allowInternalNavigation ? "cursor-pointer" : ""} onMouseEnter={handleMouseEnter('k2450b', '2nd Stage Compressor K-2450B')} onMouseLeave={handleMouseLeave}>
                <SecondStageCompressor x={positions.k2450b.x} y={positions.k2450b.y} scale={0.8} status={status} onPointerDown={handlePointerDown('k2450b')}/>
            </g>

            {/* 7. Final Stage Intercooler Unit */}
            <g onClick={handleEquipClick('v2460a')} className={allowInternalNavigation ? "cursor-pointer" : ""} onMouseEnter={handleMouseEnter('v2460a', 'Final Stage Intercooler V-2460A')} onMouseLeave={handleMouseLeave}>
                <IntercoolerA1 x={positions.v2460a.x} y={positions.v2460a.y} scale={1} status={status} label="V-2460A" onPointerDown={handlePointerDown('v2460a')}/>
            </g>

            {/* PaR Tooltip */}
            {hoverData && (<g transform={`translate(${hoverData.x}, ${hoverData.y - 120})`} pointerEvents="none">
                    <rect width="180" height="110" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}/>
                    <rect width="180" height="30" rx="12" fill="#f8fafc"/>
                    <rect width="180" height="10" y="20" fill="#f8fafc"/>
                    
                    <text x="12" y="20" className="fill-text-primary font-black text-[10px] uppercase tracking-wider">{hoverData.name}</text>
                    
                    <g transform="translate(12, 45)">
                        <text className="fill-text-subtle font-bold text-[9px] uppercase tracking-tight">PaR Realized</text>
                        <text y="15" className="fill-success font-black text-[14px]">8.45 <tspan className="text-[9px] font-bold">MMSCFD</tspan></text>
                    </g>
                    
                    <g transform="translate(100, 45)">
                        <text className="fill-text-subtle font-bold text-[9px] uppercase tracking-tight">Constraint</text>
                        <text y="15" className="fill-text-primary font-black text-[14px]">9.20 <tspan className="text-[9px] font-bold">MMSCFD</tspan></text>
                    </g>

                    <g transform="translate(12, 85)">
                        <text className="fill-text-subtle font-bold text-[9px] uppercase tracking-tight">Contingent</text>
                        <text y="15" className="fill-warning font-black text-[14px]">0.75 <tspan className="text-[9px] font-bold">MMSCFD</tspan></text>
                    </g>
                </g>)}
        </g>);
};
export default TrainA;
