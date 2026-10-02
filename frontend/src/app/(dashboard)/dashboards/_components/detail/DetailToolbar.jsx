'use client';

import React from 'react';
import { ChevronLeft, Edit, X, Check, RotateCcw } from 'lucide-react';

export default function DetailToolbar({
  activeGroup,
  editMode,
  handleToggleEditMode,
  handleSaveLayout,
  openAddVisualDrawer,
  setActiveGroupId,
  itemsPerRow,
  setItemsPerRow,
  kpiStyle,
  setKpiStyle,
  handleResetLayout,
}) {
  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-200">
      {/* Primary Header Row */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-3 min-h-[52px]">
        {/* Left section: Back button, breadcrumb pathways, edit mode status indicator */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <button
            onClick={() => {
              setActiveGroupId(null);
              handleToggleEditMode(false);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-2 border border-border hover:border-brand/40 text-text-primary hover:text-brand hover:-translate-x-0.5 transition-all cursor-pointer shrink-0"
            title="Back to Dashboards"
            aria-label="Back to Dashboards"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold truncate min-w-0">
            <span
              onClick={() => {
                setActiveGroupId(null);
                handleToggleEditMode(false);
              }}
              className="hover:text-text-primary transition-colors cursor-pointer shrink-0"
            >
              Dashboards
            </span>
            <span className="text-text-light font-normal shrink-0">/</span>
            <span className="text-text-primary font-extrabold max-w-[150px] sm:max-w-[280px] truncate">
              {activeGroup?.name || 'Dashboard'}
            </span>
          </div>

          {editMode && (
            <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-extrabold bg-warning/10 text-warning border border-warning/20 rounded uppercase tracking-wider animate-pulse select-none shrink-0">
              ✎ Editing
            </span>
          )}
        </div>

        {/* Right section: Main action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!editMode ? (
            <>
              <button
                onClick={() => handleToggleEditMode(true)}
                className="flex items-center gap-1.5 border border-border hover:border-border-strong bg-surface hover:bg-surface-2 px-3 py-1.5 rounded-lg text-xs font-bold text-text-primary transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Edit size={13} />
                <span>Edit Layout</span>
              </button>
              <button
                onClick={openAddVisualDrawer}
                className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-brand/10 hover:shadow-brand/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <PlusWrapper />
                <span>Add / Create Visual</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleResetLayout}
                className="flex items-center gap-1.5 border border-border hover:border-border-strong bg-surface hover:bg-surface-2 px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary transition-all cursor-pointer whitespace-nowrap"
                title="Auto-arrange layout to default grid flow"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset Layout</span>
              </button>
              <button
                onClick={() => handleToggleEditMode(false)}
                className="flex items-center gap-1.5 border border-danger/20 bg-danger/5 hover:bg-danger/10 text-danger px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                <X size={13} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveLayout}
                className="flex items-center gap-1.5 bg-success hover:bg-success/90 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-success/10 hover:shadow-success/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Check size={13} />
                <span>Save Layout</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Secondary Edit Controls Bar (Visible only in edit mode) */}
      {editMode && (
        <div className="flex flex-wrap items-center justify-between bg-surface-2/50 border-t border-border/60 px-4 py-2 gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            {/* Columns layout selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wider select-none whitespace-nowrap">
                KPI Columns:
              </span>
              <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shadow-2xs">
                {['auto', 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setItemsPerRow(num)}
                    className={`h-5.5 rounded text-[9.5px] font-extrabold flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      num === 'auto' ? 'px-2' : 'w-5.5'
                    } ${
                      itemsPerRow === num
                        ? num === 'auto'
                          ? 'bg-success text-white shadow-xs'
                          : 'bg-brand text-white shadow-xs'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    {num === 'auto' ? 'Default' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Style selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wider select-none whitespace-nowrap">
                KPI Style:
              </span>
              <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shadow-2xs">
                <button
                  onClick={() => setKpiStyle('unified')}
                  className={`h-5.5 px-2.5 rounded text-[9.5px] font-extrabold flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    kpiStyle === 'unified'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  Compact
                </button>
                <button
                  onClick={() => setKpiStyle('floating')}
                  className={`h-5.5 px-2.5 rounded text-[9.5px] font-extrabold flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    kpiStyle === 'floating'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  Widget
                </button>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-text-muted font-semibold hidden lg:block">
            Drag widgets to rearrange • Resize from bottom-right corner
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Inline Plus icon to avoid lucide imports duplication issues
function PlusWrapper() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
