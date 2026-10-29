import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoro, PHASE_CONFIG, PomodoroPhase } from '../contexts/PomodoroContext';
import { SoundscapeType } from '../services/soundscapeService';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PomodoroWidget: React.FC = () => {
    const {
        phase,
        timeLeft,
        isRunning,
        pomodoroCount,
        isPanelOpen,
        closePanel,
        startPause,
        reset,
        setPreset,
        currentSoundscape,
        soundVolume,
        setSoundscape,
        setVolume,
        formatTime,
    } = usePomodoro();

    if (!isPanelOpen) return null;

    const currentConfig = PHASE_CONFIG[phase];
    const totalDuration = phase === 'idle' ? PHASE_CONFIG.work.duration : PHASE_CONFIG[phase].duration;
    const progress = timeLeft / totalDuration;
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-xs">
                {/* Backdrop Click */}
                <div className="fixed inset-0" onClick={closePanel} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative z-10 mt-14 sm:mt-16 w-full max-w-sm rounded-3xl bg-[var(--color-surface-primary)]/90 backdrop-blur-2xl border border-[var(--color-border)] shadow-2xl p-5 overflow-hidden"
                >
                    {/* Glowing accent orb */}
                    <div
                        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 transition-colors duration-500"
                        style={{ backgroundColor: currentConfig.ringColor }}
                    />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
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
                            onClick={closePanel}
                            className="w-7 h-7 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center text-xs transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Countdown Dial */}
                    <div className="flex flex-col items-center justify-center my-2">
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

                        {/* Presets */}
                        <div className="flex gap-1.5 mt-3">
                            <button
                                onClick={() => setPreset(25, 'work')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition"
                            >
                                25m Focus
                            </button>
                            <button
                                onClick={() => setPreset(50, 'work')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition"
                            >
                                50m Deep
                            </button>
                            <button
                                onClick={() => setPreset(5, 'short_break')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition"
                            >
                                5m Break
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2 my-3">
                        <button
                            onClick={startPause}
                            className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: currentConfig.ringColor }}
                        >
                            <span>{isRunning ? '⏸ Pause' : '▶ Start Focus'}</span>
                        </button>
                        <button
                            onClick={reset}
                            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] transition"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Soundscapes */}
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
                                        onClick={() => setSoundscape(s.id as SoundscapeType)}
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

                        {currentSoundscape !== 'none' && (
                            <div className="flex items-center gap-2 pt-1 text-xs text-[var(--color-text-secondary)]">
                                <span>🔈</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={soundVolume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="flex-1 accent-cyan-400 h-1.5 bg-[var(--color-surface-tertiary)] rounded-lg cursor-pointer"
                                />
                                <span>🔊</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PomodoroWidget;
