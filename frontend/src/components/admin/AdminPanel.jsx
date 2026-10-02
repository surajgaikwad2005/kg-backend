/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';
import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { AdminPanelProvider, useAdminNav, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { ConfigModal } from '@/src/components/admin/ConfigModal';
import { MultiPipelineModal } from '@/src/components/admin/MultiPipelineModal';
import { AdminModals } from '@/src/components/admin/AdminModals';
import { DataModelView } from '@/src/components/admin/views/DataModelView';
import { LogsManagement } from '@/src/components/admin/views/LogsManagement';
const WelcomeView = lazy(() => import('@/src/components/admin/views/WelcomeView').then(m => ({ default: m.WelcomeView })));
const RuleEngineView = lazy(() => import('@/src/components/admin/views/RuleEngineView').then(m => ({ default: m.RuleEngineView })));
const DataConfigView = lazy(() => import('@/src/components/admin/views/DataConfigView').then(m => ({ default: m.DataConfigView })));
const PidReviewView = lazy(() => import('@/src/components/admin/views/PidReviewView').then(m => ({ default: m.PidReviewView })));
const DocsReviewView = lazy(() => import('@/src/components/admin/views/DocsReviewView').then(m => ({ default: m.DocsReviewView })));
const TsReviewView = lazy(() => import('@/src/components/admin/views/TsReviewView').then(m => ({ default: m.TsReviewView })));
const SapJoinsView = lazy(() => import('@/src/components/admin/views/SapJoinsView').then(m => ({ default: m.SapJoinsView })));
const SapTablesView = lazy(() => import('@/src/components/admin/views/SapTablesView').then(m => ({ default: m.SapTablesView })));
const SapMappingView = lazy(() => import('@/src/components/admin/views/SapMappingView').then(m => ({ default: m.SapMappingView })));
const FeedReviewView = lazy(() => import('@/src/components/admin/views/FeedReviewView').then(m => ({ default: m.FeedReviewView })));
const UsersView = lazy(() => import('@/src/components/admin/views/UsersView').then(m => ({ default: m.UsersView })));
const GroupsView = lazy(() => import('@/src/components/admin/views/GroupsView').then(m => ({ default: m.GroupsView })));
const KnowledgeGraphView = lazy(() => import('@/src/components/admin/views/KnowledgeGraphView').then(m => ({ default: m.KnowledgeGraphView })));
const IntegratedViewContainer = lazy(() => import('@/src/components/admin/integrated/IntegratedViewContainer').then(m => ({ default: m.IntegratedViewContainer })));

const PidValidateView    = lazy(() => import('@/src/components/admin/views/PidValidateView').then(m => ({ default: m.PidValidateView })));
const fallback = <div className="flex items-center justify-center h-full text-text-subtle text-sm">Loading…</div>;
function AdminPanelInner() {
    const { view } = useAdminNav();
    const { selectedPlantId } = useAdminEntities();
    const plantKey = selectedPlantId?.id || 'no-plant';

    return (<div className="flex-1 flex flex-col relative min-w-0 h-full">
      <main className="flex-1 bg-canvas p-4 md:p-6 lg:p-8 pb-28 md:pb-32 overflow-y-auto relative">
        <div className="w-full">
          <Suspense fallback={fallback}>
            {view === 'welcome' && <WelcomeView key={`welcome-${plantKey}`} />}
            {view === 'rule-engine' && <RuleEngineView key={`rule-engine-${plantKey}`} />}
            {view === 'data-config' && <DataConfigView key={`data-config-${plantKey}`} />}
            {view === 'pid-review' && <PidReviewView key={`pid-review-${plantKey}`} />}
            {view === 'docs-review' && <DocsReviewView key={`docs-review-${plantKey}`} />}
            {view === 'ts-review' && <TsReviewView key={`ts-review-${plantKey}`} />}
            {view === 'sap-joins' && <SapJoinsView key={`sap-joins-${plantKey}`} />}
            {view === 'sap-tables' && <SapTablesView key={`sap-tables-${plantKey}`} />}
            {view === 'sap-mapping' && <SapMappingView key={`sap-mapping-${plantKey}`} />}
            {view === 'aif-review' && <FeedReviewView key={`aif-review-${plantKey}`} connector="aif" label="AIF" />}
            {view === 'gloc-review' && <FeedReviewView key={`gloc-review-${plantKey}`} connector="gloc" label="GLOC" />}
            {view === 'lopc-review' && <FeedReviewView key={`lopc-review-${plantKey}`} connector="lopc" label="LOPC" />}
            {view === 'integrated-review' && <IntegratedViewContainer key={`integrated-review-${plantKey}`} />}
            {view === 'users' && <UsersView />}
            {view === 'groups' && <GroupsView />}
            {view === 'knowledge-graph' && <KnowledgeGraphView key={`knowledge-graph-${plantKey}`} />}

            {view === 'pid-validate'    && <PidValidateView key={`pid-validate-${plantKey}`} />}
            {view === 'data-model' && (<motion.div key={`data-model-${plantKey}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <DataModelView />
              </motion.div>)}

            {view === 'logs' && (<motion.div key={`logs-${plantKey}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <LogsManagement />
              </motion.div>)}
          </Suspense>
        </div>
      </main>

      <ConfigModal />
      <MultiPipelineModal />
      <AdminModals />
    </div>);
}

export function AdminPanelContent() {
    return <AdminPanelInner />;
}
export default function AdminPanel({ initialView = 'welcome', onViewChange }) {
    return (<AdminPanelProvider initialView={initialView} onViewChange={onViewChange}>
      <AdminPanelInner />
    </AdminPanelProvider>);
}
