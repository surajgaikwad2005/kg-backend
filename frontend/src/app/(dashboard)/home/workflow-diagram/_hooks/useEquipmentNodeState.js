import { useState, useEffect } from 'react';

export const TRAIN_CONNECTIONS = {
    train_a: [
        { from: 'V-2410A', to: 'V-2420A', loop: '3000' },
        { from: 'V-2420A', to: 'V-2430A', loop: '3000' },
        { from: 'V-2420A', to: 'A-2402', loop: '3000' },
        { from: 'V-2420A', to: 'V-2430B', loop: '3000' },
        { from: 'V-2430B', to: 'V-2460A', loop: '3000' },
        { from: 'V-2430A', to: 'V-2440A', loop: '3000' },
    ],
    train_b: [
        { from: 'V-2410B', to: 'V-2420B', loop: '4000' },
        { from: 'V-2420B', to: 'V-2430B', loop: '4000' },
        { from: 'V-2420B', to: 'B-2402', loop: '4000' },
        { from: 'V-2430B', to: 'V-2460B', loop: '4000' },
        { from: 'V-2430B', to: 'V-2440B', loop: '4000' },
    ],
    reinjection_compressor_train_a: [
        { from: 'V-2470A', to: 'V-2420A', loop: '3200' },
        { from: 'V-2420A', to: 'E-2490A', loop: '3200' },
        { from: 'V-2420A', to: 'K-2480A', loop: '3200' },
    ],
    reinjection_compressor_train_b: [
        { from: 'V-2470B', to: 'V-2420B', loop: '2100' },
        { from: 'V-2420B', to: 'E-2490B', loop: '2100' },
        { from: 'V-2420B', to: 'K-2480B', loop: '2100' },
    ],
};

export function useEquipmentNodeState({ id, data, componentType, normalizedType, setNodes }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(data.label);
    const [showTable, setShowTable] = useState(false);
    const [localConnections, setLocalConnections] = useState([]);
    const [showCPCPColumn, setShowCPCPColumn] = useState(false);
    const [editingCell, setEditingCell] = useState(null);
    const [cellValue, setCellValue] = useState('');
    const [showCPCPDropdown, setShowCPCPDropdown] = useState(false);
    const [isNamingCustom, setIsNamingCustom] = useState(false);
    const [customCPCPName, setCustomCPCPName] = useState('');

    const foundTrainKey = Object.keys(TRAIN_CONNECTIONS).find(key => key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedType);
    const hasTrainConnections = !!(TRAIN_CONNECTIONS[componentType] || foundTrainKey);

    useEffect(() => {
        const cachedConns = localStorage.getItem(`connections_${normalizedType}`) || localStorage.getItem(`connections_${componentType}`);
        const cachedShow = localStorage.getItem(`show_cpcp_${normalizedType}`) || localStorage.getItem(`show_cpcp_${componentType}`);
        let initialData = data.customConnections;
        if (!initialData && cachedConns) {
            try { initialData = JSON.parse(cachedConns); } catch { /* ignore */ }
        }
        if (!initialData) initialData = foundTrainKey ? TRAIN_CONNECTIONS[foundTrainKey] : TRAIN_CONNECTIONS[componentType];
        const initialShow = !!(data.showCPCPColumn !== undefined ? data.showCPCPColumn : (cachedShow === 'true'));
        if (initialData && Array.isArray(initialData)) setLocalConnections(initialData);
        setShowCPCPColumn(initialShow);
    }, [componentType, normalizedType, foundTrainKey, data.customConnections, data.showCPCPColumn]);

    const saveLabel = () => {
        if (editValue.trim() !== '') {
            setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, label: editValue } } : node));
        }
        setIsEditing(false);
    };

    const onDelete = (e) => { 
        e.stopPropagation(); 
        setNodes((nds) => nds.filter((node) => node.id !== id)); 
    };

    const toggleTable = (e) => { 
        e.stopPropagation(); 
        setShowTable(!showTable); 
    };

    const saveCellEdit = () => {
        if (!editingCell) return;
        const newConns = [...localConnections];
        newConns[editingCell.rowIdx] = { ...newConns[editingCell.rowIdx], [editingCell.field]: cellValue };
        setLocalConnections(newConns);
        setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, customConnections: newConns } } : n));
        localStorage.setItem(`connections_${normalizedType}`, JSON.stringify(newConns));
        if (componentType && componentType !== normalizedType) localStorage.setItem(`connections_${componentType}`, JSON.stringify(newConns));
        setEditingCell(null);
    };

    const handleCellKeyDown = (e) => {
        if (e.key === 'Enter') saveCellEdit();
        if (e.key === 'Escape') setEditingCell(null);
    };

    const applyCPCPValue = (value) => {
        const newConns = localConnections.map(conn => ({ ...conn, cpcp: value }));
        setLocalConnections(newConns);
        setShowCPCPColumn(true);
        setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, customConnections: newConns, showCPCPColumn: true } } : n));
        localStorage.setItem(`connections_${normalizedType}`, JSON.stringify(newConns));
        if (componentType && componentType !== normalizedType) localStorage.setItem(`connections_${componentType}`, JSON.stringify(newConns));
        localStorage.setItem(`show_cpcp_${normalizedType}`, 'true');
        if (componentType && componentType !== normalizedType) localStorage.setItem(`show_cpcp_${componentType}`, 'true');
        setShowCPCPDropdown(false);
        setIsNamingCustom(false);
        setCustomCPCPName('');
    };

    return {
        isEditing, setIsEditing,
        editValue, setEditValue,
        showTable, setShowTable,
        localConnections, setLocalConnections,
        showCPCPColumn, setShowCPCPColumn,
        editingCell, setEditingCell,
        cellValue, setCellValue,
        showCPCPDropdown, setShowCPCPDropdown,
        isNamingCustom, setIsNamingCustom,
        customCPCPName, setCustomCPCPName,
        hasTrainConnections,
        saveLabel, onDelete, toggleTable,
        saveCellEdit, handleCellKeyDown, applyCPCPValue
    };
}
