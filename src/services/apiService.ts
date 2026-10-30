/**
 * apiService.ts — HTTP client using Supabase JWT for authentication
 *
 * Auth is now handled by Supabase. This service:
 * 1. Gets the current Supabase session JWT
 * 2. Attaches it as a Bearer token to every API call
 * 3. Handles 401 → dispatches auth:logout event
 * 4. Throws clear error messages from the FastAPI backend
 *
 * All data API calls (plans, sessions, chats, stats) remain unchanged.
 */

import { supabase } from '../lib/supabase';

// Frontend and backend are served from the same domain in production.
// Locally, Vite proxies /api to localhost:8000 (see vite.config.ts).
const API_BASE = '/api';

// ── Token helpers (Supabase manages its own storage — these are for compatibility) ──

/** @deprecated No longer needed — Supabase manages tokens internally */
export const saveToken = (_token: string, _username: string): void => {};

/** @deprecated Use supabase.auth.signOut() instead */
export const clearToken = (): void => {};

/** Get the current Supabase JWT access token */
export const getToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

/** Get the display name from the current Supabase session */
export const getSavedUsername = (): string | null => {
  // Supabase stores the session in localStorage — we can read it synchronously
  const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-'));
  for (const key of keys) {
    try {
      const val = JSON.parse(localStorage.getItem(key) ?? '{}');
      if (val?.user?.email) return val.user.email;
    } catch { /* ignore */ }
  }
  return null;
};

// ── Core Fetch Wrapper ────────────────────────────────────────────────────────

type FetchOptions = RequestInit & { skipAuth?: boolean };

export const apiFetch = async <T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (!skipAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  // Handle empty responses (e.g., 204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 401 means token expired or invalid → force logout
    if (response.status === 401) {
      await supabase.auth.signOut();
      window.dispatchEvent(new Event('auth:logout'));
    }
    // Extract the detail message from FastAPI's error format
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
};

// ── Auth API Calls (now handled by Supabase directly, kept for compatibility) ──

export interface AuthResponse {
  access_token: string;
  token_type: string;
  username: string;
}

/** @deprecated Use supabase.auth.signUp() directly */
export const apiSignUp = async (username: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({ email: username, password });
  if (error) throw error;
  return {
    access_token: data.session?.access_token ?? '',
    token_type: 'bearer',
    username: data.user?.email ?? username,
  };
};

/** @deprecated Use supabase.auth.signInWithPassword() directly */
export const apiLogin = async (username: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
  if (error) throw error;
  return {
    access_token: data.session?.access_token ?? '',
    token_type: 'bearer',
    username: data.user?.email ?? username,
  };
};

export const apiGetMe = async (): Promise<{ username: string } | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { username: user.email ?? 'User' };
};

/** @deprecated Supabase handles password reset emails natively */
export const apiForgotPassword = async (email: string): Promise<string> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return 'Password reset email sent! Check your inbox.';
};

// ── Study Plans API Calls ─────────────────────────────────────────────────────

export const apiGetPlans = async (): Promise<any[]> => {
  const rows = await apiFetch<Array<{ id: string; data: any }>>('/plans');
  return rows.map(r => r.data);
};

export const apiUpsertPlan = async (plan: any): Promise<void> => {
  await apiFetch('/plans', {
    method: 'POST',
    body: JSON.stringify({ id: plan.id, data: plan }),
  });
};

export const apiDeletePlan = async (planId: string): Promise<void> => {
  await apiFetch(`/plans/${planId}`, { method: 'DELETE' });
};

// ── Tutor Sessions API Calls ──────────────────────────────────────────────────

export const apiGetSessions = async (): Promise<any[]> => {
  const rows = await apiFetch<Array<{ id: string; data: any }>>('/sessions');
  return rows.map(r => r.data);
};

export const apiUpsertSession = async (session: any): Promise<void> => {
  await apiFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify({ id: session.id, data: session }),
  });
};

export const apiDeleteSession = async (sessionId: string): Promise<void> => {
  await apiFetch(`/sessions/${sessionId}`, { method: 'DELETE' });
};

export const apiClearAllSessions = async (): Promise<void> => {
  await apiFetch('/sessions', { method: 'DELETE' });
};

// ── Companion Chat API Calls ──────────────────────────────────────────────────

export const apiGetCompanionChat = async (): Promise<any[]> => {
  const data = await apiFetch<{ messages: any[] }>('/chats/companion');
  return data.messages || [];
};

export const apiSaveCompanionChat = async (messages: any[]): Promise<void> => {
  await apiFetch('/chats/companion', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
};

export const apiClearCompanionChat = async (): Promise<void> => {
  await apiFetch('/chats/companion', { method: 'DELETE' });
};

// ── Stats API Calls ───────────────────────────────────────────────────────────

export const apiGetStats = async (): Promise<any | null> => {
  try {
    return await apiFetch('/stats');
  } catch {
    return null;
  }
};

export const apiSaveQuizResult = async (result: any): Promise<void> => {
  await apiFetch('/stats/quiz', {
    method: 'POST',
    body: JSON.stringify({ result }),
  });
};

export const apiSaveFocusSession = async (durationMinutes: number = 25): Promise<void> => {
  try {
    await apiFetch('/stats/focus', {
      method: 'POST',
      body: JSON.stringify({
        completedAt: new Date().toISOString(),
        durationMinutes,
      }),
    });
  } catch (err) {
    console.error("Failed to save focus session:", err);
  }
};
