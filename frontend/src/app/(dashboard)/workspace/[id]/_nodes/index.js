export { SignalNode } from './SignalNode';
export { RCAProblemNode } from './RCAProblemNode';
export { RCACategoryNode } from './RCACategoryNode';
export { RCAFindingsNode } from './RCAFindingsNode';
export { RCAEvidenceNode } from './RCAEvidenceNode';
export { FishboneCanvasNode } from './FishboneCanvasNode';
export { CorrelationMatrixNode } from './CorrelationMatrixNode';
export { ThresholdNode } from './ThresholdNode';
export { AnomalyAlertsNode } from './AnomalyAlertsNode';
export { ComparisonNode } from './ComparisonNode';
export { TrendStatsNode } from './TrendStatsNode';
export { WhyNode } from './WhyNode';
export { RcaAnalysisNode } from './RcaAnalysisNode';
export { KpiMonitoringNode } from './KpiMonitoringNode';
export { MultiChartNode } from './MultiChartNode';

import { SignalNode } from './SignalNode';
import { RCAProblemNode } from './RCAProblemNode';
import { RCACategoryNode } from './RCACategoryNode';
import { RCAFindingsNode } from './RCAFindingsNode';
import { RCAEvidenceNode } from './RCAEvidenceNode';
import { FishboneCanvasNode } from './FishboneCanvasNode';
import { CorrelationMatrixNode } from './CorrelationMatrixNode';
import { ThresholdNode } from './ThresholdNode';
import { AnomalyAlertsNode } from './AnomalyAlertsNode';
import { ComparisonNode } from './ComparisonNode';
import { TrendStatsNode } from './TrendStatsNode';
import { WhyNode } from './WhyNode';
import { RcaAnalysisNode } from './RcaAnalysisNode';
import { KpiMonitoringNode } from './KpiMonitoringNode';
import { MultiChartNode } from './MultiChartNode';

export const nodeTypes = {
  signalNode: SignalNode,
  rcaProblem: RCAProblemNode,
  rcaCategory: RCACategoryNode,
  rcaFindings: RCAFindingsNode,
  rcaEvidence: RCAEvidenceNode,
  fishboneCanvas: FishboneCanvasNode,
  correlationMatrix: CorrelationMatrixNode,
  threshold: ThresholdNode,
  anomalyAlerts: AnomalyAlertsNode,
  comparisonChart: ComparisonNode,
  trendStats: TrendStatsNode,
  whyNode: WhyNode,
  rcaAnalysis: RcaAnalysisNode,
  kpiMonitoring: KpiMonitoringNode,
  multiChart: MultiChartNode,
};
