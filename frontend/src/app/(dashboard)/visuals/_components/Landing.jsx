'use client';
import React from 'react';
import { BarChart2, Plus, Trash2, Zap, Database, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border/80 rounded-2xl p-5 flex flex-col justify-between h-[210px] overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-border/50 to-transparent pointer-events-none" />
      <div className="flex flex-col gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-2 animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-2/5 rounded-lg bg-surface-2 animate-pulse" />
          <div className="h-3 w-3/5 rounded-md bg-canvas animate-pulse" />
        </div>
      </div>
      <div className="h-[64px] flex gap-1.5 flex-wrap items-start content-start pt-2 border-t border-border/40">
        {[60, 80, 50].map(w => (
          <div key={w} className="h-6 rounded-md bg-surface-2 animate-pulse" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.045, duration: 0.26, ease: [0.4, 0, 0.2, 1] },
  }),
};

export function Landing({ workspaces, onOpen, onNew, onDelete, isLoadingBackend, fetchError = null, onRetry }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-4 rounded-full bg-brand" />
              <span className="text-2xs font-black text-brand uppercase tracking-widest">Analytics Engine</span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-black text-text-primary tracking-tight m-0">Data Visuals</h1>
            <p className="text-label text-text-subtle mt-1.5 font-medium max-w-md">
              Create and manage multi-tag visualization workspaces connected to your live data.
              {isLoadingBackend && (
                <span className="ml-2 inline-flex items-center gap-1 text-brand font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  Syncing…
                </span>
              )}
            </p>
          </div>

          <button
            onClick={onNew}
            className="flex items-center gap-2 self-start sm:self-auto shrink-0 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl border-none cursor-pointer text-label font-black uppercase tracking-wider shadow-card hover:shadow-card hover:-translate-y-px active:translate-y-0 transition-all duration-200"
          >
            <Plus size={15} />
            <span>New Visual</span>
          </button>
        </div>

        {/* ── Error state ── */}
        <AnimatePresence>
          {fetchError && !isLoadingBackend && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="flex flex-col items-center justify-center gap-5 py-20 sm:py-28 text-center"
            >
              <div className="w-20 h-20 bg-surface border-2 border-dashed border-danger/40 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={34} className="text-danger" strokeWidth={1.2} />
              </div>
              <div>
                <p className="text-base font-black text-danger uppercase tracking-wide">Failed to Load Visuals</p>
                <p className="text-label text-text-subtle mt-1.5">{fetchError}</p>
              </div>
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-brand/30 text-brand rounded-xl cursor-pointer text-label font-black hover:bg-brand/10 transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ── */}
        <AnimatePresence>
          {workspaces.length === 0 && !isLoadingBackend && !fetchError && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-5 py-20 sm:py-28 text-center"
            >
              <div className="w-20 h-20 bg-surface border-2 border-dashed border-border rounded-2xl flex items-center justify-center">
                <BarChart2 size={34} className="text-text-subtle" strokeWidth={1.2} />
              </div>
              <div>
                <p className="text-base font-black text-text-muted uppercase tracking-wide">No Visuals Yet</p>
                <p className="text-label text-text-subtle mt-1.5">
                  Click <strong className="text-brand">New Visual</strong> to build your first workspace.
                </p>
              </div>
              <button
                onClick={onNew}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-brand/30 text-brand rounded-xl cursor-pointer text-label font-black hover:bg-brand/10 transition-colors"
              >
                <Plus size={14} /> Create your first visual
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skeleton loading ── */}
        {isLoadingBackend && workspaces.length === 0 && !fetchError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Workspace cards ── */}
        {workspaces.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            <AnimatePresence>
              {workspaces.map((ws, i) => (
                <motion.div
                  key={ws.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.96 }}
                  layout
                  onClick={() => onOpen(ws.id)}
                  className="group relative bg-surface border border-border/80 rounded-2xl p-5 shadow-card hover:shadow-panel hover:-translate-y-1 hover:border-brand/30 transition-all duration-200 cursor-pointer flex flex-col justify-between h-[210px] overflow-hidden"
                >
                  {/* Top accent line on hover */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-brand opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Upper Section */}
                  <div className="flex flex-col gap-3">
                    {/* Top Row: Icon & Status / Actions */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center border border-brand/15 shrink-0 group-hover:scale-105 group-hover:bg-brand/15 transition-all duration-200">
                        <BarChart2 size={18} className="text-brand" strokeWidth={2} />
                      </div>

                      <div className="flex items-center gap-2">
                        {ws.isBackend && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5 uppercase tracking-wide">
                            <Zap size={9} fill="currentColor" /> Synced
                          </span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); onDelete(ws.id); }}
                          title="Delete workspace"
                          aria-label="Delete workspace"
                          className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer text-text-subtle opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger transition-all duration-150"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Name & Subtitle */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="text-base font-black text-text-primary m-0 tracking-tight truncate group-hover:text-brand transition-colors">
                        {ws.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-2xs font-semibold text-text-subtle uppercase tracking-wider">
                        <Database size={11} className="text-text-subtle" />
                        <span>{ws.isBackend ? 'Remote' : 'Local'}</span>
                        <span className="text-border">·</span>
                        <span className="text-text-muted font-bold">{ws.tags.length} tag{ws.tags.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tag Pills Section - Fixed height container */}
                  <div className="h-[64px] flex flex-wrap gap-1.5 items-start content-start overflow-hidden pt-2 border-t border-border/40">
                    {ws.tags.length > 0 ? (
                      <>
                        {ws.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-surface-2 text-text-secondary border border-border/80 flex items-center gap-1.5 shrink-0 max-w-[160px]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand/70 shrink-0" />
                            <span className="truncate">{t.split('.').pop()}</span>
                          </span>
                        ))}
                        {ws.tags.length > 4 && (
                          <span className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold bg-surface-2/60 text-text-muted border border-border/60 shrink-0">
                            +{ws.tags.length - 4} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="px-2.5 py-1 bg-surface-2/40 text-text-subtle rounded-md text-[11px] font-medium border border-border/40 italic">
                        No tags assigned
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
