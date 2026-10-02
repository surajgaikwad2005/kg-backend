// SAP-linked integrity data feeds (see the Notification_AIF / Work_Order_GLOC /
// Integrity_Incident table defs below) — uploaded via the unified
// connectors/upload endpoint with their OWN native connector value
// (connector='aif'|'gloc'|'lopc', lowercased from this array at the call
// site — see useConfigModalActions.handleFeedSubmit). 2026-08-17 migration:
// previously these went through connector='sap' + file_type=<feed name>; the
// backend's connector enum now lists aif/gloc/lopc as first-class values
// (confirmed via live Swagger UI dropdown for POST /p0/cdm/connectors/upload)
// so the file_type sub-typing was dropped for these three. Plain SAP table
// uploads (connector='sap', file_type='SAP') are unchanged.
// Shared between useSourceTabs.js (sidebar rows) and ConfigModal.jsx (which
// modal body/submit handler to use) so the two never drift apart.
export const FEED_TYPES = ['AIF', 'GLOC', 'LOPC'];

// NOTE: the per-file use-case label vocabulary (integrity | reliability |
// production | maintenance) used to live here as FILE_LABEL_OPTIONS. It was
// removed on 2026-08-17 when GET /connectors/labels landed — the backend now
// owns both the vocabulary AND which connectors require a label
// (required_for / not_required_for), so hardcoding it here could only drift.
// Read it through useConnectorLabels (components/admin/_queries) and render
// it with <FileLabelSelect />; there is deliberately no local fallback list.

// Documents Config State
export const DOC_TYPE_CATEGORIES = [
    {
        category: 'Design Documents',
        types: [
            { key: 'equipment_datasheets', label: 'Equipment Datasheets', fields: [
                    { name: 'Equipment Tag', desc: 'Unique equipment identifier (e.g. P-101)' },
                    { name: 'Equipment Name', desc: 'Full name / description of the equipment' },
                    { name: 'Manufacturer', desc: 'OEM / vendor name' },
                    { name: 'Model Number', desc: 'Manufacturer model or part number' },
                    { name: 'Design Pressure', desc: 'Maximum rated pressure (bar / psi)' },
                    { name: 'Design Temperature', desc: 'Maximum rated temperature (°C / °F)' },
                    { name: 'Material of Construction', desc: 'Body / shell material (e.g. SS316)' },
                    { name: 'Capacity / Rating', desc: 'Flow rate, power, or throughput rating' },
                ] },
            { key: 'cause_effect_matrix', label: 'Cause & Effect Matrix', fields: [
                    { name: 'Cause Tag', desc: 'Initiating signal / input tag (e.g. LSHH-101)' },
                    { name: 'Effect Tag', desc: 'Resulting action / output tag (e.g. XV-101)' },
                    { name: 'Cause Description', desc: 'Description of the cause condition' },
                    { name: 'Effect Description', desc: 'Description of the resulting action' },
                    { name: 'Logic', desc: 'AND / OR / voting logic' },
                    { name: 'SIF / SIL', desc: 'Safety Instrumented Function / Safety Integrity Level' },
                ] },
        ],
    },
    {
        category: 'Operations Documents',
        types: [
            { key: 'sop', label: 'SOP (Standard Operating Procedures)', fields: [
                    { name: 'Procedure ID', desc: 'Unique SOP reference number' },
                    { name: 'Title', desc: 'Procedure title / name' },
                    { name: 'Applicable Unit', desc: 'Plant area or process unit' },
                    { name: 'Steps', desc: 'Ordered list of procedural steps' },
                    { name: 'Safety Precautions', desc: 'PPE, hazards, permits required' },
                    { name: 'Revision', desc: 'Document revision number & date' },
                ] },
            { key: 'startup_shutdown', label: 'Start-up/Shutdown Procedures', fields: [
                    { name: 'Procedure ID', desc: 'Unique procedure reference' },
                    { name: 'Unit / Equipment', desc: 'Target equipment or system' },
                    { name: 'Mode', desc: 'Start-up or Shutdown' },
                    { name: 'Pre-conditions', desc: 'Required conditions before execution' },
                    { name: 'Steps', desc: 'Ordered procedural steps' },
                    { name: 'Interlock Checks', desc: 'Interlock / trip verifications' },
                ] },
            { key: 'operating_manuals', label: 'Operating Manuals', fields: [
                    { name: 'Equipment / System', desc: 'Target equipment or subsystem' },
                    { name: 'Operating Parameters', desc: 'Normal operating ranges' },
                    { name: 'Alarm Setpoints', desc: 'High / Low alarm values' },
                    { name: 'Emergency Actions', desc: 'Actions during abnormal conditions' },
                ] },
            { key: 'log_sheets', label: 'Log Sheets', fields: [
                    { name: 'Shift Date', desc: 'Date of the shift' },
                    { name: 'Shift', desc: 'Shift identifier (A / B / C)' },
                    { name: 'Operator', desc: 'Name of the shift operator' },
                    { name: 'Readings', desc: 'Parameter readings and observations' },
                    { name: 'Incidents', desc: 'Any incidents or deviations noted' },
                ] },
            { key: 'batch_reports', label: 'Batch Reports (Cement / Blending)', fields: [
                    { name: 'Batch ID', desc: 'Unique batch number' },
                    { name: 'Product', desc: 'Cement type / blend grade' },
                    { name: 'Raw Mix Ratio', desc: 'Component proportions' },
                    { name: 'Quality Parameters', desc: 'Fineness, LOI, free lime, etc.' },
                    { name: 'Production Quantity', desc: 'Tonnes produced' },
                ] },
        ],
    },
    {
        category: 'Maintenance Documents',
        types: [
            { key: 'maintenance_manuals', label: 'Maintenance Manuals', fields: [
                    { name: 'Equipment Tag', desc: 'Equipment identifier' },
                    { name: 'Maintenance Type', desc: 'Preventive / Predictive / Corrective' },
                    { name: 'Task Description', desc: 'Maintenance activity description' },
                    { name: 'Frequency', desc: 'Interval (daily, weekly, monthly, etc.)' },
                    { name: 'Spare Parts', desc: 'Required spare parts list' },
                    { name: 'Tools Required', desc: 'Tools and equipment needed' },
                ] },
            { key: 'rca_reports', label: 'RCA Reports', fields: [
                    { name: 'Incident ID', desc: 'Unique failure / incident reference' },
                    { name: 'Equipment', desc: 'Failed equipment tag' },
                    { name: 'Failure Mode', desc: 'How the equipment failed' },
                    { name: 'Root Cause', desc: 'Identified root cause' },
                    { name: 'Corrective Action', desc: 'Actions taken or recommended' },
                    { name: 'Date of Failure', desc: 'When the failure occurred' },
                ] },
            { key: 'inspection_reports', label: 'Inspection Reports', fields: [
                    { name: 'Inspection ID', desc: 'Unique inspection reference' },
                    { name: 'Equipment Tag', desc: 'Inspected equipment identifier' },
                    { name: 'Inspection Type', desc: 'Visual / UT / RT / other NDT method' },
                    { name: 'Inspection Date', desc: 'Date the inspection was performed' },
                    { name: 'Findings', desc: 'Observed condition / defects' },
                    { name: 'Recommendation', desc: 'Recommended follow-up action' },
                    { name: 'Next Due Date', desc: 'Date the next inspection is due' },
                ] },
        ],
    },
    {
        category: 'Safety & Compliance Documents',
        types: [
            { key: 'hazop', label: 'HAZOP (Hazard and Operability Study)', fields: [
                    { name: 'Node', desc: 'Process section / node under study' },
                    { name: 'Guide Word', desc: 'HAZOP guide word (No, More, Less, etc.)' },
                    { name: 'Deviation', desc: 'Parameter deviation description' },
                    { name: 'Cause', desc: 'Possible cause of the deviation' },
                    { name: 'Consequence', desc: 'Resulting consequence' },
                    { name: 'Safeguard', desc: 'Existing safeguards / protections' },
                    { name: 'Recommendation', desc: 'Recommended action items' },
                    { name: 'Risk Ranking', desc: 'Severity / likelihood ranking' },
                ] },
            { key: 'jsa_jha', label: 'JSA / JHA (Job Safety / Hazard Analysis)', fields: [
                    { name: 'Job Title', desc: 'Name of the job or task' },
                    { name: 'Step', desc: 'Job step description' },
                    { name: 'Hazard', desc: 'Identified hazard for this step' },
                    { name: 'Risk Level', desc: 'Risk assessment (High / Medium / Low)' },
                    { name: 'Control Measure', desc: 'Mitigation / control action' },
                ] },
            { key: 'ptw', label: 'Permit to Work (PTW)', fields: [
                    { name: 'Permit Number', desc: 'Unique permit reference' },
                    { name: 'Permit Type', desc: 'Hot Work, Cold Work, Confined Space, etc.' },
                    { name: 'Location', desc: 'Work location / area' },
                    { name: 'Valid From', desc: 'Permit start date/time' },
                    { name: 'Valid To', desc: 'Permit expiry date/time' },
                    { name: 'Precautions', desc: 'Safety precautions required' },
                ] },
            { key: 'msds_sds', label: 'MSDS / SDS (Material Safety Data Sheet)', fields: [
                    { name: 'Product Name', desc: 'Chemical or product name' },
                    { name: 'CAS Number', desc: 'Chemical Abstracts Service number' },
                    { name: 'Hazard Classification', desc: 'GHS classification' },
                    { name: 'First Aid Measures', desc: 'Emergency first aid procedures' },
                    { name: 'Storage Conditions', desc: 'Safe storage requirements' },
                    { name: 'PPE Required', desc: 'Personal protective equipment' },
                ] },
            { key: 'incident_reports', label: 'Incident / Accident Reports', fields: [
                    { name: 'Incident ID', desc: 'Unique incident reference' },
                    { name: 'Date / Time', desc: 'When the incident occurred' },
                    { name: 'Location', desc: 'Where the incident occurred' },
                    { name: 'Description', desc: 'Incident description' },
                    { name: 'Injury / Damage', desc: 'Injuries or damage sustained' },
                    { name: 'Immediate Cause', desc: 'Direct cause' },
                    { name: 'Corrective Action', desc: 'Actions taken' },
                ] },
            { key: 'erp_plan', label: 'Emergency Response Plan (ERP)', fields: [
                    { name: 'Scenario', desc: 'Emergency scenario type' },
                    { name: 'Response Team', desc: 'Responsible personnel / roles' },
                    { name: 'Assembly Point', desc: 'Designated evacuation point' },
                    { name: 'Communication Plan', desc: 'Notification chain' },
                    { name: 'Equipment', desc: 'Emergency equipment / resources' },
                ] },
        ],
    },
    {
        category: 'Other Documents',
        types: [
            { key: 'other_files', label: 'Other Files', fields: [
                    { name: 'Document Title', desc: 'Title or short name of the file' },
                    { name: 'Description', desc: 'What this document contains' },
                ] },
        ],
    },
];
// 21 mandatory SAP tables (from sap_merging_impl.py)
export const MANDATORY_SAP_TABLES = [
    { name: 'AUFK', desc: 'Order Master Data', pipeline: 'workorder' },
    { name: 'AFKO', desc: 'Order Header Data', pipeline: 'workorder' },
    { name: 'AFVC', desc: 'Order Operations', pipeline: 'workorder' },
    { name: 'AFVV', desc: 'Operation Quantities/Dates', pipeline: 'workorder' },
    { name: 'QMEL', desc: 'Quality Notifications', pipeline: 'workorder' },
    { name: 'QMSM', desc: 'Notification Tasks', pipeline: 'workorder' },
    { name: 'JEST', desc: 'Object Status', pipeline: 'workorder' },
    { name: 'JSTO', desc: 'Status Objects', pipeline: 'workorder' },
    { name: 'RESB', desc: 'Reservation/Component List', pipeline: 'workorder' },
    { name: 'COEP', desc: 'CO Line Items (Costs)', pipeline: 'workorder' },
    { name: 'EQUI', desc: 'Equipment Master', pipeline: 'workorder' },
    { name: 'IFLOT', desc: 'Functional Location Data', pipeline: 'floc' },
    { name: 'ILOA', desc: 'PM Object Location/Account', pipeline: 'floc' },
    { name: 'STXH', desc: 'Long Text Headers', pipeline: 'workorder' },
    { name: 'STXL', desc: 'Long Text Lines', pipeline: 'workorder' },
    { name: 'PLKO', desc: 'Task List Header', pipeline: 'tasklist' },
    { name: 'PLPO', desc: 'Task List Operations', pipeline: 'tasklist' },
    { name: 'MAPL', desc: 'Task List – Material Assignment', pipeline: 'tasklist' },
    { name: 'MARA', desc: 'General Material Data', pipeline: 'material' },
    { name: 'MARC', desc: 'Plant Data for Material', pipeline: 'material' },
    { name: 'MARD', desc: 'Storage Location Data', pipeline: 'material' },
];
// SAP table column definitions (for join mapping)
export const SAP_TABLE_COLUMNS = {
    AUFK: ['AUFNR', 'AUART', 'EQUNR', 'TPLNR', 'OBJNR', 'KTEXT', 'ERDAT', 'ERNAM', 'GSTRP', 'GLTRP'],
    AFKO: ['AUFNR', 'AUFPL', 'GLTRP', 'GSTRP', 'DTEFN', 'PLNBEZ'],
    AFVC: ['AUFNR', 'AUFPL', 'APLZL', 'VORNR', 'LTXA1', 'ARBID', 'WERKS'],
    AFVV: ['AUFPL', 'APLZL', 'DAESSION', 'DAESSION_UNIT', 'DAUNO', 'DAUNO_MIN'],
    QMEL: ['QMNUM', 'AUFNR', 'QMART', 'QMTXT', 'ERDAT', 'ERNAM'],
    QMSM: ['QMNUM', 'MESSION', 'MNGRP', 'MNCOD', 'MATXT'],
    JEST: ['OBJNR', 'STAT', 'INACT', 'CHGNR'],
    JSTO: ['OBJNR', 'OBTYP', 'STSMA', 'CHGNR'],
    RESB: ['AUFNR', 'MATNR', 'BDMNG', 'MEINS', 'POSNR', 'WERKS'],
    COEP: ['AUFNR', 'OBJNR', 'KSTAR', 'WTG001', 'BEKNZ', 'BUZEI'],
    EQUI: ['EQUNR', 'EQKTX', 'TPLNR', 'EQART', 'HERST', 'TYPBZ', 'SERGE'],
    IFLOT: ['TPLNR', 'PLTXT', 'FLTYP', 'ILOAN', 'ERDAT', 'ERNAM'],
    ILOA: ['ILOAN', 'BUKRS', 'GSBER', 'KOSTL', 'KOKRS'],
    STXH: ['TDOBJECT', 'TDNAME', 'TDID', 'TDSPRAS'],
    STXL: ['TDNAME', 'TDLINE', 'TDFORMAT'],
    PLKO: ['PLNTY', 'PLNNR', 'PLNAL', 'LOEKZ', 'VERWE', 'WERKS'],
    PLPO: ['PLNNR', 'PLNKN', 'VORNR', 'LTXA1', 'ARBID'],
    MAPL: ['PLNNR', 'PLNAL', 'MATNR', 'WERKS'],
    MARA: ['MATNR', 'MTART', 'MBRSH', 'MATKL', 'MEINS', 'BSTME', 'GROES', 'NTGEW', 'GEWEI'],
    MARC: ['MATNR', 'WERKS', 'LADGR', 'MAABC', 'EKGRP', 'DISMM', 'DISPO', 'DISLS', 'BESKZ'],
    MARD: ['MATNR', 'WERKS', 'LGORT', 'LABST', 'UMLME', 'INSME', 'EINME', 'SPEME'],
    Notification_AIF: ['notif_aif_uid', 'plant_code', 'reporting_level', 'aif_id', 'region', 'psc', 'cluster', 'field', 'platform', 'notification_id', 'no_of_findings', 'wo_number', 'status', 'system_status', 'user_status', 'creation_date', 'plan_date', 'yep_date', 'closure_date', 'action_party', 'main_work_centre', 'functional_location', 'description', 'aif_source_group', 'aif_source', 'aif_initial_priority', 'aif_priority', 'aif_due_date', 'aif_extension_method', 'aif_extension_date', 'recommendation', 'equipment_ref', 'corrosion_mechanism', 'category_group', 'category', 'sce_fl', 'ta_list', 'ra_outcome', 'reported_by', 'content', 'equipment_id', 'source_system', 'source_record_id', 'confidence', 'updated_at', 'is_active'],
    Work_Order_GLOC: ['wo_gloc_uid', 'plant_code', 'report_date', 'notification_id', 'wo_number', 'severity', 'final_status', 'equipment_sap_tag', 'field', 'fault_code', 'findings', 'recommendation', 'action_party', 'equipment_ref', 'equipment_id', 'source_system', 'source_record_id', 'confidence', 'updated_at', 'is_active'],
    Condition_Monitoring: ['cmf_uid', 'plant_code', 'report_date', 'notification_id', 'wo_number', 'severity', 'final_status', 'equipment_sap_id', 'equipment_ref', 'functional_location', 'fault_code', 'finding_type', 'findings', 'recommendation', 'action_party', 'source_system', 'source_record_id', 'confidence', 'updated_at', 'is_active', 'equipment_id'],
    Integrity_Incident: ['incident_uid', 'plant_code', 'reference_no', 'incident_title', 'field_platform', 'location', 'incident_date', 'description', 'incident_classification', 'medium_classification', 'release_category', 'amount_of_leak_kg', 'rate_of_leak', 'equipment_type', 'component_type', 'corrosion_related', 'damage_mechanism', 'secondary_damage_mechanism', 'remarks', 'risk_factor', 'lopc_program', 'source_system', 'source_record_id', 'confidence', 'updated_at', 'is_active', 'equipment_id', 'region', 'month', 'year', 'valve_size'],
    UPD_Event: ['upd_uid', 'plant_code', 'month', 'field', 'category', 'remarks', 'primary_class', 'secondary_class', 'asome_code', 'volume', 'equipment_ref', 'source_system', 'source_record_id', 'confidence', 'updated_at', 'is_active', 'equipment_id'],
    Notification: ['notif_uid', 'plant_code', 'notification_id', 'notification_type', 'created_on', 'priority', 'equipment_ref', 'floc', 'symptom_text', 'failure_mode_code', 'failure_cause_code', 'failure_effect_code', 'source_system', 'source_record_id', 'confidence', 'updated_at', 'is_active', 'equipment_id'],
};

// SAP column → CDM display-name defaults (mirrors sap_merging_impl.py field map)
export const SAP_RENAME_TEMPLATE = {
    EQUNR: 'equipment_id', TPLNR: 'functional_location', AUFNR: 'wo_number', AUART: 'wo_type',
    EQTYP: 'equipment_type', EQKTX: 'description', PLTXT: 'functional_location_description',
    SWERK: 'area', HERST: 'manufacturer', TYPBZ: 'model', OBJNR: 'object_number',
    SERGE: 'serial_number', ILOAN: 'location_account_assignment', KTEXT: 'short_text',
    PRIOK: 'priority', ERDAT: 'created_on', ERNAM: 'created_by', GSTRP: 'basic_start',
    GLTRP: 'basic_finish', VORNR: 'operation_no', LTXA1: 'operation_text',
    ARBPL: 'work_center', STAT: 'status_code', INACT: 'status_inactive_flag',
    STSMA: 'status_profile', KOSTL: 'cost_center', INGPR: 'planner_group',
    BDMNG: 'required_qty', DMBTR: 'cost_amount', WERKS: 'plant_code',
    LGORT: 'storage_location', LABST: 'stock_qty', DISMM: 'mrp_type',
    MATNR: 'material_code', MTART: 'material_type', MEINS: 'base_uom',
    MAKTX: 'material_description', BUKRS: 'company_code', KOKRS: 'controlling_area',
    AUFPL: 'routing_number', APLZL: 'operation_counter', ARBID: 'work_center_object_id',
    QMNUM: 'notification_id', QMART: 'notification_type', QMTXT: 'notification_text',
    MNGRP: 'code_group', MNCOD: 'code', MATXT: 'material_text',
    OBTYP: 'object_type_sap', CHGNR: 'change_number', FLTYP: 'functional_location_type',
    PLNTY: 'task_list_type', PLNNR: 'task_list_id', PLNAL: 'task_list_counter',
    PLNKN: 'operation_node_number', LOEKZ: 'deletion_flag', VERWE: 'task_list_usage',
    POSNR: 'item_no', MBRSH: 'industry_sector', MATKL: 'material_group',
    BSTME: 'po_uom', GROES: 'size_dimension', BRGEW: 'gross_weight', NTGEW: 'net_weight',
    GEWEI: 'weight_unit', MAABC: 'abc_indicator', EKGRP: 'purchasing_group',
    DISPO: 'mrp_controller', BESKZ: 'procurement_type', AEDAT: 'changed_on',
    AENAM: 'changed_by', KSTAR: 'cost_element', WTG001: 'cost_amount_local',
    BEKNZ: 'debit_credit', BUZEI: 'line_item', GSBER: 'business_area',
    DAUNO: 'normal_duration', DAUNE: 'duration_uom', DAESSION: 'operation_duration',
    DTEFN: 'finish_date', PLNBEZ: 'material_assigned',
    STLNR: 'bom_id', IDNRK: 'bom_material_code',
    RSNUM: 'reservation_number', UMLME: 'stock_in_transfer', INSME: 'quality_inspection_stock',
    EINME: 'restricted_use_stock', SPEME: 'blocked_stock_returns',
    MANDT: 'client', INVNR: 'inventory_number', ANSDT: 'acquisition_date',
    ANSWT: 'acquisition_value', BAUJJ: 'construction_year', INBDT: 'startup_date',
    TDNAME: 'longtext_name', TDID: 'longtext_id', TDOBJECT: 'longtext_object',
    TDLINE: 'longtext_line', TDSPRAS: 'language_key', TDFORMAT: 'text_format',
    IWERK: 'planning_plant_code', WARPL: 'plan_id', FECOD: 'failure_code',
    DAUNO_MIN: 'operation_duration_min',
};

// ── SAP join template (commented out — kept for reference) ───────────────────
// Default SAP table joins matching sap_merging_impl.py merge steps. The SAP tab
// no longer seeds these (joins start empty and are added by the user / loaded
// from the backend). Uncomment + re-export, then re-seed `sapJoins` in
// AdminPanelContext, to restore the old pre-populated behaviour.
// export const DEFAULT_SAP_JOINS = [
//     { id: '1',  leftTable: 'AUFK', leftColumn: 'AUFNR', rightTable: 'AFKO',  rightColumn: 'AUFNR', pipeline: 'workorder', step: 'aufk_afko' },
//     { id: '2',  leftTable: 'AUFK', leftColumn: 'AUFNR', rightTable: 'AFVC',  rightColumn: 'AUFNR', pipeline: 'workorder', step: 'aufk_afvc' },
//     { id: '3',  leftTable: 'AFVC', leftColumn: 'AUFPL', rightTable: 'AFVV',  rightColumn: 'AUFPL', pipeline: 'workorder', step: 'afvc_afvv' },
//     { id: '4',  leftTable: 'WO',   leftColumn: 'AUFNR', rightTable: 'QMEL',  rightColumn: 'AUFNR', pipeline: 'workorder', step: 'wo_qmel' },
//     { id: '5',  leftTable: 'WO',   leftColumn: 'QMNUM', rightTable: 'QMSM',  rightColumn: 'QMNUM', pipeline: 'workorder', step: 'wo_qmsm' },
//     { id: '6',  leftTable: 'WO',   leftColumn: 'OBJNR', rightTable: 'JEST',  rightColumn: 'OBJNR', pipeline: 'workorder', step: 'wo_jest' },
//     { id: '7',  leftTable: 'WO',   leftColumn: 'OBJNR', rightTable: 'JSTO',  rightColumn: 'OBJNR', pipeline: 'workorder', step: 'wo_jsto' },
//     { id: '8',  leftTable: 'WO',   leftColumn: 'AUFNR', rightTable: 'RESB',  rightColumn: 'AUFNR', pipeline: 'workorder', step: 'wo_resb' },
//     { id: '9',  leftTable: 'WO',   leftColumn: 'AUFNR', rightTable: 'COEP',  rightColumn: 'AUFNR', pipeline: 'workorder', step: 'wo_coep' },
//     { id: '10', leftTable: 'WO',   leftColumn: 'EQUNR', rightTable: 'EQUI',  rightColumn: 'EQUNR', pipeline: 'workorder', step: 'wo_equi' },
//     { id: '11', leftTable: 'WO',   leftColumn: 'TPLNR', rightTable: 'IFLOT', rightColumn: 'TPLNR', pipeline: 'workorder', step: 'wo_iflot' },
//     { id: '12', leftTable: 'EQUI', leftColumn: 'TPLNR', rightTable: 'IFLOT', rightColumn: 'TPLNR', pipeline: 'floc',      step: 'equi_iflot' },
//     { id: '13', leftTable: 'EQUI', leftColumn: 'ILOAN', rightTable: 'ILOA',  rightColumn: 'ILOAN', pipeline: 'floc',      step: 'equi_iloa' },
//     { id: '14', leftTable: 'PLKO', leftColumn: 'PLNNR', rightTable: 'MAPL',  rightColumn: 'PLNNR', pipeline: 'tasklist',  step: 'plko_mapl' },
//     { id: '15', leftTable: 'PLKO', leftColumn: 'PLNNR', rightTable: 'PLPO',  rightColumn: 'PLNNR', pipeline: 'tasklist',  step: 'plko_plpo' },
//     { id: '16', leftTable: 'TL',   leftColumn: 'EQUNR', rightTable: 'EQUI',  rightColumn: 'EQUNR', pipeline: 'tasklist',  step: 'tl_equi' },
//     { id: '17', leftTable: 'MARA', leftColumn: 'MATNR', rightTable: 'MARC',  rightColumn: 'MATNR', pipeline: 'material',  step: 'mara_marc' },
//     { id: '18', leftTable: 'MARC', leftColumn: 'MATNR', rightTable: 'MARD',  rightColumn: 'MATNR', pipeline: 'material',  step: 'marc_mard' },
//     { id: '19', leftTable: 'MAT',  leftColumn: 'MATNR', rightTable: 'RESB',  rightColumn: 'MATNR', pipeline: 'material',  step: 'mat_resb' },
//     { id: '20', leftTable: 'MAT',  leftColumn: 'AUFNR', rightTable: 'COEP',  rightColumn: 'AUFNR', pipeline: 'material',  step: 'mat_coep' },
// ];
