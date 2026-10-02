'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { WorkspaceToolbar } from './WorkspaceToolbar';
import { AddTagsPanel } from './AddTagsPanel';
import { TimelineNavigator } from './TimelineNavigator';
import { TagDetailsTable } from './TagDetailsTable';
import { CustomTagModal } from './CustomTagModal';
import { WorkspaceLoading } from './WorkspaceLoading';
import { WorkspaceEmptyState } from './WorkspaceEmptyState';
import { WorkspaceCharts } from './WorkspaceCharts';
import { useWorkspaceData } from '../_hooks/useWorkspaceData';

/**
 * Main workspace visual viewer — slim orchestrator.
 *
 * @param {{
 *   workspace: object,
 *   allTags: string[],
 *   onBack: () => void,
 *   onSave: (updated: object) => void,
 * }} props
 */
export function WorkspaceViewer({ workspace, allTags, onBack, onSave }) {
  const {
    localStart,
    localEnd,
    pendingTags,
    setPendingTags,
    setAddTagsOpen,
    addTagsOpen,
    addTagSearch,
    setAddTagSearch,
    tagData,
    selectedTags,
    loading,
    viewMode,
    setViewMode,
    focusedTag,
    setFocusedTag,
    showGrid,
    setShowGrid,
    showLabels,
    setShowLabels,
    windowHours,
    setWindowHours,
    tableHeight,
    isTableMinimized,
    setIsTableMinimized,
    chartAreaRef,
    togglePending,
    applyTags,
    handleAppendToFormula,
    handleDeleteTag,
    startResize,
    dataStart,
    dataEnd,
    totalDur,
    clampedEnd,
    windowStart,
    navLeft,
    navWidth,
    goFirst,
    goBack,
    goFwd,
    goLast,
    handleZoom,
    resetZoom,
    handleNavigatorMouseDown,
    handleNavigatorClick,
    fetchData,
    deviationInfo,
    deviatedCount,
    toggleTagVisibility,
    displayTags,
    LANE_H,
    tagMetadata,
    isCustomTagModalOpen,
    setIsCustomTagModalOpen,
    customTagName,
    setCustomTagName,
    customTagFormula,
    setCustomTagFormula,
    customTagSearchQuery,
    setCustomTagSearchQuery,
    customTagComputeResult,
    setCustomTagComputeResult,
    customTagComputeError,
    setCustomTagComputeError,
    formulaInputRef,
  } = useWorkspaceData({ workspace, allTags, onSave });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface relative">

      {/* Toolbar + Sub-Toolbar */}
      <WorkspaceToolbar
        workspace={workspace}
        pendingTags={pendingTags}
        showGrid={showGrid}
        showLabels={showLabels}
        loading={loading}
        tagData={tagData}
        selectedTags={selectedTags}
        deviatedCount={deviatedCount}
        onBack={onBack}
        onGridToggle={() => setShowGrid(v => !v)}
        onLabelsToggle={() => setShowLabels(v => !v)}
        onResetZoom={resetZoom}
        onFetchData={() => fetchData(true)}
        onCustomTagOpen={() => {
          setCustomTagName('');
          setCustomTagFormula('');
          setCustomTagSearchQuery('');
          setCustomTagComputeResult(null);
          setCustomTagComputeError(null);
          setIsCustomTagModalOpen(true);
        }}
        onToggleTagVisibility={toggleTagVisibility}
        onAddTagsOpen={() => { setPendingTags(workspace.isBackend ? pendingTags : workspace.tags); setAddTagsOpen(true); }}
      />

      {/* Add Tags Slide-in Panel */}
      <AnimatePresence>
        {addTagsOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              key="add-tags-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-90 bg-surface-inverse/40 sm:hidden"
              onClick={() => setAddTagsOpen(false)}
            />
            <motion.div
              key="add-tags-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 bottom-0 right-0 z-100 w-full sm:w-80"
            >
              <AddTagsPanel
                allTags={allTags}
                pendingTags={pendingTags}
                addTagSearch={addTagSearch}
                onSearchChange={setAddTagSearch}
                onToggle={togglePending}
                onClose={() => setAddTagsOpen(false)}
                onApply={applyTags}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Timeline Navigator */}
      <TimelineNavigator
        tagData={tagData}
        dataStart={dataStart}
        dataEnd={dataEnd}
        totalDur={totalDur}
        windowStart={windowStart}
        clampedEnd={clampedEnd}
        navLeft={navLeft}
        navWidth={navWidth}
        windowHours={windowHours}
        onGoFirst={goFirst}
        onGoBack={goBack}
        onGoFwd={goFwd}
        onGoLast={goLast}
        onWindowPreset={(hours) => { setWindowHours(hours); setWindowEnd(dataEnd); }}
        onNavigatorClick={handleNavigatorClick}
        onNavigatorMouseDown={handleNavigatorMouseDown}
      />

      {/* ── Chart area ── */}
      <div ref={chartAreaRef} className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {loading ? (
          <WorkspaceLoading />
        ) : tagData.length === 0 ? (
          <WorkspaceEmptyState workspace={workspace} />
        ) : (
          <WorkspaceCharts
            viewMode={viewMode}
            displayTags={displayTags}
            LANE_H={LANE_H}
            windowStart={windowStart}
            clampedEnd={clampedEnd}
            showGrid={showGrid}
            showLabels={showLabels}
            handleZoom={handleZoom}
            tagMetadata={tagMetadata}
            resetZoom={resetZoom}
          />
        )}
      </div>

      {/* Tag Details Table (with resize handle) */}
      {!loading && tagData.length > 0 && (
        <TagDetailsTable
          tagData={tagData}
          tagMetadata={tagMetadata}
          deviationInfo={deviationInfo}
          deviatedCount={deviatedCount}
          focusedTag={focusedTag}
          selectedTags={selectedTags}
          viewMode={viewMode}
          isTableMinimized={isTableMinimized}
          tableHeight={tableHeight}
          onFocusTag={setFocusedTag}
          onToggleVisibility={toggleTagVisibility}
          onDeleteTag={handleDeleteTag}
          onMinimize={() => setIsTableMinimized(v => !v)}
          onStartResize={startResize}
          onViewModeChange={setViewMode}
        />
      )}

      {/* Custom Tag Modal */}
      <CustomTagModal
        isOpen={isCustomTagModalOpen}
        allTags={allTags}
        customTagName={customTagName}
        customTagFormula={customTagFormula}
        customTagSearchQuery={customTagSearchQuery}
        customTagComputeResult={customTagComputeResult}
        customTagComputeError={customTagComputeError}
        formulaInputRef={formulaInputRef}
        workspace={workspace}
        localStart={localStart}
        localEnd={localEnd}
        onClose={() => setIsCustomTagModalOpen(false)}
        onNameChange={setCustomTagName}
        onFormulaChange={setCustomTagFormula}
        onSearchChange={setCustomTagSearchQuery}
        onAppendToFormula={handleAppendToFormula}
        onSave={(updatedWorkspace) => { onSave(updatedWorkspace); }}
        onSetError={setCustomTagComputeError}
      />
    </div>
  );
}
