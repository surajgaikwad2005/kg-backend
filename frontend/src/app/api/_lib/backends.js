/**
 * backends.js
 * Single source of truth for every backend the API proxy layer talks to.
 *
 * Route handlers MUST resolve their base URL through `resolveBackend(name)` —
 * never read process.env or hardcode an IP inside a route. This keeps backend
 * addresses in one place and makes a missing/moved backend fail loudly instead
 * of silently hitting a stale hardcoded host.
 *
 * NOTE: these run server-side only (route handlers), so non-public vars
 * are available here.
 */

/** Logical backend name → the env var that holds its base URL. */
const BACKEND_ENV = {
    // ── DDO (Domain Ontology) ──────────────────────────────────────────
    DOMAIN_CONFIGURATION: "SERVICE_DOMAIN_CONFIGURATION_URL",
    KNOWLEDGE_GRAPH: "SERVICE_KNOWLEDGE_GRAPH_URL",
    SYMBOLIC_AI: "SERVICE_SYMBOLIC_AI_URL",
    CPCP: "SERVICE_CPCP_URL",
    RISK_TEMPLATE: "SERVICE_RISK_TEMPLATE_URL",
    DECISION_TEMPLATE: "SERVICE_DECISION_TEMPLATE_URL",

    // ── Admin ─────────────────────────────────────────────────────────
    DATA_ACTIVITY: "SERVICE_DATA_ACTIVITY_URL",
    GROUP_MANAGEMENT: "SERVICE_GROUP_MANAGEMENT_URL",
    USER_REGISTRY: "SERVICE_USER_REGISTRY_URL",
    LOG_MANAGEMENT: "SERVICE_LOG_MANAGEMENT_URL",

    // ── User ──────────────────────────────────────────────────────────
    DASHBOARDS: "SERVICE_DASHBOARDS_URL",
    CPCP_CONFIGURATION: "SERVICE_CPCP_CONFIGURATION_URL",
    SCENARIO_EXTRACTOR: "SERVICE_SCENARIO_EXTRACTOR_URL",
    MODEL_STUDIO: "SERVICE_MODEL_STUDIO_URL",
    // Same physical host as MODEL_STUDIO (both SERVICE_MODEL_STUDIO_URL, confirmed
    // 172.16.0.12) — separate logical key so the decisionops-pod2 gateway prefix in
    // BACKEND_PATHS below only applies to this refactored contract, not to the other
    // MODEL_STUDIO routes which call the bare host directly with no gateway prefix.
    MODEL_FACTORY: "SERVICE_MODEL_STUDIO_URL",
    RCA: "SERVICE_RCA_URL",
    WORKFLOW_MANAGEMENT: "SERVICE_WORKFLOW_MANAGEMENT_URL",

    // ── Tools ─────────────────────────────────────────────────────────
    WORKSPACE: "SERVICE_WORKSPACE_URL",
    VISUALS: "SERVICE_VISUALS_URL",
    PLANT_GPT: "SERVICE_PLANT_GPT_URL",
    AGENT_FACTORY: "SERVICE_AGENT_FACTORY_URL",

    // ── Base / Shared ─────────────────────────────────────────────────
    AUTH: "SERVICE_AUTH_URL",
    PNID: "SERVICE_PNID_URL",
    // domain-configuration/pnid-workspace's refactored "P&ID Validator API"
    // contract — deliberately separate from PNID (which stays exclusively for
    // admin/cpcp's Assessment Matrix) even though both are the same local dev
    // host today. See SERVICE_PNID_WORKSPACE_URL comment in .env.local.
    PNID_WORKSPACE: "SERVICE_PNID_WORKSPACE_URL",
    DATAQUALITY: "SERVICE_DATAQUALITY_URL",
    INDUSTRIAL: "SERVICE_INDUSTRIAL_URL",
    DEVELOPER_OPTIONS: "SERVICE_DEVELOPER_OPTIONS_URL",

    // ── Plant Code ID registry (configRouter/plants, refactored) ────────
    // Uses SERVICE_PLANT_CODE_ID_URL if defined, otherwise falls back to SERVICE_DOMAIN_CONFIGURATION_URL.
    PLANT_CODE_ID: "SERVICE_PLANT_CODE_ID_URL",
};

/** Feature-specific path prefixes to append to the base URL */
const BACKEND_PATHS = {

    // DOMAIN_CONFIGURATION: "/p0/cdm", // for local backend server
    DOMAIN_CONFIGURATION: "/api/decisionops-pod1/p0/cdm", // deployed backend prefix

    DATAQUALITY: "/api/decisionops-pod1/p0/dataQuality",

    // DATA_ACTIVITY: "/p0/cdm", // for local backend server
    DATA_ACTIVITY: "/api/decisionops-pod1/p0/cdm", // deployed backend prefix

    KNOWLEDGE_GRAPH: "/api/decisionops-pod2",
    CPCP: "/api/decisionops-pod2/p1/cpcp",

    AUTH: "/api/decisionops-pod1/p0/login",

    RISK_TEMPLATE: "/api/decisionops-pod2/p1/riskTemplate",


    // SYMBOLIC_AI: "/p1/symbolicAi", // for local backend server
    SYMBOLIC_AI: "/api/decisionops-pod2/p1/symbolicAi", // deployed backend prefix

    DECISION_TEMPLATE: "/api/decisionops-pod2/p1/decisionModel",

    PLANT_CODE_ID: "/api/decisionops-pod1/p0/cdm/configRouter", // deployed backend prefix
    // PLANT_CODE_ID: "/p0/cdm/configRouter", // for local backend server

    WORKSPACE: "/api/decisionops-pod1/p1/workspace",
    DASHBOARDS: "/api/decisionops-pod1/p1",
    MODEL_FACTORY: "/api/decisionops-pod2/p2/modelFactory",

    PLANT_GPT: "/api/decisionops-pod2/p1/aivee",

    VISUALS: "/api/decisionops-pod1/p1/visuals",
    // VISUALS: "",

    // Deployed 2026-08-19: the "P&ID Validator API — Unified Storage" backend
    // (formerly a bare-host local dev instance at 127.0.0.1:4000) now sits
    // behind this gateway prefix on SERVICE_CPCP_CONFIGURATION_URL
    // (13.71.62.24). Confirmed via live GET
    // http://13.71.62.24/api/decisionops-pnid/openapi.json, whose paths
    // (/diagrams, /components, /generate, /clients/detailedEquipmentSummary/*,
    // etc.) match this domain's contract 1:1. Same physical backend as
    // PNID_WORKSPACE below — kept as a separate logical key regardless (see
    // that key's comment for why).
    CPCP_CONFIGURATION: "/api/decisionops-pnid",

    // Deployed 2026-08-19: same "P&ID Validator API — Unified Storage" backend
    // as CPCP_CONFIGURATION above (formerly bare-host local dev at
    // 127.0.0.1:4000), now behind this gateway prefix on
    // SERVICE_PNID_WORKSPACE_URL (13.71.62.24). Confirmed via live GET
    // http://13.71.62.24/api/decisionops-pnid/openapi.json, whose paths
    // (/clients, /dataFolders, /upload, /extract, /templateMatch, /kg_data,
    // /chatbot/chat, etc.) match this domain's contract 1:1. The same swagger
    // also now exposes an "Assessment Workflow" tag (/runPnidAgent,
    // /assessment/matrix, ...) matching admin/cpcp's Assessment Matrix — left
    // untouched per explicit user decision (2026-08-19): that feature stays on
    // its existing CPCP/decisionops-pod2 gateway, a deliberately different
    // backend from this one.
    PNID_WORKSPACE: "/api/decisionops-pnid",

    AGENT_FACTORY: "/api/decisionops-pod1/p1/agentFactory",

    GROUP_MANAGEMENT: "/api/decisionops-pod1",
    USER_REGISTRY: "/api/decisionops-pod1/p0/login",

    // Gateway prefix confirmed live via Swagger UI at
    // http://172.16.0.12/api/dev-option/swagger — every scheduler endpoint
    // (/health, /schedule, /schedule/{id}, /schedule/{id}/enable|disable,
    // /reload) hangs directly off this prefix, no further nesting.
    DEVELOPER_OPTIONS: "/api/dev-option",
};

/**
 * Resolve a logical backend name to its base URL (trailing slash stripped) + path prefix.
 * @param {keyof typeof BACKEND_ENV} name
 * @returns {string}
 */
export function resolveBackend(name) {
    const envKey = BACKEND_ENV[name];
    if (!envKey) {
        throw new Error(`[backends] Unknown backend "${name}"`);
    }

    let url = process.env[envKey]?.trim();

    if (!url && name === "PLANT_CODE_ID") {
        url = process.env.SERVICE_DOMAIN_CONFIGURATION_URL?.trim();
    }

    if (!url) {
        throw new Error(
            `[backends] ${envKey} is not set in your environment (.env.services). ` +
            `Missing configuration for ${name} backend.`
        );
    }

    let baseUrl = url.replace(/\/+$/, "");
    const pathPrefix = BACKEND_PATHS[name] || "";
    return baseUrl + pathPrefix;
}

/** Convenience: the gateway sub-app path prefix for Agent Factory. */
export function agentFactoryPrefix() {
    return process.env.AGENT_FACTORY_PREFIX?.trim() || "/p1_agent_factory";
}
