'use client';
import { useState, useEffect, useMemo } from 'react';
import { DOC_TYPE_CATEGORIES } from '@/src/components/admin/admin.constants';
import { useDocumentTypes, useDocsContext, useFlowState } from '@/src/components/admin/_queries/useDsiQueries';
import { docFileNamesByType } from '@/src/components/admin/connectorState';

// The backend's category list otherwise fully REPLACES the local fallback
// (see the old `apiDocCategories || DOC_TYPE_CATEGORIES`), which makes any
// type that only exists locally (e.g. a newly added row in admin.constants.js
// that the backend doesn't know about yet) invisible to allDocTypes and
// therefore to selectedDocDef — DocSourceModal only opens when selectedDocDef
// is truthy, so an unmerged local-only type silently fails to open its
// upload modal. Merging keeps the backend authoritative for types it knows
// about while still surfacing local-only types under their matching category.
function mergeDocCategories(apiCategories, localCategories) {
    if (!apiCategories || apiCategories.length === 0) return localCategories;
    const merged = apiCategories.map(cat => ({ ...cat, types: [...cat.types] }));
    const knownKeys = new Set(merged.flatMap(cat => cat.types.map(t => t.key)));
    localCategories.forEach(localCat => {
        const missingTypes = localCat.types.filter(t => !knownKeys.has(t.key));
        if (missingTypes.length === 0) return;
        missingTypes.forEach(t => knownKeys.add(t.key));
        const existing = merged.find(cat => cat.category === localCat.category);
        if (existing) existing.types.push(...missingTypes);
        else merged.push({ category: localCat.category, types: missingTypes });
    });
    return merged;
}

export function useDocsFormState({ selectedPlantId, view, pipelineStatuses, _persistReady }) {
    // Reference data, cached 5 minutes — the old effect refetched it on every
    // plant change with no reuse.
    const documentTypesQuery = useDocumentTypes(selectedPlantId?.id);
    const apiDocCategories = documentTypesQuery.data?.categories?.length
        ? documentTypesQuery.data.categories
        : null;

    const effectiveDocCategories = useMemo(
        () => mergeDocCategories(apiDocCategories, DOC_TYPE_CATEGORIES),
        [apiDocCategories]
    );
    const ALL_DOC_TYPES = useMemo(() => effectiveDocCategories.flatMap(c => c.types), [effectiveDocCategories]);

    const [docActiveCategory, setDocActiveCategory] = useState(0);
    const [docSelectedType, setDocSelectedType] = useState(null);
    const [docSourceModal, setDocSourceModal] = useState(false);
    const [docTab, setDocTab] = useState('device');
    const [docFiles, setDocFiles] = useState([]);
    // filename -> selected label keys. Lives here rather than inside
    // useDocSourceModal because BOTH doc submit paths need it: the per-subtype
    // modal that collects it, and ConfigModal's "Upload & Sync All" footer
    // button, which batches every queued subtype at once. While it was local to
    // the modal, the global path uploaded with no `labels` field at all — which
    // the backend now rejects.
    const [docFileLabels, setDocFileLabels] = useState({});
    const [docUploading, setDocUploading] = useState(false);
    const [docUploadProgress, setDocUploadProgress] = useState([]);
    const [docJobId, setDocJobId] = useState(null);
    const [docJobStatus, setDocJobStatus] = useState('');
    const [docMinimized, setDocMinimized] = useState(false);
    const [docCloudType, setDocCloudType] = useState('s3');
    const [docCloudConfig, setDocCloudConfig] = useState({});
    const [docExtraFields, setDocExtraFields] = useState({});
    const [docCustomCategories, setDocCustomCategories] = useState([]);
    const [docCategorySubtypes, setDocCategorySubtypes] = useState({});
    const [docNewFieldName, setDocNewFieldName] = useState('');
    const [docNewFieldDesc, setDocNewFieldDesc] = useState('');
    const [docNewTypeName, setDocNewTypeName] = useState('');
    const [docAddingType, setDocAddingType] = useState(false);
    const [docAddingSubtype, setDocAddingSubtype] = useState(false);
    const [docNewSubtypeName, setDocNewSubtypeName] = useState('');
    const [uploadedDocSubtypes, setUploadedDocSubtypes] = useState([]);
    // Local, optimistic layer only — set the instant an upload is submitted,
    // before the server has the files. The durable copy now comes from
    // GET /flow/state?flow=docs (see below); this used to be a sessionStorage
    // blob called `admin_domain_config`, which is why an upload made in one tab
    // was invisible in another and a hard refresh lost the mapping entirely.
    const [localDocFileNames, setLocalDocFileNames] = useState({});
    const [docDataByCategory, setDocDataByCategory] = useState({});
    const [docReviewCategories, setDocReviewCategories] = useState([]);
    const [selectedDocCategory, setSelectedDocCategory] = useState(null);
    const [docCategoryStep, setDocCategoryStep] = useState(0);

    const allDocCategories = [...effectiveDocCategories.map(c => c.category), ...docCustomCategories];
    const allDocTypes = useMemo(
        () => [...ALL_DOC_TYPES, ...Object.values(docCategorySubtypes).flat()],
        [ALL_DOC_TYPES, docCategorySubtypes],
    );
    const selectedDocDef = allDocTypes.find(t => t.key === docSelectedType) || null;

    // ── Server-backed document file names ────────────────────────────────────
    // Shares the exact cache entry useFlowFiles already populates for 'docs'
    // (same query key), so this adds no extra request.
    const docFlowQuery = useFlowState(selectedPlantId?.id, 'docs');
    const serverDocFileNames = useMemo(
        () => docFileNamesByType(docFlowQuery.data?.files),
        [docFlowQuery.data],
    );

    // Server is the base; a just-submitted upload overrides its own key until
    // the server catches up. Per-KEY merge (not a whole-object fallback) so an
    // upload into one subtype never hides the other subtypes' server files.
    const uploadedDocFileNames = useMemo(
        () => ({ ...serverDocFileNames, ...localDocFileNames }),
        [serverDocFileNames, localDocFileNames],
    );
    const setUploadedDocFileNames = setLocalDocFileNames;

    // Which subtypes actually hold files. Derived from the server list, unioned
    // with the optimistic local flags that ConfigModal/DocSourceModal set at
    // submit time.
    const uploadedDocSubtypesResolved = useMemo(() => {
        const byKey = new Map(uploadedDocSubtypes.map(s => [s.key, s]));
        Object.keys(serverDocFileNames).forEach((key) => {
            if (byKey.has(key)) return;
            const def = allDocTypes.find(t => t.key === key);
            byKey.set(key, { key, label: def?.label || key });
        });
        return [...byKey.values()];
    }, [uploadedDocSubtypes, serverDocFileNames, allDocTypes]);
    const docCategories = Object.keys(docDataByCategory).length > 0
        ? Object.keys(docDataByCategory).map(key => ({
            id: key,
            label: key.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            icon: '📄',
        }))
        : uploadedDocSubtypesResolved.length > 0
            ? uploadedDocSubtypesResolved.map(({ key, label }) => ({
                id: key.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                label,
                icon: '📄',
            }))
            : [];


    useEffect(() => {
        if (selectedDocCategory && !docDataByCategory[selectedDocCategory]) {
            setSelectedDocCategory(null);
            setDocCategoryStep(0);
        }
    }, [docDataByCategory, selectedDocCategory]);

    // `enabled` replaces the view/plant gate. The removed
    // `Object.keys(docDataByCategory).length > 0` check was a cache that never
    // expired, so a commit was invisible until remount; the commit mutation now
    // invalidates this key.
    const docsContextQuery = useDocsContext(
        selectedPlantId?.id,
        {
            batchId:  pipelineStatuses?.docs?.batchId,
            ...(pipelineStatuses?.docs?.jobId    && { jobId:    pipelineStatuses.docs.jobId }),
            ...(pipelineStatuses?.docs?.docTypes && { docTypes: pipelineStatuses.docs.docTypes }),
            ...(pipelineStatuses?.docs?.files    && { files:    pipelineStatuses.docs.files }),
        },
        { enabled: view === 'docs-review' },
    );
    const docDataLoading = docsContextQuery.isFetching;

    // Rows are EDITABLE, so they are seeded into state rather than derived.
    useEffect(() => {
        const data = docsContextQuery.data;
        if (data === undefined) return;
        if (data.rows_by_category && Object.keys(data.rows_by_category).length > 0) {
            setDocDataByCategory(data.rows_by_category);
            if (data.categories) setDocReviewCategories(data.categories);
            const firstKey = Object.keys(data.rows_by_category)[0];
            if (firstKey) { setSelectedDocCategory(firstKey); setDocCategoryStep(0); }
        } else {
            setDocDataByCategory({});
            setDocReviewCategories([]);
        }
    }, [docsContextQuery.data]);

    return {
        apiDocCategories,
        effectiveDocCategories, ALL_DOC_TYPES,
        allDocCategories, allDocTypes, selectedDocDef, docCategories,
        docActiveCategory, setDocActiveCategory,
        docSelectedType, setDocSelectedType,
        docSourceModal, setDocSourceModal,
        docTab, setDocTab,
        docFiles, setDocFiles,
        docFileLabels, setDocFileLabels,
        docUploading, setDocUploading,
        docUploadProgress, setDocUploadProgress,
        docJobId, setDocJobId,
        docJobStatus, setDocJobStatus,
        docMinimized, setDocMinimized,
        docCloudType, setDocCloudType,
        docCloudConfig, setDocCloudConfig,
        docExtraFields, setDocExtraFields,
        docCustomCategories, setDocCustomCategories,
        docCategorySubtypes, setDocCategorySubtypes,
        docNewFieldName, setDocNewFieldName,
        docNewFieldDesc, setDocNewFieldDesc,
        docNewTypeName, setDocNewTypeName,
        docAddingType, setDocAddingType,
        docAddingSubtype, setDocAddingSubtype,
        docNewSubtypeName, setDocNewSubtypeName,
        // Server-derived (union of live server files + optimistic local flags);
        // the setter still writes only the local layer.
        uploadedDocSubtypes: uploadedDocSubtypesResolved, setUploadedDocSubtypes,
        uploadedDocFileNames, setUploadedDocFileNames,
        docDataByCategory, setDocDataByCategory,
        docReviewCategories, setDocReviewCategories,
        docDataLoading,
        selectedDocCategory, setSelectedDocCategory,
        docCategoryStep, setDocCategoryStep,
    };
}
