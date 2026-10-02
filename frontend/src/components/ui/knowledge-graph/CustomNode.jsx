import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Cog, FileText, Wrench, AlertTriangle, Tag as TagIcon, File, ChevronDown, MoreHorizontal, Maximize2 } from 'lucide-react';

/**
 * CustomNode — knowledge-graph node renderer. Each group maps to a colour, an
 * icon and a matching glow so node types are readable at a glance. Backward
 * compatible: still driven purely by `data.{ label, name, group }`.
 */
import { GROUP_CONFIG, getTypeConfig } from './groups';

const CustomNode = ({ id, data, selected }) => {
    const { name, group, label, isCollapsed, hasChildren, onToggleCollapse, onActionMenuClick, isCompoundParent, isExpandable } = data;
    const meta = getTypeConfig(label || group);
    const { gradient, ring, glow, Icon } = meta;

    // Render as a compound container box if expanded
    if (isCompoundParent) {
        return (
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
                className={`relative flex flex-col w-full h-full rounded-2xl bg-surface-2/30 backdrop-blur-sm border-[3px] border-dashed ${selected ? 'border-brand shadow-lg' : 'border-border'}`}
            >
                <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-10 bg-surface border-b border-border rounded-t-xl flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                        <Icon size={16} className="text-text-secondary" />
                        <span className="text-xs font-bold text-text-primary truncate">{name}</span>
                    </div>
                    {onActionMenuClick && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onActionMenuClick(id); }}
                            aria-label="Node actions"
                            className="p-1 hover:bg-surface-2 rounded-md transition-colors cursor-pointer"
                        >
                            <MoreHorizontal size={14} className="text-text-subtle hover:text-text-primary" />
                        </button>
                    )}
                </div>
                <Handle type="source" position={Position.Bottom} className="opacity-0 pointer-events-none" />
            </motion.div>
        );
    }

    const isEquipment = group === 1;
    const sizeClass = isEquipment ? 'w-16 h-16' : 'w-12 h-12';
    const iconSize = isEquipment ? 22 : 17;

    return (
        <div className={`relative flex flex-col items-center group transition-transform duration-300 ${selected ? 'scale-110' : 'hover:scale-105'}`}>
            <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />

            {/* Soft halo behind the node — intensifies on hover/select */}
            <span
                className={`absolute top-0 ${sizeClass} rounded-full bg-linear-to-br ${gradient} blur-md transition-opacity duration-300 ${
                    selected ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'
                }`}
                aria-hidden
            />

            {hasChildren && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(id); }}
                    aria-label={isCollapsed ? 'Expand node' : 'Collapse node'}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-colors z-10 shadow-sm"
                >
                    <ChevronDown size={10} className={`text-text-secondary transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
                </button>
            )}

            {/* Compound Expandability Indicator */}
            {isExpandable && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-[2px] bg-brand text-white border border-white/30 rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none animate-pulse">
                    <span className="text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
                        <Maximize2 size={8} /> Expandable
                    </span>
                </div>
            )}

            {/* Action Menu Button */}
            {onActionMenuClick && (
                <button
                    onClick={(e) => { e.stopPropagation(); onActionMenuClick(id); }}
                    aria-label="Node actions"
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-colors z-20 shadow-md group-hover:scale-110"
                >
                    <MoreHorizontal size={12} className="text-text-secondary" />
                </button>
            )}

            {/* Node body */}
            <div
                className={`
                    relative ${sizeClass} rounded-full bg-linear-to-br ${gradient}
                    flex items-center justify-center text-white
                    ring-1 ring-inset ring-white/30
                    border-[3px] border-white dark:border-overlay-hover
                    transition-all duration-300
                    ${selected
                        ? `shadow-xl ${glow} ring-4 ${ring}`
                        : 'shadow-md group-hover:shadow-lg'}
                `}
            >
                <Icon size={iconSize} strokeWidth={2.25} className="drop-shadow-sm" />
            </div>

            {/* Label */}
            <div className="absolute top-full mt-2 w-max max-w-32.5 text-center pointer-events-none">
                <div className={`
                    px-2 py-0.5 rounded-md text-xs font-bold transition-all duration-300
                    ${selected
                        ? 'bg-surface border border-border shadow-sm text-text-primary'
                        : 'bg-surface-2/80 backdrop-blur-sm border border-transparent text-text-subtle group-hover:text-text-primary group-hover:border-border'
                    }
                `}>
                    <span className="truncate block" title={name}>{name}</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="opacity-0 pointer-events-none" />
        </div>
    );
};

export default memo(CustomNode);
