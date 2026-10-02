import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { useAskPlantGpt } from '../_queries/usePlantGptQueries';
import { DRAFT_SESSION_ID, INITIAL_GREETING } from '../plant-gpt.types';
import { useVoiceInput } from './useVoiceInput';

function parseApiResponse(data) {
    const raw = data?.data?.response || '';
    try {
        const parsed = JSON.parse(raw);
        return {
            text: parsed.text || parsed.message || parsed.reply || (parsed.plots ? '' : raw),
            plots: parsed.plots || null,
            plotMetadata: parsed.metadata || null,
        };
    } catch {
        return { text: raw || 'Sorry, I could not get a response from the analytics engine.', plots: null, plotMetadata: null };
    }
}

export function usePlantGpt(plantCode) {
    const { warning: toastWarning } = useToast();

    const askMutation = useAskPlantGpt();
    const isThinking = askMutation.isPending;

    const [sessions, setSessions] = useState(() => {
        if (typeof window === 'undefined') return [];
        const savedSessions = localStorage.getItem('plant_gpt_sessions');
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                return parsed.filter(s => s.messages.some(m => m.sender === 'user'));
            } catch {
                return [];
            }
        }
        return [];
    });

    const [currentSessionId, setCurrentSessionId] = useState(DRAFT_SESSION_ID);
    const [inputValue, setInputValue] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposerMenuOpen, setIsComposerMenuOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [tempRenameValue, setTempRenameValue] = useState('');

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const { isRecording, interimTranscript, toggleVoiceQuery } = useVoiceInput(inputValue, setInputValue);

    const createNewSession = useCallback(() => {
        setCurrentSessionId(DRAFT_SESSION_ID);
        setIsMobileMenuOpen(false);
        setRenamingId(null);
        setMenuOpenId(null);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isComposerMenuOpen && !event.target.closest('.composer-container')) {
                setIsComposerMenuOpen(false);
            }
            if (menuOpenId && !event.target.closest('.session-menu-container')) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isComposerMenuOpen, menuOpenId]);

    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem('plant_gpt_sessions', JSON.stringify(sessions));
        }
    }, [sessions]);

    const currentSession = sessions.find(s => s.id === currentSessionId) || null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentSession?.messages, isThinking]);

    const deleteSession = (e, id) => {
        if (e) e.stopPropagation();
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        setMenuOpenId(null);
        if (currentSessionId === id) {
            if (updated.length > 0) {
                setCurrentSessionId(updated[0].id);
            } else {
                createNewSession();
            }
        }
    };

    const handleRename = (id, newTitle) => {
        if (!newTitle.trim()) { setRenamingId(null); return; }
        setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
        setRenamingId(null);
        setMenuOpenId(null);
    };

    const handleSendMessage = async (textOverride) => {
        const text = textOverride || inputValue.trim();
        if (!text || isThinking || !currentSessionId) return;
        if (!plantCode) { toastWarning('No plant selected', 'Select a plant before asking PlantGPT.'); return; }

        let targetId = currentSessionId;
        if (currentSessionId === DRAFT_SESSION_ID) {
            const newId = Date.now().toString();
            const newSession = {
                id: newId,
                title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
                messages: [INITIAL_GREETING('Operator')],
                lastUpdated: new Date().toISOString(),
            };
            setSessions(prev => [newSession, ...prev]);
            setCurrentSessionId(newId);
            targetId = newId;
        }

        const newUserMsg = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date().toISOString() };

        setSessions(prev => prev.map(s => {
            if (s.id !== targetId) return s;
            const isFirstMsg = s.messages.filter(m => m.sender === 'user').length === 0;
            return {
                ...s,
                title: isFirstMsg ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : s.title,
                messages: [...s.messages, newUserMsg],
                lastUpdated: new Date().toISOString(),
            };
        }));

        if (!textOverride) setInputValue('');
        selectedFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
        setSelectedFiles([]);
        setIsWebSearchEnabled(false);

        try {
            const data = await askMutation.mutateAsync({ plantCode, payload: { query: text } });
            const { text: botText, plots, plotMetadata } = parseApiResponse(data);
            const newBotMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: botText,
                plots,
                plotMetadata,
                feedback: null,
                timestamp: new Date().toISOString(),
            };
            setSessions(prev => prev.map(s => s.id === targetId ? { ...s, messages: [...s.messages, newBotMsg], lastUpdated: new Date().toISOString() } : s));
        } catch {
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: 'System connectivity error. Please ensure the refinery analytics engine is online.',
                feedback: null,
                timestamp: new Date().toISOString(),
            };
            setSessions(prev => prev.map(s => s.id === targetId ? { ...s, messages: [...s.messages, errorMsg] } : s));
        }
    };

    const handleRetry = async (botMsgId, newText) => {
        if (!newText.trim() || isThinking || !currentSessionId) return;
        if (!plantCode) { toastWarning('No plant selected', 'Select a plant before asking PlantGPT.'); return; }
        const targetId = currentSessionId;
        const session = sessions.find(s => s.id === targetId);
        if (!session) return;

        const botIdx = session.messages.findIndex(m => m.id === botMsgId);
        if (botIdx === -1) return;

        let userIdx = -1;
        for (let i = botIdx - 1; i >= 0; i--) {
            if (session.messages[i].sender === 'user') { userIdx = i; break; }
        }
        if (userIdx === -1) return;

        const truncated = session.messages.slice(0, userIdx);
        const newUserMsg = { id: Date.now().toString(), sender: 'user', text: newText.trim(), timestamp: new Date().toISOString() };
        const updatedMessages = [...truncated, newUserMsg];

        setSessions(prev => prev.map(s => s.id === targetId ? { ...s, messages: updatedMessages } : s));

        try {
            const data = await askMutation.mutateAsync({ plantCode, payload: { query: newText.trim() } });
            const { text: botText, plots, plotMetadata } = parseApiResponse(data);
            const newBotMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: botText,
                plots,
                plotMetadata,
                feedback: null,
                timestamp: new Date().toISOString(),
            };
            setSessions(prev => prev.map(s => s.id === targetId ? { ...s, messages: [...updatedMessages, newBotMsg], lastUpdated: new Date().toISOString() } : s));
        } catch {
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: 'System connectivity error. Please ensure the refinery analytics engine is online.',
                feedback: null,
                timestamp: new Date().toISOString(),
            };
            setSessions(prev => prev.map(s => s.id === targetId ? { ...s, messages: [...updatedMessages, errorMsg] } : s));
        }
    };

    const handleFeedback = (msgId, type) => {
        setSessions(prev => prev.map(s => {
            if (s.id !== currentSessionId) return s;
            return {
                ...s,
                messages: s.messages.map(m =>
                    m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m
                ),
            };
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const handleFileSelect = (e) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
        setIsComposerMenuOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (id) => {
        setSelectedFiles(prev => {
            const f = prev.find(f => f.id === id);
            if (f?.preview) URL.revokeObjectURL(f.preview);
            return prev.filter(f => f.id !== id);
        });
    };

    return {
        sessions, currentSession, currentSessionId, setCurrentSessionId,
        inputValue, setInputValue, isThinking,
        isSidebarCollapsed, setIsSidebarCollapsed,
        isMobileMenuOpen, setIsMobileMenuOpen,
        searchQuery, setSearchQuery,
        isComposerMenuOpen, setIsComposerMenuOpen,
        selectedFiles,
        isWebSearchEnabled, setIsWebSearchEnabled,
        isRecording, interimTranscript,
        menuOpenId, setMenuOpenId,
        renamingId, setRenamingId,
        tempRenameValue, setTempRenameValue,
        messagesEndRef, fileInputRef,
        createNewSession, deleteSession, handleRename,
        handleSendMessage, handleRetry, handleFeedback,
        handleKeyDown, handleFileSelect, removeFile, toggleVoiceQuery
    };
}
