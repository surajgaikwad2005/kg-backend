'use client';
import React, { useState, useEffect } from 'react';
import { FunctionStep1Modal } from './FunctionStep1Modal';
import { FunctionCodeBuilderView } from './FunctionCodeBuilderView';

const DEFAULT_CODE = `def preprocessing(data):
    # Your code here
    preprocess_data = data
    return preprocess_data`;

const DEFAULT_INPUTS = `{\n  "additionalProp1": {}\n}`;

export function FunctionModal({
    isOpen,
    open,
    onClose,
    editingFunction,
    onSave,
    onRunTest,
    testResult,
    testingCode,
    actionLoading,
    onClearTestResult,
}) {
    const isModalVisible = isOpen ?? open ?? false;
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [code, setCode] = useState(DEFAULT_CODE);
    const [testInputsStr, setTestInputsStr] = useState(DEFAULT_INPUTS);

    useEffect(() => {
        if (editingFunction) {
            setStep(2);
            setName(editingFunction.name || '');
            setDescription(editingFunction.description || '');
            setCreatedBy(editingFunction.created_by || '');
            setCode(editingFunction.code || DEFAULT_CODE);
        } else {
            setStep(1);
            setName('');
            setDescription('');
            setCreatedBy('');
            setCode(DEFAULT_CODE);
        }
    }, [editingFunction, isModalVisible]);

    if (!isModalVisible) return null;

    const handleOpenCodeBuilder = (e) => {
        e?.preventDefault();
        if (!name.trim()) return;
        setStep(2);
    };

    const handleRunTestClick = () => {
        let parsedInputs = {};
        if (testInputsStr.trim()) {
            try {
                parsedInputs = JSON.parse(testInputsStr);
            } catch {
                parsedInputs = {};
            }
        }
        onRunTest({ name: name || 'Test', code, testInputs: parsedInputs });
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!name.trim()) return;
        onSave({ name, description, createdBy, code });
    };

    if (step === 1) {
        return (
            <FunctionStep1Modal
                isOpen={isModalVisible}
                onClose={onClose}
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                onOpenCodeBuilder={handleOpenCodeBuilder}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-canvas flex flex-col">
            <FunctionCodeBuilderView
                name={name}
                editingFunction={editingFunction}
                code={code}
                setCode={setCode}
                onBack={editingFunction ? onClose : () => setStep(1)}
                onRunTestClick={handleRunTestClick}
                onSubmit={handleSubmit}
                testResult={testResult}
                testingCode={testingCode}
                actionLoading={actionLoading}
                onClearConsole={onClearTestResult}
            />
        </div>
    );
}
