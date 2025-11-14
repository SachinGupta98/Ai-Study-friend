

import { User, StudyPlan, TutorChatSession, ChatMessage, Curriculum, QuizRecord, Task } from '../types';

// In a real app, this would be an API call to a backend.
// For this demo, we use localStorage as a mock database.
const USERS_KEY = 'ai-study-assistant-users';
const SESSION_KEY = 'ai-study-assistant-session';

// Helper to get all users from localStorage
const getUsers = (): Record<string, User> => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
};

// Helper to save all users to localStorage
const saveUsers = (users: Record<string, User>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// A simple (and insecure) hashing function for demonstration.
// In a real app, use a robust library like bcrypt.
const simpleHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

export const signUp = async (username: string, password: string): Promise<string> => {
    const users = getUsers();
    if (users[username]) {
        throw new Error("User already exists.");
    }
    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
    }

    const passwordHash = await simpleHash(password);
    
    users[username] = {
        username,
        passwordHash,
        studyPlans: [],
        tutorChatHistory: [],
        companionChatHistory: [],
        quizHistory: [],
    };
    
    saveUsers(users);
    sessionStorage.setItem(SESSION_KEY, username);
    return username;
};

export const login = async (username: string, password: string): Promise<string> => {
    const users = getUsers();
    const user = users[username];
    if (!user) {
        throw new Error("Invalid username or password.");
    }
    
    const passwordHash = await simpleHash(password);
    if (user.passwordHash !== passwordHash) {
        throw new Error("Invalid username or password.");
    }

    sessionStorage.setItem(SESSION_KEY, username);
    return username;
};

export const logout = () => {
    const users = localStorage.getItem(USERS_KEY);
    sessionStorage.clear();
    localStorage.clear();
    // Preserve the user database after clearing everything else
    if (users) {
        localStorage.setItem(USERS_KEY, users);
    }
};

export const getCurrentUser = (): string | null => {
    return sessionStorage.getItem(SESSION_KEY);
};

export const saveStudyPlan = async (plan: StudyPlan): Promise<void> => {
    const username = getCurrentUser();
    if (!username) {
        throw new Error("No user logged in.");
    }

    const users = getUsers();
    const user = users[username];
    if (user) {
        const existingPlanIndex = user.studyPlans.findIndex(p => p.id === plan.id);
        if (existingPlanIndex > -1) {
            // Update existing plan to persist progress
            user.studyPlans[existingPlanIndex] = plan;
        } else {
            // Add new plan to the beginning of the array
            user.studyPlans.unshift(plan);
        }
        users[username] = user;
        saveUsers(users);
    }
};

export const getStudyPlanHistory = (): StudyPlan[] => {
    const username = getCurrentUser();
    if (!username) return [];

    const users = getUsers();
    const user = users[username];
    const plans = user ? user.studyPlans : [];

    // Data migration for older plan formats
    return plans.map(plan => {
        if (!plan.weekly_plans) return { ...plan, weekly_plans: [] }; // Ensure weekly_plans exists
        
        const needsMigration = plan.weekly_plans.some(week =>
            week.daily_tasks.some(day => day.tasks.length > 0 && typeof (day.tasks[0] as any) === 'string')
        );

        if (needsMigration) {
            return {
                ...plan,
                weekly_plans: plan.weekly_plans.map(week => ({
                    ...week,
                    daily_tasks: week.daily_tasks.map(day => ({
                        ...day,
                        tasks: (day.tasks as any[]).map((task): Task =>
                            typeof task === 'string' ? { text: task, completed: false } : task
                        )
                    }))
                }))
            };
        }
        return plan;
    });
};

export const saveTutorChatSession = (session: TutorChatSession) => {
    const username = getCurrentUser();
    if (!username || !session.id || session.messages.length <= 1) return;

    const users = getUsers();
    const user = users[username];
    if (user) {
        if (!user.tutorChatHistory) user.tutorChatHistory = [];

        // Perform migration on write to ensure all stored sessions have an ID
        const migratedHistory: TutorChatSession[] = user.tutorChatHistory.map(s => {
            if (s.id) return s;
            // Create a stable, legacy ID for old sessions
            return { ...s, id: `${s.curriculum}-${s.subject}` };
        });

        const existingSessionIndex = migratedHistory.findIndex(s => s.id === session.id);
        
        const sessionToSave: TutorChatSession = {
            ...session,
            lastUpdatedAt: new Date().toISOString()
        };

        if (existingSessionIndex > -1) {
            migratedHistory[existingSessionIndex] = sessionToSave;
        } else {
            migratedHistory.push(sessionToSave);
        }
        user.tutorChatHistory = migratedHistory;
        saveUsers(users);
    }
};

export const getTutorChatHistory = (): TutorChatSession[] => {
    const username = getCurrentUser();
    if (!username) return [];

    const users = getUsers();
    const user = users[username];
    const history = user?.tutorChatHistory ?? [];

    // Data migration on read: ensure every session returned has an ID.
    return history.map(session => {
        if (session.id) return session;
        // Create a stable, legacy ID for old sessions
        return { ...session, id: `${session.curriculum}-${session.subject}` };
    });
};

export const saveCompanionChatHistory = (messages: ChatMessage[]) => {
    const username = getCurrentUser();
    if (!username || messages.length <= 1) return;

    const users = getUsers();
    const user = users[username];
    if (user) {
        user.companionChatHistory = messages;
        saveUsers(users);
    }
};

export const getCompanionChatHistory = (): ChatMessage[] => {
    const username = getCurrentUser();
    if (!username) return [];

    const users = getUsers();
    const user = users[username];
    return user?.companionChatHistory ?? [];
};

export const saveQuizResult = (result: QuizRecord) => {
    const username = getCurrentUser();
    if (!username) return;

    const users = getUsers();
    const user = users[username];
    if (user) {
        if (!user.quizHistory) user.quizHistory = [];
        user.quizHistory.push(result);
        saveUsers(users);
    }
};

export const getUserStats = () => {
    const username = getCurrentUser();
    if (!username) return null;

    const users = getUsers();
    const user = users[username];
    if (!user) return null;

    // --- Calculate Completion Dates and Task Counts ---
    const completionDates = new Set<string>();
    let totalTasksCompleted = 0;
    
    const dayMap: { [key: string]: number } = {
        'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
    };

    (user.studyPlans || []).forEach(plan => {
        const planStartDate = new Date(plan.createdAt);
        const dayOfWeekOfCreation = planStartDate.getDay(); // 0=Sun, 1=Mon...
        const startOfWeekOffset = (dayOfWeekOfCreation === 0) ? 6 : dayOfWeekOfCreation - 1;
        
        const startOfPlanWeek = new Date(planStartDate);
        startOfPlanWeek.setDate(planStartDate.getDate() - startOfWeekOffset);
        startOfPlanWeek.setHours(0, 0, 0, 0);

        (plan.weekly_plans || []).forEach(week => { // week.week is 1-based
            (week.daily_tasks || []).forEach(day => {
                const allTasksCompleted = day.tasks.length > 0 && day.tasks.every(t => t.completed);
                
                if (allTasksCompleted) {
                    const dayOffset = dayMap[day.day] ?? 0;
                    // week.week is 1-based, so weekIndex is week.week - 1
                    const weekOffset = (week.week - 1) * 7; 
                    const totalDayOffset = weekOffset + dayOffset;
                    
                    const taskDate = new Date(startOfPlanWeek);
                    taskDate.setDate(startOfPlanWeek.getDate() + totalDayOffset);
                    
                    completionDates.add(taskDate.toISOString().split('T')[0]);
                }

                (day.tasks || []).forEach(task => {
                    if (task.completed) {
                        totalTasksCompleted++;
                    }
                });
            });
        });
    });


    // --- Calculate Study Streak ---
    let currentStreak = 0;
    if (completionDates.size > 0) {
        const sortedDates = Array.from(completionDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if the most recent activity was today or yesterday to be part of a "current" streak
        if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
            currentStreak = 1;
            for (let i = 0; i < sortedDates.length - 1; i++) {
                const currentDate = new Date(sortedDates[i]);
                const nextDate = new Date(sortedDates[i+1]);
                const diffTime = currentDate.getTime() - nextDate.getTime();
                const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
                
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    break; // Streak is broken
                }
            }
        }
    }

    // --- Calculate Quiz Stats ---
    const quizzesTaken = user.quizHistory?.length || 0;
    let averageQuizScore = 0;
    if (quizzesTaken > 0 && user.quizHistory) {
        const totalScore = user.quizHistory.reduce((acc, quiz) => acc + (quiz.score / quiz.totalQuestions), 0);
        averageQuizScore = Math.round((totalScore / quizzesTaken) * 100);
    }
    
    // --- Count Plans Created ---
    const plansCreated = user.studyPlans?.length || 0;

    return {
        currentStreak,
        totalTasksCompleted,
        quizzesTaken,
        averageQuizScore,
        completionDates: Array.from(completionDates), // Pass dates for the calendar
        plansCreated,
    };
};