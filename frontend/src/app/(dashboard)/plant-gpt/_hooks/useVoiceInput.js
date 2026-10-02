import { useState, useRef } from 'react';
import { useToast } from '@/src/components/ui/Toast';

/** Google Web Speech API voice dictation into a controlled input value. */
export function useVoiceInput(inputValue, setInputValue) {
    const { warning: toastWarning } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    const recognitionRef = useRef(null);
    const baseTextRef = useRef('');

    const toggleVoiceQuery = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toastWarning('Browser not supported', 'Speech recognition is not supported in this browser. Please use Google Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        baseTextRef.current = inputValue;

        recognition.onstart = () => {
            setIsRecording(true);
            setInterimTranscript('');
        };

        recognition.onresult = (event) => {
            let interim = '';
            let finalNew = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalNew += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            if (finalNew) {
                const sep = baseTextRef.current ? ' ' : '';
                baseTextRef.current = baseTextRef.current + sep + finalNew.trim();
            }
            const displayText = baseTextRef.current + (interim ? (baseTextRef.current ? ' ' : '') + interim : '');
            setInputValue(displayText);
            setInterimTranscript(interim);
        };

        recognition.onerror = () => {
            setIsRecording(false);
            setInterimTranscript('');
            setInputValue(baseTextRef.current);
            recognitionRef.current = null;
        };

        recognition.onend = () => {
            setIsRecording(false);
            setInterimTranscript('');
            setInputValue(baseTextRef.current);
            recognitionRef.current = null;
        };

        recognition.start();
    };

    return { isRecording, interimTranscript, toggleVoiceQuery };
}
