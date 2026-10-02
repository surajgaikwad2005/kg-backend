import * as XLSX from 'xlsx';

export function parseCsvHeaders(text) {
    const firstLine = text.split(/\r?\n/)[0] || '';
    return firstLine.split(',').map(h => h.replace(/^"|"$/g, '').trim()).filter(Boolean);
}

export function loadExcelSheetHeaders(workbook, sheetName) {
    const ws = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (data.length > 0) {
        return data[0].map(h => String(h || '').trim()).filter(Boolean);
    }
    return [];
}

export function parseCsvConnections(text, sourceCol, targetCol, labelCol) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    
    const headerLine = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    const srcIdx = headerLine.indexOf(sourceCol);
    const tgtIdx = headerLine.indexOf(targetCol);
    const lblIdx = labelCol ? headerLine.indexOf(labelCol) : -1;
    
    return lines.slice(1)
        .map(line => {
            const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
            return { 
                from: cols[srcIdx] || '', 
                to: cols[tgtIdx] || '', 
                label: lblIdx >= 0 ? (cols[lblIdx] || 'flow') : 'flow' 
            };
        })
        .filter(c => c.from && c.to);
}

export function parseExcelConnections(workbook, sheetName, sourceCol, targetCol, labelCol) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) return [];
    
    const rows = XLSX.utils.sheet_to_json(ws);
    return rows
        .map(row => ({ 
            from: String(row[sourceCol] || '').trim(), 
            to: String(row[targetCol] || '').trim(), 
            label: labelCol ? String(row[labelCol] || '').trim() : 'flow' 
        }))
        .filter(c => c.from && c.to);
}
