/**
 * AuthContext.tsx — Supabase Auth-powered context
 *
 * Provides:
 *   - currentUser  : display name (email or Google name)
 *   - session      : raw Supabase session (contains JWT for API calls)
 *   - logout()     : signs out of Supabase
 *   - isLoading    : true while initial session check is running
 *
 * The context listens to Supabase's onAuthStateChange so the UI
 * stays in sync with auth events (login, logout, token refresh, OAuth callback).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';

interface AuthContextType {
  currentUser: string | null;   // Display name for the UI
  session: Session | null;      // Full Supabase session (use session.access_token for API)
  logout: () => Promise<void>;
  // Kept for backward compatibility with App.tsx handleLogin pattern
  login: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract a display name from a Supabase session
  const extractDisplayName = (s: Session | null): string | null => {
    if (!s) return null;
    const meta = s.user.user_metadata;
    // Google OAuth provides full_name or name; email+password users have email
    return meta?.full_name || meta?.name || s.user.email || 'User';
  };

  useEffect(() => {
    // 1. Load the current session immediately (handles page refresh)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setCurrentUser(extractDisplayName(s));
      setIsLoading(false);
    });

    // 2. Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setCurrentUser(extractDisplayName(s));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
  };

  // Kept for backward compatibility — Supabase onAuthStateChange handles the real login
  const login = (_username: string) => {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-background-start)]">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
