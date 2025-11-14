import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    getStudyPlanHistory, 
    getTutorChatHistory, 
    getCompanionChatHistory, 
    saveStudyPlan,
    getUserStats
} from '../services/authService';
import { StudyPlan, TutorChatSession, ChatMessage } from '../types';
import { WeeklyPlanCard } from './StudyPlanner';
import { UserMessage, ModelMessage } from './ChatMessage';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { GeneralChatIcon } from './icons/GeneralChatIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { FireIcon } from './icons/FireIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import Spinner from './Spinner';
import StatsCard from './StatsCard';
import StreakCalendar from './StreakCalendar';
import AICoach from './AICoach';
import AchievementBadge from './AchievementBadge';
import { SearchIcon } from './icons/SearchIcon';
import { SortAscendingIcon } from './icons/SortAscendingIcon';
import { SortDescendingIcon } from './icons/SortDescendingIcon';

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

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; }> = ({ icon, title, subtitle }) => (
    <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] opacity-40">
            {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
    </div>
);

const PlanHistoryItem: React.FC<{ plan: StudyPlan; onPlanUpdate: (updatedPlan: StudyPlan) => void; }> = ({ plan, onPlanUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const progress = useMemo(() => calculatePlanProgress(plan), [plan]);

    const createdAt = new Date(plan.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    
    const handleToggleTask = useCallback((weekIndex: number, day: string, taskIndex: number) => {
        const updatedPlan = JSON.parse(JSON.stringify(plan)) as StudyPlan;
        const week = updatedPlan.weekly_plans[weekIndex];
        if (!week) return;
        const dayTasks = week.daily_tasks.find(d => d.day === day);
        if (dayTasks && dayTasks.tasks[taskIndex]) {
            const task = dayTasks.tasks[taskIndex];
            
            if (!task.completed) {
                const dayMap: { [key: string]: number } = {
                    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
                };
                
                const planStartDate = new Date(updatedPlan.createdAt);
                const dayOfWeekOfCreation = planStartDate.getDay();
                const startOfWeekOffset = (dayOfWeekOfCreation === 0) ? 6 : dayOfWeekOfCreation - 1;
                
                const startOfPlanWeek = new Date(planStartDate);
                startOfPlanWeek.setDate(planStartDate.getDate() - startOfWeekOffset);
                startOfPlanWeek.setHours(0, 0, 0, 0);

                const dayOffset = dayMap[day] ?? 0;
                const weekOffset = weekIndex * 7;
                const totalDayOffset = weekOffset + dayOffset;
                
                const taskDate = new Date(startOfPlanWeek);
                taskDate.setDate(startOfPlanWeek.getDate() + totalDayOffset);
                taskDate.setHours(0, 0, 0, 0);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (taskDate.getTime() !== today.getTime()) {
                    alert("You can only complete tasks for the current day.");
                    return;
                }
            }

            task.completed = !task.completed;
            onPlanUpdate(updatedPlan);
        }
    }, [plan, onPlanUpdate]);

    return (
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--color-accent-text)]/50">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{plan.plan_title}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                           {plan.curriculum} - {plan.subject} | Created on {createdAt}
                        </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 text-[var(--color-text-secondary)] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
                 {/* Progress Bar */}
                <div className="w-full bg-[var(--color-surface-secondary)] rounded-full h-2.5">
                    <div className="bg-[var(--color-accent-bg)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-right text-[var(--color-text-secondary)]">{progress}% Complete</p>
            </button>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
                    <p className="text-[var(--color-text-primary)]"><span className="font-semibold">Goal:</span> {plan.goal}</p>
                    {(plan.weekly_plans || []).map((week, index) => (
                        <WeeklyPlanCard 
                            key={week.week} 
                            weekData={week} 
                            onToggleTask={(day, taskIndex) => handleToggleTask(index, day, taskIndex)} 
                            planCreatedAt={plan.createdAt}
                            weekIndex={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ChatHistoryItem: React.FC<{ session: TutorChatSession }> = ({ session }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const lastUpdated = new Date(session.lastUpdatedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    const lastMessage = session.messages.length > 0 ? session.messages[session.messages.length - 1] : null;
    const previewText = lastMessage?.text 
        ? `${lastMessage.role === 'user' ? 'You: ' : ''}${lastMessage.text.substring(0, 70)}${lastMessage.text.length > 70 ? '...' : ''}` 
        : 'Chat session started.';

    return (
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--color-accent-text)]/50">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
                 <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{session.subject} ({session.curriculum})</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                           {session.messages.length} messages | Last updated {lastUpdated}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-2 italic truncate">
                            {previewText}
                        </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`flex-shrink-0 w-6 h-6 text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </button>
            {isExpanded && (
                 <div className="mt-4 pt-4 border-t border-[var(--color-border)] h-96 overflow-y-auto p-2 space-y-4 bg-[var(--color-surface-secondary)]/50 rounded">
                    {session.messages.map((msg, index) => (
                        msg.role === 'user' ? <UserMessage key={index} text={msg.text} image={msg.image} /> : <ModelMessage key={index}>{msg.text}</ModelMessage>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompanionChatHistoryItem: React.FC<{ messages: ChatMessage[] }> = ({ messages }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (messages.length <= 1) return null;

    return (
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--color-accent-text)]/50">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">AI Companion Chat</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                           {messages.length} messages in this conversation.
                        </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </button>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] h-96 overflow-y-auto p-2 space-y-4 bg-[var(--color-surface-secondary)]/50 rounded">
                    {messages.map((msg, index) => (
                        msg.role === 'user' ? <UserMessage key={index} text={msg.text} image={msg.image} /> : <ModelMessage key={index}>{msg.text}</ModelMessage>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- New Dashboard Component ---

interface UserStats {
    currentStreak: number;
    totalTasksCompleted: number;
    quizzesTaken: number;
    averageQuizScore: number;
    completionDates: string[];
    plansCreated: number;
}

type HistoryTab = 'plans' | 'tutor' | 'companion';
type PlanSort = 'date' | 'progress';
type ChatSort = 'date' | 'messages';
type SortDirection = 'asc' | 'desc';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
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
        const fetchData = () => {
            try {
                const userStats = getUserStats();
                setStats(userStats);
                setPlans(getStudyPlanHistory());
                setTutorChats(getTutorChatHistory());
                setCompanionChat(getCompanionChatHistory());
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const handlePlanUpdate = useCallback((updatedPlan: StudyPlan) => {
        setPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        saveStudyPlan(updatedPlan);
        const newStats = getUserStats();
        setStats(newStats);
    }, []);
    
    // Memoized filtering and sorting logic
    const sortedAndFilteredPlans = useMemo(() => {
        const filtered = plans.filter(plan =>
            plan.plan_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.curriculum.toLowerCase().includes(searchQuery.toLowerCase())
        );
        filtered.sort((a, b) => {
            if (planSort === 'date') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else { // progress
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
            } else { // messages
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
        { icon: <FireIcon className="w-8 h-8"/>, title: "7-Day Streak", description: "Maintain a study streak for 7 days.", unlocked: stats.currentStreak >= 7 },
        { icon: <FireIcon className="w-8 h-8"/>, title: "30-Day Streak", description: "Maintain a study streak for a full month.", unlocked: stats.currentStreak >= 30 },
        { icon: <CheckBadgeIcon className="w-8 h-8"/>, title: "Task Master", description: "Complete 50 tasks.", unlocked: stats.totalTasksCompleted >= 50 },
        { icon: <CheckBadgeIcon className="w-8 h-8"/>, title: "Task Legend", description: "Complete 200 tasks.", unlocked: stats.totalTasksCompleted >= 200 },
        { icon: <TrophyIcon className="w-8 h-8"/>, title: "Quiz Whiz", description: "Take 10 quizzes with an average score above 80%.", unlocked: stats.quizzesTaken >= 10 && stats.averageQuizScore > 80 },
        { icon: <BookOpenIcon className="w-8 h-8"/>, title: "Planner Pro", description: "Create 5 different study plans.", unlocked: stats.plansCreated >= 5 },
    ] : [];

    const tabButtonClasses = (tab: HistoryTab) => `
        px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors
        ${activeTab === tab 
            ? 'text-[var(--color-accent-text)] border-[var(--color-accent-text)]' 
            : 'text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-surface-secondary)] hover:border-[var(--color-text-secondary)]/50'}
    `;

    const sortButtonClasses = (isActive: boolean) => `
        px-3 py-1.5 text-xs rounded-md border transition-colors
        ${isActive 
            ? 'bg-[var(--color-accent-bg)]/10 border-[var(--color-accent-text)]/30 text-[var(--color-accent-text)]' 
            : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)]'}
    `;

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (!stats) {
        return <div className="p-8 text-center text-[var(--color-text-secondary)]">Could not load user statistics.</div>;
    }
    
    return (
        <div className="p-4 md:p-6 space-y-8">
            {/* Top Section: Stats, Calendar, Coach */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatsCard label="Current Streak" value={`${stats.currentStreak} days`} />
                        <StatsCard label="Tasks Completed" value={`${stats.totalTasksCompleted}`} />
                        <StatsCard label="Quizzes Taken" value={`${stats.quizzesTaken}`} />
                        <StatsCard label="Avg. Quiz Score" value={`${stats.averageQuizScore}%`} />
                    </div>
                    <AICoach stats={stats} />
                </div>
                <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Monthly Activity</h3>
                    <StreakCalendar completionDates={stats.completionDates} />
                </div>
            </div>

            {/* Achievements Section */}
            <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><TrophyIcon className="w-6 h-6 text-amber-500"/> Achievements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {achievements.map((ach, i) => <AchievementBadge key={i} {...ach} />)}
                </div>
            </div>
            
            {/* History Section */}
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Your History</h2>
                    <div className="relative w-full sm:w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md py-2 pl-10 pr-4 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                        />
                    </div>
                </div>
                
                {/* Tab Navigation and Sort Controls */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[var(--color-border)] mb-4">
                    <div className="flex items-center flex-wrap -mb-px">
                        <button onClick={() => setActiveTab('plans')} className={tabButtonClasses('plans')}>Study Plans</button>
                        <button onClick={() => setActiveTab('tutor')} className={tabButtonClasses('tutor')}>AI Tutor Chats</button>
                        <button onClick={() => setActiveTab('companion')} className={tabButtonClasses('companion')}>Companion Chat</button>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeTab === 'plans' && (
                            <>
                                <span className="text-xs text-[var(--color-text-secondary)]">Sort by:</span>
                                <button onClick={() => setPlanSort('date')} className={sortButtonClasses(planSort === 'date')}>Date</button>
                                <button onClick={() => setPlanSort('progress')} className={sortButtonClasses(planSort === 'progress')}>Progress</button>
                            </>
                        )}
                         {activeTab === 'tutor' && (
                            <>
                                <span className="text-xs text-[var(--color-text-secondary)]">Sort by:</span>
                                <button onClick={() => setChatSort('date')} className={sortButtonClasses(chatSort === 'date')}>Date</button>
                                <button onClick={() => setChatSort('messages')} className={sortButtonClasses(chatSort === 'messages')}>Messages</button>
                            </>
                        )}
                        {(activeTab === 'plans' || activeTab === 'tutor') && (
                            <button onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition rounded-md hover:bg-[var(--color-surface-secondary)]">
                                {sortDirection === 'desc' ? <SortDescendingIcon className="w-5 h-5" /> : <SortAscendingIcon className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                    {activeTab === 'plans' && (
                        sortedAndFilteredPlans.length > 0 ? (
                            sortedAndFilteredPlans.map(plan => <PlanHistoryItem key={plan.id} plan={plan} onPlanUpdate={handlePlanUpdate} />)
                        ) : (
                            <EmptyState 
                                icon={<BookOpenIcon />} 
                                title={searchQuery ? "No Plans Match Your Search" : "No Study Plans Yet"}
                                subtitle={searchQuery ? "Try a different search term." : "Create a new study plan in the 'Planner' tab to get started."}
                            />
                        )
                    )}
                    {activeTab === 'tutor' && (
                        sortedAndFilteredTutorChats.length > 0 ? (
                           sortedAndFilteredTutorChats.map(session => <ChatHistoryItem key={session.id} session={session} />)
                        ) : (
                             <EmptyState 
                                icon={<ChatBubbleIcon />} 
                                title={searchQuery ? "No Chats Match Your Search" : "No Tutor Chats Yet"}
                                subtitle={searchQuery ? "Try a different search term." : "Start a conversation with the 'AI Tutor' to see your history here."}
                            />
                        )
                    )}
                    {activeTab === 'companion' && (
                        companionChatMatchesSearch ? (
                            <CompanionChatHistoryItem messages={companionChat} />
                        ) : (
                            <EmptyState 
                                icon={<GeneralChatIcon />} 
                                title={searchQuery ? "No Companion Chat Match" : "No Companion Chat Yet"}
                                subtitle={searchQuery ? "Your search didn't match any messages in this chat." : "Talk with your 'Companion' and the conversation will be saved."}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
