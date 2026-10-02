'use client';
import { useState, useEffect } from 'react';

export function useAdminNavState({ initialView = 'welcome', onViewChange, setIsDecisionContextDone }) {
    const [view, setViewInternal] = useState(initialView);
    const [nextView, setNextView] = useState(initialView);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [loginTime] = useState(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configStep, setConfigStep] = useState(1);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressModalTitle, setProgressModalTitle] = useState('Configuring Context');
    const [progressModalSubtitle, setProgressModalSubtitle] = useState(
        'Orchestrating assets and mapping relationships...'
    );
    const [multiPipelineOpen, setMultiPipelineOpen] = useState(false);
    const [multiPipelineTargetView, setMultiPipelineTargetView] = useState('pid-review');
    // Minimized, not closed: the run keeps polling in the background and the
    // dock renders it under the Data Configuration heading instead. Shared state
    // (not local) because the modal minimizes it and a different subtree —
    // DataConfigView's dock — restores it.
    const [multiPipelineMinimized, setMultiPipelineMinimized] = useState(false);
    const [showContextDoneCard, setShowContextDoneCard] = useState(false);
    const [contextProgressMode, setContextProgressMode] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

    const setView = (v) => {
        setViewInternal(v);
        onViewChange?.(v);
    };

    useEffect(() => {
        if (initialView !== view) setViewInternal(initialView);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialView]);

    const startProgress = (v) => {
        setNextView(v);
        setIsProgressModalOpen(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100; }
                return prev + 5;
            });
        }, 100);
    };

    const handleDoneProgress = () => {
        setIsProgressModalOpen(false);
        if (contextProgressMode) {
            setContextProgressMode(false);
            setIsDecisionContextDone(true);
            setShowContextDoneCard(true);
        } else {
            setView(nextView);
        }
    };

    const simulateContextProgress = (targetView, isFinal = false) => {
        setProgress(0);
        setProgressModalTitle('Configuring Context');
        setProgressModalSubtitle('Orchestrating assets and mapping relationships...');
        setIsProgressModalOpen(true);
        if (isFinal) setContextProgressMode(true);
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 18 + 8;
            if (p >= 100) { p = 100; clearInterval(interval); }
            setProgress(Math.min(p, 100));
            if (p >= 100) {
                setTimeout(() => {
                    setIsProgressModalOpen(false);
                    if (isFinal) {
                        setContextProgressMode(false);
                        setIsDecisionContextDone(true);
                        setShowContextDoneCard(true);
                    }
                    setView(targetView);
                }, 400);
            }
        }, 300);
    };

    return {
        view, setView, setViewInternal, nextView, setNextView,
        activeTab, setActiveTab,
        isSidebarOpen, setIsSidebarOpen,
        isProfileOpen, setIsProfileOpen,
        loginTime,
        isConfigModalOpen, setIsConfigModalOpen,
        configStep, setConfigStep,
        isProgressModalOpen, setIsProgressModalOpen,
        progress, setProgress,
        progressModalTitle, setProgressModalTitle,
        progressModalSubtitle, setProgressModalSubtitle,
        multiPipelineOpen, setMultiPipelineOpen,
        multiPipelineTargetView, setMultiPipelineTargetView,
        multiPipelineMinimized, setMultiPipelineMinimized,
        showContextDoneCard, setShowContextDoneCard,
        contextProgressMode, setContextProgressMode,
        isProcessModalOpen, setIsProcessModalOpen,
        startProgress, handleDoneProgress, simulateContextProgress,
    };
}
