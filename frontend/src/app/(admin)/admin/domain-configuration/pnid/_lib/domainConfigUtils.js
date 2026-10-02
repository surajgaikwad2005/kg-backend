/**
 * Domain Configuration shared helpers — resilient file extraction + formatting.
 * The backend's `uploads` field may arrive as a categorized object or a flat
 * array of file objects / path strings; these normalizers smooth that over.
 */

const fileFromString = (path) => ({
    name: path.substring(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1),
    path,
    size: 0,
    is_pdf: false,
    is_excel: false,
    is_image: false,
});

const normalize = (file) => (typeof file === 'string' ? fileFromString(file) : file);

/**
 * The upload buckets a clientFiles payload is grouped into.
 * Single source of truth — page.jsx (which decides whether the workspace has any
 * files) and the page-count prefetch (which decides which PDFs to read) must
 * agree, or adding a category makes the dashboard show files that never get
 * page counts.
 */
export const FILE_CATEGORY_KEYS = ['pnid', 'pfd', 'line_list', 'others'];

/** Shared extension predicate — previously copy-pasted across four files. */
export const isPdfFile = (name) => /\.pdf$/i.test(name ?? '');

/**
 * Extract a category's files from a clientFiles payload.
 * @param {object|null} clientFiles
 * @param {'pnid'|'pfd'|'line_list'|'others'} key
 * @returns {Array}
 */
export function getCategoryFiles(clientFiles, key) {
    if (!clientFiles || !clientFiles.uploads) return [];

    // Flat-array fallback: only "others" can be inferred.
    if (Array.isArray(clientFiles.uploads)) {
        return key === 'others' ? clientFiles.uploads.map(normalize) : [];
    }

    const data = clientFiles.uploads[key];
    return Array.isArray(data) ? data.map(normalize) : [];
}

/** Human-readable byte size. */
export function formatBytes(bytes, decimals = 2) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
