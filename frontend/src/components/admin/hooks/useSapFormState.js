'use client';
import { useState, useEffect } from 'react';
import { MANDATORY_SAP_TABLES } from '@/src/components/admin/admin.constants';
import { addSapTable } from '@/src/services/domain-configuration/common';
import * as cdm from '@/src/services/domain-configuration/common';
import { useSapContext } from '@/src/components/admin/_queries/useDsiQueries';

const MANDATORY_TABLE_NAMES = MANDATORY_SAP_TABLES.map(t => t.name);

export function useSapFormState({ selectedPlantId, view, pipelineStatuses, _persistReady }) {
    const [sapTab, setSapTab] = useState('device');
    const [sapStep, setSapStep] = useState('config');
    const [sapSourceType, setSapSourceType] = useState('');
    const [sapSourceConfig, setSapSourceConfig] = useState({});
    const [sapCloudType, setSapCloudType] = useState('s3');
    const [sapCloudConfig, setSapCloudConfig] = useState({});
    const [sapFiles, setSapFiles] = useState([]);
    const [sapJoins, setSapJoins] = useState([]);
    const [sapDetectedTables, setSapDetectedTables] = useState([]);
    const [sapExpandedTable, setSapExpandedTable] = useState(null);
    const [sapColumnMappings, setSapColumnMappings] = useState({});
    const [sapTables, setSapTables] = useState(
        MANDATORY_SAP_TABLES.map(t => ({ name: t.name, desc: t.desc, selected: true }))
    );
    const [allSapColumns, setAllSapColumns] = useState([]);
    const [visibleSapColumns, setVisibleSapColumns] = useState([]);
    const [selectedSapTable, setSelectedSapTable] = useState(null);
    const [sapData, setSapData] = useState([]);
    const [mappingData, setMappingData] = useState([]);
    const [sapTableStep, setSapTableStep] = useState(0);
    const [isAddSapTableModalOpen, setIsAddSapTableModalOpen] = useState(false);
    const [newSapTable, setNewSapTable] = useState({ name: '', desc: '', columns: [{ sap_field: '', canonical_name: '' }] });
    const [addTableError, setAddTableError] = useState('');
    const [addTableLoading, setAddTableLoading] = useState(false);
    // AIF / GLOC / LOPC device-upload staging — SAP-linked feeds that upload
    // with their own native connector value (connector='aif'|'gloc'|'lopc',
    // see ConfigModalSimpleUpload + useConfigModalActions.handleFeedSubmit).
    // Keyed by feed type so each feed's pending files stay independent.
    const [feedFiles, setFeedFiles] = useState({ AIF: [], GLOC: [], LOPC: [] });
    const [sapFileLabels, setSapFileLabels] = useState({});
    const [feedFileLabels, setFeedFileLabels] = useState({});

    const handleAddSapTable = async () => {
        setAddTableError('');
        const { name, desc, columns } = newSapTable;
        if (!name.trim()) { setAddTableError('Table name is required'); return; }
        if (columns.some(c => !c.sap_field.trim() || !c.canonical_name.trim())) {
            setAddTableError('All columns must have both SAP field and display name');
            return;
        }
        setAddTableLoading(true);
        try {
            await addSapTable({
                table_name: name.toUpperCase(),
                group: 'custom',
                label: desc || name,
                key_fields: ['MANDT'],
                columns: columns.map(c => ({ sap_field: c.sap_field.toUpperCase(), canonical_name: c.canonical_name })),
                source_key: `sap_custom_${name.toLowerCase()}`,
            }, selectedPlantId?.id);
            setSapTables(prev => [...prev, { name: name.toUpperCase(), desc: desc || name, selected: true }]);
            setIsAddSapTableModalOpen(false);
            setNewSapTable({ name: '', desc: '', columns: [{ sap_field: '', canonical_name: '' }] });
        } catch (e) {
            setAddTableError(e.message || 'Failed to add table');
        } finally {
            setAddTableLoading(false);
        }
    };


    // The current table is part of the key, so stepping back to a previously
    // viewed table is served from cache instead of refetched.
    const currentSapTable = sapTables.filter(t => t.selected)[sapTableStep];
    const sapContextQuery = useSapContext(
        selectedPlantId?.id,
        { table: currentSapTable?.name?.toLowerCase(), batchId: pipelineStatuses?.sap?.batchId },
        { enabled: view === 'sap-tables' },
    );
    const sapDataLoading = sapContextQuery.isFetching;

    useEffect(() => {
        const data = sapContextQuery.data;
        if (data === undefined) return;
        if (!data?.rows?.length) { setSapData([]); return; }
        setSapData(data.rows);
        const cols = data.columns || Object.keys(data.rows[0]);
        setAllSapColumns(cols);
        setVisibleSapColumns(cols.slice(0, 6));
    }, [sapContextQuery.data]);

    return {
        sapTab, setSapTab,
        sapStep, setSapStep,
        sapSourceType, setSapSourceType,
        sapSourceConfig, setSapSourceConfig,
        sapCloudType, setSapCloudType,
        sapCloudConfig, setSapCloudConfig,
        sapFiles, setSapFiles,
        sapJoins, setSapJoins,
        sapDetectedTables, setSapDetectedTables,
        sapExpandedTable, setSapExpandedTable,
        sapColumnMappings, setSapColumnMappings,
        sapTables, setSapTables,
        allSapColumns, setAllSapColumns,
        visibleSapColumns, setVisibleSapColumns,
        selectedSapTable, setSelectedSapTable,
        sapData, setSapData,
        sapDataLoading,
        mappingData, setMappingData,
        sapTableStep, setSapTableStep,
        isAddSapTableModalOpen, setIsAddSapTableModalOpen,
        newSapTable, setNewSapTable,
        addTableError, setAddTableError,
        addTableLoading, setAddTableLoading,
        handleAddSapTable,
        MANDATORY_TABLE_NAMES,
        feedFiles, setFeedFiles,
        sapFileLabels, setSapFileLabels,
        feedFileLabels, setFeedFileLabels,
    };
}
