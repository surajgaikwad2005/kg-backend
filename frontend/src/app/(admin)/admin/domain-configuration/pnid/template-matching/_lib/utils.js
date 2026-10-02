/** Template Matching — pure helpers (regex generation + drawing reconstruction). */

/** Normalize a PDF filename (strip stray space before extension). */
export const cleanPdfName = (pdf) => (pdf || '').replace(/\s+\.pdf$/i, '.pdf').trim();

/** Strip the extension from a filename. */
export const baseName = (pdf) => (pdf || '').replace(/\.[^/.]+$/, '').trim();

/** Build a preprocessed page image path. */
export const pagePath = (plantCode, docType, pdf, pageImg) =>
    `${plantCode}/preprocess_files/${docType}/${baseName(pdf)}/${pageImg}`;

/** Path of the OCR results workbook for a drawing. */
export const ocrExcelPath = (plantCode, docType, pdf) =>
    `${plantCode}/preprocess_files/${docType}/${baseName(pdf)}/${baseName(pdf)}_ocr_results.xlsx`;

/**
 * Reconstruct the grouped drawings list from the flat list of preprocessed page
 * images on disk. Path schema: plantCode/preprocess_files/doc_type/pdfDir/page_X.png
 */
export function reconstructDrawings(rawFiles, plantCode) {
    const map = {};
    rawFiles.forEach((file) => {
        if (!file.is_image) return;
        const parts = file.path.replace(/\\/g, '/').split('/');
        if (parts.length < 5) return;
        const docType = parts[parts.length - 3];
        const pdfDir = parts[parts.length - 2];
        const pageImageName = parts[parts.length - 1];
        const pdfFilename = `${pdfDir}.pdf`;
        if (!map[pdfFilename]) map[pdfFilename] = { doc_type: docType, pdf: pdfFilename, images: [] };
        map[pdfFilename].images.push(pageImageName);
    });

    return Object.values(map).map((drawing) => {
        drawing.images.sort((a, b) => (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0));
        return {
            doc_type: drawing.doc_type,
            pdf: drawing.pdf,
            images: drawing.images,
            ocr_excel: ocrExcelPath(plantCode, drawing.doc_type, drawing.pdf),
        };
    });
}

/** Auto-generate a tag regex from an example like "PT 123" / "FT-301A". */
export function generateTagRegex(example) {
    const clean = example.trim();
    const m = clean.match(/^([A-Za-z]+)([-\s._/]?)(\d+)([A-Za-z]?)$/);
    if (m) {
        const [, prefix, , , suffix] = m;
        return `${prefix}[-\\s.]?\\d+${suffix ? '[A-Za-z]?' : ''}`;
    }
    const mLetters = clean.match(/^([A-Za-z]{1,6})$/);
    if (mLetters) return `${mLetters[1]}[-\\s.]?\\d*`;
    return clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Example strings the generated pattern would match (for the preview chips). */
export function generateExampleMatches(example) {
    const clean = example.trim();
    const m = clean.match(/^([A-Za-z]+)([-\s._/]?)(\d+)([A-Za-z]?)$/);
    if (!m) return clean ? [clean] : [];
    const [, prefix, , num, suffix] = m;
    const s = suffix || '';
    const next = String(parseInt(num, 10) + 1).padStart(num.length, '0');
    const next50 = String(parseInt(num, 10) + 50).padStart(num.length, '0');
    return [`${prefix}-${num}${s}`, `${prefix} ${num}${s}`, `${prefix}${num}${s}`, `${prefix}-${next}${s}`, `${prefix}-${next50}${s}`];
}

/** True if two matches refer to the same box on the same drawing. */
export function isSameMatch(a, b) {
    if (!a || !b) return false;
    return a.bbox_3x[0] === b.bbox_3x[0] && a.bbox_3x[1] === b.bbox_3x[1] && cleanPdfName(a.pdf) === cleanPdfName(b.pdf);
}
