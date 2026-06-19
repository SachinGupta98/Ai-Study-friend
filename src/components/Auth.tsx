
import React, { useState, FormEvent } from 'react';
import { login, signUp, forgotPassword } from '../services/authService';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

interface AuthProps {
  onAuthSuccess: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authFunction = isLogin ? login : signUp;
      const result = await authFunction(username, password);
      onAuthSuccess(result);
      toast.success(isLogin ? "Logged in successfully!" : "Account created successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const forgotUsername = prompt("Please enter your username to reset your password:");
    if (!forgotUsername) return;

    setIsLoading(true);
    try {
      const message = await forgotPassword(forgotUsername);
      toast.success(message); // Show the success message from the service
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
              {isLogin && (
                <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-[var(--color-accent-text)] hover:underline">
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition duration-200"
          >
            {isLoading ? <Spinner /> : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="text-sm text-center text-[var(--color-text-secondary)]">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-[var(--color-accent-text)] hover:underline ml-2">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
