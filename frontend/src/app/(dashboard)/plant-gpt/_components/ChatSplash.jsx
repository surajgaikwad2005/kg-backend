'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { RECOMMENDED_QUESTIONS } from '../plant-gpt.types';

/** Initial empty-state view: greeting bubble + recommended-question shortcuts. */
export function ChatSplash({ greeting, onQuestionClick }) {
    return (
        <motion.div
            key="splash"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28, scale: 0.96, filter: 'blur(6px)' }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col pt-13"
        >
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.38 }}
                className="flex items-start gap-3.5 mb-7"
            >
                <div className="w-11.5 h-11.5 rounded-full shrink-0 overflow-hidden border-2 border-brand/35 shadow-brand bg-surface-2">
                    <Image src="/images/Aivee_1.png" alt="PlantGPT" width={46} height={46} className="object-contain" />
                </div>
                <div className="bg-surface border border-border py-4 px-5 rounded-tl-md rounded-tr-2xl rounded-br-2xl rounded-bl-2xl max-w-[85%] shadow-panel">
                    <p className="m-0 text-base leading-[1.7] font-bold text-text-primary">{greeting}</p>
                </div>
            </motion.div>

            {/* Suggested questions */}
            <div className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                {RECOMMENDED_QUESTIONS.map((q, i) => (
                    <motion.button
                        key={q}
                        type="button"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 + i * 0.07, duration: 0.32 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onQuestionClick(q)}
                        className="flex items-start gap-2.5 py-3 px-4 rounded-2xl cursor-pointer text-left bg-surface border border-border shadow-card transition-colors duration-[var(--duration-fast,150ms)] hover:bg-surface-2"
                    >
                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-brand-muted text-brand">
                            <MessageSquare className="w-3.25 h-3.25" />
                        </div>
                        <span className="text-xs font-semibold text-text-secondary leading-relaxed">{q}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
