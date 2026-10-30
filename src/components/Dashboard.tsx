import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getStudyPlanHistory,
    getTutorChatHistory,
    getCompanionChatHistory,
    saveStudyPlan,
    getUserStats,
    deleteTutorChatSession,
    clearAllTutorSessions,
    clearCompanionChatHistory
} from '../services/authService';
import { TrashIcon } from './icons/TrashIcon';
import { StudyPlan, TutorChatSession, ChatMessage } from '../types';
import { WeeklyPlanCard } from './StudyPlanner';
import { UserMessage, ModelMessage } from './ChatMessage';
import { reschedulePlan } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { GeneralChatIcon } from './icons/GeneralChatIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { FireIcon } from './icons/FireIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import AICoach from './AICoach';
import AchievementBadge from './AchievementBadge';
import TodaysFocus from './TodaysFocus';
import ActivityHeatmap from './ActivityHeatmap';
import { SearchIcon } from './icons/SearchIcon';
import { SortAscendingIcon } from './icons/SortAscendingIcon';
import { SortDescendingIcon } from './icons/SortDescendingIcon';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useAuth } from '../contexts/AuthContext';

// --- Re-usable History Item Components ---

const calculatePlanProgress = (plan: StudyPlan): number => {
    let totalTasks = 0;
    let completedTasks = 0;
    (plan.weekly_plans || []).forEach(week => {
        (week.daily_tasks || []).forEach(day => {
            totalTasks += (day.tasks || []).length;
            (day.tasks || []).forEach(task => {
                if (task.completed) {
                    completedTasks++;
                }
            });
        });
    });
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; actionText?: string; onAction?: () => void }> = ({ icon, title, subtitle, actionText, onAction }) => (
    <div className="text-center py-12 px-4 rounded-2xl bg-[var(--color-surface-secondary)]/40 border border-dashed border-[var(--color-border)]">
        <div className="w-12 h-12 mx-auto text-[var(--color-text-secondary)] opacity-50 flex items-center justify-center">
            {icon}
        </div>
        <h3 className="mt-3 text-base font-bold text-[var(--color-text-primary)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">{subtitle}</p>
        {actionText && onAction && (
            <button
                onClick={onAction}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition"
            >
                {actionText}
            </button>
        )}
    </div>
);

const PlanHistoryItem: React.FC<{ plan: StudyPlan; onPlanUpdate: (updatedPlan: StudyPlan) => void; }> = ({ plan, onPlanUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const progress = useMemo(() => calculatePlanProgress(plan), [plan]);

    const createdAt = new Date(plan.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const handleReschedule = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want the AI to intelligently reschedule all missed tasks? This will permanently modify your study dates.")) return;

        setIsRescheduling(true);
        try {
            const newWeeklyPlans = await reschedulePlan(plan);
            const updatedPlan = { ...plan, weekly_plans: newWeeklyPlans };
            onPlanUpdate(updatedPlan);
            toast.success("Tasks rescheduled successfully!");
        } catch (error) {
            console.error("Reschedule failed:", error);
            toast.error("Failed to reschedule plan. Please try again later.");
        } finally {
            setIsRescheduling(false);
        }
    };

    const handleToggleTask = useCallback((weekIndex: number, day: string, taskIndex: number) => {
        const updatedPlan = JSON.parse(JSON.stringify(plan)) as StudyPlan;
        const week = updatedPlan.weekly_plans[weekIndex];
        if (!week) return;
        const dayTasks = week.daily_tasks.find(d => d.day === day);
        if (dayTasks && dayTasks.tasks[taskIndex]) {
            const task = dayTasks.tasks[taskIndex];
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : undefined;
            onPlanUpdate(updatedPlan);
        }
    }, [plan, onPlanUpdate]);

    const handleReorderTask = useCallback((weekIndex: number, sourceDay: string, sourceIndex: number, destDay: string, destIndex: number) => {
        const updatedPlan = JSON.parse(JSON.stringify(plan)) as StudyPlan;
        const week = updatedPlan.weekly_plans[weekIndex];
        if (!week) return;

        const sourceDayPlan = week.daily_tasks.find(d => d.day === sourceDay);
        const destDayPlan = week.daily_tasks.find(d => d.day === destDay);

        if (sourceDayPlan && destDayPlan) {
            const [movedTask] = sourceDayPlan.tasks.splice(sourceIndex, 1);
            destDayPlan.tasks.splice(destIndex, 0, movedTask);
            onPlanUpdate(updatedPlan);
        }
    }, [plan, onPlanUpdate]);

    return (
        <div className="bg-[var(--color-surface-primary)]/70 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg shadow-sm">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left space-y-3 relative group">
                <div className="flex justify-between items-start pr-12">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">📌</span>
                            <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-cyan-400 transition">
                                {plan.plan_title}
                            </h3>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)] font-semibold text-cyan-400 mr-2">
                                {plan.curriculum}
                            </span>
                            {plan.subject} • Created on {createdAt}
                        </p>
                    </div>
                </div>

                <div className="absolute top-0 right-0 flex items-center gap-2">
                    {progress < 100 && (
                        <button
                            onClick={handleReschedule}
                            disabled={isRescheduling}
                            title="AI Auto-Reschedule Missed Tasks"
                            className="p-2 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 transition rounded-xl"
                        >
                            {isRescheduling ? <Spinner className="w-4 h-4 !text-cyan-400" /> : <SparklesIcon className="w-4 h-4" />}
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Clear all AI companion chat history? This cannot be undone.")) {
                                    onClearCompanionChat();
                                }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition flex items-center gap-1.5"
                            title="Clear companion conversation"
                        >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span>Clear Chat</span>
                        </button>
                        <div className={`w-8 h-8 rounded-xl bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="w-full bg-[var(--color-surface-secondary)] rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)]">
                        <span>Progress</span>
                        <span className="font-bold text-cyan-400">{progress}% Complete</span>
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
                    <p className="text-xs text-[var(--color-text-primary)]">
                        <span className="font-bold text-[var(--color-text-secondary)]">Goal:</span> {plan.goal}
                    </p>
                    {(plan.weekly_plans || []).map((week, index) => (
                        <WeeklyPlanCard
                            key={week.week}
                            weekData={week}
                            onToggleTask={(day, taskIndex) => handleToggleTask(index, day, taskIndex)}
                            onReorderTask={(sourceDay, sourceIndex, destDay, destIndex) => handleReorderTask(index, sourceDay, sourceIndex, destDay, destIndex)}
                            planCreatedAt={plan.createdAt}
                            weekIndex={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ChatHistoryItem: React.FC<{
    session: TutorChatSession;
    onDeleteSession: (sessionId: string) => void;
}> = ({ session, onDeleteSession }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const lastUpdated = new Date(session.lastUpdatedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    const lastMessage = session.messages.length > 0 ? session.messages[session.messages.length - 1] : null;
    const previewText = lastMessage?.text
        ? `${lastMessage.role === 'user' ? 'You: ' : ''}${lastMessage.text.substring(0, 80)}${lastMessage.text.length > 80 ? '...' : ''}`
        : 'Chat session started.';

    return (
        <div className="bg-[var(--color-surface-primary)]/70 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg shadow-sm">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">💬</span>
                            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                                {session.subject} ({session.curriculum})
                            </h3>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {session.messages.length} messages • Last active {lastUpdated}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2 italic line-clamp-1 bg-[var(--color-surface-secondary)]/50 p-2 rounded-xl border border-[var(--color-border)]">
                            {previewText}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete chat session for ${session.subject}?`)) {
                                    onDeleteSession(session.id);
                                }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                            title="Delete this chat session"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className={`w-8 h-8 rounded-xl bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                        </div>
                    </div>
                </div>
            </button>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] max-h-96 overflow-y-auto p-3 space-y-3 bg-[var(--color-surface-secondary)]/40 rounded-2xl">
                    {session.messages.map((msg, index) => (
                        msg.role === 'user' ? <UserMessage key={index} text={msg.text} image={msg.image} /> : <ModelMessage key={index} message={msg} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CompanionChatHistoryItem: React.FC<{
    messages: ChatMessage[];
    onClearCompanionChat: () => void;
}> = ({ messages, onClearCompanionChat }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (messages.length <= 1) return null;

    return (
        <div className="bg-[var(--color-surface-primary)]/70 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg shadow-sm">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🤖</span>
                            <h3 className="text-base font-bold text-[var(--color-text-primary)]">AI Companion Chat</h3>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {messages.length} messages in this active conversation
                        </p>
                    </div>
                    <div className={`w-8 h-8 rounded-xl bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                    </div>
                </div>
            </button>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] max-h-96 overflow-y-auto p-3 space-y-3 bg-[var(--color-surface-secondary)]/40 rounded-2xl">
                    {messages.map((msg, index) => (
                        msg.role === 'user' ? <UserMessage key={index} text={msg.text} image={msg.image} /> : <ModelMessage key={index} message={msg} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Dashboard ---

interface UserStats {
    currentStreak: number;
    totalTasksCompleted: number;
    quizzesTaken: number;
    averageQuizScore: number;
    completionDates: string[];
    plansCreated: number;
    studySessionsCount?: number;
    totalStudyMinutes?: number;
}

type HistoryTab = 'plans' | 'tutor' | 'companion';
type PlanSort = 'date' | 'progress';
type ChatSort = 'date' | 'messages';
type SortDirection = 'asc' | 'desc';

interface DashboardProps {
    onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { togglePanel } = usePomodoro();
    const { profile } = useAuth();

    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statsErrorMsg, setStatsErrorMsg] = useState<string | null>(null);

    // History states
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [tutorChats, setTutorChats] = useState<TutorChatSession[]>([]);
    const [companionChat, setCompanionChat] = useState<ChatMessage[]>([]);

    // UI states
    const [activeTab, setActiveTab] = useState<HistoryTab>('plans');
    const [searchQuery, setSearchQuery] = useState('');
    const [planSort, setPlanSort] = useState<PlanSort>('date');
    const [chatSort, setChatSort] = useState<ChatSort>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userStats, pbPlans, pbTutorChats, pbCompanionChat] = await Promise.all([
                    getUserStats(),
                    getStudyPlanHistory(),
                    getTutorChatHistory(),
                    getCompanionChatHistory()
                ]);

                setStats(userStats);
                setPlans(pbPlans);
                setTutorChats(pbTutorChats);
                setCompanionChat(pbCompanionChat);
            } catch (error: any) {
                console.error("Failed to load dashboard data:", error);
                setStatsErrorMsg(error.message || "Failed to load dashboard.");
                toast.error(`Dashboard Error: ${error.message || 'Unknown'}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteSession = useCallback(async (sessionId: string) => {
        try {
            await deleteTutorChatSession(sessionId);
            setTutorChats(prev => prev.filter(s => s.id !== sessionId));
            toast.success("Tutor chat session deleted.");
            const newStats = await getUserStats();
            setStats(newStats);
        } catch (err: any) {
            console.error("Failed to delete session:", err);
            toast.error("Failed to delete session.");
        }
    }, []);

    const handleClearAllSessions = useCallback(async () => {
        if (tutorChats.length === 0) return;
        if (!confirm("Are you sure you want to delete ALL tutor chat sessions? This cannot be undone.")) return;
        try {
            await clearAllTutorSessions();
            setTutorChats([]);
            toast.success("All tutor chat sessions cleared.");
            const newStats = await getUserStats();
            setStats(newStats);
        } catch (err: any) {
            console.error("Failed to clear sessions:", err);
            toast.error("Failed to clear sessions.");
        }
    }, [tutorChats]);

    const handleClearCompanionChatInDashboard = useCallback(async () => {
        try {
            await clearCompanionChatHistory();
            setCompanionChat([]);
            toast.success("Companion chat history cleared.");
            const newStats = await getUserStats();
            setStats(newStats);
        } catch (err: any) {
            console.error("Failed to clear companion chat:", err);
            toast.error("Failed to clear companion chat.");
        }
    }, []);

    const handlePlanUpdate = useCallback(async (updatedPlan: StudyPlan) => {
        setPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        await saveStudyPlan(updatedPlan);
        const newStats = await getUserStats();
        setStats(newStats);
    }, []);

    const handleToggleTaskForToday = useCallback(async (planId: string, weekIndex: number, day: string, taskIndex: number) => {
        const planToUpdate = plans.find(p => p.id === planId);
        if (!planToUpdate) return;

        const updatedPlan = JSON.parse(JSON.stringify(planToUpdate)) as StudyPlan;
        const task = updatedPlan.weekly_plans[weekIndex]?.daily_tasks.find(d => d.day === day)?.tasks[taskIndex];

        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : undefined;
            await handlePlanUpdate(updatedPlan);
        }
    }, [plans, handlePlanUpdate]);

    // Gamification Level Calculation
    const xp = useMemo(() => {
        if (!stats) return 0;
        return (
            stats.totalTasksCompleted * 15 +
            stats.quizzesTaken * 30 +
            stats.currentStreak * 50 +
            stats.plansCreated * 40 +
            (stats.studySessionsCount || 0) * 20
        );
    }, [stats]);

    const level = useMemo(() => Math.floor(xp / 150) + 1, [xp]);
    const xpInCurrentLevel = xp % 150;
    const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / 150) * 100));

    const getRankTitle = (lvl: number) => {
        if (lvl <= 2) return '🌱 Apprentice Scholar';
        if (lvl <= 5) return '⚡ Focused Achiever';
        if (lvl <= 10) return '🧠 Knowledge Master';
        return '👑 Academic Grandmaster';
    };

    // Filtered lists
    const sortedAndFilteredPlans = useMemo(() => {
        const filtered = plans.filter(plan =>
            (plan.plan_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (plan.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (plan.curriculum || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        filtered.sort((a, b) => {
            if (planSort === 'date') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return calculatePlanProgress(b) - calculatePlanProgress(a);
            }
        });
        if (sortDirection === 'asc') return filtered.reverse();
        return filtered;
    }, [plans, searchQuery, planSort, sortDirection]);

    const sortedAndFilteredTutorChats = useMemo(() => {
        const filtered = tutorChats.filter(chat =>
            chat.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.curriculum.toLowerCase().includes(searchQuery.toLowerCase())
        );
        filtered.sort((a, b) => {
            if (chatSort === 'date') {
                return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
            } else {
                return b.messages.length - a.messages.length;
            }
        });
        if (sortDirection === 'asc') return filtered.reverse();
        return filtered;
    }, [tutorChats, searchQuery, chatSort, sortDirection]);

    const companionChatMatchesSearch = useMemo(() => {
        if (!searchQuery) return true;
        if (companionChat.length <= 1) return false;
        return companionChat.some(msg => msg.text?.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [companionChat, searchQuery]);

    const achievements = stats ? [
        { icon: <FireIcon className="w-8 h-8" />, title: "First Spark", description: "Start learning: complete a study session, task, or roadmap.", unlocked: (stats.currentStreak >= 1 || stats.totalTasksCompleted >= 1 || (stats.studySessionsCount || 0) >= 1 || stats.plansCreated >= 1) },
        { icon: <FireIcon className="w-8 h-8" />, title: "3-Day Streak", description: "Maintain a study streak for 3 consecutive days.", unlocked: stats.currentStreak >= 3 },
        { icon: <FireIcon className="w-8 h-8" />, title: "7-Day Streak", description: "Maintain a study streak for 7 days.", unlocked: stats.currentStreak >= 7 },
        { icon: <BookOpenIcon className="w-8 h-8" />, title: "Active Scholar", description: "Engage in 3 interactive AI study sessions.", unlocked: (stats.studySessionsCount || 0) >= 3 },
        { icon: <CheckBadgeIcon className="w-8 h-8" />, title: "Task Master", description: "Complete 10 roadmap tasks.", unlocked: stats.totalTasksCompleted >= 10 },
        { icon: <TrophyIcon className="w-8 h-8" />, title: "Quiz Whiz", description: "Complete a quiz with at least 70% accuracy.", unlocked: stats.quizzesTaken >= 1 && stats.averageQuizScore >= 70 },
    ] : [];

    if (isLoading) {
        return <div className="flex justify-center items-center h-full py-20"><Spinner /></div>;
    }

    if (!stats) {
        return (
            <div className="p-8 text-center text-[var(--color-text-secondary)]">
                <p className="mb-2">Could not load user statistics.</p>
                {statsErrorMsg && <p className="text-xs text-[var(--color-danger-text)] font-mono">{statsErrorMsg}</p>}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-6xl mx-auto">
            {/* 🌟 Hero Gamification Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 p-6 md:p-8 shadow-2xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                            <span>LEVEL {level}</span>
                            <span>•</span>
                            <span>{getRankTitle(level)}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Welcome, {profile?.fullName || 'Student'}! 👋
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-300">
                            <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-cyan-300 font-semibold">
                                🎓 {profile?.studentClass || 'Class 10th'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-slate-300">
                                🔬 {profile?.stream || 'Science'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-slate-300">
                                🏛️ {profile?.board || 'CBSE 2026–27'}
                            </span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-300 max-w-xl mt-1">
                            Track your academic momentum, review AI roadmaps, and maintain daily learning streaks.
                        </p>

                        {/* XP Progress Bar */}
                        <div className="pt-2 max-w-md space-y-1.5">
                            <div className="flex justify-between text-xs text-slate-300 font-semibold">
                                <span>{xp} Total XP</span>
                                <span className="text-cyan-400">{150 - xpInCurrentLevel} XP to Level {level + 1}</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                                <div
                                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2.5 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                                    style={{ width: `${xpPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Shortcuts */}
                    <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2.5 flex-shrink-0">
                        <button
                            onClick={togglePanel}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>⏱️ Start Focus Session</span>
                        </button>
                        {onNavigate && (
                            <>
                                <button
                                    onClick={() => onNavigate('planner')}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>📅 Create Study Plan</span>
                                </button>
                                <button
                                    onClick={() => onNavigate('docchat')}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>📄 Chat with Document</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 📊 Today's Focus Action Hub */}
            <TodaysFocus plans={plans} onToggleTask={handleToggleTaskForToday} />

            {/* 💎 5 Glassmorphic Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-[var(--color-surface-primary)]/75 backdrop-blur-xl border border-[var(--color-border)] shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Study Sessions</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">💬</div>
                    </div>
                    <div className="mt-2.5">
                        <span className="text-2xl font-black text-[var(--color-text-primary)]">{stats.studySessionsCount || 0}</span>
                        <span className="text-xs text-[var(--color-text-secondary)] ml-1 font-semibold">active</span>
                    </div>
                    <p className="text-[10px] text-cyan-400 font-semibold mt-1">~{stats.totalStudyMinutes || 0} mins logged</p>
                </div>
                <div className="p-5 rounded-2xl bg-[var(--color-surface-primary)]/75 backdrop-blur-xl border border-[var(--color-border)] shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Current Streak</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-base">🔥</div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">{stats.currentStreak}</span>
                        <span className="text-xs text-[var(--color-text-secondary)] ml-1 font-semibold">days</span>
                    </div>
                    <p className="text-[10px] text-amber-400 font-semibold mt-1">Keep it up tomorrow!</p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--color-surface-primary)]/75 backdrop-blur-xl border border-[var(--color-border)] shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Tasks Mastered</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base">✓</div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">{stats.totalTasksCompleted}</span>
                        <span className="text-xs text-[var(--color-text-secondary)] ml-1 font-semibold">done</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-1">+15 XP earned per task</p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--color-surface-primary)]/75 backdrop-blur-xl border border-[var(--color-border)] shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Quiz Accuracy</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-base">🎯</div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">{stats.averageQuizScore}%</span>
                    </div>
                    <p className="text-[10px] text-cyan-400 font-semibold mt-1">{stats.quizzesTaken} quizzes completed</p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--color-surface-primary)]/75 backdrop-blur-xl border border-[var(--color-border)] shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Study Roadmaps</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-base">🗺️</div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">{stats.plansCreated}</span>
                        <span className="text-xs text-[var(--color-text-secondary)] ml-1 font-semibold">plans</span>
                    </div>
                    <p className="text-[10px] text-purple-400 font-semibold mt-1">Multi-week structured plans</p>
                </div>
            </div>

            {/* AI Coach & Activity Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 h-full">
                    <AICoach stats={stats} />
                </div>
                <div className="xl:col-span-2">
                    <ActivityHeatmap completionDates={stats.completionDates} />
                </div>
            </div>

            {/* 🏆 Achievements Badges */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                        Milestone Badges
                    </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {achievements.map((ach, i) => <AchievementBadge key={i} {...ach} />)}
                </div>
            </div>

            {/* 📜 History Archive Tabs */}
            <div className="bg-[var(--color-surface-primary)]/70 backdrop-blur-2xl border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                        Academic History & Archive
                    </h2>
                    <div className="relative w-full sm:w-72">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Filter plans and chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-4 text-xs md:text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-cyan-400 transition"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[var(--color-border)] pb-2">
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'plans', label: `Study Plans (${plans.length})` },
                            { id: 'tutor', label: `Tutor Sessions (${tutorChats.length})` },
                            { id: 'companion', label: `Companion Chat` },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as HistoryTab)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === t.id
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-xs'
                                        : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-secondary)]'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTab === 'plans' && (
                            <>
                                <span className="text-xs text-[var(--color-text-secondary)]">Sort:</span>
                                <button
                                    onClick={() => setPlanSort('date')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${planSort === 'date' ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400' : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                                >
                                    Date
                                </button>
                                <button
                                    onClick={() => setPlanSort('progress')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${planSort === 'progress' ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400' : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                                >
                                    Progress
                                </button>
                            </>
                        )}
                        {activeTab === 'tutor' && tutorChats.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAllSessions}
                                className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition flex items-center gap-1"
                                title="Delete all tutor sessions"
                            >
                                <TrashIcon className="w-3.5 h-3.5" />
                                <span>Clear All</span>
                            </button>
                        )}
                        {(activeTab === 'plans' || activeTab === 'tutor') && (
                            <button
                                onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                                className="p-1.5 text-[var(--color-text-secondary)] hover:text-white rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)]"
                            >
                                {sortDirection === 'desc' ? <SortDescendingIcon className="w-4 h-4" /> : <SortAscendingIcon className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {activeTab === 'plans' && (
                        sortedAndFilteredPlans.length > 0 ? (
                            sortedAndFilteredPlans.map(plan => <PlanHistoryItem key={plan.id} plan={plan} onPlanUpdate={handlePlanUpdate} />)
                        ) : (
                            <EmptyState
                                icon={<BookOpenIcon className="w-8 h-8" />}
                                title={searchQuery ? "No Plans Match Your Search" : "No Study Plans Yet"}
                                subtitle={searchQuery ? "Try a different search keyword." : "Create your first personalized study plan in the Planner tab!"}
                                actionText="Create Study Plan"
                                onAction={() => onNavigate?.('planner')}
                            />
                        )
                    )}
                    {activeTab === 'tutor' && (
                        sortedAndFilteredTutorChats.length > 0 ? (
                            sortedAndFilteredTutorChats.map(session => <ChatHistoryItem key={session.id} session={session} onDeleteSession={handleDeleteSession} />)
                        ) : (
                            <EmptyState
                                icon={<ChatBubbleIcon className="w-8 h-8" />}
                                title={searchQuery ? "No Chats Match Your Search" : "No Tutor Chats Yet"}
                                subtitle={searchQuery ? "Try searching for a different subject." : "Start learning and asking doubts with your AI Tutor."}
                                actionText="Open AI Tutor"
                                onAction={() => onNavigate?.('tutor')}
                            />
                        )
                    )}
                    {activeTab === 'companion' && (
                        companionChatMatchesSearch ? (
                            <CompanionChatHistoryItem messages={companionChat} onClearCompanionChat={handleClearCompanionChatInDashboard} />
                        ) : (
                            <EmptyState
                                icon={<GeneralChatIcon className="w-8 h-8" />}
                                title={searchQuery ? "No Companion Chat Match" : "No Companion Chat Yet"}
                                subtitle="Chat with your friendly AI study companion whenever you want!"
                                actionText="Open Companion"
                                onAction={() => onNavigate?.('companion')}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
