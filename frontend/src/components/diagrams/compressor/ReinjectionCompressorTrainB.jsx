import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SuctionScrubber from './SuctionScrubberInlet';
import CompressionTrain from './TwoStageCompressor';
import Intercooler from './InterCoolerA';
import { Trash2, Check, X } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
const ReinjectionCompressorTrainB = ({ x = 0, y = 0, scale = 1, status = 'hazard', onPointerDown, }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isWorkflowEditor = pathname?.includes('/Workflow_Diagram');
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    // Internal positions for components
    const [positions, setPositions] = useState({
        v2470b: { x: 0, y: 150 },
        k2480b: { x: 150, y: 50 },
        e2490b: { x: 150, y: 240 },
    });
    const [labels, setLabels] = useState({
        train: 'REINJECTION TRAIN B: ' + (status === 'hazard' ? 'ANOMALY' : 'HEALTHY'),
        v2470b: 'V-2470B',
        k2480b: 'K-2480B',
        e2490b: 'E-2490B',
    });
    useEffect(() => {
        setLabels(prev => ({
            ...prev,
            train: 'REINJECTION TRAIN B: ' + (status === 'hazard' ? 'ANOMALY' : 'HEALTHY')
        }));
    }, [status]);
    const [visibility, setVisibility] = useState({
        v2470b: true,
        k2480b: true,
        e2490b: true,
    });
    const [editingNode, setEditingNode] = useState(null);
    const [editValue, setEditValue] = useState('');
    const handleDoubleClick = (id, currentLabel) => (e) => {
        e.stopPropagation();
        setEditingNode(id);
        setEditValue(currentLabel);
    };
    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            setLabels(prev => ({ ...prev, [editingNode]: editValue }));
            setEditingNode(null);
        }
        else if (e.key === 'Escape') {
            setEditingNode(null);
        }
    };
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
        setHoverData({ id, x: positions[id].x + 50, y: positions[id].y - 20, name });
    };
    const handleMouseLeave = () => setHoverData(null);
    const handleLineDoubleClick = (e) => {
        e.stopPropagation();
        if (isWorkflowEditor)
            return;
        router.push('/line-details?id=L-2100');
    };
    // Dynamic Piping Coordinates
    const scr_out = { x: positions.v2470b.x + 30, y: positions.v2470b.y };
    const comp_in = { x: positions.k2480b.x + 44, y: positions.k2480b.y + 36 };
    const comp_out = { x: positions.k2480b.x + 68, y: positions.k2480b.y + 152 };
    const int_in = { x: positions.e2490b.x - 8, y: positions.e2490b.y + 13 };
    const handleEquipClick = (id, currentLabel) => (e) => {
        e.stopPropagation();
        if (isWorkflowEditor) {
            setEditingNode(id);
            setEditValue(currentLabel);
            return;
        }
        router.push(`/compressor-details/${id}?train=RB`);
    };
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
            {/* 0. Train Status Bounding Box */}
            <rect x="-80" y="-40" width="450" height="400" fill="transparent" stroke={statusColor} strokeWidth="2" strokeDasharray="8,4" rx="20" className="cursor-move hover:fill-border/5 transition-colors" onPointerDown={onPointerDown} pointerEvents="auto" onClick={() => { if (!isWorkflowEditor)
        router.push('/compressor-details?train=RB'); }}/>

            <g transform="translate(-100, -80)" onPointerDown={onPointerDown} className="cursor-pointer group" onClick={(e) => {
            e.stopPropagation();
            if (isWorkflowEditor) {
                setEditingNode('train');
                setEditValue(labels.train);
            }
            else
                router.push('/compressor-details?train=RB');
        }}>
                <rect x="20" width="450" height="40" rx="6" fill={statusColor} opacity="0.9" className="group-hover:brightness-110 transition-all"/>
                <text x="245" y="27" textAnchor="middle" className="fill-white font-mono text-[16px] font-black uppercase tracking-wider pointer-events-none select-none">
                    {labels.train}
                </text>
            </g>


            {/* 1. Piping Logic */}
            <g fill="none" strokeLinecap="round">
                {/* Scrubber to Compressor */}
                {visibility.v2470b && visibility.k2480b && (<g>
                        <path d={`M ${scr_out.x},${scr_out.y} H ${comp_in.x} V ${comp_in.y}`} stroke="#64748b" strokeWidth="4"/>
                        <path d={`M ${scr_out.x},${scr_out.y} H ${comp_in.x} V ${comp_in.y}`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                            <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                        </path>
                        <text x={(scr_out.x + comp_in.x) / 2} y={scr_out.y - 10} onDoubleClick={handleLineDoubleClick} className="fill-brand font-bold text-[18px] cursor-pointer select-none hover:brightness-125 transition-all">2100</text>
                    </g>)}

                {/* Compressor to Intercooler */}
                {visibility.k2480b && visibility.e2490b && (<g>
                        <path d={`M ${comp_out.x},${comp_out.y} v 10 H ${int_in.x} V ${int_in.y}`} stroke="#64748b" strokeWidth="4"/>
                        <path d={`M ${comp_out.x},${comp_out.y} v 10 H ${int_in.x} V ${int_in.y}`} stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                            <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite"/>
                        </path>
                        <text x={(comp_out.x + int_in.x) / 2} y={comp_out.y + 15} onDoubleClick={handleLineDoubleClick} className="fill-brand font-bold text-[18px] cursor-pointer select-none hover:brightness-125 transition-all">2100</text>
                    </g>)}
            </g>

            {/* 2. Components */}
            {visibility.v2470b && (<g onClick={handleEquipClick('v2470b', labels.v2470b)} className="cursor-pointer" pointerEvents="auto" onMouseEnter={handleMouseEnter('v2470b', `Suction Scrubber ${labels.v2470b}`)} onMouseLeave={handleMouseLeave}>
                    <SuctionScrubber x={positions.v2470b.x} y={positions.v2470b.y} scale={1} status={status} label={labels.v2470b} onPointerDown={handlePointerDown('v2470b')}/>
                    {isWorkflowEditor && (<foreignObject x={positions.v2470b.x - 10} y={positions.v2470b.y - 10} width="70" height="100" pointerEvents="none" style={{ overflow: 'visible' }}>
                            <div className="w-full h-full relative pointer-events-none">
                                <Handle type="target" id="v2470b-target" position={Position.Left} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, left: -5, top: '50%' }}/>
                                <Handle type="source" id="v2470b-source" position={Position.Right} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, right: -5, top: '50%' }}/>
                                <Handle type="target" id="v2470b-top" position={Position.Top} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, top: -5, left: '50%' }}/>
                            </div>
                        </foreignObject>)}
                </g>)}

            {visibility.k2480b && (<g onClick={handleEquipClick('k2480b', labels.k2480b)} className="cursor-pointer" pointerEvents="auto" onMouseEnter={handleMouseEnter('k2480b', `Compressor Train ${labels.k2480b}`)} onMouseLeave={handleMouseLeave}>
                    <CompressionTrain x={positions.k2480b.x} y={positions.k2480b.y} scale={0.8} status={status} tagK={labels.k2480b} onPointerDown={handlePointerDown('k2480b')}/>
                    {isWorkflowEditor && (<foreignObject x={positions.k2480b.x - 10} y={positions.k2480b.y - 10} width="160" height="80" pointerEvents="none" style={{ overflow: 'visible' }}>
                            <div className="w-full h-full relative pointer-events-none">
                                <Handle type="target" id="k2480b-target" position={Position.Left} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, left: -5, top: '50%' }}/>
                                <Handle type="source" id="k2480b-source" position={Position.Right} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, right: -5, top: '50%' }}/>
                                <Handle type="target" id="k2480b-top" position={Position.Top} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, top: -5, left: '50%' }}/>
                                <Handle type="source" id="k2480b-bottom" position={Position.Bottom} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, bottom: -5, left: '50%' }}/>
                            </div>
                        </foreignObject>)}
                </g>)}

            {visibility.e2490b && (<g onClick={handleEquipClick('e2490b', labels.e2490b)} className="cursor-pointer" pointerEvents="auto" onMouseEnter={handleMouseEnter('e2490b', `Intercooler ${labels.e2490b}`)} onMouseLeave={handleMouseLeave}>
                    <Intercooler x={positions.e2490b.x} y={positions.e2490b.y} scale={0.9} status={status} label={labels.e2490b} onPointerDown={handlePointerDown('e2490b')}/>
                    {isWorkflowEditor && (<foreignObject x={positions.e2490b.x - 20} y={positions.e2490b.y - 10} width="80" height="40" pointerEvents="none" style={{ overflow: 'visible' }}>
                            <div className="w-full h-full relative pointer-events-none">
                                <Handle type="target" id="e2490b-target" position={Position.Left} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, left: -5, top: '50%' }}/>
                                <Handle type="source" id="e2490b-source" position={Position.Right} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, right: -5, top: '50%' }}/>
                                <Handle type="source" id="e2490b-bottom" position={Position.Bottom} style={{ pointerEvents: 'auto', background: '#3b82f6', width: 10, height: 10, bottom: -5, left: '50%' }}/>
                            </div>
                        </foreignObject>)}
                </g>)}

            {/* Inline Editor Overlay */}
            {editingNode && (<foreignObject x={editingNode === 'train' ? 100 : positions[editingNode].x - 20} y={editingNode === 'train' ? -80 : positions[editingNode].y - 50} width="350" height="60" style={{ overflow: 'visible' }} pointerEvents="auto">
                    <div className="flex items-center gap-1.5 bg-surface/95 backdrop-blur border border-brand/30 rounded-lg p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] origin-left animate-in slide-in-from-top-2 zoom-in-95">
                        <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleEditKeyDown} className="w-[140px] bg-transparent border-none px-2 py-1 text-center font-black text-text-secondary text-[12px] outline-none"/>
                        <div className="w-px h-5 bg-border mx-0.5"></div>
                        <button onClick={(e) => {
                e.stopPropagation();
                setLabels(prev => ({ ...prev, [editingNode]: editValue }));
                setEditingNode(null);
            }} className="bg-success/10 hover:bg-success text-success hover:text-white p-1.5 rounded transition-colors" title="Save Name">
                            <Check size={14} strokeWidth={3}/>
                        </button>
                        {editingNode !== 'train' && (<button onClick={(e) => {
                    e.stopPropagation();
                    setVisibility(prev => ({ ...prev, [editingNode]: false }));
                    setEditingNode(null);
                }} className="bg-danger/10 hover:bg-danger text-danger hover:text-white p-1.5 rounded transition-colors" title="Delete Component">
                                <Trash2 size={14} strokeWidth={2.5}/>
                            </button>)}
                        <button onClick={(e) => {
                e.stopPropagation();
                setEditingNode(null);
            }} className="bg-surface-2 hover:bg-surface-2 text-text-secondary hover:text-white p-1.5 rounded transition-colors" title="Cancel">
                            <X size={14} strokeWidth={3}/>
                        </button>
                    </div>
                </foreignObject>)}

            {/* PaR Tooltip */}
            {hoverData && (<g transform={`translate(${hoverData.x}, ${hoverData.y - 120})`} pointerEvents="none">
                    <rect width="180" height="110" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}/>
                    <rect width="180" height="30" rx="12" fill="#f8fafc"/>
                    <rect width="180" height="10" y="20" fill="#f8fafc"/>

                    <text x="12" y="20" className="fill-text-primary font-black text-[10px] uppercase tracking-wider">{hoverData.name}</text>

                    <g transform="translate(12, 45)">
                        <text className="fill-text-subtle font-bold text-[9px] uppercase tracking-tight">PaR Realized</text>
                        <text y="15" className="fill-success font-black text-[14px]">10.85 <tspan className="text-[9px] font-bold">MMSCFD</tspan></text>
                    </g>

                    <g transform="translate(100, 45)">
                        <text className="fill-text-subtle font-bold text-[9px] uppercase tracking-tight">Constraint</text>
                        <text y="15" className="fill-text-primary font-black text-[14px]">11.50 <tspan className="text-[9px] font-bold">MMSCFD</tspan></text>
                    </g>

                    <g transform="translate(12, 85)">
                        <text className="fill-text-subtle font-bold text-[9px] uppercase tracking-tight">Contingent</text>
                        <text y="15" className="fill-warning font-black text-[14px]">0.65 <tspan className="text-[9px] font-bold">MMSCFD</tspan></text>
                    </g>
                </g>)}
        </g>);
};
export default ReinjectionCompressorTrainB;
