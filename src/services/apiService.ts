/**
 * apiService.ts — JWT-based HTTP client that replaces the Supabase SDK.
 *
 * All API calls go through `apiFetch()` which:
 * 1. Reads the JWT from localStorage
 * 2. Attaches it as a Bearer token
 * 3. Handles 401 → auto-logout
 * 4. Throws clear error messages from the backend
 */

// Frontend and backend are served from the same domain in production.
// Locally, Vite proxies /api to localhost:8000 (see vite.config.ts).
const API_BASE = '/api';
const TOKEN_KEY = 'vidya_ai_token';
const USERNAME_KEY = 'vidya_ai_username';

// ── Token Management ──────────────────────────────────────────────────────────

export const saveToken = (token: string, username: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
};

export const clearToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getSavedUsername = (): string | null => localStorage.getItem(USERNAME_KEY);

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
        const token = getToken();
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
            clearToken();
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

// ── Auth API Calls ────────────────────────────────────────────────────────────

export interface AuthResponse {
    access_token: string;
    token_type: string;
    username: string;
}

export const apiSignUp = async (username: string, password: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        skipAuth: true,
    });
};

export const apiLogin = async (username: string, password: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        skipAuth: true,
    });
};

export const apiGetMe = async (): Promise<{ username: string } | null> => {
    try {
        return await apiFetch<{ username: string }>('/auth/me');
    } catch {
        return null;
    }
};

export const apiForgotPassword = async (username: string): Promise<string> => {
    const data = await apiFetch<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username }),
        skipAuth: true,
    });
    return data.message;
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
