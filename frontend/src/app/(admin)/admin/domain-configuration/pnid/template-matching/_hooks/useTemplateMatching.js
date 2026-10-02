'use client';

/**
 * useTemplateMatching — data + matching actions for the Template Matching console:
 * loads preprocessed drawings + the saved symbol library, drives template/upload
 * selection and tag config, runs the matcher, supports manual marking, and
 * focuses the viewer on a selected match. Persists the library + exports Excel.
 *
 * Reactive to plantCode changing (the global Plant Selector can change
 * without a page navigation).
 */
import { useState, useEffect, useCallback } from 'react';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { useClientFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspace';
import { useTemplateLibrary } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_queries/usePnidValidate';
import { reconstructDrawings, cleanPdfName, baseName, pagePath } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_lib/utils';

export function useTemplateMatching(ctx) {
    const {
        plantCode,
        activeDrawing, setActiveDrawing, savedCropBox3x, setSavedCropBox3x,
        libraryMatches, setLibraryMatches, selectedTab, setSelectedTab, setActiveMatchHighlight,
        canvasRef, imageObj, focusOnMatch, resetView,
    } = ctx;

    const [preprocessedFiles, setPreprocessedFiles] = useState([]);

    const [templateSource, setTemplateSource] = useState('crop');
    const [selectedFileOption, setSelectedFileOption] = useState('');
    const [selectedPageNo, setSelectedPageNo] = useState(1);
    const [availablePages, setAvailablePages] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);

    const [threshold, setThreshold] = useState(0.8);
    const [searchScope, setSearchScope] = useState('all');
    const [symbolCategory, setSymbolCategory] = useState('');
    const [tagExample, setTagExample] = useState('');
    const [tagRegex, setTagRegex] = useState('');
    const [isRegexManuallyEdited, setIsRegexManuallyEdited] = useState(false);
    const [selectedSavedTemplateCategory, setSelectedSavedTemplateCategory] = useState(null);

    const [isMatchingLoading, setIsMatchingLoading] = useState(false);
    const [matchResponse, setMatchResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [sidebarTab, setSidebarTab] = useState('setup');

    // ── Initial load ─────────────────────────────────────────────────────────
    // Both reads are shared cache entries now. getClientFiles in particular was
    // ALSO fetched by DomainConfigContext, so this screen used to issue the same
    // request twice; one key means one request.
    const clientFilesQuery = useClientFiles(plantCode);
    const templateLibraryQuery = useTemplateLibrary(plantCode);
    const isLoading = clientFilesQuery.isLoading;

    // Seed the symbol library tabs from the query.
    useEffect(() => {
        const data = templateLibraryQuery.data;
        if (!data || Object.keys(data).length === 0) return;
        setLibraryMatches((prev) => ({ ...prev, ...data }));
        setSelectedTab((prev) => prev || Object.keys(data)[0]);
    }, [templateLibraryQuery.data, setLibraryMatches, setSelectedTab]);

    // Seed the drawing selection from the file list. Kept as an effect because
    // it initialises USER-SELECTABLE state (active drawing / page) that must
    // survive subsequent renders.
    useEffect(() => {
        const plant = plantCode;
        const data = clientFilesQuery.data;
        if (!plant || !data) return;
        {
            if (data?.preprocessed) {
                const processed = reconstructDrawings(data.preprocessed, plant);
                setPreprocessedFiles(processed);
                if (processed.length > 0) {
                    const first = processed[0];
                    setSelectedFileOption(first.pdf);
                    setAvailablePages(first.images);
                    setSelectedPageNo(1);
                    setActiveDrawing({
                        pdf: first.pdf, doc_type: first.doc_type, page_name: first.images[0] || '', page_no: 1,
                        path: first.images.length ? pagePath(plant, first.doc_type, first.pdf, first.images[0]) : '',
                    });
                }
            }
        }
    }, [plantCode, clientFilesQuery.data, setActiveDrawing]);

    // A real failure is now visible instead of being swallowed into an empty list.
    useEffect(() => {
        if (clientFilesQuery.isError) setErrorMessage('Could not load preprocessed drawings.');
    }, [clientFilesQuery.isError]);

    // ── Selection ──────────────────────────────────────────────────────────────
    const loadDrawing = (file, pageNo) => {
        const pageImg = file.images[pageNo - 1] || '';
        setActiveDrawing({ pdf: file.pdf, doc_type: file.doc_type, page_name: pageImg, page_no: pageNo, path: pageImg ? pagePath(plantCode, file.doc_type, file.pdf, pageImg) : '' });
    };

    const handleFileChange = (pdfName) => {
        const file = preprocessedFiles.find((f) => f.pdf === pdfName);
        if (!file) return;
        setSelectedFileOption(pdfName);
        setAvailablePages(file.images);
        setSelectedPageNo(1);
        setSavedCropBox3x(null);
        loadDrawing(file, 1);
    };

    const handlePageChange = (pageIdxStr) => {
        const pageIdx = parseInt(pageIdxStr, 10);
        const file = preprocessedFiles.find((f) => f.pdf === selectedFileOption);
        if (file && pageIdx > 0 && pageIdx <= file.images.length) {
            setSelectedPageNo(pageIdx);
            setSavedCropBox3x(null);
            loadDrawing(file, pageIdx);
        }
    };

    const handleUploadFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile(file);
        setUploadedFileUrl(URL.createObjectURL(file));
        setSavedCropBox3x(null);
        setSelectedSavedTemplateCategory(null);
    };

    const handleCropCommitted = useCallback(() => {
        setSelectedSavedTemplateCategory(null);
        setSuccessMessage('Symbol cropped successfully! Ready to match.');
        setErrorMessage(null);
    }, []);

    // ── Run match ──────────────────────────────────────────────────────────────
    const handleRunTemplateMatch = async () => {
        if (!plantCode) return;
        setErrorMessage(null);
        setSuccessMessage(null);

        const usingSaved = !!selectedSavedTemplateCategory;
        if (!usingSaved) {
            if (templateSource === 'crop' && !savedCropBox3x) { setErrorMessage('Please select and crop a symbol from the drawing first.'); return; }
            if (templateSource === 'upload' && !uploadedFile) { setErrorMessage('Please upload a template image file first.'); return; }
        }

        setIsMatchingLoading(true);
        try {
            const form = new FormData();
            form.append('threshold', threshold.toString());
            if (usingSaved) {
                form.append('saved_template_category', selectedSavedTemplateCategory);
            } else if (templateSource === 'crop' && savedCropBox3x && activeDrawing) {
                form.append('crop_page_name', activeDrawing.page_name);
                form.append('crop_pdf_name', baseName(activeDrawing.pdf));
                form.append('crop_doc_type', activeDrawing.doc_type);
                form.append('crop_box_json', JSON.stringify(savedCropBox3x));
            } else if (templateSource === 'upload' && uploadedFile) {
                form.append('template_file', uploadedFile);
            }
            form.append('symbol_category', symbolCategory);
            if (tagRegex?.trim()) form.append('tag_regex', tagRegex.trim());
            if (searchScope === 'current' && activeDrawing) {
                form.append('search_files_json', JSON.stringify([{ pdf: activeDrawing.pdf, doc_type: activeDrawing.doc_type }]));
            }

            const data = await pnidService.runTemplateMatch(plantCode, form);
            setMatchResponse(data);
            if (data.library) setLibraryMatches(data.library);
            setSelectedTab(symbolCategory);
            setSidebarTab('results');
            setSuccessMessage(`Search complete! Found ${data.matches_count} matching instances.`);
        } catch (err) {
            setErrorMessage(err?.data?.detail ?? 'Failed to execute template matching.');
        } finally {
            setIsMatchingLoading(false);
        }
    };

    // ── Manual mark ──────────────────────────────────────────────────────────────
    const handleCreateManualMatch = async (bbox3x, bbox1x) => {
        if (!plantCode || !activeDrawing) return;
        const activeCategory = selectedTab || symbolCategory;
        if (!activeCategory) { setErrorMessage('Select a category tab or enter a category name before manually marking.'); return; }

        setIsMatchingLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const cleanActivePdf = cleanPdfName(activeDrawing.pdf);
            const res = await pnidService.extractTextByBox(plantCode, {
                pdfFilename: cleanActivePdf, pageNo: activeDrawing.page_no, bboxJson: JSON.stringify(bbox1x),
            });
            const extractedText = res?.text || '';
            const newMatch = {
                pdf: cleanActivePdf, pdf_name: baseName(cleanActivePdf), doc_type: activeDrawing.doc_type,
                page_name: activeDrawing.page_name, page_no: activeDrawing.page_no,
                bbox_3x: bbox3x, bbox_1x: bbox1x, score: 1.0, rotation: 0, extracted_text: extractedText,
            };
            const updated = { ...libraryMatches, [activeCategory]: [newMatch, ...(libraryMatches[activeCategory] || [])] };
            await pnidService.saveTemplateMatchLibrary(plantCode, updated);
            setLibraryMatches(updated);
            setSelectedTab(activeCategory);
            setSuccessMessage(`Successfully manually marked symbol with text "${extractedText}"!`);
            setActiveMatchHighlight(newMatch);
        } catch (err) {
            setErrorMessage(err?.data?.detail ?? 'Failed to extract text or save manual match.');
        } finally {
            setIsMatchingLoading(false);
        }
    };

    // ── Select match → focus viewer ────────────────────────────────────────────
    const handleSelectMatch = (match) => {
        setActiveMatchHighlight(match);
        const cleanMatchPdf = cleanPdfName(match.pdf);
        const isSamePage = activeDrawing && cleanPdfName(activeDrawing.pdf) === cleanMatchPdf && activeDrawing.page_no === match.page_no;
        if (!isSamePage) {
            setActiveDrawing({ pdf: cleanMatchPdf, doc_type: match.doc_type, page_name: match.page_name, page_no: match.page_no, path: pagePath(plantCode, match.doc_type, cleanMatchPdf, match.page_name) });
            setSelectedFileOption(cleanMatchPdf);
            setSelectedPageNo(match.page_no);
            const file = preprocessedFiles.find((f) => cleanPdfName(f.pdf) === cleanMatchPdf);
            if (file) setAvailablePages(file.images);
        }
        focusOnMatch(match);
    };

    const handleDownloadExcel = () => {
        if (!plantCode) return;
        const link = document.createElement('a');
        link.href = pnidService.exportTemplateMatchesUrl(plantCode);
        link.setAttribute('download', `${plantCode}_template_matches.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    };

    const selectSavedTemplate = (catName) => {
        setSelectedSavedTemplateCategory(catName);
        setSymbolCategory(catName);
        setSelectedTab(catName);
        setSavedCropBox3x(null);
    };

    const resetTemplateSource = (source) => {
        setTemplateSource(source);
        setSavedCropBox3x(null);
        setSelectedSavedTemplateCategory(null);
    };

    return {
        plantCode, preprocessedFiles, isLoading,
        templateSource, resetTemplateSource, selectedFileOption, selectedPageNo, availablePages,
        uploadedFile, uploadedFileUrl, handleUploadFileChange,
        threshold, setThreshold, searchScope, setSearchScope,
        symbolCategory, setSymbolCategory, tagExample, setTagExample, tagRegex, setTagRegex,
        isRegexManuallyEdited, setIsRegexManuallyEdited, selectedSavedTemplateCategory, selectSavedTemplate,
        isMatchingLoading, matchResponse, errorMessage, setErrorMessage, successMessage, setSuccessMessage,
        sidebarTab, setSidebarTab, savedCropBox3x,
        handleFileChange, handlePageChange, handleRunTemplateMatch, handleCreateManualMatch, handleSelectMatch,
        handleDownloadExcel, handleCropCommitted,
    };
}
