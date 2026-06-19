import React, { useState, useEffect } from 'react';
import { LogoutIcon } from './icons/LogoutIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

type Theme = 'light' | 'dark';

interface HeaderProps {
    username?: string;
    onLogout?: () => void;
    onInstallClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout, onInstallClick }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
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

  return (
    <header className="bg-[var(--color-surface-primary)]/70 backdrop-blur-sm px-4 py-3 sticky top-0 z-10 border-b border-[var(--color-border)]">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl overflow-hidden bg-[#0f172a] flex items-center justify-center shadow-md">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 22C55 19 65 18 72 18C73.8 18 75.6 18.2 77 18.5M23 18.5C24.4 18.2 26.2 18 28 18C37 18 50 22.8 50 22.8M50 22V78M50 22.8C50 22.8 37 18 28 18C26.2 18 24.4 18.2 23 18.5M23 18.5V72C24.5 71.6 26.2 71.5 28 71.5C37 71.5 50 75 50 75M77 18.5V72C75.5 71.6 73.5 71.5 72 71.5C63 71.5 50 75 50 75" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="72" cy="35" r="3" fill="#22d3ee" opacity="0.9"/>
              <circle cx="63" cy="26" r="2" fill="#38bdf8" opacity="0.7"/>
              <circle cx="78" cy="45" r="1.5" fill="#07aec2" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] tracking-tight leading-none">
              Vidya <span className="text-[var(--color-accent-text)]">AI</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] leading-none mt-0.5">
              Smart Study Assistant
            </p>
          </div>
        </div>
        {username && (
            <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm text-[var(--color-text-secondary)] hidden md:block truncate max-w-[120px]">
                  Hi, {username}
                </span>
                <button
                    onClick={toggleTheme}
                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                {onInstallClick && (
                    <button
                        onClick={onInstallClick}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                        aria-label="Install App"
                        title="Install as App"
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={onLogout}
                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                    aria-label="Logout"
                    title="Logout"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>
    </header>
  );

};

export default Header;