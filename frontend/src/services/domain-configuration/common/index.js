/**
 * domain-configuration/common/index.js
 * Barrel for CDM service logic shared across every stage (sap | docs | ts |
 * pnid | full) — pipeline run/monitoring, source connectors, configuration
 * (SAP tables/column-renames/user-config), context staging (P&ID/SAP
 * review+commit), timeseries data-quality analysis, and KG ontology
 * population. Grouped separately from per-domain folders (e.g. documents/)
 * so shared logic isn't duplicated per domain. configService/contextService/
 * dataQualityService/ontologyService merged in from the legacy `cdm/` barrel
 * (pre-rename name for this same Domain Configuration feature) — cdm/ has
 * been deleted. commitHistoryService.js was removed entirely (2026-07-20) —
 * its one export had zero consumers anywhere in the app.
 *
 *   import * as common from '@/src/services/domain-configuration/common';
 *   import { runPipeline, uploadConnectorFile } from '@/src/services/domain-configuration/common';
 */
export * from './pipelineService';
export * from './connectorsService';
export * from './configService';
export * from './contextService';
export * from './ontologyService';
export * from './dataQualityService';
