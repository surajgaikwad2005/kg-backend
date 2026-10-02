'use client';
import { useState, useEffect, useMemo } from 'react';
import * as cdm from '@/src/services/domain-configuration/common';
import * as common from '@/src/services/domain-configuration/common';
import { generateId } from '@/src/lib/utils';
import { usePollConnectorJob } from '@/src/components/admin/_queries/useConnectorJob';
import { useFetchPnidContext, useFlowState, useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';
import { flowFileNames } from '@/src/components/admin/connectorState';

export function usePnidFormState({
    selectedPlantId,
    view,
    pipelineStatuses,
    configuredSources,
    setConfiguredSources,
    markSourceFailed,
    setIsConfigModalOpen,
    setConfigStep,
    _persistReady,
}) {
    // Shared connector-job poller — replaces this hook's private setInterval.
    const pollConnectorJob = usePollConnectorJob(selectedPlantId?.id);
    const fetchPnidContext = useFetchPnidContext(selectedPlantId?.id);
    const invalidateConnectorState = useInvalidateConnectorState(selectedPlantId?.id);
    const [pnidTab, setPnidTab] = useState('device');
    const [pnidFiles, setPnidFiles] = useState([]);
    const [pnidUploading, setPnidUploading] = useState(false);
    const [pnidUploadProgress, setPnidUploadProgress] = useState([]);
    const [pnidJobId, setPnidJobId] = useState(null);
    const [pnidJobStatus, setPnidJobStatus] = useState('');
    const [pnidMinimized, setPnidMinimized] = useState(false);
    const [pnidCloudType, setPnidCloudType] = useState('s3');
    const [pnidCloudConfig, setPnidCloudConfig] = useState({});
    const [pnidDuplicateDialog, setPnidDuplicateDialog] = useState({
        open: false, duplicates: [], onReprocess: () => {}, onSkip: () => {},
    });
    const [pnidCommitConfirm, setPnidCommitConfirm] = useState(false);
    // Files uploaded in THIS session only. Used to be seeded from
    // sessionStorage's `admin_domain_config` blob and mirrored into
    // `admin_pnid_file_names::<plant>`; both are gone, and the durable list now
    // comes from GET /flow/state?flow=pnid below.
    const [sessionPnidFileNames, setSessionPnidFileNames] = useState([]);
    const [pids, setPids] = useState([]);
    const [pidData, setPidData] = useState([]);
    const [pidDataLoading, setPidDataLoading] = useState(false);
    const [pnidImages, setPnidImages] = useState([]);
    const [equipmentPidData, setEquipmentPidData] = useState([]);
    const [equipmentConnectivityData, setEquipmentConnectivityData] = useState([]);
    const [connectivityByFile, setConnectivityByFile] = useState({});
    const [selectedPid, setSelectedPid] = useState(null);
    const [pidStep, setPidStep] = useState(0);

    // Server-side P&ID file names. Fetched lazily — only the review screen
    // needs the list, and the tab strip is served entirely by
    // GET /connectors/state.
    const pnidFilesQuery = useFlowState(selectedPlantId?.id, 'pnid', { enabled: view === 'pid-review' });
    const serverPnidFileNames = useMemo(
        () => flowFileNames(pnidFilesQuery.data?.files),
        [pnidFilesQuery.data],
    );

    // Derived, not synced into state: the session's batch wins when there is
    // one, otherwise fall back to the plant's full server-side list. That
    // precedence matters — after an upload this deliberately narrows to just
    // that batch, because the review screen filters its images by it, and
    // widening to the plant's whole history would silently pull every P&ID
    // ever uploaded into the review.
    const uploadedPnidFileNames = sessionPnidFileNames.length > 0
        ? sessionPnidFileNames
        : serverPnidFileNames;
    const setUploadedPnidFileNames = setSessionPnidFileNames;

    // Drop the session batch when the plant changes. Adjusted during render
    // (React's documented "reset state when a prop changes" pattern) rather
    // than in an effect, which would render one frame of the previous plant's
    // filter against the new plant's data.
    const [renderedPlant, setRenderedPlant] = useState(selectedPlantId?.id);
    if (renderedPlant !== selectedPlantId?.id) {
        setRenderedPlant(selectedPlantId?.id);
        setSessionPnidFileNames([]);
    }

    // Fetch pid-review data
    useEffect(() => {
        const batchId = pipelineStatuses?.pnid?.batchId;
        const jobId   = pipelineStatuses?.pnid?.jobId;
        const ctxFiles = pipelineStatuses?.pnid?.files; // comma-separated, persisted on pipeline start
        if (view !== 'pid-review' || !selectedPlantId?.id || pidData.length > 0 || pidDataLoading) return;
        const plantCode = selectedPlantId.id;
        setPidDataLoading(true);
        // The batch → file-names lookup used to be three localStorage reads
        // (`admin_pnid_files_by_batch::<batch>`, then `admin_pnid_file_names::<plant>`,
        // then configuredSources). All three are now one source: flow/state
        // rows carry both `file_name` and `upload_batch_id`, so the batch filter
        // is a filter over server data and survives a reload.
        const serverFiles = pnidFilesQuery.data?.files || [];
        let fileFilter = batchId
            ? serverFiles.filter(f => f.upload_batch_id === batchId).map(f => f.file_name).filter(Boolean)
            : [];
        if (fileFilter.length === 0 && uploadedPnidFileNames.length > 0) fileFilter = uploadedPnidFileNames;
        if (fileFilter.length === 0) fileFilter = serverPnidFileNames;
        if (fileFilter.length === 0) {
            const pnidSource = configuredSources.find(s => s.type === 'P&ID');
            fileFilter = (pnidSource?.filesMeta || []).map(m => m?.name).filter(Boolean);
        }
        // Use persisted files string as final fallback for the API param
        const filesParam = ctxFiles || (fileFilter.length > 0 ? fileFilter.join(',') : undefined);
        const normalize = (p) =>
            decodeURIComponent((p || '').split('/').pop().split('\\').pop())
                .replace(/_/g, ' ')
                .toLowerCase();
        // Routed through the shared cache (same key the rest of Phase 1e uses)
        // rather than a bare service call, so a commit invalidating this key is
        // picked up here too. Kept imperative because the request parameters are
        // derived from several localStorage reads that must run at fetch time.
        fetchPnidContext({ batchId, ...(jobId && { jobId }), ...(filesParam && { files: filesParam }) })
            .then(data => {
                if (data.equipment_pid?.length > 0) setEquipmentPidData(data.equipment_pid);
                if (data.equipment_connectivity?.length > 0) setEquipmentConnectivityData(data.equipment_connectivity);
                if (data.connectivity_by_file) setConnectivityByFile(data.connectivity_by_file);

                // Build complete list of all files from data.requested_files or fileFilter
                const allFiles = (Array.isArray(data.requested_files) && data.requested_files.length > 0)
                    ? data.requested_files
                    : (fileFilter.length > 0)
                        ? fileFilter
                        : (Array.isArray(data.pnid_images) ? data.pnid_images.map(img => img.filename).filter(Boolean) : []);

                // Map images if present
                const imageMap = new Map();
                const rawImages = Array.isArray(data.pnid_images)
                    ? data.pnid_images
                    : (data.pnid_images && typeof data.pnid_images === 'object')
                        ? Object.entries(data.pnid_images).map(([filename, url]) => ({ filename, url }))
                        : [];

                rawImages.forEach(img => {
                    if (img?.filename) imageMap.set(normalize(img.filename), img.url);
                });
                setPnidImages(rawImages);

                if (allFiles.length > 0) {
                    const pidItems = allFiles.map((fn, i) => ({
                        id: `pid-${i}`,
                        name: fn,
                        image: imageMap.get(normalize(fn)) || null,
                    }));
                    setPids(pidItems);
                }

                const connRows = data.equipment_connectivity || data.rows || [];
                if (connRows.length > 0) {
                    const mapped = connRows.map(r => ({
                        _rowKey: r.id || r.uid || r.connectivity_id || generateId(),
                        source: r.from_equipment_ref || r.source_asset || r.parent_ref || r.source || r.equipment_tag || Object.values(r)[0] || '',
                        destination: r.to_equipment_ref || r.destination_asset || r.child_ref || r.destination || Object.values(r)[1] || '',
                    })).filter(r => r.source || r.destination);
                    setPidData(mapped);
                } else {
                    setPidData([]);
                }
            })
            .catch(() => { setPidData([]); })
            .finally(() => setPidDataLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, selectedPlantId?.id, pipelineStatuses?.pnid?.batchId, pipelineStatuses?.pnid?.jobId]);

    const performPnidUpload = async (filesToUpload) => {
        if (filesToUpload.length === 0) return;
        const fileNames = filesToUpload.map(f => f.name);
        setUploadedPnidFileNames(fileNames);
        setPidData([]);
        setPnidImages([]);
        setEquipmentPidData([]);
        setEquipmentConnectivityData([]);
        setConnectivityByFile({});
        const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const sourceId = generateId();
        const newSource = {
            id: sourceId, type: 'P&ID', name: `${filesToUpload.length} P&ID file(s)`, timestamp: ts,
            method: pnidTab, status: 'running', progress: 0,
            logs: ['Starting upload...', `${fileNames.length} file(s) queued`], errors: [],
            filesMeta: filesToUpload.map(f => ({ name: f.name, size: f.size, mimeType: f.type })),
        };
        setConfiguredSources(prev => [newSource, ...prev]);
        setIsConfigModalOpen(false);
        setConfigStep(1);
        // One shared poller (see components/admin/_queries/useConnectorJob.js)
        // instead of a private setInterval. Behaviour is unchanged on the happy
        // path; the differences are that a transient blip no longer cancels the
        // whole poll after one failure, and the loop cannot outlive this
        // component the way the interval could.
        const startPolling = async (jobId) => {
            try {
                const jd = await pollConnectorJob({ connector: 'pnid', jobId });
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? {
                    ...s, status: jd.status,
                    progress: jd.status === 'completed' ? 100 : s.progress,
                    logs: [...s.logs, jd.status === 'completed' ? 'Files uploaded to RustFS — run pipeline to extract data' : 'Upload failed'],
                    errors: jd.status === 'failed' ? [...s.errors, 'Job failed — check logs'] : s.errors,
                } : s));
                // The files are on the server now — re-read the lifecycle so
                // this optimistic row is reconciled away and flow/state becomes
                // the copy that survives a refresh.
                invalidateConnectorState();
            } catch {
                markSourceFailed(sourceId, 'Job status check failed — check logs');
            }
        };
        try {
            const formData = new FormData();
            filesToUpload.forEach(f => formData.append('files', f));
            if (selectedPlantId?.id) formData.append('plant_code_id', selectedPlantId.id);
            setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 30, logs: [...s.logs, 'Uploading files...'] } : s));
            const data = await common.uploadConnectorFile('pnid', formData, selectedPlantId?.id);
            setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, jobId: data.job_id, progress: 60, logs: [...s.logs, 'Files uploaded, processing...'] } : s));
            startPolling(data.job_id);
        } catch {
            markSourceFailed(sourceId, 'Upload failed — backend unreachable');
        }
        setPnidFiles([]);
        setPnidUploading(false);
        setPnidUploadProgress([]);
        setPnidJobId(null);
        setPnidJobStatus('');
    };

    return {
        pnidTab, setPnidTab,
        pnidFiles, setPnidFiles,
        pnidUploading, setPnidUploading,
        pnidUploadProgress, setPnidUploadProgress,
        pnidJobId, setPnidJobId,
        pnidJobStatus, setPnidJobStatus,
        pnidMinimized, setPnidMinimized,
        pnidCloudType, setPnidCloudType,
        pnidCloudConfig, setPnidCloudConfig,
        pnidDuplicateDialog, setPnidDuplicateDialog,
        pnidCommitConfirm, setPnidCommitConfirm,
        uploadedPnidFileNames, setUploadedPnidFileNames,
        pids, setPids,
        pidData, setPidData,
        pidDataLoading, setPidDataLoading,
        pnidImages, setPnidImages,
        equipmentPidData, setEquipmentPidData,
        equipmentConnectivityData, setEquipmentConnectivityData,
        connectivityByFile, setConnectivityByFile,
        selectedPid, setSelectedPid,
        pidStep, setPidStep,
        performPnidUpload,
    };
}
