'use client';
import React from 'react';
import { AgentProvider, useAgent } from './_context/AgentContext';
import { AgentDashboard } from './_components/AgentDashboard';
import { AgentCanvasIDE } from './_components/AgentCanvasIDE';
import { PageHeader } from '@/src/components/layout/PageHeader';

function AgentFactoryInner() {
  const { view } = useAgent();

  return (
    <>
      <PageHeader showDateRange title="Agent Factory" subtitle="AI Agent Configuration" />
      <AgentDashboard />
      {view === 'canvas' && <AgentCanvasIDE />}
    </>
  );
}

export default function AgentFactoryPage() {
  return (
    <AgentProvider>
      <AgentFactoryInner />
    </AgentProvider>
  );
}
