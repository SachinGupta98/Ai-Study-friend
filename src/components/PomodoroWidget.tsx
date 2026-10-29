import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerIcon } from './icons/TimerIcon';
import { soundscape, SoundscapeType } from '../services/soundscapeService';

// ─── Types ────────────────────────────────────────────────────────────────────
type PomodoroPhase = 'idle' | 'work' | 'short_break' | 'long_break';

const PHASE_CONFIG: Record<PomodoroPhase, { label: string; duration: number; color: string; ringColor: string; bgColor: string }> = {
    idle:        { label: 'Ready',       duration: 25 * 60, color: '#a78bfa', ringColor: '#7c3aed', bgColor: 'rgba(124,58,237,0.12)' },
    work:        { label: 'Deep Focus',  duration: 25 * 60, color: '#38bdf8', ringColor: '#0ea5e9', bgColor: 'rgba(14,165,233,0.15)' },
    short_break: { label: 'Short Break', duration:  5 * 60, color: '#34d399', ringColor: '#10b981', bgColor: 'rgba(16,185,129,0.15)' },
    long_break:  { label: 'Long Break',  duration: 15 * 60, color: '#818cf8', ringColor: '#6366f1', bgColor: 'rgba(99,102,241,0.15)' },
};

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ─── Audio Beep via Web Audio API ─────────────────────────────────────────────
const playBeep = (type: 'work' | 'break') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const notes = type === 'work'
            ? [523, 659, 784]   // C5, E5, G5 — uplifting
            : [784, 659, 523];  // descending — relaxing

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4);
            osc.start(ctx.currentTime + i * 0.18);
            osc.stop(ctx.currentTime + i * 0.18 + 0.4);
        });
    } catch (_) { /* audio not supported */ }
};

// ─── Component ────────────────────────────────────────────────────────────────
const PomodoroWidget: React.FC = () => {
    const [phase, setPhase] = useState<PomodoroPhase>('idle');
    const [timeLeft, setTimeLeft] = useState(PHASE_CONFIG.work.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [taskLabel, setTaskLabel] = useState('');
    const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>('none');
    const [soundVolume, setSoundVolume] = useState(0.4);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalDuration = phase === 'idle' ? PHASE_CONFIG.work.duration : PHASE_CONFIG[phase].duration;
    const progress = timeLeft / totalDuration;
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSoundscapeChange = (type: SoundscapeType) => {
        if (currentSoundscape === type) {
            soundscape.stop();
            setCurrentSoundscape('none');
        } else {
            soundscape.play(type);
            soundscape.setVolume(soundVolume);
            setCurrentSoundscape(type);
        }
    };

    const handleVolumeChange = (newVol: number) => {
        setSoundVolume(newVol);
        soundscape.setVolume(newVol);
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

    const handleStartPause = () => {
        if (!isRunning && phase === 'idle') {
            setPhase('work');
        }
        setIsRunning(prev => !prev);
    };

    const handleReset = () => {
        setIsRunning(false);
        setPhase('idle');
        setTimeLeft(PHASE_CONFIG.work.duration);
        soundscape.stop();
        setCurrentSoundscape('none');
    };

    const setCustomPreset = (minutes: number, targetPhase: PomodoroPhase) => {
        setIsRunning(false);
        setPhase(targetPhase);
        setTimeLeft(minutes * 60);
    };

    const currentConfig = PHASE_CONFIG[phase];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="mb-3 w-80 md:w-96 rounded-3xl bg-[var(--color-surface-primary)]/85 backdrop-blur-2xl border border-[var(--color-border)] shadow-2xl p-5 overflow-hidden relative"
                    >
                        {/* Glow accent */}
                        <div
                            className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 transition-colors duration-500"
                            style={{ backgroundColor: currentConfig.ringColor }}
                        />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⏱️</span>
                                <div>
                                    <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                                        Focus & Soundscapes
                                    </h3>
                                    <span
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5"
                                        style={{ backgroundColor: currentConfig.bgColor, color: currentConfig.color }}
                                    >
                                        {currentConfig.label} • Cycle #{pomodoroCount + 1}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="w-7 h-7 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center text-xs"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Big Dial */}
                        <div className="flex flex-col items-center justify-center my-3">
                            <div className="relative w-36 h-36 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                                    <circle
                                        cx="45"
                                        cy="45"
                                        r={RADIUS}
                                        fill="none"
                                        stroke="var(--color-surface-tertiary)"
                                        strokeWidth="5"
                                    />
                                    <circle
                                        cx="45"
                                        cy="45"
                                        r={RADIUS}
                                        fill="none"
                                        stroke={currentConfig.ringColor}
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray={CIRCUMFERENCE}
                                        strokeDashoffset={strokeDashoffset}
                                        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
                                        {formatTime(timeLeft)}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)] mt-0.5">
                                        {isRunning ? 'Focusing...' : 'Paused'}
                                    </span>
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex gap-1.5 mt-3">
                                <button
                                    onClick={() => setCustomPreset(25, 'work')}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition"
                                >
                                    25m Focus
                                </button>
                                <button
                                    onClick={() => setCustomPreset(50, 'work')}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition"
                                >
                                    50m Deep
                                </button>
                                <button
                                    onClick={() => setCustomPreset(5, 'short_break')}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition"
                                >
                                    5m Break
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-2 my-4">
                            <button
                                onClick={handleStartPause}
                                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                                style={{ backgroundColor: currentConfig.ringColor }}
                            >
                                <span>{isRunning ? '⏸ Pause' : '▶ Start Focus'}</span>
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] transition"
                            >
                                Reset
                            </button>
                        </div>

                        {/* 🎧 Soundscapes Section */}
                        <div className="pt-3 border-t border-[var(--color-border)] space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                                    <span>🎧</span> Ambient Soundscapes
                                </span>
                                {currentSoundscape !== 'none' && (
                                    <span className="text-[10px] text-cyan-400 font-semibold animate-pulse">
                                        ● Playing
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-1.5">
                                {[
                                    { id: 'rain', label: 'Rain', icon: '🌧️' },
                                    { id: 'binaural', label: '40Hz Beats', icon: '🧠' },
                                    { id: 'brown', label: 'Brown Noise', icon: '📻' },
                                    { id: 'cafe', label: 'Cafe Hum', icon: '☕' },
                                ].map(s => {
                                    const active = currentSoundscape === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSoundscapeChange(s.id as SoundscapeType)}
                                            className={`p-2 rounded-xl text-center border transition ${
                                                active
                                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                                                    : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-border)]'
                                            }`}
                                        >
                                            <div className="text-base">{s.icon}</div>
                                            <div className="text-[9px] font-bold mt-1 truncate">{s.label}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Volume Slider */}
                            {currentSoundscape !== 'none' && (
                                <div className="flex items-center gap-2 pt-1 text-xs text-[var(--color-text-secondary)]">
                                    <span>🔈</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={soundVolume}
                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                        className="flex-1 accent-cyan-400 h-1.5 bg-[var(--color-surface-tertiary)] rounded-lg cursor-pointer"
                                    />
                                    <span>🔊</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Pill Trigger */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(prev => !prev)}
                className="flex items-center gap-3 px-4 py-3 rounded-full bg-[var(--color-surface-primary)]/90 backdrop-blur-2xl border border-[var(--color-border)] shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-500/40 transition duration-300 group"
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold relative shadow-md"
                    style={{ backgroundColor: currentConfig.ringColor }}
                >
                    {isRunning ? (
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                        </span>
                    ) : (
                        <TimerIcon className="w-4 h-4 text-white" />
                    )}
                </div>

                <div className="flex flex-col text-left">
                    <span className="text-xs font-black tracking-tight text-[var(--color-text-primary)]">
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--color-text-secondary)]">
                        {currentSoundscape !== 'none' ? `🎧 ${currentSoundscape}` : currentConfig.label}
                    </span>
                </div>
            </motion.button>
        </div>
    );
};

export default PomodoroWidget;
