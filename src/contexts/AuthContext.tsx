/**
 * AuthContext.tsx — Supabase Auth-powered context with Student Profile support
 *
 * Provides:
 *   - currentUser  : display student name (e.g. "Sachin Gupta")
 *   - profile      : full student profile (class, stream, board, age, goal, school)
 *   - session      : raw Supabase session (contains JWT for API calls)
 *   - updateProfile: update student profile in Supabase metadata
 *   - logout()     : signs out of Supabase
 *   - isLoading    : true while initial session check is running
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

export interface StudentProfile {
  fullName: string;
  email: string;
  studentClass: string;
  stream: string;
  board: string;
  age: string;
  academicGoal: string;
  schoolCollege: string;
}

interface AuthContextType {
  currentUser: string | null;
  profile: StudentProfile | null;
  session: Session | null;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  login: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract student profile from Supabase session metadata
  const extractProfile = (s: Session | null): StudentProfile | null => {
    if (!s?.user) return null;
    const meta = s.user.user_metadata || {};
    const email = s.user.email || '';
    const fullName = meta.full_name || meta.name || email.split('@')[0] || 'Student';

    return {
      fullName,
      email,
      studentClass: meta.student_class || 'Class 10th',
      stream: meta.stream || 'Science (PCM)',
      board: meta.board || 'CBSE (2026–27)',
      age: meta.age ? String(meta.age) : '16',
      academicGoal: meta.academic_goal || 'Score 95%+ in Board Exam',
      schoolCollege: meta.school_college || '',
    };
  };

  useEffect(() => {
    // 1. Load the current session immediately (handles page refresh)
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        const p = extractProfile(s);
        setProfile(p);
        setCurrentUser(p?.fullName || (s?.user?.email?.split('@')[0] ?? null));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[AuthContext] Session check error:', err);
        setIsLoading(false);
      });

    // 2. Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        const p = extractProfile(s);
        setProfile(p);
        setCurrentUser(p?.fullName || (s?.user?.email?.split('@')[0] ?? null));
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    const metaUpdates: Record<string, any> = {};
    if (updates.fullName !== undefined) {
      metaUpdates.full_name = updates.fullName;
      metaUpdates.name = updates.fullName;
    }
    if (updates.studentClass !== undefined) metaUpdates.student_class = updates.studentClass;
    if (updates.stream !== undefined) metaUpdates.stream = updates.stream;
    if (updates.board !== undefined) metaUpdates.board = updates.board;
    if (updates.age !== undefined) metaUpdates.age = updates.age;
    if (updates.academicGoal !== undefined) metaUpdates.academic_goal = updates.academicGoal;
    if (updates.schoolCollege !== undefined) metaUpdates.school_college = updates.schoolCollege;

    const { data, error } = await supabase.auth.updateUser({
      data: metaUpdates,
    });
    if (error) throw error;

    if (data.user) {
      const updated = extractProfile({ ...session!, user: data.user });
      setProfile(updated);
      setCurrentUser(updated?.fullName || null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
    setProfile(null);
  };

  const login = (username: string) => {
    setCurrentUser(username);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-background-start)]">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, profile, session, login, logout, updateProfile }}>
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
