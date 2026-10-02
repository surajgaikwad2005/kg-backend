'use client';
import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@/src/context/visuals/ThemeContext';

const DEFAULT_PYTHON_TEMPLATE = `def test(data):
    # Your code here
    preprocess_data = data
    return preprocess_data`;

export function PythonCodeEditor({ code, setCode, name }) {
    const editorRef = useRef(null);
    const { isDark } = useTheme();

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    function handleEditorChange(value, event) {
        setCode(value || '');
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative bg-surface border-t border-border">
            <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={isDark ? "vs-dark" : "light"}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    lineHeight: 24,
                    scrollBeyondLastLine: false,
                    roundedSelection: false,
                    padding: {
                        top: 16,
                        bottom: 16,
                    },
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                }}
            />
        </div>
    );
}
