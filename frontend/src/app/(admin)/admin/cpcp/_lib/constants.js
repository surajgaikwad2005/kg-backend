/**
 * Shared seed data and option lists for the CPCP Operations feature.
 * Module-scoped so nothing here is re-created on every render (CLAUDE.md #22).
 * All list/detail data here is placeholder content for the static flow — swap
 * for real `cpcpService` calls once the backend contract lands.
 */

export const STORAGE_KEY = 'do:cpcp-templates';

export const OPERATING_OUTCOME_OPTIONS = [
    { value: 'Gas Export Availability', label: 'Gas Export Availability' },
    { value: 'Oil Export Availability', label: 'Oil Export Availability' },
    { value: 'Water Injection Availability', label: 'Water Injection Availability' },
];

export const MEMBERSHIP_TYPE_OPTIONS = [
    { value: 'fixed', label: 'fixed' },
    { value: 'conditional', label: 'conditional' },
    { value: 'dependency', label: 'dependency' },
    { value: 'dynamic', label: 'dynamic' },
];

export const YES_NO_OPTIONS = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
];

export const CAPACITY_BASIS_OPTIONS = [
    { value: 'design', label: 'design' },
    { value: 'performance test', label: 'performance test' },
    { value: 'derated', label: 'derated' },
];

export const ALTERNATE_PATH_OPTIONS = [
    { value: 'Stand-By', label: 'Stand-By' },
    { value: 'By-Pass', label: 'By-Pass' },
];

export const RISK_TYPE_OPTIONS = [
    { value: 'Integrity', label: 'Integrity' },
    { value: 'Mechanical', label: 'Mechanical' },
];

export const FAILURE_LOCATION_OPTIONS = [
    { value: 'Active Path', label: 'Active Path' },
    { value: 'Dependency System', label: 'Dependency System' },
];

export const CAPACITY_COMPARISON_OPTIONS = [
    { value: 'Similar', label: 'Similar' },
    { value: 'Less', label: 'Less' },
    { value: 'More', label: 'More' },
];

export const ONTOLOGY_NODES = [
    'Feed source',
    'Export scrubbing',
    'Compression Train A',
    'Compression Train B',
    'Cooling A',
    'Cooling B',
    'Export containment',
    'Seal gas supply',
    'Power supply',
    'Safeguarding',
    'Anti-surge protection',
    'Suction crossover',
    'Production dependents',
];

export const WIZARD_STEPS = [
    { id: 'setup', label: 'Template Setup' },
    { id: 'path-selection', label: 'Path Method' },
    { id: 'path-definition', label: 'Path Definition', matches: ['pid-drawing', 'ontology-setup'] },
    { id: 'source-sink', label: 'Source to Sink' },
    { id: 'topology', label: 'Topology Knowledge' },
    { id: 'rules', label: 'Rule Configuration' },
];

export const EMPTY_FORM_DATA = {
    operatingOutcome: '',
    outcomeStatement: '',
    status: '',
    cpcpName: '',
    cpcpId: '',
    site: '',
    owner: '',
    archetypeVersion: '',
    requiredExportRate: '',
    supportedDecisions: '',
};

export const SEED_TEMPLATES = [
    {
        id: 'tpl-1',
        cpcpName: 'Gas Export CpCp - Platform A',
        createdBy: 'Prasad Pawar',
        date: 'Jul 28, 2026',
        status: 'Draft',
    },
    {
        id: 'tpl-2',
        cpcpName: 'Oil Export CpCp - Platform B',
        createdBy: 'System Admin',
        date: 'Jul 25, 2026',
        status: 'Active',
    },
];

export const SEED_ASSET_MAPPINGS = [
    {
        archetypeRole: 'Feed source', mappedAsset: 'V-101', equipmentClass: 'Separator',
        membershipType: 'fixed', mandatory: 'Yes', activationCondition: 'always', parallelGroup: '',
        capacity: '90.0', capacityBasis: 'design', dynamicMemberQuery: '', resolvedMembers: '',
        assetRegistered: 'OK', mappingComplete: 'OK', running: '1', available: '1',
        capacityNow: '90.0', capacityPostSwitchover: '90.0',
    },
    {
        archetypeRole: 'Export scrubbing', mappedAsset: 'V-102', equipmentClass: 'Scrubber',
        membershipType: 'fixed', mandatory: 'Yes', activationCondition: 'always', parallelGroup: '',
        capacity: '85.0', capacityBasis: 'design', dynamicMemberQuery: '', resolvedMembers: '',
        assetRegistered: 'OK', mappingComplete: 'OK', running: '1', available: '1',
        capacityNow: '85.0', capacityPostSwitchover: '85.0',
    },
    {
        archetypeRole: 'Compression Train A', mappedAsset: 'K-101A', equipmentClass: 'Compressor',
        membershipType: 'conditional', mandatory: 'Yes', activationCondition: 'running AND suction/discharge lined up', parallelGroup: 'Compression',
        capacity: '78.0', capacityBasis: 'design', dynamicMemberQuery: '', resolvedMembers: '',
        assetRegistered: 'OK', mappingComplete: 'OK', running: '1', available: '1',
        capacityNow: '78.0', capacityPostSwitchover: '78.0',
    },
    {
        archetypeRole: 'Compression Train B', mappedAsset: 'K-101B', equipmentClass: 'Compressor',
        membershipType: 'conditional', mandatory: 'No', activationCondition: 'running AND suction/discharge lined up', parallelGroup: 'Compression',
        capacity: '78.0', capacityBasis: 'design', dynamicMemberQuery: '', resolvedMembers: '',
        assetRegistered: 'OK', mappingComplete: 'OK', running: '0', available: '0',
        capacityNow: '0.0', capacityPostSwitchover: '0.0',
    },
    {
        archetypeRole: 'Cooling A', mappedAsset: 'E-101A', equipmentClass: 'Cooler',
        membershipType: 'conditional', mandatory: 'Yes', activationCondition: 'running', parallelGroup: 'Cooling',
        capacity: '40.0', capacityBasis: 'design', dynamicMemberQuery: '', resolvedMembers: '',
        assetRegistered: 'OK', mappingComplete: 'OK', running: '1', available: '1',
        capacityNow: '40.0', capacityPostSwitchover: '40.0',
    },
    {
        archetypeRole: 'Cooling B', mappedAsset: 'E-101B', equipmentClass: 'Cooler',
        membershipType: 'conditional', mandatory: 'Yes', activationCondition: 'running', parallelGroup: 'Cooling',
        capacity: '40.0', capacityBasis: 'design', dynamicMemberQuery: '', resolvedMembers: '',
        assetRegistered: 'OK', mappingComplete: 'OK', running: '1', available: '1',
        capacityNow: '40.0', capacityPostSwitchover: '40.0',
    },
    {
        archetypeRole: 'Export containment', mappedAsset: '10-GAS-1001', equipmentClass: 'Header/Line',
        membershipType: 'fixed', mandatory: 'Yes', activationCondition: 'always', parallelGroup: '',
        capacity: '82.0', capacityBasis: 'design', dynamicMemberQuery: '', resolvedMembers: '',
        assetRegistered: 'OK', mappingComplete: 'OK', running: '1', available: '1',
        capacityNow: '82.0', capacityPostSwitchover: '82.0',
    },
];

export const SEED_REPAIR_ASSUMPTIONS = [
    { role: 'Compression Train A', minDuration: '26', maxDuration: '34', liveSourceOverride: '-' },
    { role: 'Compression Train B', minDuration: '26', maxDuration: '34', liveSourceOverride: 'SAP WO 4501-2211 ETA' },
    { role: 'Cooling A', minDuration: '8', maxDuration: '14', liveSourceOverride: '-' },
    { role: 'Cooling B', minDuration: '8', maxDuration: '14', liveSourceOverride: '-' },
    { role: 'Seal gas supply', minDuration: '6', maxDuration: '12', liveSourceOverride: '-' },
    { role: 'Power supply', minDuration: '4', maxDuration: '10', liveSourceOverride: '-' },
];

export const SEED_EMERGENCY_ROUTES = [
    { route: 'Full-capacity export bypass', registered: 'No', capacity: '', allowedDuration: '' },
    { route: 'Suction crossover via XV-118', registered: 'Yes', capacity: '78.0', allowedDuration: '24' },
    { route: 'Cooler bypass', registered: 'No', capacity: '', allowedDuration: '' },
];

export const SEED_RULE_CONFIGURATIONS = [
    {
        ruleId: 'R-01', category: 'state normalization',
        rule: 'IF SAP work order active on <asset> THEN <asset> unavailable',
        source: 'archetype pack', active: 'Yes',
        implemented: '2_Live_State column D -> column G', validation: 'Binding to SAP WO status exists',
    },
    {
        ruleId: 'R-02', category: 'state normalization',
        rule: 'IF DCS run feedback = RUN THEN <asset> running',
        source: 'archetype pack', active: 'Yes',
        implemented: '6_Bindings raw->state map', validation: 'Every raw code maps to the fixed vocabulary',
    },
    {
        ruleId: 'R-03', category: 'state normalization',
        rule: 'IF isolation boundary applied THEN <asset> isolated',
        source: 'archetype pack', active: 'Yes',
        implemented: '2_Live_State column E', validation: 'Boundary registered on 5_Limits',
    },
    {
        ruleId: 'R-04', category: 'state normalization',
        rule: 'IF tag stale beyond freshness threshold THEN <asset> unavailable',
        source: 'archetype pack', active: 'Yes',
        implemented: 'NODATA raw code', validation: 'Freshness threshold set per binding',
    },
    {
        ruleId: 'R-10', category: 'propagation',
        rule: 'IF <dependency> unavailable THEN all assets with a DEPENDS_ON edge to it are unavailable',
        source: 'archetype pack', active: 'Yes',
        implemented: '4_Relationships col N -> 2_Live_State col L', validation: 'DEPENDS_ON edge exists in topology',
    },
];
