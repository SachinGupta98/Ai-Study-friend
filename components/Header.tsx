import React, { useState, useEffect } from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';
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
    <header className="bg-[var(--color-surface-primary)]/70 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-[var(--color-border)]">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="w-8 h-8 text-[var(--color-accent-text)]" />
          <div>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">AI Study Assistant</h1>
              <p className="text-xs text-[var(--color-text-secondary)]">For School, College, Competitive Exams & Skills</p>
          </div>
        </div>
        {username && (
            <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block">Welcome, {username}</span>
                <button
                    onClick={toggleTheme}
                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
                {onInstallClick && (
                    <button
                        onClick={onInstallClick}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                        aria-label="Install App"
                        title="Install App"
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                )}
                <button 
                    onClick={onLogout}
                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                    aria-label="Logout"
                >
                    <LogoutIcon className="w-6 h-6" />
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;