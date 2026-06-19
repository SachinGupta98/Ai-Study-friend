
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudyPlanner from './components/StudyPlanner';
import TutorChat from './components/TutorChat';
import GeneralChat from './components/GeneralChat';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';
import { GeneralChatIcon } from './components/icons/GeneralChatIcon';
import { LayoutDashboardIcon } from './components/icons/LayoutDashboardIcon';
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

type ActiveView = 'planner' | 'tutor' | 'companion' | 'dashboard';

const App: React.FC = () => {
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
    setActiveView('planner'); // Reset to default view on logout
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
    setInstallPrompt(null); // The prompt can only be used once
  };

  const navButtonClasses = (view: ActiveView) =>
    `flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-4 text-[10px] sm:text-xs font-semibold border-b-2 sm:border-b-0 sm:border-l-2 transition duration-200 ${activeView === view
      ? 'text-[var(--color-accent-text)] border-[var(--color-accent-text)] bg-[var(--color-surface-primary)]/50'
      : 'text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-surface-secondary)]'
    }`;

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-[var(--color-text-primary)]">
        <div className="w-full max-w-md mx-auto relative z-10">
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
    <div className="flex flex-col h-screen bg-transparent text-[var(--color-text-primary)]">
      <Header
        username={currentUser}
        onLogout={handleLogout}
        onInstallClick={installPrompt ? handleInstallClick : undefined}
      />
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
        <nav className="flex justify-around items-center bg-[var(--color-surface-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)] z-20 p-2 sm:p-4 sm:flex-col sm:justify-start sm:gap-4 sm:border-b-0 sm:border-r sm:w-24 sm:min-w-[6rem] shadow-sm transition-colors duration-300">
          <button onClick={() => setActiveView('planner')} className={navButtonClasses('planner')}>
            <BookOpenIcon className="w-5 h-5" />
            Planner
          </button>
          <button onClick={() => setActiveView('tutor')} className={navButtonClasses('tutor')}>
            <ChatBubbleIcon className="w-5 h-5" />
            AI Tutor
          </button>
          <button onClick={() => setActiveView('companion')} className={navButtonClasses('companion')}>
            <GeneralChatIcon className="w-5 h-5" />
            Companion
          </button>
          <button onClick={() => setActiveView('dashboard')} className={navButtonClasses('dashboard')}>
            <LayoutDashboardIcon className="w-5 h-5" />
            Dashboard
          </button>
        </nav>
        <main className="flex-1 overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto"
            >
              {activeView === 'planner' && <StudyPlanner />}
              {activeView === 'tutor' && <TutorChat />}
              {activeView === 'companion' && <GeneralChat />}
              {activeView === 'dashboard' && <Dashboard />}
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
          },
        }}
      />
    </div>
  );
};

export default App;
