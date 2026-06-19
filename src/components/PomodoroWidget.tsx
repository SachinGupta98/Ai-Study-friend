import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerIcon } from './icons/TimerIcon';

// ─── Types ────────────────────────────────────────────────────────────────────
type PomodoroPhase = 'idle' | 'work' | 'short_break' | 'long_break';

const PHASE_CONFIG: Record<PomodoroPhase, { label: string; duration: number; color: string; ringColor: string; bgColor: string }> = {
    idle:        { label: 'Ready',       duration: 25 * 60, color: '#a78bfa', ringColor: '#7c3aed', bgColor: 'rgba(124,58,237,0.12)' },
    work:        { label: 'Focus',       duration: 25 * 60, color: '#f87171', ringColor: '#ef4444', bgColor: 'rgba(239,68,68,0.12)' },
    short_break: { label: 'Short Break', duration:  5 * 60, color: '#34d399', ringColor: '#10b981', bgColor: 'rgba(16,185,129,0.12)' },
    long_break:  { label: 'Long Break',  duration: 15 * 60, color: '#60a5fa', ringColor: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)' },
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

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalDuration = phase === 'idle' ? PHASE_CONFIG.work.duration : PHASE_CONFIG[phase].duration;
    const progress = timeLeft / totalDuration;
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

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

    const handleStartPause = () => {
        if (phase === 'idle') {
            setPhase('work');
            setTimeLeft(PHASE_CONFIG.work.duration);
        }
        setIsRunning(prev => !prev);
    };

    const handleReset = () => {
        setIsRunning(false);
        setPhase('idle');
        setTimeLeft(PHASE_CONFIG.work.duration);
        setPomodoroCount(0);
    };

    const handleSkip = () => {
        setIsRunning(false);
        goToNextPhase(phase === 'idle' ? 'work' : phase);
    };

    const ringColor = phase === 'idle' ? '#7c3aed' : PHASE_CONFIG[phase].ringColor;
    const labelColor = phase === 'idle' ? '#a78bfa' : PHASE_CONFIG[phase].color;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2" style={{ pointerEvents: 'auto' }}>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                        className="rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]"
                        style={{
                            background: 'var(--color-surface-primary)',
                            backdropFilter: 'blur(20px)',
                            width: '220px',
                        }}
                    >
                        {/* Header */}
                        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: labelColor }}>
                                {PHASE_CONFIG[phase === 'idle' ? 'work' : phase].label}
                            </span>
                            <div className="flex gap-1">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className="text-base"
                                        title={`Pomodoro ${i + 1}`}
                                    >
                                        {i < pomodoroCount % 4 || (pomodoroCount > 0 && pomodoroCount % 4 === 0 && i < 4) ? '🍅' : '⭕'}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Ring Timer */}
                        <div className="flex flex-col items-center py-4">
                            <div className="relative" style={{ width: 100, height: 100 }}>
                                <svg width="100" height="100" viewBox="0 0 100 100">
                                    {/* Background ring */}
                                    <circle
                                        cx="50" cy="50" r={RADIUS}
                                        fill="none"
                                        stroke="var(--color-surface-secondary)"
                                        strokeWidth="8"
                                    />
                                    {/* Progress ring */}
                                    <circle
                                        cx="50" cy="50" r={RADIUS}
                                        fill="none"
                                        stroke={ringColor}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={CIRCUMFERENCE}
                                        strokeDashoffset={strokeDashoffset}
                                        style={{
                                            transform: 'rotate(-90deg)',
                                            transformOrigin: '50px 50px',
                                            transition: 'stroke-dashoffset 0.8s linear',
                                            filter: `drop-shadow(0 0 6px ${ringColor}88)`,
                                        }}
                                    />
                                </svg>
                                {/* Time label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Task label input */}
                        <div className="px-4 pb-2">
                            <input
                                type="text"
                                value={taskLabel}
                                onChange={e => setTaskLabel(e.target.value)}
                                placeholder="What are you working on?"
                                className="w-full text-xs rounded-lg px-2 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-ring)]"
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between px-4 pb-4 gap-2">
                            <button
                                onClick={handleReset}
                                className="text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition px-2 py-1 rounded-md hover:bg-[var(--color-surface-secondary)]"
                                title="Reset"
                            >
                                Reset
                            </button>

                            <button
                                onClick={handleStartPause}
                                className="flex-1 py-2 px-4 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95"
                                style={{
                                    background: `linear-gradient(135deg, ${ringColor}, ${ringColor}cc)`,
                                    boxShadow: `0 4px 15px ${ringColor}55`,
                                }}
                            >
                                {isRunning ? '⏸ Pause' : (phase === 'idle' ? '▶ Start' : '▶ Resume')}
                            </button>

                            <button
                                onClick={handleSkip}
                                className="text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition px-2 py-1 rounded-md hover:bg-[var(--color-surface-secondary)]"
                                title="Skip phase"
                            >
                                Skip ⏭
                            </button>
                        </div>

                        {/* Total pomodoros today */}
                        {pomodoroCount > 0 && (
                            <div className="border-t border-[var(--color-border)] px-4 py-2 text-center">
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                    🍅 {pomodoroCount} session{pomodoroCount !== 1 ? 's' : ''} today
                                    {pomodoroCount >= 4 && ' — Amazing focus! 🔥'}
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating toggle button */}
            <motion.button
                onClick={() => setIsExpanded(prev => !prev)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white/20 relative"
                style={{
                    background: `linear-gradient(135deg, ${ringColor}, ${ringColor}bb)`,
                    boxShadow: `0 8px 25px ${ringColor}55`,
                }}
                title="Pomodoro Timer"
                aria-label="Toggle Pomodoro Timer"
            >
                <TimerIcon className="w-7 h-7" />
                {/* Pulse ring while running */}
                {isRunning && (
                    <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: ringColor, opacity: 0.25 }}
                    />
                )}
                {/* Mini time badge */}
                {phase !== 'idle' && (
                    <span
                        className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/30"
                        style={{ background: ringColor, color: 'white', minWidth: '32px', textAlign: 'center' }}
                    >
                        {formatTime(timeLeft)}
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default PomodoroWidget;
