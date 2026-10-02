/**
 * Template generator functions for the Workspace canvas.
 * Each generator returns { nodes, edges } to be applied with setNodes / setEdges.
 * They accept a `getId` function to produce unique node IDs.
 */

/** ── Causal / Fishbone / 5-Whys RCA layout ─────────────────────────────── */
export function buildRCALayout({ rcaForm, selectedTemplate, getId }) {
  const { eventName, eventDate, equipment, description, severity } = rcaForm;
  const problemId = getId();

  if (selectedTemplate === 'causal') {
    const [manId, machineId, methodId, materialId, envId, measureId, findingsId, evidenceId] =
      Array.from({ length: 8 }, () => getId());

    return {
      nodes: [
        { id: problemId, type: 'rcaProblem',   position: { x: 550, y: 0 },   data: { eventName, eventDate, equipment, description, severity } },
        { id: manId,     type: 'rcaCategory',  position: { x: 0, y: 200 },   data: { category: 'Man/People',   causes: [], attachments: [] } },
        { id: machineId, type: 'rcaCategory',  position: { x: 0, y: 420 },   data: { category: 'Machine',      causes: [], attachments: [] } },
        { id: methodId,  type: 'rcaCategory',  position: { x: 0, y: 640 },   data: { category: 'Method',       causes: [], attachments: [] } },
        { id: materialId,type: 'rcaCategory',  position: { x: 1100, y: 200 },data: { category: 'Material',     causes: [], attachments: [] } },
        { id: envId,     type: 'rcaCategory',  position: { x: 1100, y: 420 },data: { category: 'Environment',  causes: [], attachments: [] } },
        { id: measureId, type: 'rcaCategory',  position: { x: 1100, y: 640 },data: { category: 'Measurement',  causes: [], attachments: [] } },
        { id: evidenceId,type: 'rcaEvidence',  position: { x: 520, y: 420 }, data: { signals: [] } },
        { id: findingsId,type: 'rcaFindings',  position: { x: 550, y: 840 }, data: { rootCause: '', actions: '', insights: '' } },
      ],
      edges: [
        { id: 'e-p-man', source: problemId, target: manId,      type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2.5 } },
        { id: 'e-p-mac', source: problemId, target: machineId,  type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
        { id: 'e-p-met', source: problemId, target: methodId,   type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2.5 } },
        { id: 'e-p-mat', source: problemId, target: materialId, type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2.5 } },
        { id: 'e-p-env', source: problemId, target: envId,      type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2.5 } },
        { id: 'e-p-mea', source: problemId, target: measureId,  type: 'smoothstep', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2.5 } },
        { id: 'e-ev-f',  source: evidenceId,target: findingsId, type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '6 3' } },
        { id: 'e-p-ev',  source: problemId, target: evidenceId, type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '6 3' } },
      ],
    };
  }

  if (selectedTemplate === 'fishbone') {
    const fishId = getId();
    const findingsId = getId();
    return {
      nodes: [
        {
          id: fishId, type: 'fishboneCanvas', position: { x: 60, y: 60 },
          data: { problemName: eventName || 'Our Problem', severity, equipment, categories: { man: [], machine: [], method: [], material: [], environ: [], measure: [] } },
          draggable: true,
        },
        { id: findingsId, type: 'rcaFindings', position: { x: 300, y: 660 }, data: { rootCause: '', actions: '', insights: '' } },
      ],
      edges: [
        { id: 'e-fish-f', source: fishId, target: findingsId, type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 3 } },
      ],
    };
  }

  if (selectedTemplate === '5whys') {
    const [w1, w2, w3, w4, w5, findingsId] = Array.from({ length: 6 }, () => getId());
    const whyColors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'];
    return {
      nodes: [
        { id: problemId, type: 'rcaProblem', position: { x: 280, y: 0 },    data: { eventName, eventDate, equipment, description, severity } },
        { id: w1, type: 'whyNode', position: { x: 290, y: 240 },  data: { label: 'Why did this happen?',   level: '0', value: '' } },
        { id: w2, type: 'whyNode', position: { x: 290, y: 450 },  data: { label: 'Why? (Drill deeper)',     level: '1', value: '' } },
        { id: w3, type: 'whyNode', position: { x: 290, y: 660 },  data: { label: 'Why? (Continue)',         level: '2', value: '' } },
        { id: w4, type: 'whyNode', position: { x: 290, y: 870 },  data: { label: 'Why? (Going deeper)',     level: '3', value: '' } },
        { id: w5, type: 'whyNode', position: { x: 290, y: 1080 }, data: { label: 'Root Cause (Why?)',       level: '4', value: '' } },
        { id: findingsId, type: 'rcaFindings', position: { x: 260, y: 1300 }, data: { rootCause: '', actions: '', insights: '' } },
      ],
      edges: [
        { id: 'e-p-w1',  source: problemId, target: w1,         type: 'smoothstep', animated: true, style: { stroke: whyColors[0], strokeWidth: 3 } },
        { id: 'e-w1-w2', source: w1,        target: w2,         type: 'smoothstep', animated: true, style: { stroke: whyColors[1], strokeWidth: 3 } },
        { id: 'e-w2-w3', source: w2,        target: w3,         type: 'smoothstep', animated: true, style: { stroke: whyColors[2], strokeWidth: 3 } },
        { id: 'e-w3-w4', source: w3,        target: w4,         type: 'smoothstep', animated: true, style: { stroke: whyColors[3], strokeWidth: 3 } },
        { id: 'e-w4-w5', source: w4,        target: w5,         type: 'smoothstep', animated: true, style: { stroke: whyColors[4], strokeWidth: 3 } },
        { id: 'e-w5-f',  source: w5,        target: findingsId, type: 'smoothstep', animated: true, style: { stroke: '#10b981',   strokeWidth: 3 } },
      ],
    };
  }

  return { nodes: [], edges: [] };
}

/** ── Correlation Analysis ─────────────────────────────────────────────── */
export function buildCorrelationLayout({ getId }) {
  const titleId = getId();
  const resultId = getId();
  return {
    nodes: [
      {
        id: titleId, type: 'default', position: { x: 400, y: 0 },
        data: { label: '🔗 Correlation Analysis' },
        style: { background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)', color: '#fff', borderRadius: '14px', padding: '16px 28px', fontWeight: '900', fontSize: '15px', border: 'none', boxShadow: '0 8px 20px rgba(109,40,217,0.25)', minWidth: '260px', textAlign: 'center' },
      },
      { id: resultId, type: 'correlationMatrix', position: { x: 300, y: 450 }, data: { label: 'Correlation Matrix' } },
    ],
    edges: [],
  };
}

/** ── Anomaly Detection ─────────────────────────────────────────────────── */
export function buildAnomalyLayout({ getId }) {
  const titleId = getId();
  const alertsId = getId();
  return {
    nodes: [
      {
        id: titleId, type: 'default', position: { x: 350, y: 0 },
        data: { label: '⚠️ Anomaly Detection' },
        style: { background: 'linear-gradient(135deg,#d97706 0%,#b45309 100%)', color: '#fff', borderRadius: '14px', padding: '16px 28px', fontWeight: '900', fontSize: '15px', border: 'none', boxShadow: '0 8px 20px rgba(217,119,6,0.25)', minWidth: '240px', textAlign: 'center' },
      },
      { id: alertsId, type: 'anomalyAlerts', position: { x: 300, y: 450 }, data: { label: 'Workspace Observer' } },
    ],
    edges: [],
  };
}

/** ── Trend Analysis ────────────────────────────────────────────────────── */
export function buildTrendLayout({ getId }) {
  const titleId = getId();
  const statsId = getId();
  return {
    nodes: [
      {
        id: titleId, type: 'default', position: { x: 350, y: 0 },
        data: { label: '📈 Trend Analysis' },
        style: { background: 'linear-gradient(135deg,#059669 0%,#047857 100%)', color: '#fff', borderRadius: '14px', padding: '16px 28px', fontWeight: '900', fontSize: '15px', border: 'none', boxShadow: '0 8px 20px rgba(5,150,105,0.25)', minWidth: '220px', textAlign: 'center' },
      },
      { id: statsId, type: 'trendStats', position: { x: 250, y: 430 }, data: { label: 'Behavior Profile' } },
    ],
    edges: [],
  };
}

/** ── Data Comparison ───────────────────────────────────────────────────── */
export function buildComparisonLayout({ getId }) {
  const titleId = getId();
  const compareId = getId();
  return {
    nodes: [
      {
        id: titleId, type: 'default', position: { x: 350, y: 0 },
        data: { label: '📊 Data Comparison' },
        style: { background: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)', color: '#fff', borderRadius: '14px', padding: '16px 28px', fontWeight: '900', fontSize: '15px', border: 'none', boxShadow: '0 8px 20px rgba(37,99,235,0.25)', minWidth: '220px', textAlign: 'center' },
      },
      { id: compareId, type: 'comparisonChart', position: { x: 150, y: 250 }, data: { label: 'Overlay View' } },
    ],
    edges: [],
  };
}

/** ── Process Flow ──────────────────────────────────────────────────────── */
export function buildProcessFlowLayout({ getId }) {
  const [n1, n2, n3, n4] = Array.from({ length: 4 }, () => getId());
  return {
    nodes: [
      { id: n1, type: 'default', position: { x: 0,   y: 200 }, data: { label: '⬛ Input / Feed'     }, style: { background: '#f0f9ff', border: '2px solid #7dd3fc', borderRadius: '14px', padding: '16px 28px', fontWeight: '800', fontSize: '13px', color: '#0c4a6e', minWidth: '160px', textAlign: 'center' } },
      { id: n2, type: 'default', position: { x: 300, y: 200 }, data: { label: '⚙️ Process Unit'     }, style: { background: '#ecfeff', border: '2px solid #67e8f9', borderRadius: '14px', padding: '16px 28px', fontWeight: '800', fontSize: '13px', color: '#155e75', minWidth: '160px', textAlign: 'center' } },
      { id: n3, type: 'default', position: { x: 600, y: 200 }, data: { label: '🔧 Equipment'         }, style: { background: '#ecfeff', border: '2px solid #67e8f9', borderRadius: '14px', padding: '16px 28px', fontWeight: '800', fontSize: '13px', color: '#155e75', minWidth: '160px', textAlign: 'center' } },
      { id: n4, type: 'default', position: { x: 900, y: 200 }, data: { label: '✅ Output / Product'  }, style: { background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '14px', padding: '16px 28px', fontWeight: '800', fontSize: '13px', color: '#14532d', minWidth: '160px', textAlign: 'center' } },
    ],
    edges: [
      { id: `e-${n1}-${n2}`, source: n1, target: n2, type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
      { id: `e-${n2}-${n3}`, source: n2, target: n3, type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
      { id: `e-${n3}-${n4}`, source: n3, target: n4, type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
    ],
  };
}

/** ── Threshold Analysis ─────────────────────────────────────────────────── */
export function buildThresholdLayout({ getId }) {
  const titleId = getId();
  const statusId = getId();
  return {
    nodes: [
      {
        id: titleId, type: 'default', position: { x: 300, y: 0 },
        data: { label: '🎯 Threshold Analysis' },
        style: { background: 'linear-gradient(135deg,#ea580c 0%,#c2410c 100%)', color: '#fff', borderRadius: '14px', padding: '16px 28px', fontWeight: '900', fontSize: '15px', border: 'none', boxShadow: '0 8px 20px rgba(234,88,12,0.25)', minWidth: '240px', textAlign: 'center' },
      },
      { id: statusId, type: 'anomalyAlerts', position: { x: 200, y: 450 }, data: { label: 'Current Breach Status' } },
    ],
    edges: [],
  };
}

/** ── Investigation Report ────────────────────────────────────────────────── */
export function buildReportLayout({ getId }) {
  const [header, summary, timeline, findings, actions] = Array.from({ length: 5 }, () => getId());
  return {
    nodes: [
      { id: header,   type: 'default', position: { x: 250, y: 0 },   data: { label: '📋 Investigation Report'                                                     }, style: { background: 'linear-gradient(135deg,#475569 0%,#334155 100%)', color: '#fff', borderRadius: '14px', padding: '16px 32px', fontWeight: '900', fontSize: '15px', border: 'none', boxShadow: '0 8px 20px rgba(51,65,85,0.3)', minWidth: '260px', textAlign: 'center' } },
      { id: summary,  type: 'default', position: { x: 200, y: 140 }, data: { label: '📝 Executive Summary — Brief overview of the investigation scope and key findings' }, style: { background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', padding: '16px 24px', fontWeight: '600', fontSize: '12px', color: '#334155', minWidth: '360px' } },
      { id: timeline, type: 'default', position: { x: 200, y: 280 }, data: { label: '⏱️ Event Timeline — Sequence of events leading to the incident'                 }, style: { background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', padding: '16px 24px', fontWeight: '600', fontSize: '12px', color: '#334155', minWidth: '360px' } },
      { id: findings, type: 'default', position: { x: 200, y: 420 }, data: { label: '🔍 Key Findings — Root causes and contributing factors identified'               }, style: { background: '#fefce8', border: '2px solid #fde68a', borderRadius: '14px', padding: '16px 24px', fontWeight: '600', fontSize: '12px', color: '#713f12', minWidth: '360px' } },
      { id: actions,  type: 'default', position: { x: 200, y: 560 }, data: { label: '✅ Corrective Actions — Recommended actions with ownership and deadlines'        }, style: { background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '14px', padding: '16px 24px', fontWeight: '600', fontSize: '12px', color: '#14532d', minWidth: '360px' } },
    ],
    edges: [
      { id: `e-${header}-${summary}`,    source: header,   target: summary,  type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 1.5 } },
      { id: `e-${summary}-${timeline}`,  source: summary,  target: timeline, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 1.5 } },
      { id: `e-${timeline}-${findings}`, source: timeline, target: findings, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 1.5 } },
      { id: `e-${findings}-${actions}`,  source: findings, target: actions,  type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 1.5 } },
    ],
  };
}
