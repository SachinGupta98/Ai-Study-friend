/**
 * Auth.tsx — Supabase Auth UI
 *
 * Supports:
 *   - Email + Password Sign Up / Sign In
 *   - Google OAuth (one-click)
 *   - Forgot Password (real email via Supabase)
 *   - Email confirmation feedback
 */

import React, { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthProps {
  onAuthSuccess: (username: string) => void;
  initialMode?: AuthMode;
  onClose?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10th');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // ── Email / Password ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              name: fullName.trim(),
              student_class: studentClass,
            },
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          // Email confirmation required (Supabase default)
          toast.success('Check your email to confirm your account!', { duration: 6000 });
        } else if (data.session) {
          // Auto-confirmed (e.g. when email confirmation is disabled in Supabase)
          onAuthSuccess(fullName.trim());
          toast.success(`Welcome to Vidya AI, ${fullName.trim()}! 🎉`);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const displayName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'Student';
        onAuthSuccess(displayName);
        toast.success(`Welcome back, ${displayName}!`);
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password ──────────────────────────────────────────────────────────

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading || !email) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // After clicking the link, Supabase redirects here so user can set new password
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
      toast.success('Password reset email sent! Check your inbox.', { duration: 8000 });
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,  // Return to app after Google login
        },
      });
      if (error) throw error;
      // Browser will redirect to Google — no further action needed here
    } catch (err: any) {
      toast.error(err.message ?? 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  // ── Render: Forgot Password Mode ─────────────────────────────────────────────

  if (mode === 'forgot') {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-6 space-y-5 shadow-lg">
          <div className="text-center space-y-1">
            <div className="text-3xl mb-2">🔑</div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Reset Password</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Enter your email and we'll send a reset link
            </p>
          </div>

          {forgotSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="text-4xl">📬</div>
              <p className="text-[var(--color-text-primary)] font-semibold">Email sent!</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Check your inbox at <strong>{email}</strong> for the password reset link.
              </p>
              <button
                onClick={() => { setMode('login'); setForgotSent(false); }}
                className="text-sm font-semibold text-[var(--color-accent-text)] hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:opacity-50 text-[var(--color-text-on-accent)] font-bold py-2.5 px-4 rounded-lg transition duration-200"
              >
                {isLoading ? <Spinner /> : 'Send Reset Email'}
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-sm text-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Login / Signup Mode ───────────────────────────────────────────────

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-md mx-auto">
      <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-[var(--color-text-primary)]">
            {mode === 'login' ? 'Welcome Back' : 'Create Free Account'}
          </h2>
          <p className="text-xs md:text-sm text-[var(--color-text-secondary)]">
            {mode === 'login' ? 'Sign in to continue your streak & study plans' : 'Join thousands of students studying with AI'}
          </p>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          id="google-signin-btn"
          className="w-full flex items-center justify-center gap-3 border border-[var(--color-border)] bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] disabled:opacity-50 text-[var(--color-text-primary)] font-semibold py-2.5 px-4 rounded-lg transition duration-200"
        >
          {/* Google SVG icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="auth-fullname" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Sachin Gupta"
                  autoComplete="name"
                  className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                />
              </div>

              <div>
                <label htmlFor="auth-class" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Class / Academic Level
                </label>
                <select
                  id="auth-class"
                  value={studentClass}
                  onChange={e => setStudentClass(e.target.value)}
                  className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                >
                  <option value="Class 8th">Class 8th (Foundation)</option>
                  <option value="Class 9th">Class 9th (NCF-SE)</option>
                  <option value="Class 10th">Class 10th (CBSE / Boards)</option>
                  <option value="Class 11th">Class 11th (Science / Commerce)</option>
                  <option value="Class 12th">Class 12th (Boards Prep)</option>
                  <option value="JEE Aspirant">JEE Main & Advanced Aspirant</option>
                  <option value="NEET Aspirant">NEET Medical Aspirant</option>
                  <option value="B.Tech / College">B.Tech / College Student</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="auth-password" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={() => { setMode('forgot'); setForgotSent(false); }}
                  className="text-xs font-semibold text-[var(--color-accent-text)] hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:opacity-50 text-[var(--color-text-on-accent)] font-bold py-2.5 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? <Spinner /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle Login / Signup */}
        <p className="text-sm text-center text-[var(--color-text-secondary)]">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            id="auth-toggle-btn"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-[var(--color-accent-text)] hover:underline ml-2"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
