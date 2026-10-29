import React, { useState, useEffect } from 'react';
import { LogoutIcon } from './icons/LogoutIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { usePomodoro, PHASE_CONFIG } from '../contexts/PomodoroContext';

type Theme = 'light' | 'dark';

interface HeaderProps {
    username?: string;
    onLogout?: () => void;
    onInstallClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout, onInstallClick }) => {
  const { formatTime, timeLeft, isRunning, phase, togglePanel, currentSoundscape } = usePomodoro();
  const currentConfig = PHASE_CONFIG[phase];

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(/[@\s]/);
    return (parts[0][0] || 'U').toUpperCase();
  };

  return (
    <header className="bg-[var(--color-surface-primary)]/80 backdrop-blur-2xl px-4 py-3 sticky top-0 z-30 border-b border-[var(--color-border)] shadow-md transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-10 h-10 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-cyan-500/40 shadow-inner">
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 22C55 19 65 18 72 18C73.8 18 75.6 18.2 77 18.5M23 18.5C24.4 18.2 26.2 18 28 18C37 18 50 22.8 50 22.8M50 22V78M50 22.8C50 22.8 37 18 28 18C26.2 18 24.4 18.2 23 18.5M23 18.5V72C24.5 71.6 26.2 71.5 28 71.5C37 71.5 50 75 50 75M77 18.5V72C75.5 71.6 73.5 71.5 72 71.5C63 71.5 50 75 50 75" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="72" cy="35" r="3.5" fill="#22d3ee" />
                <circle cx="63" cy="26" r="2.5" fill="#38bdf8" />
                <circle cx="78" cy="45" r="2" fill="#07aec2" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg md:text-xl font-black text-[var(--color-text-primary)] tracking-tight leading-none">
                Vidya <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] leading-none mt-1">
              Next-Gen AI Study Companion
            </p>
          </div>
        </div>

        {/* User Chip, Timer & Actions */}
        {username && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Focus Timer Pill (Top Header Placement — Never blocks chat buttons!) */}
            <button
              onClick={togglePanel}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-secondary)]/90 hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] hover:border-cyan-500/40 transition duration-200 shadow-sm group cursor-pointer"
              title="Click to open Focus Timer & Ambient Soundscapes"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 relative"
                style={{ backgroundColor: currentConfig.ringColor }}
              >
                {isRunning && (
                  <span className="animate-ping absolute inset-0 rounded-full bg-cyan-400 opacity-75" />
                )}
              </div>
              <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] hidden sm:inline font-semibold text-[var(--color-text-secondary)]">
                {currentSoundscape !== 'none' ? `🎧 ${currentSoundscape}` : currentConfig.label}
              </span>
            </button>

            {/* User Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-secondary)]/80 border border-[var(--color-border)] shadow-sm">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-inner">
                {getInitials(username)}
              </div>
              <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate max-w-[120px]">
                {username}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--color-text-secondary)] hover:text-cyan-400 transition rounded-xl hover:bg-[var(--color-surface-secondary)] border border-transparent hover:border-[var(--color-border)]"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
            </button>

            {/* Install PWA */}
            {onInstallClick && (
              <button
                onClick={onInstallClick}
                className="p-2 text-[var(--color-text-secondary)] hover:text-cyan-400 transition rounded-xl hover:bg-[var(--color-surface-secondary)] border border-transparent hover:border-[var(--color-border)]"
                aria-label="Install App"
                title="Install as App"
              >
                <DownloadIcon className="w-4 h-4" />
              </button>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-[var(--color-text-secondary)] hover:text-red-400 transition rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
              aria-label="Logout"
              title="Logout"
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
