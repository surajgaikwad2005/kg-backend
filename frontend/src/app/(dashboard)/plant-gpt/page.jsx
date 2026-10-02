'use client';
import React from 'react';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { SessionSidebar } from './_components/SessionSidebar';
import { ChatWindow } from './_components/ChatWindow';
import { useTheme } from '@/src/context/visuals/ThemeContext';
import { useApp } from '@/src/context/AppContext';
import { usePlantGpt } from './_hooks/usePlantGpt';

export default function PlantGPT() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { plantId } = useApp();
    const plantCode = plantId?.id ?? '';

    const {
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
    } = usePlantGpt(plantCode);

    return (
        <>
            <PageHeader showDateRange title="PlantGPT" subtitle="AI-Powered Plant Intelligence" />
            <div className="flex flex-1 overflow-hidden relative">
                <SessionSidebar
                    sessions={sessions}
                    currentSessionId={currentSessionId}
                    isSidebarCollapsed={isSidebarCollapsed}
                    isMobileMenuOpen={isMobileMenuOpen}
                    searchQuery={searchQuery}
                    renamingId={renamingId}
                    tempRenameValue={tempRenameValue}
                    menuOpenId={menuOpenId}
                    isDark={isDark}
                    onSelectSession={(id) => { setCurrentSessionId(id); setIsMobileMenuOpen(false); }}
                    onNewChat={createNewSession}
                    onDeleteSession={(id) => deleteSession(null, id)}
                    onStartRename={(id, title) => { setRenamingId(id); setTempRenameValue(title); setMenuOpenId(null); }}
                    onRenameConfirm={(id) => handleRename(id, tempRenameValue)}
                    onRenameCancel={() => setRenamingId(null)}
                    onTempRenameChange={setTempRenameValue}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    onToggleMobileMenu={() => setIsMobileMenuOpen(false)}
                    onMenuToggle={setMenuOpenId}
                    onSearchChange={setSearchQuery}
                />
                <ChatWindow
                    currentSession={currentSession}
                    inputValue={inputValue}
                    isThinking={isThinking}
                    isComposerMenuOpen={isComposerMenuOpen}
                    selectedFiles={selectedFiles}
                    isWebSearchEnabled={isWebSearchEnabled}
                    isRecording={isRecording}
                    interimTranscript={interimTranscript}
                    messagesEndRef={messagesEndRef}
                    fileInputRef={fileInputRef}
                    isDark={isDark}
                    onInputChange={setInputValue}
                    onSend={() => handleSendMessage()}
                    onKeyDown={handleKeyDown}
                    onComposerMenuToggle={() => setIsComposerMenuOpen(!isComposerMenuOpen)}
                    onFileSelect={handleFileSelect}
                    onRemoveFile={removeFile}
                    onWebSearchToggle={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                    onRecordToggle={toggleVoiceQuery}
                    onQuestionClick={(q) => handleSendMessage(q)}
                    onRetry={handleRetry}
                    onFeedback={handleFeedback}
                />
            </div>
        </>
    );
}
