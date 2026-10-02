/**
 * keys.js — the single source of query keys.
 *
 * Hooks are colocated with their feature (`_queries/` next to `_hooks/`), but
 * KEYS are central, because cross-feature invalidation needs a shared
 * vocabulary: `commitContext('pnid', ...)` lives in the Data Source
 * Integration feature and must invalidate `clientFiles`, which is owned by
 * the P&ID workspace feature. Keys are tiny pure functions; hooks are not.
 *
 * Two rules that make the whole cache correct:
 *
 *  1. Keys are HIERARCHICAL ARRAYS, so a prefix invalidates everything beneath
 *     it. invalidateQueries({ queryKey: domainConfig.pnidWs.all(plant) }) clears
 *     every P&ID workspace entry for that plant in one call.
 *
 *  2. Every plant-scoped key carries `plantCode` as its SECOND element, directly
 *     after the domain namespace. This is what makes switching plants correct
 *     for free — a different plant is a different cache entry, so an in-flight
 *     response for the old plant can never render against the new one. The
 *     hand-rolled `fetchTokenRef` stale-response guard in DomainConfigContext
 *     exists only because that property was missing; it becomes unnecessary.
 *
 * Every plant-scoped query MUST also set `enabled: !!plantCode`. Without it,
 * apiClient's PLANT_CODE_REQUIRED preflight fires a toast and throws before any
 * network call (src/services/apiClient.js).
 *
 * Namespaces are added here as their phase lands. Present: plants (Phase 0.11),
 * domainConfig (Phase 1), knowledgeGraph (Phase 2), symbolicAi (Phase 3).
 */

export const queryKeys = {
    // Not plant-scoped — this IS the plant list.
    plants: {
        all: () => ['plants'],
        list: () => ['plants', 'list'],
        purgePreview: (plantCodeId) => ['plants', 'purge-preview', plantCodeId],
    },

    domainConfig: {
        all: (plant) => ['domain-config', plant],

        // P&ID workspace — backend: PNID_WORKSPACE
        pnidWs: {
            all: (plant) => ['domain-config', plant, 'pnid-ws'],
            clientFiles: (plant) => ['domain-config', plant, 'pnid-ws', 'client-files'],
            // `extractionFiles` varies by opts, so it needs a prefix form for
            // invalidating every variant at once. Same for pdfPageCount below,
            // which varies by path. Always go through these rather than writing
            // a literal array at the call site — the factory is the only place
            // key structure is allowed to be spelled out.
            extractionFilesAll: (plant) => ['domain-config', plant, 'pnid-ws', 'extraction-files'],
            extractionFiles: (plant, opts) => ['domain-config', plant, 'pnid-ws', 'extraction-files', opts ?? {}],
            extractionData: (plant) => ['domain-config', plant, 'pnid-ws', 'extraction-data'],
            extractionFileInfo: (plant) => ['domain-config', plant, 'pnid-ws', 'extraction-file-info'],
            dataFolders: (plant) => ['domain-config', plant, 'pnid-ws', 'data-folders'],
            equipment: (plant, page, limit) => ['domain-config', plant, 'pnid-ws', 'equipment', page, limit],
            imagesList: (plant, docType) => ['domain-config', plant, 'pnid-ws', 'images-list', docType],
            pdfInfo: (plant, path) => ['domain-config', plant, 'pnid-ws', 'pdf-info', path],
            fileBlob: (plant, path) => ['domain-config', plant, 'pnid-ws', 'file-blob', path],
            // Caches the COUNT, not the bytes. The queryFn fetches the PDF and
            // discards the ArrayBuffer once counted, so a dashboard listing 30
            // PDFs holds 30 numbers instead of 30 multi-MB buffers.
            pdfPageCountAll: (plant) => ['domain-config', plant, 'pnid-ws', 'pdf-page-count'],
            pdfPageCount: (plant, path) => ['domain-config', plant, 'pnid-ws', 'pdf-page-count', path],
            clientImage: (plant, docType, pageName) => ['domain-config', plant, 'pnid-ws', 'client-image', docType, pageName],
            excelExists: (plant) => ['domain-config', plant, 'pnid-ws', 'excel-exists'],
            highlightOptions: (plant, pdfName) => ['domain-config', plant, 'pnid-ws', 'highlight-options', pdfName ?? null],
            templateLibrary: (plant) => ['domain-config', plant, 'pnid-ws', 'template-library'],
            kgData: (plant, pdfName) => ['domain-config', plant, 'pnid-ws', 'kg-data', pdfName],
            ocrStatus: (plant, jobId) => ['domain-config', plant, 'pnid-ws', 'ocr-status', jobId],
            extractStatus: (plant, jobId) => ['domain-config', plant, 'pnid-ws', 'extract-status', jobId],
        },

        // Data Source Integration connectors — pnid | documents | sap |
        // timeseries | aif | gloc | lopc (seven since 2026-08-17)
        connector: {
            all: (plant) => ['domain-config', plant, 'connector'],
            job: (plant, connector, jobId) => ['domain-config', plant, 'connector', connector, 'job', jobId],
            existingPnid: (plant) => ['domain-config', plant, 'connector', 'pnid', 'existing'],
            // Per-connector lifecycle rollup — the tab strip's status/counts.
            // This entry plus `flowState` below are what make the screen
            // survive a hard refresh; they replaced nine localStorage keys.
            state: (plant) => ['domain-config', plant, 'connector', 'state'],
            // ONE connector's rollup + its taxonomy breakdown
            // (/connectors/{connector}/state?include_groups=true). Keyed on
            // includeGroups because the flag changes the response shape —
            // sharing a key with the flagless read would let a groups-less
            // payload satisfy a caller that needs groups[].
            stateOne: (plant, connector, includeGroups = false) =>
                ['domain-config', plant, 'connector', 'state', connector ?? null, { includeGroups }],
            // Per-file list. ONE entry for the whole plant: `flow` is optional
            // on /flow/state, so the app reads every flow in a single request
            // and slices per-flow client-side (groupFilesByFlow) instead of
            // keeping eight cache entries fed by eight requests. Keyed on the
            // lifecycle filter, which is a server-side filter — a different
            // filter is genuinely a different response, not a subset to derive.
            flowStateAll: (plant) => ['domain-config', plant, 'connector', 'flow-state'],
            flowState: (plant, lifecycle) =>
                ['domain-config', plant, 'connector', 'flow-state', 'list', lifecycle ?? 'all'],
            // ONE file's row (/flow/state/{flowUid}). Under the same
            // `flow-state` prefix so flowStateAll invalidates rows too — a
            // reset or delete moves both the list and the row.
            flowStateRow: (plant, flowUid) =>
                ['domain-config', plant, 'connector', 'flow-state', 'row', flowUid ?? null],
            // Use-case label vocabulary + which connectors require a label
            // (GET /connectors/labels). Reference data shared by every upload
            // modal, so it is NOT keyed per connector.
            labels: (plant) => ['domain-config', plant, 'connector', 'labels'],
        },

        // Review contexts, one per source
        context: {
            all: (plant) => ['domain-config', plant, 'context'],
            pnid: (plant, params) => ['domain-config', plant, 'context', 'pnid', params ?? {}],
            docs: (plant, params) => ['domain-config', plant, 'context', 'docs', params ?? {}],
            ts: (plant, params) => ['domain-config', plant, 'context', 'ts', params ?? {}],
            sap: (plant, params) => ['domain-config', plant, 'context', 'sap', params ?? {}],
            // SAP-linked findings feeds (aif | gloc | lopc, added 2026-08-17) — one
            // factory parameterized by connector instead of three near-identical
            // ones, since all three share the exact same param/response shape.
            feed: (plant, connector, params) => ['domain-config', plant, 'context', connector, params ?? {}],
        },

        docs: {
            types: (plant) => ['domain-config', plant, 'docs', 'types'],
            knowledgeGraph: (plant) => ['domain-config', plant, 'docs', 'knowledge-graph'],
        },

        pipeline: {
            all: (plant) => ['domain-config', plant, 'pipeline'],
            job: (plant, jobId) => ['domain-config', plant, 'pipeline', 'job', jobId],
            jobs: (plant, stage) => ['domain-config', plant, 'pipeline', 'jobs', stage ?? 'all'],
            outputs: (plant) => ['domain-config', plant, 'pipeline', 'outputs'],
            outputPreview: (plant, stage, table, params) =>
                ['domain-config', plant, 'pipeline', 'outputs', stage, table, params ?? {}],
        },

        dataQuality: (plant) => ['domain-config', plant, 'data-quality'],

        // Integrated Domain Intelligence Review (cross-domain synthesis)
        integrated: {
            all: (plant) => ['domain-config', plant, 'integrated'],
            labels: (plant) => ['domain-config', plant, 'integrated', 'labels'],
            columns: (label) => ['domain-config', 'integrated', 'columns', label ?? 'integrity'],
            view: (plant, params) => ['domain-config', plant, 'integrated', 'view', params ?? {}],
        },
    },

    // Phase 6 — Decision Template + the asset-config resource on the same backend.
    decisionTemplate: {
        all: (plant) => ['decision-template', plant],
        workflows: (plant) => ['decision-template', plant, 'workflows'],
        // viewWorkflow: the canonical saved graph for one template. Distinct
        // from the `workflows` list, whose rows are list-view summaries that are
        // NOT confirmed to carry the full workflow graph.
        workflow: (plant, templateId) => ['decision-template', plant, 'workflow', templateId],
        templateOptions: (plant) => ['decision-template', plant, 'template-options'],
        snapshotFeatures: (plant) => ['decision-template', plant, 'snapshot-features'],
        snapshotOptions: (plant, templateId) => ['decision-template', plant, 'snapshot-options', templateId],
        snapshot: (plant, templateId) => ['decision-template', plant, 'snapshot', templateId],
    },

    assetConfig: {
        all: (plant) => ['asset-config', plant],
        check: (plant, assetId) => ['asset-config', plant, 'check', assetId],
        options: (plant, assetId) => ['asset-config', plant, 'options', assetId],
    },

    knowledgeGraph: {
        all: (plant) => ['knowledge-graph', plant],
        explore: (plant, limit) => ['knowledge-graph', plant, 'explore', limit],
    },

    symbolicAi: {
        all: (plant) => ['symbolic-ai', plant],
        tables: (plant) => ['symbolic-ai', plant, 'tables'],
        markdown: (plant, dashboardName) => ['symbolic-ai', plant, 'markdown', dashboardName],
    },

    riskTemplate: {
        all: (plant) => ['risk-template', plant],
        templates: (plant) => ['risk-template', plant, 'templates'],
        markdown: (plant, templateName) => ['risk-template', plant, 'markdown', templateName],
    },

    // Not plant-scoped — global admin operations. Declared ahead of its own
    // query hooks (Phase 9, User Registry) because Phase 8's group mutations
    // already need a stable invalidation target: there is no standalone "list
    // groups" endpoint (GROUP_MANAGEMENT exposes only POST /admin/groups), so
    // the group list a future UsersView derives is read off the same user
    // records these mutations affect.
    users: {
        all: () => ['users'],
        list: () => ['users', 'list'],
        groupMembers: (plant) => ['users', plant, 'group-members'],
        featureList: (plant) => ['users', plant, 'feature-list'],
        permissionsView: (plant, users, features) => ['users', plant, 'permissions-view', users ?? [], features ?? []],
    },

    // Phase 10 — Log Management (admin activity feed, events, raw pipeline tails).
    logManagement: {
        all: (plant) => ['log-management', plant],
        summary: (plant) => ['log-management', plant, 'summary'],
        activity: (plant, limit) => ['log-management', plant, 'activity', limit],
        events: (plant, filters) => ['log-management', plant, 'events', filters ?? {}],
        tail: (plant, logKey, lines) => ['log-management', plant, 'tail', logKey, lines],
    },

    // Phase 11 — Dashboard (visual/widget workspaces) + the expression service
    // that backs custom-logic (formula) authoring on a visual.
    dashboard: {
        all: (plant) => ['dashboard', plant],
        list: (plant) => ['dashboard', plant, 'list'],
        detail: (plant, dashboardId) => ['dashboard', plant, 'detail', dashboardId],
        equipment: (plant, dashboardId) => ['dashboard', plant, 'equipment', dashboardId ?? null],
        equipmentTags: (plant, equipmentId, dashboardId) => ['dashboard', plant, 'equipment-tags', equipmentId, dashboardId ?? null],
        // `payload` is passed through raw (not hand-stringified) — Query's default
        // key hasher sorts object keys, so two calls built from the same config
        // hash identically regardless of property order. Same pattern as
        // domainConfig.pnidWs.extractionFiles above.
        preview: (plant, payload) => ['dashboard', plant, 'preview', payload ?? {}],
        cronValidation: (plant, cron) => ['dashboard', plant, 'cron-validation', cron ?? ''],
    },

    // Phase 12 — CPCP Configuration (Home) / Workflow Diagram.
    // Component & folder catalog, diagram persistence, batch generation jobs,
    // and Detailed Equipment Summary for the diagram builder.
    cpcpConfig: {
        all: (plant) => ['cpcp-config', plant],
        // Component & folder catalog
        components: (plant) => ['cpcp-config', plant, 'components'],
        sidebarData: (plant) => ['cpcp-config', plant, 'sidebar-data'],
        component: (plant, name) => ['cpcp-config', plant, 'component', name],
        componentsFromFolder: (plant, folder) => ['cpcp-config', plant, 'components-folder', folder],
        folders: (plant) => ['cpcp-config', plant, 'folders'],
        equipments: (plant) => ['cpcp-config', plant, 'equipments'],
        // Diagram persistence
        diagrams: (plant) => ['cpcp-config', plant, 'diagrams'],
        diagram: (plant, diagramId) => ['cpcp-config', plant, 'diagram', diagramId],
        // Batch generation jobs
        generateJob: (plant, jobId) => ['cpcp-config', plant, 'generate-job', jobId],
        generateJobs: (plant) => ['cpcp-config', plant, 'generate-jobs'],
        // Detailed Equipment Summary
        summaryStatus: (plant) => ['cpcp-config', plant, 'summary-status'],
        summaryPreview: (plant, page) => ['cpcp-config', plant, 'summary-preview', page],
    },

    // Phase 12 — Notifications (NOT plant-scoped).
    // The notification/observation/workorder services are plant-agnostic,
    // so keys have NO plant segment and queries have no `enabled: !!plantCode`.
    notifications: {
        all: () => ['notifications'],
        list: () => ['notifications', 'list'],
    },

    // Phase 19 — PlantGPT (NOT plant-scoped root info).
    plantGpt: {
        all: () => ['plant-gpt'],
        info: () => ['plant-gpt', 'info'],
    },

    // Phase 21 — Developer Options / Scheduler
    developerOptions: {
        all: () => ['developer-options'],
        health: () => ['developer-options', 'health'],
        schedules: {
            all: (plant) => ['developer-options', plant, 'schedules'],
            list: (plant) => ['developer-options', plant, 'schedules', 'list'],
            detail: (plant, id) => ['developer-options', plant, 'schedules', 'detail', id],
        },
    },

    // Phase 14 — Model Studio (globalVariable, expression, function, forecast, optimizer, mlModel)
    modelStudio: {
        all: () => ['model-studio'],
        globalVariable: {
            all: (plant) => ['model-studio', plant, 'global-variable'],
            list: (plant) => ['model-studio', plant, 'global-variable', 'list'],
            detail: (plant, id) => ['model-studio', plant, 'global-variable', 'detail', id],
        },
        expression: {
            all: (plant) => ['model-studio', plant, 'expression'],
            list: (plant) => ['model-studio', plant, 'expression', 'list'],
            detail: (plant, id) => ['model-studio', plant, 'expression', 'detail', id],
            cronValidation: (plant, cron) => ['model-studio', plant, 'expression', 'cron-validation', cron ?? ''],
            tagSearch: (plant, query) => ['model-studio', plant, 'expression', 'tag-search', query ?? ''],
        },
        function: {
            all: (plant) => ['model-studio', plant, 'function'],
            list: (plant) => ['model-studio', plant, 'function', 'list'],
            detail: (plant, id) => ['model-studio', plant, 'function', 'detail', id],
        },
        forecast: {
            all: (plant) => ['model-studio', plant, 'forecast'],
            overview: (plant) => ['model-studio', plant, 'forecast', 'overview'],
            models: (plant) => ['model-studio', plant, 'forecast', 'models'],
            modelOptions: (plant) => ['model-studio', plant, 'forecast', 'model-options'],
            assetList: (plant) => ['model-studio', plant, 'forecast', 'asset-list'],
            assetTags: (plant, assetId) => ['model-studio', plant, 'forecast', 'asset-tags', assetId],
            pipelines: (plant) => ['model-studio', plant, 'forecast', 'pipelines'],
            pipelineDetail: (plant, pipelineId) => ['model-studio', plant, 'forecast', 'pipeline-detail', pipelineId],
            availableTools: (plant) => ['model-studio', plant, 'forecast', 'available-tools'],
            experiments: (plant) => ['model-studio', plant, 'forecast', 'experiments'],
            experimentDetail: (plant, expId) => ['model-studio', plant, 'forecast', 'experiment-detail', expId],
            modelParams: (plant, modelId) => ['model-studio', plant, 'forecast', 'model-params', modelId],
        },
        optimizer: {
            all: (plant) => ['model-studio', plant, 'optimizer'],
            overview: (plant) => ['model-studio', plant, 'optimizer', 'overview'],
            objectiveFunction: (plant, expId) => ['model-studio', plant, 'optimizer', 'objective-function', expId],
            constraints: (plant, expId) => ['model-studio', plant, 'optimizer', 'constraints', expId],
            constants: (plant, expId) => ['model-studio', plant, 'optimizer', 'constants', expId],
            deployment: (plant, expId) => ['model-studio', plant, 'optimizer', 'deployment', expId],
            tagSearch: (plant, query) => ['model-studio', plant, 'optimizer', 'tag-search', query ?? ''],
        },
        mlModel: {
            all: (plant) => ['model-studio', plant, 'ml-model'],
            overview: (plant) => ['model-studio', plant, 'ml-model', 'overview'],
            models: (plant) => ['model-studio', plant, 'ml-model', 'models'],
            modelDetail: (plant, modelId) => ['model-studio', plant, 'ml-model', 'model-detail', modelId],
            assetList: (plant) => ['model-studio', plant, 'ml-model', 'asset-list'],
            tagSearch: (plant, query) => ['model-studio', plant, 'ml-model', 'tag-search', query ?? ''],
            pipelines: (plant) => ['model-studio', plant, 'ml-model', 'pipelines'],
            pipelineDetail: (plant, pipelineId) => ['model-studio', plant, 'ml-model', 'pipeline-detail', pipelineId],
            availableTools: (plant) => ['model-studio', plant, 'ml-model', 'available-tools'],
            experiments: (plant) => ['model-studio', plant, 'ml-model', 'experiments'],
            experimentDetail: (plant, expId) => ['model-studio', plant, 'ml-model', 'experiment-detail', expId],
            runs: (plant, expId) => ['model-studio', plant, 'ml-model', 'runs', expId],
            modelParams: (plant, modelId) => ['model-studio', plant, 'ml-model', 'model-params', modelId],
            deployments: (plant) => ['model-studio', plant, 'ml-model', 'deployments'],
            deploymentDetail: (plant, depId) => ['model-studio', plant, 'ml-model', 'deployment-detail', depId],
            registry: (plant) => ['model-studio', plant, 'ml-model', 'registry'],
            registryDetail: (plant, name) => ['model-studio', plant, 'ml-model', 'registry-detail', name],
            artifacts: (plant) => ['model-studio', plant, 'ml-model', 'artifacts'],
            artifactDetail: (plant, artId) => ['model-studio', plant, 'ml-model', 'artifact-detail', artId],
        },
    },

    // Phase 17 — Workspace (workspace CRUD, folder/features, per-type analyses, custom tags)
    workspace: {
        all: (plant) => ['workspace', plant],
        list: (plant, username) => ['workspace', plant, 'list', username],
        folder: (plant, username, workspaceName) => ['workspace', plant, 'folder', username, workspaceName],
        features: (plant, username, workspaceName) => ['workspace', plant, 'features', username, workspaceName],
        availableTags: (plant, username, workspaceName) => ['workspace', plant, 'available-tags', username, workspaceName],
        analysis: (plant, type, payload) => ['workspace', plant, 'analysis', type, payload ?? {}],
    },

    // Phase 18 — Visuals (chart/visual CRUD, tag search, timeseries data)
    visuals: {
        all: (plant) => ['visuals', plant],
        listTags: (plant, params) => ['visuals', plant, 'list-tags', params ?? {}],
        savedVisuals: (plant, body) => ['visuals', plant, 'saved-visuals', body ?? {}],
        visualsData: (plant, body) => ['visuals', plant, 'visuals-data', body ?? {}],
        dashboards: (plant, username) => ['visuals', plant, 'dashboards', username],
        customTag: (plant, body) => ['visuals', plant, 'custom-tag', body ?? {}],
    },

    // Phase 20 — Agent Factory (models, tools, node catalog, templates CRUD, deployment)
    agentFactory: {
        all: (plant) => ['agent-factory', plant],
        models: (plant) => ['agent-factory', plant, 'models'],
        tools: (plant) => ['agent-factory', plant, 'tools'],
        nodeCatalog: (plant) => ['agent-factory', plant, 'node-catalog'],
        datasourceTypes: (plant) => ['agent-factory', plant, 'datasource-types'],
        availableFeatures: (plant) => ['agent-factory', plant, 'available-features'],
        memoryTypes: (plant) => ['agent-factory', plant, 'memory-types'],
        outputTypes: (plant) => ['agent-factory', plant, 'output-types'],
        templates: (plant, params) => ['agent-factory', plant, 'templates', params ?? {}],
        template: (plant, id) => ['agent-factory', plant, 'template', id],
    },

    // Phase 4 — CPCP (Domain Ontology equipment-attribute matrix & P&ID Agent assessment matrix)
    cpcp: {
        all: (plant) => ['cpcp', plant],
        ontology: (plant) => ['cpcp', plant, 'ontology'],
        matrix: (clientName) => ['cpcp', 'matrix', clientName],
    },
};



