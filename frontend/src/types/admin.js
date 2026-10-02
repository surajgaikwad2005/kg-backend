// Label → D3 group number and colour
export const _KG_LABEL_GROUP = {
    Equipment: 1,
    SOP: 2, OperatingManual: 2,
    MaintenanceManual: 3, DesignSheet: 3,
    RCA: 4, WorkOrder: 4,
    Tag: 5,
    Document: 6,
};
// group 1=blue, 2=green, 3=amber, 4=violet, 5=cyan, 6=red
export const _KG_COLOURS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];
export const PIPELINE_LOG_LABELS = {
    pnid_pipeline: 'P&ID Pipeline (extraction detail)',
    docs_pipeline: 'Docs Pipeline (extraction detail)',
    pnid: 'P&ID (API)',
    docs: 'Docs (API)',
    sap: 'SAP Processing',
    timeseries: 'Timeseries Processing',
    connectors: 'Connectors',
    api: 'API (all)',
};
