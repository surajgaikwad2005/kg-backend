import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { parseCsvHeaders, loadExcelSheetHeaders, parseCsvConnections, parseExcelConnections } from '../_utils/fileParser';

export function useFileMapper({ isOpen, onSubmit }) {
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [equipmentCol, setEquipmentCol] = useState('');
    const [descCol, setDescCol] = useState('');
    const [modalMode, setModalMode] = useState('components');
    const [sourceCol, setSourceCol] = useState('');
    const [targetCol, setTargetCol] = useState('');
    const [labelCol, setLabelCol] = useState('');
    const [sheets, setSheets] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [error, setError] = useState(null);
    const workbookRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFile(null); setHeaders([]); setEquipmentCol(''); setDescCol('');
            setSourceCol(''); setTargetCol(''); setLabelCol('');
            setModalMode('components'); setError(null); setSheets([]);
            setSelectedSheet(''); workbookRef.current = null;
        }
    }, [isOpen]);

    const handleSheetChange = (sheetName) => {
        setSelectedSheet(sheetName); 
        setError(null);
        if (workbookRef.current) {
            try {
                const fileHeaders = loadExcelSheetHeaders(workbookRef.current, sheetName);
                if (fileHeaders.length > 0) {
                    setHeaders(fileHeaders);
                    setEquipmentCol(''); setDescCol(''); setSourceCol(''); setTargetCol(''); setLabelCol('');
                } else {
                    setHeaders([]); 
                    setError(`The sheet "${sheetName}" appears to be empty.`);
                }
            } catch (err) {
                setError(`Failed to read sheet headers: ${err.message}`);
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile); setError(null); setHeaders([]); setEquipmentCol(''); setDescCol('');
        setSourceCol(''); setTargetCol(''); setLabelCol(''); setSheets([]); setSelectedSheet('');
        workbookRef.current = null;

        const isCsv = selectedFile.name.toLowerCase().endsWith('.csv');
        const isExcel = selectedFile.name.toLowerCase().match(/\.(xlsx|xls)$/);

        if (isCsv) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const text = evt.target?.result || '';
                const fileHeaders = parseCsvHeaders(text);
                if (fileHeaders.length > 0) { setHeaders(fileHeaders); }
                else { setError('Could not read columns from the CSV file.'); }
            };
            reader.readAsText(selectedFile);
        } else if (isExcel) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const workbook = XLSX.read(bstr, { type: 'binary' });
                    workbookRef.current = workbook;
                    const sheetNames = workbook.SheetNames;
                    setSheets(sheetNames);
                    if (sheetNames.length > 0) {
                        const defaultSheet = sheetNames[0];
                        setSelectedSheet(defaultSheet);
                        const fileHeaders = loadExcelSheetHeaders(workbook, defaultSheet);
                        if (fileHeaders.length > 0) {
                            setHeaders(fileHeaders);
                        } else {
                            setError('The default sheet appears to be empty.');
                        }
                    } else { setError('The excel file does not contain any sheets.'); }
                } catch (err) { setError(`Excel Parse Error: ${err.message}`); }
            };
            reader.readAsBinaryString(selectedFile);
        } else {
            setError('Unsupported file type. Please upload a .csv or .xlsx file.');
        }
    };

    const handleProcess = () => {
        if (!file) { setError('Please upload a file first.'); return; }
        if (modalMode === 'components') {
            if (!equipmentCol) { setError('Please map the Equipment Name column.'); return; }
            onSubmit(file, equipmentCol, descCol || null, null, 'components', undefined, selectedSheet || null);
        } else {
            if (!sourceCol || !targetCol) { setError('Please map both Source (From) and Target (To) columns.'); return; }
            const isCsv = file.name.toLowerCase().endsWith('.csv');
            const isExcel = file.name.toLowerCase().match(/\.(xlsx|xls)$/);
            
            if (isCsv) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const text = evt.target?.result || '';
                    const connections = parseCsvConnections(text, sourceCol, targetCol, labelCol);
                    if (connections.length === 0) { setError('No valid connections found in the mapped columns.'); return; }
                    onSubmit(file, sourceCol, targetCol, labelCol || null, 'connections', connections, null);
                };
                reader.readAsText(file);
            } else if (isExcel && workbookRef.current) {
                try {
                    const wsname = selectedSheet || workbookRef.current.SheetNames[0];
                    const connections = parseExcelConnections(workbookRef.current, wsname, sourceCol, targetCol, labelCol);
                    if (connections.length === 0) { setError('No valid connections found in the mapped columns.'); return; }
                    onSubmit(file, sourceCol, targetCol, labelCol || null, 'connections', connections, wsname);
                } catch (err) { setError(`Excel Parse Error: ${err.message}`); }
            } else { setError('Unsupported file format.'); }
        }
    };

    return {
        file, setFile,
        headers,
        equipmentCol, setEquipmentCol,
        descCol, setDescCol,
        modalMode, setModalMode,
        sourceCol, setSourceCol,
        targetCol, setTargetCol,
        labelCol, setLabelCol,
        sheets, selectedSheet,
        error, setError,
        handleSheetChange, handleFileChange, handleProcess
    };
}
