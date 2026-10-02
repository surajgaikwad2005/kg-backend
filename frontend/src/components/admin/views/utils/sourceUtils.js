import { FileText, FileSpreadsheet, FileImage, FileCode, Database, File } from 'lucide-react';

export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Both args are coerced rather than defaulted: a default only fires for
// `undefined`, and these now also arrive as `null` from GET /flow/state, whose
// `content_type` is nullable (it was never null while every configured-source
// row was built client-side from a File object). Without this, a single file
// row with no content type threw "Cannot read properties of null (reading
// 'includes')" and took the whole Data Configuration screen down.
export function getFileVisual(name, mimeType) {
    const fileName = typeof name === 'string' ? name : '';
    const mime = typeof mimeType === 'string' ? mimeType : '';
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf' || mime.includes('pdf')) {
        return { Icon: FileText, iconCls: 'text-danger', bgCls: 'bg-danger/10 border border-danger/20', label: 'PDF' };
    }
    if (['csv', 'xlsx', 'xls', 'tsv'].includes(ext) || mime.includes('spreadsheet') || mime.includes('csv') || mime.includes('excel')) {
        return { Icon: FileSpreadsheet, iconCls: 'text-success', bgCls: 'bg-success/10 border border-success/20', label: ext.toUpperCase() || 'EXCEL' };
    }
    if (['png', 'jpg', 'jpeg', 'tiff', 'tif', 'svg', 'bmp', 'webp'].includes(ext) || mime.startsWith('image/')) {
        return { Icon: FileImage, iconCls: 'text-info', bgCls: 'bg-info/10 border border-info/20', label: ext.toUpperCase() || 'IMAGE' };
    }
    if (['json', 'xml', 'yaml', 'yml'].includes(ext)) {
        return { Icon: FileCode, iconCls: 'text-warning', bgCls: 'bg-warning/10 border border-warning/20', label: ext.toUpperCase() };
    }
    if (ext === 'parquet') {
        return { Icon: Database, iconCls: 'text-chart-5', bgCls: 'bg-chart-5/10 border border-chart-5/20', label: 'Parquet' };
    }
    return { Icon: File, iconCls: 'text-brand', bgCls: 'bg-brand/10 border border-brand/20', label: ext ? ext.toUpperCase() : 'FILE' };
}
