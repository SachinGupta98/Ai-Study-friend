import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudyPlanner from './components/StudyPlanner';
import TutorChat from './components/TutorChat';
import GeneralChat from './components/GeneralChat';
import Dashboard from './components/Dashboard';
import DocumentChat from './components/DocumentChat';
import Auth from './components/Auth';
import PomodoroWidget from './components/PomodoroWidget';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';
import { GeneralChatIcon } from './components/icons/GeneralChatIcon';
import { LayoutDashboardIcon } from './components/icons/LayoutDashboardIcon';
import { DocumentIcon } from './components/icons/DocumentIcon';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Define BeforeInstallPromptEvent interface as it's not in standard TS lib
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

import { PomodoroProvider } from './contexts/PomodoroContext';

type ActiveView = 'planner' | 'tutor' | 'docchat' | 'companion' | 'dashboard';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('planner');
  const { currentUser, login, logout } = useAuth();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLogin = (username: string) => {
    login(username);
  };

  const handleLogout = () => {
    logout();
    setActiveView('planner');
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setInstallPrompt(null);
  };

  const navItems = [
    { id: 'planner', label: 'Planner', icon: BookOpenIcon, badge: 'AI' },
    { id: 'tutor', label: 'AI Tutor', icon: ChatBubbleIcon },
    { id: 'docchat', label: 'PDF & Docs', icon: DocumentIcon, badge: 'NEW' },
    { id: 'companion', label: 'Companion', icon: GeneralChatIcon },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  ] as const;

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-[var(--color-text-primary)] relative overflow-hidden">
        {/* Modern glowing background orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10 p-4">
          <Header />
          <Auth onAuthSuccess={handleLogin} />
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'var(--color-surface-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-transparent text-[var(--color-text-primary)] relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <Header
        username={currentUser}
        onLogout={handleLogout}
        onInstallClick={installPrompt ? handleInstallClick : undefined}
      />

      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden relative z-10">
        {/* Glassmorphic Sidebar Navigation */}
        <nav className="flex justify-around items-center bg-[var(--color-surface-primary)]/80 backdrop-blur-2xl border-b border-[var(--color-border)] z-20 p-2 sm:p-3 sm:flex-col sm:justify-start sm:gap-2 sm:border-b-0 sm:border-r sm:w-28 sm:min-w-[7rem] shadow-xl transition-all duration-300">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex-1 sm:flex-none sm:w-full flex flex-col items-center justify-center gap-1.5 p-2 sm:py-3.5 sm:px-2 rounded-2xl text-[10px] sm:text-xs font-bold transition-all duration-300 group
                  ${active
                    ? 'text-cyan-400 bg-gradient-to-b from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]/60 border border-transparent'
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-black rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white uppercase tracking-wider scale-90 shadow">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main View Area */}
        <main className="flex-1 overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0 overflow-y-auto"
            >
              {activeView === 'planner' && <StudyPlanner />}
              {activeView === 'tutor' && <TutorChat />}
              {activeView === 'docchat' && <DocumentChat />}
              {activeView === 'companion' && <GeneralChat />}
              {activeView === 'dashboard' && <Dashboard onNavigate={(v) => setActiveView(v as any)} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-surface-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '1rem',
            backdropFilter: 'blur(16px)',
          },
        }}
      />

      {/* 🍅 Focus Soundscapes & Timer Modal (Top-docked, never blocks bottom chat inputs) */}
      <PomodoroWidget />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PomodoroProvider>
      <AppContent />
    </PomodoroProvider>
  );
};

export default App;
