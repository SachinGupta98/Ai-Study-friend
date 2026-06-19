/**
 * authService.ts — All data persistence functions for the AI Study Assistant.
 *
 * This file is the single source of truth for DB operations.
 * It was previously backed by Supabase; it now uses the FastAPI/PostgreSQL backend
 * via apiService.ts calls.
 *
 * The public API of every function is UNCHANGED so no other component file needs editing.
 */

import { StudyPlan, TutorChatSession, ChatMessage, QuizRecord } from '../types';
import {
    saveToken,
    clearToken,
    getSavedUsername,
    apiSignUp,
    apiLogin,
    apiGetMe,
    apiForgotPassword,
    apiGetPlans,
    apiUpsertPlan,
    apiGetSessions,
    apiUpsertSession,
    apiGetCompanionChat,
    apiSaveCompanionChat,
    apiGetStats,
    apiSaveQuizResult,
} from './apiService';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const getCurrentUser = async (): Promise<string | null> => {
    // First try the fast path: username cached in localStorage
    const cachedUsername = getSavedUsername();
    if (cachedUsername) {
        // Validate the token is still good by calling /me
        const user = await apiGetMe();
        if (user) return user.username;
        // Token invalid — clear it
        clearToken();
        return null;
    }
    return null;
};

export const signUp = async (username: string, password: string): Promise<string> => {
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
    }
    const response = await apiSignUp(username.trim(), password);
    saveToken(response.access_token, response.username);
    return response.username;
};

export const login = async (username: string, password: string): Promise<string> => {
    const response = await apiLogin(username.trim(), password);
    saveToken(response.access_token, response.username);
    return response.username;
};

export const logout = async (): Promise<void> => {
    clearToken();
};

export const forgotPassword = async (username: string): Promise<string> => {
    return apiForgotPassword(username.trim());
};

// ── Study Plans ───────────────────────────────────────────────────────────────

export const saveStudyPlan = async (plan: StudyPlan): Promise<void> => {
    await apiUpsertPlan(plan);
};

export const getStudyPlanHistory = async (): Promise<StudyPlan[]> => {
    return apiGetPlans();
};

// ── Tutor Chat Sessions ───────────────────────────────────────────────────────

export const saveTutorChatSession = async (session: TutorChatSession): Promise<void> => {
    // Only save sessions with more than the initial greeting message
    if (!session.id || session.messages.length <= 1) return;
    const sessionToSave = { ...session, lastUpdatedAt: new Date().toISOString() };
    await apiUpsertSession(sessionToSave);
};

export const getTutorChatHistory = async (): Promise<TutorChatSession[]> => {
    return apiGetSessions();
};

// ── Companion Chat ────────────────────────────────────────────────────────────

export const saveCompanionChatHistory = async (messages: ChatMessage[]): Promise<void> => {
    if (messages.length <= 1) return; // Don't save just the initial greeting
    await apiSaveCompanionChat(messages);
};

export const getCompanionChatHistory = async (): Promise<ChatMessage[]> => {
    return apiGetCompanionChat();
};

// ── Quiz Results & User Stats ─────────────────────────────────────────────────

export const saveQuizResult = async (result: QuizRecord): Promise<void> => {
    await apiSaveQuizResult(result);
};

export const getUserStats = async () => {
    return apiGetStats();
};
