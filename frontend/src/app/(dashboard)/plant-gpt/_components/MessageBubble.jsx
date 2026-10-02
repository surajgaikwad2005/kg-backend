'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Copy, CheckCheck, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PlotRenderer } from './PlotRenderer';
import { RetryPanel } from './RetryPanel';
import { copyToClipboard } from '@/src/lib/utils';

export function useCopy() {
    const [copiedId, setCopiedId] = useState(null);
    const copy = (text, id) => {
        copyToClipboard(text).catch(() => {});
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return { copiedId, copy };
}

const ICONBTN_VARIANT = {
    neutral: 'text-text-subtle hover:bg-surface-2 hover:text-text-secondary',
    success: 'text-text-subtle hover:bg-success/10 hover:text-success',
    danger: 'text-text-subtle hover:bg-danger/10 hover:text-danger',
};
const ICONBTN_ACTIVE = {
    neutral: 'bg-surface-2 text-text-secondary',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
};

function IconBtn({ title, onClick, active, variant = 'neutral', children }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors duration-[var(--duration-fast,150ms)] ${
                active ? ICONBTN_ACTIVE[variant] : ICONBTN_VARIANT[variant]
            }`}
        >
            {children}
        </button>
    );
}

/** One user or bot bubble in the PlantGPT thread, with its hover action bar and retry panel. */
export function MessageBubble({
    msg, idx, isDark, copiedId, copy,
    retryState, onFeedback, openRetry, submitRetry, cancelRetry,
}) {
    if (msg.sender === 'user') {
        return (
            <div className="flex justify-end items-end gap-2.5">
                <div className="flex flex-col items-end max-w-[78%]">
                    <div className="bg-brand text-white py-2.5 px-4 rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-2xl text-sm leading-relaxed font-medium shadow-brand">
                        <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="flex gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast,180ms)]">
                        <IconBtn title="Copy message" onClick={() => copy(msg.text, `u-${msg.id}`)} variant="success" active={copiedId === `u-${msg.id}`}>
                            {copiedId === `u-${msg.id}` ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </IconBtn>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-brand shadow-brand">
                    <User className="w-3.5 h-3.5 text-white" />
                </div>
            </div>
        );
    }

    const isRetryOpen = retryState?.botMsgId === msg.id;

    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full shrink-0 mt-0.5 overflow-hidden border-2 border-brand bg-surface-2">
                <Image src="/images/Aivee_1.png" alt="PlantGPT" width={32} height={32} className="object-contain" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="bg-surface border border-border py-3.5 px-4.5 rounded-tl-md rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-panel">
                    <MarkdownRenderer content={msg.text} />
                    {msg.plots && (
                        <div className="mt-1.5">
                            <PlotRenderer plots={msg.plots} metadata={msg.plotMetadata} isDark={isDark} />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast,180ms)]">
                    <IconBtn title="Copy response" onClick={() => copy(msg.text, `b-${msg.id}`)} variant="success" active={copiedId === `b-${msg.id}`}>
                        {copiedId === `b-${msg.id}` ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </IconBtn>

                    <div className="w-px h-3.5 bg-border mx-0.5" />

                    <IconBtn title="Good response" onClick={() => onFeedback(msg.id, 'up')} variant="success" active={msg.feedback === 'up'}>
                        <ThumbsUp className="w-3.5 h-3.5" />
                    </IconBtn>
                    <IconBtn title="Poor response" onClick={() => onFeedback(msg.id, 'down')} variant="danger" active={msg.feedback === 'down'}>
                        <ThumbsDown className="w-3.5 h-3.5" />
                    </IconBtn>

                    <div className="w-px h-3.5 bg-border mx-0.5" />

                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        title="Try Again — edit and resend"
                        onClick={() => (isRetryOpen ? cancelRetry() : openRetry(msg.id, idx))}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-none cursor-pointer text-xs font-bold transition-colors duration-[var(--duration-fast,150ms)] ${
                            isRetryOpen ? 'bg-brand-muted text-brand' : 'text-text-subtle hover:bg-surface-2 hover:text-brand'
                        }`}
                    >
                        <RotateCcw className="w-3 h-3" />
                        Try Again
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isRetryOpen && (
                        <RetryPanel
                            key="retry-panel"
                            initialText={retryState.text}
                            onSubmit={(newText) => submitRetry(msg.id, newText)}
                            onCancel={cancelRetry}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
