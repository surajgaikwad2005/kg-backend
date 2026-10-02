'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Minus, Server } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { useAdminNav, usePnidForm } from '@/src/components/admin/AdminPanelContext';
import { PipelineRunRow } from '@/src/components/admin/pipeline/PipelineRunRow';
import { usePipelineRunView } from '@/src/components/admin/pipeline/usePipelineRunView';

/**
 * The expanded view of a pipeline run.
 *
 * Minimize sends it to PipelineRunDock (under the Data Configuration heading)
 * WITHOUT stopping anything: the polling lives in usePipelineRuns inside the
 * layout-level provider, so a minimized — or navigated-away-from — run keeps
 * progressing and can be expanded again at any time.
 *
 * Per-stage progress, statuses, and the cancel/retry controls all come from
 * PipelineRunRow, the same component the dock renders.
 */
export function MultiPipelineModal() {
    const {
        multiPipelineOpen, setMultiPipelineOpen, multiPipelineTargetView, setView,
        multiPipelineMinimized, setMultiPipelineMinimized,
    } = useAdminNav();
    const { pnidPipelineRunning, setPnidPipelineRunning } = usePnidForm();
    const {
        activeRows, allDone, anyRunning, overallPercent,
        requestCancel, requestRetry, canRetryStage, isCancelling, isRetrying,
    } = usePipelineRunView();
    const [countdown, setCountdown] = useState(null);
    const timerRef = useRef(null);

    const isOpen = multiPipelineOpen && !multiPipelineMinimized;

    const handleContinue = useCallback(() => {
        clearInterval(timerRef.current);
        setCountdown(null);
        setMultiPipelineOpen(false);
        setMultiPipelineMinimized(false);
        setPnidPipelineRunning(false);
        setView(multiPipelineTargetView);
    }, [setMultiPipelineOpen, setMultiPipelineMinimized, setPnidPipelineRunning, setView, multiPipelineTargetView]);

    const handleMinimize = useCallback(() => {
        clearInterval(timerRef.current);
        setCountdown(null);
        setMultiPipelineMinimized(true);
    }, [setMultiPipelineMinimized]);

    useEffect(() => {
        if (!allDone || !isOpen) {
            clearInterval(timerRef.current);
            setCountdown(null);
            return;
        }
        setCountdown(3);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [allDone, isOpen]);

    useEffect(() => {
        if (countdown === 0) handleContinue();
    }, [countdown, handleContinue]);

    return (
      // Intentionally non-dismissable (no onClose): while pipelines run the user
      // either minimizes to the dock or waits for Continue. Closing outright
      // would orphan the run with nothing on screen pointing back to it.
      <Modal open={isOpen} size="lg" closeOnBackdrop={false} ariaLabelledBy="multi-pipeline-modal-title" className="flex flex-col max-h-[90vh] border border-border/50 p-5 sm:p-8 overflow-hidden">
              {/* Premium Background Glows */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand/20 rounded-full mix-blend-screen filter blur-[80px] opacity-70 pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-brand/10 rounded-full mix-blend-screen filter blur-[80px] opacity-70 pointer-events-none" />

              <button
                type="button"
                onClick={handleMinimize}
                aria-label="Minimize pipeline run — keeps running in the background"
                title="Minimize — the run continues in the background"
                className="absolute top-4 right-4 z-20 p-2 rounded-lg text-text-muted bg-surface/80 border border-border/60 hover:text-text-primary hover:border-border-strong transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Minus size={15} />
              </button>

              <div className="mb-6 sm:mb-8 text-center relative z-10 shrink-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-brand/10 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-brand/10 rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform duration-500" />
                  <div className="relative w-full h-full bg-surface border border-brand/20 shadow-lg shadow-brand/10 rounded-2xl flex items-center justify-center">
                    <Server size={28} className={`text-brand ${anyRunning || pnidPipelineRunning ? 'animate-pulse' : ''}`} />
                  </div>
                  {(anyRunning || pnidPipelineRunning) && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-brand/50"
                      animate={{ scale: [1, 1.1, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                <h3 id="multi-pipeline-modal-title" className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                  Running Data Pipelines
                  {overallPercent !== null && !allDone && (
                    <span className="ml-2 text-brand tabular-nums">{overallPercent}%</span>
                  )}
                </h3>
                <p className="text-sm text-text-muted mt-2 max-w-[85%] mx-auto leading-relaxed">
                  {allDone
                    ? 'All pipelines finished. Please review the results to continue.'
                    : 'Processing your configured data sources. You can minimize this — it keeps running in the background.'}
                </p>
              </div>

              <div className="space-y-4 mb-6 sm:mb-8 relative z-10 min-h-0 overflow-y-auto thin-scrollbar pr-1 -mr-1">
                <AnimatePresence>
                  {activeRows.map(({ key, label, icon, run }) => (
                    <PipelineRunRow
                      key={key}
                      label={label}
                      icon={icon}
                      run={run}
                      onCancel={() => requestCancel(key, label)}
                      onRetry={canRetryStage(key) ? () => requestRetry(key) : undefined}
                      isCancelling={isCancelling}
                      isRetrying={isRetrying}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="sm:w-auto w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide bg-surface-2 text-text-secondary border border-border hover:border-border-strong hover:text-text-primary transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Run in background
                </button>
                <motion.button
                  type="button"
                  onClick={handleContinue}
                  disabled={!allDone}
                  whileHover={allDone ? { scale: 1.02, y: -2 } : {}}
                  whileTap={allDone ? { scale: 0.98 } : {}}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                    ${allDone
                      ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow-lg shadow-brand/25 border border-brand/50 cursor-pointer'
                      : 'bg-surface-2 text-text-muted border border-border shadow-none cursor-not-allowed opacity-70'}`}
                >
                  {allDone
                    ? countdown > 0
                      ? `Continue (${countdown})`
                      : <>Continue <ArrowRight size={16} /></>
                    : 'Please wait...'}
                </motion.button>
              </div>
      </Modal>
    );
}
