// ── Data Activity: API integration helpers ──────────────────────────────────
export const _STAGE_SOURCE = {
    pnid: 'P&ID', docs: 'Documents', sap: 'SAP', ts: 'Historian', full: 'Full Pipeline',
};
export const _STAGE_NS = {
    pnid: 'decisionops.pnid', docs: 'decisionops.docs',
    sap: 'decisionops.sap', ts: 'decisionops.ts', full: 'decisionops.full',
};
export const _API_STATUS_MAP = {
    completed: 'Success', failed: 'Failed', running: 'Running', queued: 'Running',
};
export function fmtIso(iso) {
    if (!iso)
        return '—';
    try {
        return new Date(iso).toISOString().replace('T', ' ').slice(0, 19);
    }
    catch {
        return String(iso);
    }
}
export function calcDuration(startedAt, completedAt) {
    if (!startedAt)
        return '—';
    const t0 = new Date(startedAt).getTime();
    const t1 = completedAt ? new Date(completedAt).getTime() : Date.now();
    const diff = Math.max(0, (t1 - t0) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = Math.round(diff % 60);
    if (mins === 0)
        return `${secs}s`;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
export function formatElapsed(elapsed) {
    if (!elapsed)
        return '—';
    const secs = parseFloat(elapsed);
    if (isNaN(secs))
        return elapsed;
    if (secs < 60)
        return `${Math.round(secs)}s`;
    const m = Math.floor(secs / 60), s = Math.round(secs % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
export function apiJobToFrontend(apiJob) {
    const stage = apiJob.stage || 'unknown';
    const fullId = apiJob.pipeline_job_id || apiJob.job_id || '';
    const shortId = fullId.slice(0, 8);
    const uiStatus = _API_STATUS_MAP[apiJob.status] ?? 'Running';
    const totalRecords = apiJob.total_records ?? 0;
    const recordCounts = apiJob.record_counts ?? {};
    const changeBreakdown = Object.entries(recordCounts).map(([table, count]) => ({
        table, inserts: count, updates: 0, deletes: 0,
    }));
    const run = {
        id: shortId,
        executedAt: fmtIso(apiJob.started_at || apiJob.created_at),
        status: uiStatus,
        inserts: totalRecords,
        updates: 0,
        deletes: 0,
        totalRecords,
        duration: calcDuration(apiJob.started_at, apiJob.completed_at),
        timeWindow: 'On-demand',
        ...(changeBreakdown.length > 0 ? { changeBreakdown } : {}),
        ...(apiJob.error ? { errorMessage: String(apiJob.error).slice(0, 300) } : {}),
    };
    return {
        jobId: fullId,
        source: _STAGE_SOURCE[stage] || stage.toUpperCase(),
        namespace: _STAGE_NS[stage] || `decisionops.${stage}`,
        labels: [stage.toUpperCase(), apiJob.plant_code_id || apiJob.plant_code || 'CDM'].filter(Boolean),
        trigger: 'Manual',
        schedule: 'On-demand',
        tables: Array.isArray(apiJob.output_tables) ? apiJob.output_tables : [],
        runs: [run],
    };
}
export function parseStageLog(lines, stage) {
    const jobMap = new Map();
    const jobOrder = [];
    for (const line of lines) {
        if (!line.includes('[pipeline/') || !line.includes('JOB '))
            continue;
        const tsM = line.match(/^(\S+)/);
        const eventM = line.match(/\[pipeline\/\w+\]\s+(JOB\s+\w+)/);
        const idM = line.match(/job_id=([\w-]+)/);
        if (!tsM || !eventM || !idM)
            continue;
        const ts = tsM[1];
        const event = eventM[1].trim();
        const jobId = idM[1];
        const plantM = line.match(/plant=([\w]+)/);
        const elapsedM = line.match(/elapsed=([\d.]+)s/);
        const tablesM = line.match(/output_tables=(\[.*\])/);
        if (!jobMap.has(jobId)) {
            jobMap.set(jobId, {
                job_id: jobId, stage,
                created_at: ts, started_at: null, completed_at: null,
                status: 'queued', elapsed: null, output_tables: [], error: null,
                plant_code: plantM ? plantM[1] : 'CDM',
            });
            jobOrder.push(jobId);
        }
        const job = jobMap.get(jobId);
        if (plantM)
            job.plant_code = plantM[1];
        if (event === 'JOB QUEUED') {
            job.created_at = ts;
        }
        else if (event === 'JOB START') {
            job.started_at = ts;
            job.status = 'running';
        }
        else if (event === 'JOB COMPLETED') {
            job.completed_at = ts;
            job.status = 'completed';
            if (elapsedM)
                job.elapsed = elapsedM[1] + 's';
            if (tablesM) {
                const inner = tablesM[1].slice(1, -1);
                if (inner.trim()) {
                    job.output_tables = inner.split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean);
                }
            }
        }
        else if (event === 'JOB FAILED' || event === 'JOB EXCEPTION') {
            job.completed_at = ts;
            job.status = 'failed';
            if (elapsedM)
                job.elapsed = elapsedM[1] + 's';
        }
    }
    return [...jobOrder].reverse().map(jid => {
        const j = jobMap.get(jid);
        const fe = apiJobToFrontend(j);
        if (j.elapsed && fe.runs[0])
            fe.runs[0].duration = formatElapsed(j.elapsed);
        return fe;
    });
}
// ── Connector Activity: parse raw log lines → LogEntry rows ─────────────────
export const _LOGGER_CONNECTOR = [
    ['connector.pnid', 'PNID Connector'],
    ['connector.docs', 'Docs Connector'],
    ['connector.sap', 'SAP Connector'],
    ['connector.ts', 'Timeseries Connector'],
    ['pipeline.pnid', 'PNID Pipeline'],
    ['pipeline.docs', 'Docs Pipeline'],
    ['pipeline.sap', 'SAP Pipeline'],
    ['pipeline.ts', 'Timeseries Pipeline'],
    ['pipeline.full', 'Full Pipeline'],
    ['api.pipeline', 'API / Pipeline'],
    ['api.connectors', 'API / Connectors'],
    ['api.data', 'API / Data'],
    ['api.logs', 'API / Logs'],
];
export const _LOGGER_SRCDST = [
    ['connector.pnid', 'P&ID Upload', 'RustFS Staging'],
    ['connector.docs', 'Docs Upload', 'RustFS Staging'],
    ['connector.sap', 'SAP Upload', 'RustFS Staging'],
    ['connector.ts', 'Historian Upload', 'RustFS Staging'],
    ['pipeline.pnid', 'RustFS Staging', 'CDM / P&ID'],
    ['pipeline.docs', 'RustFS Staging', 'CDM / Docs'],
    ['pipeline.sap', 'SAP Files', 'CDM / SAP'],
    ['pipeline.ts', 'Historian Files', 'CDM / Timeseries'],
    ['pipeline.full', 'CDM Stages', 'CDM / Final'],
];
export function parseLinesToLogEntries(lines, logKey) {
    const entries = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(/^(\S+)\s+(INFO|WARNING|ERROR|WARN)\s+(\S+)\s+(.*)/);
        if (!m)
            continue;
        const [, ts, level, loggerFull, rest] = m;
        const logger = loggerFull.split(':')[0];
        const ctxM = rest.match(/^\[([^\]]+)\]\s+(.*)/);
        const ctx = ctxM ? ctxM[1] : '';
        const msg = ctxM ? ctxM[2] : rest;
        const connectorEntry = _LOGGER_CONNECTOR.find(([k]) => logger.includes(k));
        const connector = connectorEntry ? connectorEntry[1] : logKey;
        const sdEntry = _LOGGER_SRCDST.find(([k]) => logger.includes(k));
        const source = sdEntry ? sdEntry[1] : 'API';
        const destination = sdEntry ? sdEntry[2] : 'DecisionOps';
        const lc = (msg + ' ' + ctx).toLowerCase();
        const operation = lc.includes('upload') || lc.includes('post') ? 'Upload' :
            lc.includes('fetch') || lc.includes('get') || lc.includes('list') || lc.includes('check') || lc.includes('existing') ? 'Fetch' :
                'Transform';
        const status = level === 'ERROR' ? 'Failed' :
            (level === 'WARNING' || level === 'WARN') ? 'Warning' :
                'Success';
        const filesM = msg.match(/(\d+)\s+file/);
        const rowsM = msg.match(/(\d+)\s+row/);
        const accM = msg.match(/accepted=(\d+)/);
        const recsM = msg.match(/(\d+)\s+record/);
        const records = filesM ? parseInt(filesM[1]) : rowsM ? parseInt(rowsM[1]) : accM ? parseInt(accM[1]) : recsM ? parseInt(recsM[1]) : 0;
        const jobIdM = msg.match(/job_id=([\w-]+)/);
        const elapsedM = msg.match(/elapsed=([\d.]+)s/);
        entries.push({
            id: String(entries.length),
            timestamp: ts.replace('T', ' ').slice(0, 19),
            runId: jobIdM ? jobIdM[1].slice(0, 8).toUpperCase() : `LOG-${String(i).padStart(4, '0')}`,
            connector,
            source,
            destination,
            operation,
            status,
            records,
            duration: elapsedM ? formatElapsed(elapsedM[1] + 's') : '—',
            logMessage: msg,
            retryCount: 0,
            ...(level === 'ERROR' ? { errorSummary: msg.slice(0, 120) } : {}),
        });
    }
    return entries.reverse();
}

/**
 * Remove a row from an array based on its identity callback or direct equality.
 */
export function removeRowByIdentity(arr, targetRow, getIdFn) {
    if (!Array.isArray(arr) || !targetRow) return arr || [];
    const targetId = getIdFn ? getIdFn(targetRow) : undefined;
    if (targetId !== undefined && targetId !== null) {
        return arr.filter(r => getIdFn(r) !== targetId);
    }
    return arr.filter(r => r !== targetRow);
}
