// Mock data for tests and Storybook only. Never import in production code.
export const mockLogs = [
    {
        id: '1', timestamp: '2026-03-02 09:15:22', runId: 'RUN-9821',
        connector: 'SAP-Extraction-P1', source: 'SAP ERP', destination: 'S3 Raw Zone',
        operation: 'Fetch', status: 'Success', records: 12500, duration: '45s', retryCount: 0,
        logMessage: 'Successfully fetched 12,500 records from SAP table MARA.',
        params: { table: 'MARA', batchSize: 5000 },
    },
    {
        id: '2', timestamp: '2026-03-02 10:05:10', runId: 'RUN-9822',
        connector: 'Historian-Sync', source: 'OSIsoft PI', destination: 'TimescaleDB',
        operation: 'Transform', status: 'Failed', records: 0, duration: '12s',
        errorSummary: 'Connection timeout during data transformation', retryCount: 2,
        logMessage: 'Failed to connect to transformation engine. Service unavailable.',
        stackTrace: 'Error: Connection timeout\n  at Socket.connect (net.js:123:45)',
        params: { tags: ['PI-101', 'TI-202'], interval: '1m' },
    },
    {
        id: '3', timestamp: '2026-03-02 11:30:45', runId: 'RUN-9823',
        connector: 'P&ID-Parser', source: 'Local Upload', destination: 'Knowledge Graph',
        operation: 'Upload', status: 'Warning', records: 45, duration: '1m 20s',
        errorSummary: 'Partial success: 3 entities skipped', retryCount: 0,
        logMessage: 'P&ID parsing completed. 42 entities mapped, 3 entities flagged.',
        params: { file: 'Reactor_Unit_04.pdf', model: 'vision-pro-v2' },
    },
];

export const mockJobs = [
    {
        jobId: 'sap_equipment_sync', source: 'SAP', namespace: 'decisionops.sap',
        labels: ['CDC:v2', 'EQUI'], trigger: 'Scheduled', schedule: '0 * * * *',
        tables: ['EQUI', 'EQKT', 'IFLOT'],
        runs: [
            { id: 'RUN-1047', executedAt: '2026-04-03 11:02:14', status: 'Success', inserts: 1200, updates: 900, deletes: 45, totalRecords: 2145, duration: '1m 32s', timeWindow: '10:00 – 11:00', changeBreakdown: [{ table: 'EQUI', inserts: 800, updates: 600, deletes: 30 }, { table: 'EQKT', inserts: 350, updates: 250, deletes: 10 }, { table: 'IFLOT', inserts: 50, updates: 50, deletes: 5 }] },
            { id: 'RUN-1030', executedAt: '2026-04-03 10:01:50', status: 'Success', inserts: 980, updates: 750, deletes: 22, totalRecords: 1752, duration: '1m 18s', timeWindow: '09:00 – 10:00' },
            { id: 'RUN-1005', executedAt: '2026-04-03 08:01:45', status: 'Failed', inserts: 0, updates: 0, deletes: 0, totalRecords: 0, duration: '5s', timeWindow: '07:00 – 08:00', errorMessage: 'SAP RFC connection refused.' },
        ],
    },
    {
        jobId: 'historian_tag_sync', source: 'Historian', namespace: 'decisionops.ts',
        labels: ['timeseries', 'CDC:v1'], trigger: 'Scheduled', schedule: '0 * * * *',
        tables: ['tag_readings'],
        runs: [
            { id: 'RUN-1044', executedAt: '2026-04-03 08:03:10', status: 'Success', inserts: 45200, updates: 0, deletes: 0, totalRecords: 45200, duration: '2m 15s', timeWindow: '07:00 – 08:00', changeBreakdown: [{ table: 'tag_readings', inserts: 45200, updates: 0, deletes: 0 }] },
        ],
    },
];
