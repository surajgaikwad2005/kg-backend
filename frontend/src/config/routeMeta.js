/**
 * routeMeta.js
 * Route → header title/subtitle registry consumed by PageHeader.
 * Longest-prefix match wins, so nested routes inherit their section's meta
 * unless a more specific entry exists. Add new pages here — never hardcode
 * a duplicate title map inside a component.
 */
export const ROUTE_META = {
    '/admin/domain-configuration': { title: 'Domain Driven Ontology', subtitle: 'Data Model Management' },
    '/admin/data-activity':        { title: 'Data Activity',          subtitle: 'Activity Monitoring & Audit' },
    '/admin/group-management':     { title: 'Group Management',       subtitle: 'Access & Permission Groups' },
    '/admin/user-registry':        { title: 'User Registry',          subtitle: 'User Account Management' },
    '/admin/log-management':       { title: 'Log Management',         subtitle: 'System Log Viewer' },
    '/workflow-management':  { title: 'Workflow Management',    subtitle: 'Maintenance Process Control' },
    '/scenario-extractor':   { title: 'Scenario Extractor',     subtitle: 'Pattern & Event Analysis' },
    '/knowledge-graph':      { title: 'Knowledge Graph',        subtitle: 'Entity Relationship Mapping' },
    '/model-studio':         { title: 'Model Studio',           subtitle: 'ML Model Management' },
    '/agent-factory':        { title: 'Agent Factory',          subtitle: 'AI Agent Configuration' },
    '/symbolic-ai':          { title: 'Symbolic AI',            subtitle: 'Rule-Based Intelligence' },
    '/admin/cpcp/old':       { title: 'CPCP Configuration',     subtitle: 'Equipment Ontology Matrix' },
    '/admin/cpcp/new':       { title: 'CPCP Template Setup',    subtitle: 'Identity, Path & Rule Configuration' },
    '/admin/cpcp':           { title: 'CPCP Operations',        subtitle: 'Operational Templates' },
    '/admin/risk-template':  { title: 'Risk Template',          subtitle: 'Domain Ontology' },
    '/admin/decision-template':{ title: 'Decision Template',    subtitle: 'Domain Ontology' },
    '/dashboards':           { title: 'Dashboards',             subtitle: 'Custom Monitoring Views' },
    '/workspace':            { title: 'Workspace',              subtitle: 'Collaborative Workspace' },
    '/visuals':              { title: 'Visuals',                subtitle: 'Data Visualization Studio' },
    '/plant-gpt':            { title: 'PlantGPT',               subtitle: 'AI-Powered Plant Intelligence' },
    '/home':                 { title: 'CPCP Configuration',     subtitle: 'Platform Configuration' },
    '/rca':                  { title: 'RCA',                    subtitle: 'Root Cause Analysis' },
    '/developer-options':    { title: 'Developer Options',      subtitle: 'System Configuration' },
};

const DEFAULT_META = { title: 'Decision Intelligence', subtitle: 'AI PlantOps Platform' };

export function getRouteMeta(pathname) {
    const sorted = Object.keys(ROUTE_META).sort((a, b) => b.length - a.length);
    for (const key of sorted) {
        if (pathname === key || pathname.startsWith(key + '/')) return ROUTE_META[key];
    }
    return DEFAULT_META;
}
