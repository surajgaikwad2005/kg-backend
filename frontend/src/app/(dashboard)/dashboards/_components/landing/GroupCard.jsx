'use client';

import React from 'react';
import { Layout, Trash2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SPARKS, DEFAULT_SPARK } from '../../_data/seedGroups';

export default function GroupCard({ dashboard, group, isStarred, onStar, onClick, onDelete }) {
  const item = dashboard || group || {};
  const themeClasses = {
    blue: {
      borderHover: 'hover:border-blue-500/50',
      iconBg: 'bg-blue-500/10 text-blue-500',
      sparkColor: '#3b82f6',
      countColor: 'text-blue-500',
      topBorder: 'bg-gradient-to-r from-blue-500 to-sky-400'
    },
    green: {
      borderHover: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      sparkColor: '#10b981',
      countColor: 'text-emerald-500',
      topBorder: 'bg-gradient-to-r from-emerald-500 to-teal-400'
    },
    orange: {
      borderHover: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-500',
      sparkColor: '#f59e0b',
      countColor: 'text-amber-500',
      topBorder: 'bg-gradient-to-r from-amber-500 to-orange-400'
    },
    purple: {
      borderHover: 'hover:border-purple-500/50',
      iconBg: 'bg-purple-500/10 text-purple-500',
      sparkColor: '#8b5cf6',
      countColor: 'text-purple-500',
      topBorder: 'bg-gradient-to-r from-purple-500 to-indigo-400'
    },
    red: {
      borderHover: 'hover:border-red-500/50',
      iconBg: 'bg-red-500/10 text-red-500',
      sparkColor: '#ef4444',
      countColor: 'text-red-500',
      topBorder: 'bg-gradient-to-r from-red-500 to-rose-400'
    }
  };

  let rawTheme = (item.theme || item.color || item.border_color || item.borderColor || 'blue').toString().toLowerCase();
  let themeKey = 'blue';
  if (rawTheme.includes('green') || rawTheme.includes('emerald')) themeKey = 'green';
  else if (rawTheme.includes('orange') || rawTheme.includes('amber')) themeKey = 'orange';
  else if (rawTheme.includes('purple') || rawTheme.includes('indigo')) themeKey = 'purple';
  else if (rawTheme.includes('red') || rawTheme.includes('rose')) themeKey = 'red';

  const themeConfig = themeClasses[themeKey];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-surface border border-border rounded-xl p-5 flex flex-col cursor-pointer overflow-hidden transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(99,102,241,0.08),0_10px_10px_-5px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_20px_25px_-5px_rgba(99,102,241,0.15),0_10px_10px_-5px_rgba(0,0,0,0.25)] shadow-sm ${themeConfig.borderHover} h-full min-h-[265px]`}
    >
      {/* Decorative Top Border Highlight */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${themeConfig.topBorder} opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}
      />

      {/* Header zone: icon + action buttons */}
      <div className="flex items-start justify-between mb-3 shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${themeConfig.iconBg}`}>
          <Layout size={18} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all duration-200 cursor-pointer"
            title="Delete Dashboard"
            aria-label="Delete Dashboard"
          >
            <Trash2 size={15} />
          </button>
          <motion.button
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 1.15 }}
            onClick={(e) => {
              e.stopPropagation();
              onStar?.(e);
            }}
            className={`p-1.5 rounded-md transition-colors duration-200 cursor-pointer ${
              isStarred
                ? 'text-amber-400 hover:bg-amber-400/10 opacity-100'
                : 'opacity-0 group-hover:opacity-100 text-text-muted hover:text-amber-400 hover:bg-amber-400/10'
            }`}
            title={isStarred ? 'Remove Star' : 'Star Dashboard'}
            aria-label={isStarred ? 'Remove Star' : 'Star Dashboard'}
          >
            <motion.div
              key={isStarred ? 'starred' : 'unstarred'}
              initial={{ scale: 0.5, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Star
                size={15}
                className={isStarred ? 'fill-amber-400 text-amber-400' : ''}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Title block with fixed min-height for perfect symmetry */}
      <div className="min-h-[46px] flex items-center mb-1">
        <h3 className="text-[16px] font-extrabold text-text-primary leading-tight line-clamp-2 m-0">
          {item.name}
        </h3>
      </div>

      {/* Visuals count */}
      <div className={`text-[11px] font-bold ${themeConfig.countColor} uppercase tracking-wider mb-2 shrink-0`}>
        {item.total_visuals ?? item.visuals?.length ?? 0} Visuals
      </div>

      {/* Description block with fixed min-height */}
      <div className="min-h-[38px] flex items-start mb-3">
        <p className="text-[12.5px] text-text-muted leading-relaxed line-clamp-2 m-0">
          {item.description || 'Custom monitoring dashboard.'}
        </p>
      </div>

      {/* Sparkline Graphic (pinned to bottom) */}
      <div className="h-[42px] w-full mt-auto overflow-visible shrink-0">
        <svg
          viewBox="0 0 300 45"
          className="w-full h-full overflow-visible"
          style={{ overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <path
            fill="none"
            stroke={themeConfig.sparkColor}
            strokeWidth={2}
            strokeLinecap="round"
            d={SPARKS[item.id] || DEFAULT_SPARK}
          />
        </svg>
      </div>
    </div>
  );
}

export const DashboardCard = GroupCard;
