'use client';
import { useState, useEffect } from 'react';
import { generateId } from '@/src/lib/utils';
import { useTsContext } from '@/src/components/admin/_queries/useDsiQueries';

export function useTsFormState({ selectedPlantId, view, pipelineStatuses, _persistReady }) {
    const [tsTab, setTsTab] = useState('device');
    const [tsDeviceMode, setTsDeviceMode] = useState('metadata');
    const [tsMetadataFiles, setTsMetadataFiles] = useState([]);
    const [tsValuesFiles, setTsValuesFiles] = useState([]);
    const [tsUploading, setTsUploading] = useState(false);
    const [tsUploadProgress, setTsUploadProgress] = useState([]);
    const [tsValidationErrors, setTsValidationErrors] = useState([]);
    const [tsCloudType, setTsCloudType] = useState('s3');
    const [tsCloudConfig, setTsCloudConfig] = useState({});
    const [tsHistorianType, setTsHistorianType] = useState('OSIsoft PI');
    const [tsHistorianConfig, setTsHistorianConfig] = useState({});
    const [tsRetention, setTsRetention] = useState({ value: '90', unit: 'days' });
    const [tsStep, setTsStep] = useState('config');
    const [tsData, setTsData] = useState([]);
    const [tsFileLabels, setTsFileLabels] = useState({});

    const validateTsMetadataFile = async (file) => {
        // XLSX/XLS are binary formats — cannot be validated as text; skip column check.
        if (/\.(xlsx|xls)$/i.test(file.name)) return [];
        const errors = [];
        try {
            const text = await file.slice(0, 8192).text();
            const lines = text.split('\n');
            if (lines.length < 2) { errors.push('File appears to be empty or has only headers'); return errors; }
            const columns = lines[0].toLowerCase().split(/[,\t;|]/).map(c => c.trim());
            if (!columns.some(c => /tag.?name|tag.?id|tag_name|tagname|^tag$/i.test(c)))
                errors.push('Missing tag name column (e.g., tag_name, tag_id, tag)');
            if (!columns.some(c => /desc|description|tag.?desc/i.test(c)))
                errors.push('Missing description column (e.g., description, tag_desc)');
            if (!columns.some(c => /range|limit|upper|lower|high|low|min|max|setpoint/i.test(c)))
                errors.push('Missing ranges/limits column (e.g., upper_limit, lower_limit, range, min, max)');
        } catch {
            // If the file can't be read (permissions, binary content), skip validation silently.
        }
        return errors;
    };

    const validateTsValuesFile = async (file) => {
        const errors = [];
        const text = await file.slice(0, 8192).text();
        const lines = text.split('\n');
        if (lines.length < 2) { errors.push('File appears to be empty or has only headers'); return errors; }
        const columns = lines[0].toLowerCase().split(/[,\t;|]/).map(c => c.trim());
        if (!columns.some(c => /timestamp|time|datetime|date_time|^date$/i.test(c)))
            errors.push('Missing timestamp column (e.g., timestamp, datetime, time)');
        if (!columns.some(c => /value|reading|measurement|^data$|^val$/i.test(c)))
            errors.push('Missing values column (e.g., value, reading, measurement)');
        return errors;
    };


    // `enabled` replaces the view/plant gate; the removed `tsData.length > 0`
    // check was a cache with no expiry — after committing, returning to this tab
    // showed pre-commit rows until a full remount. The commit mutation now
    // invalidates this key instead.
    const tsContextQuery = useTsContext(
        selectedPlantId?.id,
        { batchId: pipelineStatuses?.ts?.batchId },
        { enabled: view === 'ts-review' },
    );
    const tsDataLoading = tsContextQuery.isFetching;

    // Rows are EDITABLE, so they are seeded into state rather than derived.
    useEffect(() => {
        const data = tsContextQuery.data;
        if (data === undefined) return;
        if (!data?.rows?.length) { setTsData([]); return; }
        const hasUnnamed = Object.keys(data.rows[0]).some(c => c.startsWith('Unnamed'));
        if (hasUnnamed) { setTsData([]); return; }
        setTsData(data.rows.map(r => {
            const row = { _id: generateId() };
            Object.keys(r).forEach(k => { row[k] = r[k] != null ? String(r[k]) : ''; });
            return row;
        }));
    }, [tsContextQuery.data]);

    return {
        tsTab, setTsTab,
        tsDeviceMode, setTsDeviceMode,
        tsMetadataFiles, setTsMetadataFiles,
        tsValuesFiles, setTsValuesFiles,
        tsUploading, setTsUploading,
        tsUploadProgress, setTsUploadProgress,
        tsValidationErrors, setTsValidationErrors,
        tsCloudType, setTsCloudType,
        tsCloudConfig, setTsCloudConfig,
        tsHistorianType, setTsHistorianType,
        tsHistorianConfig, setTsHistorianConfig,
        tsRetention, setTsRetention,
        tsStep, setTsStep,
        tsData, setTsData,
        tsDataLoading,
        tsFileLabels, setTsFileLabels,
        validateTsMetadataFile, validateTsValuesFile,
    };
}
