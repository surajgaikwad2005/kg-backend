'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, X, FileText, Paperclip, Globe, Mic, MicOff } from 'lucide-react';

function MenuBtn({ icon, iconBg, iconColor, label, sublabel, badge, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.25 rounded-lg border-none cursor-pointer text-left bg-transparent transition-colors duration-[var(--duration-fast,150ms)] hover:bg-surface-2"
        >
            <div className={`w-7.5 h-7.5 rounded-lg shrink-0 flex items-center justify-center ${iconBg} ${iconColor}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="m-0 text-xs font-semibold text-text-secondary">{label}</p>
                {sublabel && <p className="m-0 text-xs text-text-subtle">{sublabel}</p>}
            </div>
            {badge && <div className="w-1.75 h-1.75 rounded-full bg-success shrink-0" />}
        </button>
    );
}

/** PlantGPT's composer: file previews, live recording indicator, attach menu, input, mic, send. */
export function ChatInput({
    inputValue, isThinking, isComposerMenuOpen, selectedFiles, isWebSearchEnabled,
    isRecording, interimTranscript, fileInputRef,
    onInputChange, onSend, onKeyDown, onComposerMenuToggle,
    onFileSelect, onRemoveFile, onWebSearchToggle, onRecordToggle,
}) {
    const isDisabled = (!inputValue.trim() && selectedFiles.length === 0) || isThinking;
    const isListening = isRecording;

    return (
        <div className="py-2.5 px-4 pb-4.5 bg-surface border-t border-border shrink-0">
            <input type="file" ref={fileInputRef} multiple className="hidden" onChange={onFileSelect} />
            <div className="max-w-[760px] mx-auto">

                {/* File previews */}
                <AnimatePresence>
                    {selectedFiles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="flex flex-wrap gap-2 mb-2 p-2.5 rounded-2xl bg-surface-2 border border-border"
                        >
                            {selectedFiles.map(file => (
                                <div key={file.id} className="group relative">
                                    {file.preview
                                        ? <img src={file.preview} className="w-13.5 h-13.5 object-cover rounded-lg border border-border-strong" alt="preview" />
                                        : (
                                            <div className="w-13.5 h-13.5 rounded-lg border border-border-strong bg-surface flex flex-col items-center justify-center gap-1">
                                                <FileText className="w-4.5 h-4.5 text-text-subtle" />
                                                <span className="text-xs font-bold uppercase text-text-subtle">{file.file.name.split('.').pop()}</span>
                                            </div>
                                        )}
                                    <button
                                        type="button"
                                        onClick={() => onRemoveFile(file.id)}
                                        aria-label={`Remove ${file.file.name}`}
                                        className="hidden group-hover:flex absolute -top-1.25 -right-1.25 w-4.25 h-4.25 items-center justify-center bg-danger text-white rounded-full border-none cursor-pointer"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording live indicator */}
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="flex items-center gap-2 mb-2 py-1.75 px-3 rounded-lg bg-danger/8 border border-danger/25"
                        >
                            <div className="flex gap-0.5 items-center">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ scaleY: [0.4, 1, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1, ease: 'easeInOut' }}
                                        className="w-0.75 h-4 bg-danger rounded-sm origin-center"
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-bold text-danger">Listening...</span>
                            {interimTranscript && (
                                <span className="text-xs text-text-muted italic truncate flex-1">
                                    {interimTranscript}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={onRecordToggle}
                                className="text-xs font-bold text-danger bg-danger/10 border border-danger/25 rounded-md py-0.75 px-2.25 cursor-pointer"
                            >
                                Stop
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input box */}
                <div className="bg-surface border border-border-strong rounded-2xl pt-1.25 pr-1.25 pb-1.25 pl-2 shadow-panel flex items-center gap-1.25">

                    {/* Attach menu */}
                    <div className="relative composer-container">
                        <button
                            type="button"
                            onClick={onComposerMenuToggle}
                            aria-label="Add attachments"
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer text-text-muted transition-colors duration-[var(--duration-fast,150ms)] hover:bg-surface-2"
                        >
                            <motion.div animate={{ rotate: isComposerMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                                <Plus className="w-4.75 h-4.75" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isComposerMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.94, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.94, y: 8 }}
                                    className="absolute bottom-full left-0 mb-2.5 w-55 bg-surface border border-border rounded-2xl shadow-modal p-1.5 z-50"
                                >
                                    <MenuBtn
                                        icon={<Paperclip className="w-3.5 h-3.5" />}
                                        iconBg="bg-brand-muted" iconColor="text-brand"
                                        label="Add photos & files"
                                        onClick={() => { fileInputRef.current?.click(); onComposerMenuToggle(); }}
                                    />
                                    <div className="h-px bg-surface-2 my-1" />
                                    <MenuBtn
                                        icon={<Globe className="w-3.5 h-3.5" />}
                                        iconBg="bg-success/15" iconColor="text-success"
                                        label="Web Search"
                                        sublabel={isWebSearchEnabled ? 'Enabled' : 'Search the internet'}
                                        badge={isWebSearchEnabled}
                                        onClick={() => { onWebSearchToggle(); onComposerMenuToggle(); }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Web badge */}
                    <AnimatePresence>
                        {isWebSearchEnabled && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: -6 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: -6 }}
                                className="flex items-center gap-1.25 bg-success/15 text-success py-1 px-2.5 rounded-full text-xs font-bold border border-success/30 shrink-0"
                            >
                                <Globe className="w-2.75 h-2.75" />
                                <span>Web</span>
                                <button type="button" onClick={onWebSearchToggle} aria-label="Disable web search" className="bg-transparent border-none cursor-pointer text-success flex items-center">
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text input */}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        aria-label="Ask PlantGPT"
                        placeholder={isListening ? 'Listening… speak now' : 'Ask PlantGPT about diagnostics, sensors, or failures...'}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-text-primary py-2.25 px-1.5 min-h-10.5"
                    />

                    {/* Mic button */}
                    <motion.button
                        type="button"
                        onClick={onRecordToggle}
                        whileTap={{ scale: 0.88 }}
                        title={isListening ? 'Stop recording' : 'Voice input (English only)'}
                        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer shrink-0 transition-all duration-[var(--duration-base,200ms)] ${
                            isListening ? 'bg-danger text-white ring-4 ring-danger/20' : 'bg-surface-2 text-text-muted'
                        }`}
                    >
                        <AnimatePresence mode="wait">
                            {isListening ? (
                                <motion.div key="stop" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
                                    <MicOff className="w-4 h-4" />
                                </motion.div>
                            ) : (
                                <motion.div key="mic" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
                                    <Mic className="w-4 h-4" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Send */}
                    <motion.button
                        type="button"
                        onClick={onSend}
                        disabled={isDisabled}
                        aria-label="Send message"
                        aria-busy={isThinking}
                        whileTap={{ scale: isDisabled ? 1 : 0.92 }}
                        whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                        className={`w-10.5 h-10.5 rounded-xl flex items-center justify-center border-none text-white transition-colors duration-[var(--duration-base,200ms)] ${
                            isDisabled ? 'bg-surface-2 cursor-not-allowed' : 'bg-brand shadow-brand cursor-pointer'
                        }`}
                    >
                        <Send className="w-4.25 h-4.25" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
