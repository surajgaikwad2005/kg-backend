'use client';
import React from 'react';
import { X } from 'lucide-react';
import { useReactFlow, Handle, Position } from '@xyflow/react';

const FISHBONE_CATEGORIES = [
  { key: 'man',     label: 'Man / People',  top: true,  color: '#8b5cf6' },
  { key: 'machine', label: 'Machine',        top: true,  color: '#3b82f6' },
  { key: 'method',  label: 'Method',         top: true,  color: '#10b981' },
  { key: 'material',label: 'Material',       top: false, color: '#f59e0b' },
  { key: 'environ', label: 'Environment',    top: false, color: '#06b6d4' },
  { key: 'measure', label: 'Measurement',    top: false, color: '#f43f5e' },
];

export const FishboneCanvasNode = React.memo(({ id, data }) => {
  const { setNodes } = useReactFlow();
  const [editingCell, setEditingCell] = React.useState(null);

  const W = 900, H = 520;
  const SPINE_Y = H / 2;
  const SPINE_START = 60;
  const SPINE_END = W - 140;
  const HEAD_X = W - 60;

  const topKeys = FISHBONE_CATEGORIES.filter(c => c.top);
  const bottomKeys = FISHBONE_CATEGORIES.filter(c => !c.top);
  const spineLength = SPINE_END - SPINE_START;
  const topAttachPoints    = topKeys.map((_, i) => SPINE_START + (i + 1) * (spineLength / topKeys.length));
  const bottomAttachPoints = bottomKeys.map((_, i) => SPINE_START + (i + 1) * (spineLength / bottomKeys.length));
  const boneAngle = 45;
  const boneH = 110;
  const boneDx = boneH / Math.tan((boneAngle * Math.PI) / 180);

  const categories = data.categories || {};

  const addCause = (key) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== id) return n;
      const cats = { ...n.data.categories };
      cats[key] = [...(cats[key] || []), ''];
      return { ...n, data: { ...n.data, categories: cats } };
    }));
    setTimeout(() => setEditingCell({ cat: key, idx: (categories[key] || []).length }), 20);
  };

  const updateCause = (key, idx, value) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== id) return n;
      const cats = { ...n.data.categories };
      const causes = [...(cats[key] || [])];
      causes[idx] = value;
      cats[key] = causes;
      return { ...n, data: { ...n.data, categories: cats } };
    }));
  };

  const removeCause = (key, idx) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== id) return n;
      const cats = { ...n.data.categories };
      cats[key] = (cats[key] || []).filter((_, i) => i !== idx);
      return { ...n, data: { ...n.data, categories: cats } };
    }));
  };

  const renderCauseList = (cat, causes, above) => (
    <div className={`flex flex-col items-center gap-1 ${above ? 'mb-1' : 'mt-0.5'}`}>
      {causes.map((cause, ci) => (
        <div key={ci} className="flex items-center gap-1 w-full">
          {editingCell?.cat === cat.key && editingCell.idx === ci ? (
            <input autoFocus value={cause} onChange={e => updateCause(cat.key, ci, e.target.value)} onBlur={() => setEditingCell(null)} onKeyDown={e => e.key === 'Enter' && setEditingCell(null)} className="flex-1 text-[11px] px-2 py-0.5 rounded border outline-none" style={{ borderColor: cat.color }} />
          ) : (
            <span onClick={() => setEditingCell({ cat: cat.key, idx: ci })} className="flex-1 text-[11px] font-semibold text-text-secondary cursor-pointer hover:text-text-primary text-center truncate">
              {cause || <span className="italic text-text-subtle">click to edit</span>}
            </span>
          )}
          <button onClick={() => removeCause(cat.key, ci)} className="text-text-subtle hover:text-danger transition-colors"><X className="w-2.5 h-2.5" /></button>
        </div>
      ))}
      <button onClick={() => addCause(cat.key)} className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full hover:opacity-90 transition-opacity" style={{ color: cat.color, background: cat.color + '15', border: `1px solid ${cat.color}40` }}>
        + Add cause
      </button>
    </div>
  );

  const categoryLabel = (cat) => (
    <div className="text-center text-[11px] font-black uppercase tracking-wide px-2 py-1 rounded-lg" style={{ color: cat.color, background: cat.color + '18', border: `1.5px solid ${cat.color}40` }}>
      {cat.label}
    </div>
  );

  return (
    <div className="relative" style={{ width: W, height: H }}>
      <div className="absolute inset-0 bg-surface rounded-3xl border-2 border-border shadow-2xl overflow-hidden" />

      <svg className="absolute inset-0 pointer-events-none" width={W} height={H} style={{ zIndex: 1 }}>
        <line x1={SPINE_START} y1={SPINE_Y} x2={SPINE_END} y2={SPINE_Y} stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <polygon points={`${SPINE_END},${SPINE_Y - 18} ${HEAD_X},${SPINE_Y} ${SPINE_END},${SPINE_Y + 18}`} fill="#475569" />

        {topAttachPoints.map((ax, i) => {
          const cat = topKeys[i];
          const tipX = ax - boneDx;
          const tipY = SPINE_Y - boneH;
          return (
            <g key={cat.key}>
              <line x1={ax} y1={SPINE_Y} x2={tipX} y2={tipY} stroke={cat.color} strokeWidth="2.5" strokeLinecap="round" />
              {(categories[cat.key] || []).map((_, ci) => {
                const t = (ci + 1) / Math.max((categories[cat.key]?.length || 1) + 1, 3);
                const lx1 = ax + t * (tipX - ax);
                const ly1 = SPINE_Y + t * (tipY - SPINE_Y);
                const perpAngle = Math.atan2(tipY - SPINE_Y, tipX - ax) - Math.PI / 2;
                return <line key={ci} x1={lx1} y1={ly1} x2={lx1 + 18 * Math.cos(perpAngle)} y2={ly1 + 18 * Math.sin(perpAngle)} stroke={cat.color} strokeWidth="1.5" opacity={0.6} />;
              })}
            </g>
          );
        })}

        {bottomAttachPoints.map((ax, i) => {
          const cat = bottomKeys[i];
          const tipX = ax - boneDx;
          const tipY = SPINE_Y + boneH;
          return (
            <g key={cat.key}>
              <line x1={ax} y1={SPINE_Y} x2={tipX} y2={tipY} stroke={cat.color} strokeWidth="2.5" strokeLinecap="round" />
              {(categories[cat.key] || []).map((_, ci) => {
                const t = (ci + 1) / Math.max((categories[cat.key]?.length || 1) + 1, 3);
                const lx1 = ax + t * (tipX - ax);
                const ly1 = SPINE_Y + t * (tipY - SPINE_Y);
                const perpAngle = Math.atan2(tipY - SPINE_Y, tipX - ax) + Math.PI / 2;
                return <line key={ci} x1={lx1} y1={ly1} x2={lx1 + 18 * Math.cos(perpAngle)} y2={ly1 + 18 * Math.sin(perpAngle)} stroke={cat.color} strokeWidth="1.5" opacity={0.6} />;
              })}
            </g>
          );
        })}
      </svg>

      {/* Problem head label */}
      <div className="absolute flex flex-col items-center justify-center text-center" style={{ right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
        <div className="bg-danger text-white font-black text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-xl shadow-lg leading-tight max-w-[110px]">{data.problemName || 'Problem'}</div>
        {data.severity && <span className="mt-1 text-[9px] bg-warning/10 text-warning font-bold px-2 py-0.5 rounded-full border border-warning/20">{data.severity}</span>}
      </div>

      {/* Top bones */}
      {topAttachPoints.map((ax, i) => {
        const cat = topKeys[i];
        const tipX = ax - boneDx;
        const tipY = SPINE_Y - boneH;
        const causes = categories[cat.key] || [];
        return (
          <div key={cat.key} className="absolute" style={{ left: tipX - 70, top: tipY - 115, width: 140, zIndex: 10 }}>
            {categoryLabel(cat)}
            {renderCauseList(cat, causes, true)}
          </div>
        );
      })}

      {/* Bottom bones */}
      {bottomAttachPoints.map((ax, i) => {
        const cat = bottomKeys[i];
        const tipX = ax - boneDx;
        const tipY = SPINE_Y + boneH;
        const causes = categories[cat.key] || [];
        return (
          <div key={cat.key} className="absolute" style={{ left: tipX - 70, top: tipY + 10, width: 140, zIndex: 10 }}>
            {renderCauseList(cat, causes, false)}
            {categoryLabel(cat)}
          </div>
        );
      })}

      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[9px] font-bold text-text-subtle uppercase tracking-wider" style={{ zIndex: 5 }}>
        <span>Ishikawa / Fishbone</span>
        <span className="w-8 h-px bg-border-strong block" />
        <span>Click bone labels to edit causes</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <Handle type="target" position={Position.Top} className="!opacity-0" />
    </div>
  );
});
FishboneCanvasNode.displayName = 'FishboneCanvasNode';
