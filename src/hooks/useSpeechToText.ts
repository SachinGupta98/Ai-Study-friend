import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechToText = (onTranscriptFinalized: (text: string) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    // Store the callback in a ref so the recognition object is not recreated on every render
    const callbackRef = useRef(onTranscriptFinalized);
    useEffect(() => {
        callbackRef.current = onTranscriptFinalized;
    }, [onTranscriptFinalized]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    // Always call the latest version of the callback via ref
                    callbackRef.current(finalTranscript);
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }
    }, []); // Empty deps: only create recognition object once on mount

    const toggleRecording = useCallback(() => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (e) {
                console.error("Failed to start speech recognition:", e);
                setIsRecording(false);
            }
        }
    }, [isRecording]);

    return { isRecording, toggleRecording, isSupported: !!recognitionRef.current };
};
