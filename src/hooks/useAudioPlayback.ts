import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioPlayback = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    const stopAudio = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        return () => stopAudio();
    }, [stopAudio]);

    const playAudio = useCallback(async (text: string) => {
        stopAudio();

        // Return a promise that resolves when speech ends
        return new Promise<void>((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Basic voice settings
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            // Try to find a good English voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Female') || v.name.includes('Google'))) || voices[0];
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onend = () => {
                setIsPlaying(false);
                resolve();
            };

            utterance.onerror = (e) => {
                console.error("Speech synthesis error", e);
                setIsPlaying(false);
                reject(e);
            };

            synthesisRef.current = utterance;
            setIsPlaying(true);
            window.speechSynthesis.speak(utterance);
        });
    }, [stopAudio]);

    return { isPlaying, playAudio, stopAudio };
};
