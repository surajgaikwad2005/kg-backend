'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { DRAFT_SESSION_ID, INITIAL_GREETING } from '../plant-gpt.types';
import { ChatSplash } from './ChatSplash';
import { ChatInput } from './ChatInput';
import { MessageBubble, useCopy } from './MessageBubble';

export function ChatWindow({
    currentSession, inputValue, isThinking,
    isComposerMenuOpen, selectedFiles, isWebSearchEnabled,
    isRecording, interimTranscript,
    messagesEndRef, fileInputRef, isDark,
    onInputChange, onSend, onKeyDown, onComposerMenuToggle,
    onFileSelect, onRemoveFile, onWebSearchToggle, onRecordToggle,
    onQuestionClick, onRetry, onFeedback,
}) {
    const { copiedId, copy } = useCopy();
    const [retryState, setRetryState] = useState(null); // { botMsgId, text }

    const activeSession = currentSession || {
        id: DRAFT_SESSION_ID,
        title: 'New Discussion',
        messages: [INITIAL_GREETING('Operator')],
        lastUpdated: new Date().toISOString(),
    };
    const messages = activeSession.messages;
    const isInitialState = !currentSession || (messages.length === 1 && messages[0].sender === 'bot');

    useEffect(() => { if (isThinking) setRetryState(null); }, [isThinking]);

    const getPrecedingUserText = (filteredIdx) => {
        const fullIdx = filteredIdx + 1; // offset by 1 for the greeting at [0]
        for (let i = fullIdx - 1; i >= 0; i--) {
            if (messages[i].sender === 'user') return messages[i].text;
        }
        return '';
    };

    const openRetry = (botMsgId, filteredIdx) => {
        setRetryState({ botMsgId, text: getPrecedingUserText(filteredIdx) });
    };

    const submitRetry = async (botMsgId, newText) => {
        setRetryState(null);
        await onRetry(botMsgId, newText);
    };

    const cancelRetry = () => setRetryState(null);

    return (
        <main className="flex-1 flex flex-col bg-canvas overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto px-4 plant-scrollbar">
                <div className="max-w-[760px] mx-auto w-full flex flex-col pb-12 min-h-full">

                    <AnimatePresence mode="wait">
                        {isInitialState ? (
                            <ChatSplash greeting={messages[0].text} onQuestionClick={onQuestionClick} />
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col pt-5"
                            >
                                {messages.filter((_, i) => i > 0).map((msg, idx) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.28 }}
                                        className={`group ${idx === 0 ? 'pt-1' : 'pt-5.5'}`}
                                    >
                                        <MessageBubble
                                            msg={msg}
                                            idx={idx}
                                            isDark={isDark}
                                            copiedId={copiedId}
                                            copy={copy}
                                            retryState={retryState}
                                            onFeedback={onFeedback}
                                            openRetry={openRetry}
                                            submitRetry={submitRetry}
                                            cancelRetry={cancelRetry}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Thinking indicator */}
                    <AnimatePresence>
                        {isThinking && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="flex items-start gap-3 pt-5.5"
                            >
                                <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border-2 border-brand bg-surface-2">
                                    <Image src="/images/Aivee.gif" alt="Thinking" width={32} height={32} className="object-contain" unoptimized />
                                </div>
                                <div className="bg-surface border border-border py-3.5 px-4.5 rounded-tl-md rounded-tr-2xl rounded-br-2xl rounded-bl-2xl flex items-center gap-3 shadow-panel">
                                    <span className="text-xs font-extrabold uppercase tracking-wide text-text-subtle">
                                        Analyzing Platform Data
                                    </span>
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.16, ease: 'easeInOut' }}
                                                className="w-1.5 h-1.5 rounded-full bg-brand"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} className="h-px" />
                </div>
            </div>

            <ChatInput
                inputValue={inputValue}
                isThinking={isThinking}
                isComposerMenuOpen={isComposerMenuOpen}
                selectedFiles={selectedFiles}
                isWebSearchEnabled={isWebSearchEnabled}
                isRecording={isRecording}
                interimTranscript={interimTranscript}
                fileInputRef={fileInputRef}
                onInputChange={onInputChange}
                onSend={onSend}
                onKeyDown={onKeyDown}
                onComposerMenuToggle={onComposerMenuToggle}
                onFileSelect={onFileSelect}
                onRemoveFile={onRemoveFile}
                onWebSearchToggle={onWebSearchToggle}
                onRecordToggle={onRecordToggle}
            />
        </main>
    );
}
