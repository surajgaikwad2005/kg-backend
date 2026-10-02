'use client';

import React, { useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';

import DetailView from '../_components/detail/DetailView';
import AddVisualDrawer from '../_components/drawer/AddVisualDrawer';
import VisualForm from '../_components/drawer/VisualForm';

import { Layout, AlertTriangle } from 'lucide-react';
import { useDashboardLayout } from '../_hooks/useDashboardLayout';
import { useVisualDrawer } from '../_hooks/useVisualDrawer';
import { SkeletonDashboardDetail } from '../_components/landing/DashboardSkeleton';
import { useDashboardDetail } from '../_queries/useDashboardQueries';
import { useApp } from '@/src/context/AppContext';

export default function DashboardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const activeGroupId = params.id;
  const gridContainerRef = useRef(null);
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';

  // The full record for this dashboard (visuals included) — its own cache
  // entry, independent of the list query the landing page/layout use.
  const {
    data: activeGroup,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useDashboardDetail(plantCode, activeGroupId);

  // 2. Drag / resize visual layout hook
  const {
    editMode,
    tempVisuals,
    setTempVisuals,
    handleToggleEditMode,
    startDragging,
    startResizing,
    handleSaveLayout,
    draggingId,
    handleResetLayout,
    handleMoveSummaryVisual,
  } = useDashboardLayout({
    plantCode,
    activeGroupId,
    activeGroup,
  });

  // 3. Configure/add visual widget hook
  const {
    isVisualDrawerOpen,
    setIsVisualDrawerOpen,
    editingVisualId,
    editingVisual,
    isSubmitting,
    drawerTitle,
    setDrawerTitle,
    drawerVisualType,
    setDrawerVisualType,
    drawerMetricIndex,
    drawerAggregation,
    setDrawerAggregation,
    isTitleAutoFilled,
    handleFormInstance,
    handleMetricChange,
    openAddVisualDrawer,
    openEditVisualDrawer,
    handleSaveVisual,
    handleDeleteVisual,
  } = useVisualDrawer({
    plantCode,
    activeGroupId,
    activeGroup,
    editMode,
    tempVisuals,
    setTempVisuals,
  });

  // Derived preview configuration for visual creation form
  const previewWsConfig = useMemo(() => {
    return {
      id: 'preview',
      name: drawerTitle || 'Preview Chart',
      chartType: drawerVisualType,
      type: drawerVisualType,
      chartData: {},
      data: {},
      is_live: true,
    };
  }, [drawerVisualType, drawerTitle]);

  if (isLoadingDetail) {
    return <SkeletonDashboardDetail />;
  }

  if (isDetailError) {
    return (
      <div className="w-full flex flex-col min-h-screen items-center justify-center bg-app p-8 text-center">
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md flex flex-col items-center shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-extrabold text-text-primary mb-1.5">Failed to Load Dashboard</h3>
          <p className="text-xs text-text-muted mb-6 max-w-xs leading-relaxed font-medium">
            {detailError?.message || 'Something went wrong while loading this dashboard.'}
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/dashboards')}
              className="px-5 py-2.5 border border-border rounded-xl bg-surface text-text-secondary text-xs font-bold cursor-pointer hover:bg-surface-2 transition-colors"
            >
              Back to Dashboards
            </button>
            <button
              onClick={() => refetchDetail()}
              className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand/20 cursor-pointer active:scale-95"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="w-full flex flex-col min-h-screen items-center justify-center bg-app p-8 text-center">
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md flex flex-col items-center shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-4">
            <Layout size={24} />
          </div>
          <h3 className="text-lg font-extrabold text-text-primary mb-1.5">Dashboard Not Found</h3>
          <p className="text-xs text-text-muted mb-6 max-w-xs leading-relaxed font-medium">
            The requested dashboard <code className="text-brand bg-surface-2 px-1.5 py-0.5 rounded font-mono text-[11px]">{activeGroupId}</code> could not be found or has been removed.
          </p>
          <button
            onClick={() => router.push('/dashboards')}
            className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand/20 cursor-pointer active:scale-95"
          >
            Back to Dashboards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gridContainerRef} className="dashboards-style-scope w-full h-full flex-1 flex flex-col bg-app text-text-primary min-h-0">
      <div className="relative flex-1 flex overflow-hidden">
        {/* Main dashboard body viewport */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <DetailView
            activeGroup={activeGroup}
            editMode={editMode}
            tempVisuals={tempVisuals}
            handleToggleEditMode={handleToggleEditMode}
            handleSaveLayout={handleSaveLayout}
            startDragging={startDragging}
            startResizing={startResizing}
            openAddVisualDrawer={openAddVisualDrawer}
            openEditVisualDrawer={openEditVisualDrawer}
            handleDeleteVisual={handleDeleteVisual}
            setActiveGroupId={() => router.push('/dashboards')}
            gridContainerRef={gridContainerRef}
            draggingId={draggingId}
            handleResetLayout={handleResetLayout}
            handleMoveSummaryVisual={handleMoveSummaryVisual}
            isLoading={isLoadingDetail}
          />
        </main>

        {/* Visual Configuration Drawer */}
        <AddVisualDrawer
          isOpen={isVisualDrawerOpen}
          onClose={() => setIsVisualDrawerOpen(false)}
          onSave={handleSaveVisual}
          editingVisualId={editingVisualId}
          isSubmitting={isSubmitting}
        >
          <VisualForm
            drawerTitle={drawerTitle}
            setDrawerTitle={setDrawerTitle}
            drawerVisualType={drawerVisualType}
            setDrawerVisualType={setDrawerVisualType}
            drawerMetricIndex={drawerMetricIndex}
            handleMetricChange={handleMetricChange}
            drawerAggregation={drawerAggregation}
            setDrawerAggregation={setDrawerAggregation}
            previewWsConfig={previewWsConfig}
            isTitleAutoFilled={isTitleAutoFilled}
            onFormInstance={handleFormInstance}
            editingVisual={editingVisual}
          />
        </AddVisualDrawer>
      </div>
    </div>
  );
}
