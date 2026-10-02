'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';

export default function UploadExcelModal({ open, onClose, onUpload, isPending }) {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError(null);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        setError(null);
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
            setError('Please upload a valid Excel or CSV file.');
            setFile(null);
            return;
        }
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        try {
            await onUpload(file);
            setFile(null);
            setError(null);
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
        }
    };

    const removeFile = () => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Clean up state when modal closes
    React.useEffect(() => {
        if (!open) {
            setFile(null);
            setError(null);
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose} size="md" closeOnBackdrop={!isPending} className="overflow-hidden bg-surface-1 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="relative overflow-hidden flex items-center justify-between px-8 py-6 border-b border-border/40 bg-gradient-to-br from-surface to-brand/5">
                <div className="absolute inset-0 bg-brand/5 blur-3xl opacity-50 pointer-events-none" />
                <h2 className="relative z-10 text-lg font-black uppercase tracking-widest text-text-primary flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand to-brand-hover shadow-lg shadow-brand/20 flex items-center justify-center text-white ring-1 ring-white/20">
                        <Upload className="w-5 h-5" />
                    </div>
                    Upload File
                </h2>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="text-text-muted hover:text-danger hover:bg-danger/10 transition-colors rounded-full p-2 cursor-pointer"
                    disabled={isPending}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <ModalBody className="space-y-6 px-8 py-6">
                    <div className="space-y-4">
                        <p className="text-body-sm text-text-muted leading-relaxed max-w-[95%]">
                            Upload your Excel or CSV data file. The system will automatically parse and instantly populate your Knowledge Graph with entities and relationships.
                        </p>
                        
                        <div
                            className={`group relative w-full h-64 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-6 transition-all duration-300 overflow-hidden ${
                                dragActive 
                                    ? 'border-brand bg-brand/5 scale-[0.98] shadow-inner' 
                                    : 'border-border/60 bg-gradient-to-b from-canvas to-surface hover:border-brand/50 hover:bg-brand/[0.02] hover:shadow-lg hover:shadow-brand/5'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                onChange={handleChange}
                                disabled={isPending}
                            />
                            
                            {!file ? (
                                <div className="text-center pointer-events-none flex flex-col items-center gap-4 relative z-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-brand blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full" />
                                        <div className="relative w-20 h-20 rounded-full bg-surface shadow-xl shadow-black/5 border border-white/40 flex items-center justify-center ring-8 ring-canvas group-hover:scale-110 transition-transform duration-300">
                                            <Upload className="w-8 h-8 text-brand/70 group-hover:text-brand transition-colors duration-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-1 mt-2">
                                        <p className="text-lg font-black text-text-primary tracking-tight">
                                            Click or drag file to this area
                                        </p>
                                        <p className="text-sm text-text-muted font-bold tracking-wide">
                                            Supports <span className="text-text-primary bg-surface border border-border/50 px-1.5 py-0.5 rounded-md shadow-sm">.xlsx</span>, <span className="text-text-primary bg-surface border border-border/50 px-1.5 py-0.5 rounded-md shadow-sm">.xls</span>, and <span className="text-text-primary bg-surface border border-border/50 px-1.5 py-0.5 rounded-md shadow-sm">.csv</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center w-full flex flex-col items-center gap-5 z-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-success blur-2xl opacity-30 rounded-full animate-pulse" />
                                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-success/10 to-success/5 border border-success/30 flex items-center justify-center text-success ring-8 ring-canvas shadow-xl shadow-success/10">
                                            <FileSpreadsheet className="w-10 h-10 drop-shadow-md" />
                                        </div>
                                    </div>
                                    <div className="max-w-[90%] flex flex-col items-center gap-1.5 bg-surface/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-border/50 shadow-sm">
                                        <p className="text-base font-black text-text-primary truncate w-full tracking-tight text-center" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-text-muted font-extrabold tracking-widest uppercase bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    {!isPending && (
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="mt-1 px-4 py-2 rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white text-xs font-black tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:shadow-lg hover:shadow-danger/30 hover:-translate-y-0.5"
                                        >
                                            <X className="w-4 h-4" /> Remove File
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-danger/5 text-danger border border-danger/20 rounded-xl flex items-start gap-3 text-sm font-bold mt-4 shadow-inner">
                                <AlertCircle className="w-5 h-5 shrink-0 text-danger" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </ModalBody>

                <ModalFooter className="border-t border-border/40 bg-surface/50 px-8 py-5">
                    <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isPending} className="font-bold tracking-wider">
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary" 
                        size="md" 
                        isPending={isPending} 
                        disabled={!file}
                        className={`font-black tracking-widest uppercase shadow-xl transition-all duration-300 ${file ? 'shadow-brand/30 hover:shadow-brand/50 bg-gradient-to-r from-brand to-brand-hover hover:-translate-y-0.5' : ''}`}
                    >
                        Upload & Populate
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
