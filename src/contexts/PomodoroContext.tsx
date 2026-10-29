import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { soundscape, SoundscapeType } from '../services/soundscapeService';

export type PomodoroPhase = 'idle' | 'work' | 'short_break' | 'long_break';

export const PHASE_CONFIG: Record<PomodoroPhase, { label: string; duration: number; color: string; ringColor: string; bgColor: string }> = {
    idle:        { label: 'Ready',       duration: 25 * 60, color: '#a78bfa', ringColor: '#7c3aed', bgColor: 'rgba(124,58,237,0.12)' },
    work:        { label: 'Deep Focus',  duration: 25 * 60, color: '#38bdf8', ringColor: '#0ea5e9', bgColor: 'rgba(14,165,233,0.15)' },
    short_break: { label: 'Short Break', duration:  5 * 60, color: '#34d399', ringColor: '#10b981', bgColor: 'rgba(16,185,129,0.15)' },
    long_break:  { label: 'Long Break',  duration: 15 * 60, color: '#818cf8', ringColor: '#6366f1', bgColor: 'rgba(99,102,241,0.15)' },
};

interface PomodoroContextType {
    phase: PomodoroPhase;
    timeLeft: number;
    isRunning: boolean;
    pomodoroCount: number;
    isPanelOpen: boolean;
    currentSoundscape: SoundscapeType;
    soundVolume: number;
    togglePanel: () => void;
    closePanel: () => void;
    startPause: () => void;
    reset: () => void;
    setPreset: (minutes: number, targetPhase: PomodoroPhase) => void;
    setSoundscape: (type: SoundscapeType) => void;
    setVolume: (val: number) => void;
    formatTime: (secs: number) => string;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const playBeep = (type: 'work' | 'break') => {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const notes = type === 'work' ? [523, 659, 784] : [784, 659, 523];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.35);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.35);
        });
    } catch { /* audio not supported */ }
};

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [phase, setPhase] = useState<PomodoroPhase>('idle');
    const [timeLeft, setTimeLeft] = useState(PHASE_CONFIG.work.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>('none');
    const [soundVolume, setSoundVolume] = useState(0.4);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const goToNextPhase = useCallback((completedPhase: PomodoroPhase) => {
        if (completedPhase === 'work') {
            const newCount = pomodoroCount + 1;
            setPomodoroCount(newCount);
            if (newCount % 4 === 0) {
                setPhase('long_break');
                setTimeLeft(PHASE_CONFIG.long_break.duration);
                playBeep('break');
            } else {
                setPhase('short_break');
                setTimeLeft(PHASE_CONFIG.short_break.duration);
                playBeep('break');
            }
        } else {
            setPhase('work');
            setTimeLeft(PHASE_CONFIG.work.duration);
            playBeep('work');
        }
        setIsRunning(false);
    }, [pomodoroCount]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setIsRunning(false);
                        goToNextPhase(phase);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current!);
        }
        return () => clearInterval(intervalRef.current!);
    }, [isRunning, phase, goToNextPhase]);

    const startPause = () => {
        if (!isRunning && phase === 'idle') {
            setPhase('work');
        }
        setIsRunning(prev => !prev);
    };

    const reset = () => {
        setIsRunning(false);
        setPhase('idle');
        setTimeLeft(PHASE_CONFIG.work.duration);
        soundscape.stop();
        setCurrentSoundscape('none');
    };

    const setPreset = (minutes: number, targetPhase: PomodoroPhase) => {
        setIsRunning(false);
        setPhase(targetPhase);
        setTimeLeft(minutes * 60);
    };

    const handleSetSoundscape = (type: SoundscapeType) => {
        if (currentSoundscape === type) {
            soundscape.stop();
            setCurrentSoundscape('none');
        } else {
            soundscape.play(type);
            soundscape.setVolume(soundVolume);
            setCurrentSoundscape(type);
        }
    };

    const handleSetVolume = (val: number) => {
        setSoundVolume(val);
        soundscape.setVolume(val);
    };

    return (
        <PomodoroContext.Provider
            value={{
                phase,
                timeLeft,
                isRunning,
                pomodoroCount,
                isPanelOpen,
                currentSoundscape,
                soundVolume,
                togglePanel: () => setIsPanelOpen(prev => !prev),
                closePanel: () => setIsPanelOpen(false),
                startPause,
                reset,
                setPreset,
                setSoundscape: handleSetSoundscape,
                setVolume: handleSetVolume,
                formatTime,
            }}
        >
            {children}
        </PomodoroContext.Provider>
    );
};

export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
};

