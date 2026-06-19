import React, { useMemo } from 'react';
import { StudyPlan, Task } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { motion } from 'framer-motion';

interface TodaysFocusProps {
    plans: StudyPlan[];
    onToggleTask: (planId: string, weekIndex: number, day: string, taskIndex: number) => void;
}

interface TodaysTaskInfo {
    planId: string;
    planTitle: string;
    subject: string;
    weekIndex: number;
    day: string;
    taskIndex: number;
    task: Task;
}

const TodaysFocus: React.FC<TodaysFocusProps> = ({ plans, onToggleTask }) => {

    const todaysTasks = useMemo(() => {
        const tasksForToday: TodaysTaskInfo[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayMap: { [key: string]: number } = {
            'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
        };

        plans.forEach(plan => {
            const planStartDate = new Date(plan.createdAt);
            const dayOfWeekOfCreation = planStartDate.getDay();
            const startOfWeekOffset = (dayOfWeekOfCreation === 0) ? 6 : dayOfWeekOfCreation - 1;

            const startOfPlanWeek = new Date(planStartDate);
            startOfPlanWeek.setDate(planStartDate.getDate() - startOfWeekOffset);
            startOfPlanWeek.setHours(0, 0, 0, 0);

            (plan.weekly_plans || []).forEach((week, weekIndex) => {
                (week.daily_tasks || []).forEach((dayPlan) => {
                    const dayOffset = dayMap[dayPlan.day] ?? 0;
                    const weekOffset = weekIndex * 7;
                    const totalDayOffset = weekOffset + dayOffset;

                    const taskDate = new Date(startOfPlanWeek);
                    taskDate.setDate(startOfPlanWeek.getDate() + totalDayOffset);
                    taskDate.setHours(0, 0, 0, 0);

                    if (taskDate.getTime() === today.getTime()) {
                        dayPlan.tasks.forEach((task, taskIndex) => {
                            tasksForToday.push({
                                planId: plan.id,
                                planTitle: plan.plan_title,
                                subject: plan.subject,
                                weekIndex,
                                day: dayPlan.day,
                                taskIndex,
                                task
                            });
                        });
                    }
                });
            });
        });

        return tasksForToday;
    }, [plans]);

    if (plans.length === 0) return null;

    const completedCount = todaysTasks.filter(t => t.task.completed).length;
    const totalCount = todaysTasks.length;
    const progressPerc = totalCount === 0 ? 100 : Math.round((completedCount / totalCount) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-gradient-to-br from-[var(--color-surface-secondary)] to-[var(--color-surface-primary)] border border-[var(--color-accent-text)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[var(--color-accent-bg)]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">

                {/* Progress Ring */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-border)" strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke="var(--color-accent-bg)"
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * progressPerc) / 100}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-[var(--color-text-primary)]">{progressPerc}%</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
                        Today's Focus
                        {progressPerc === 100 && totalCount > 0 && <span className="text-xl">🔥</span>}
                    </h2>
                    <p className="text-[var(--color-text-secondary)] mb-4 mt-1">
                        {totalCount === 0
                            ? "You don't have any tasks scheduled for today. Relax or review!"
                            : progressPerc === 100
                                ? "Incredible work! You crushed all your goals for today."
                                : `You have ${totalCount - completedCount} tasks left to conquer today.`}
                    </p>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {todaysTasks.map((info, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${info.task.completed ? 'bg-[var(--color-surface-primary)]/50 border-[var(--color-border)] opacity-60' : 'bg-[var(--color-surface-primary)] border-[var(--color-accent-bg)]/40 shadow-sm hover:border-[var(--color-accent-bg)] hover:shadow-md cursor-pointer'}`}
                                onClick={() => onToggleTask(info.planId, info.weekIndex, info.day, info.taskIndex)}
                            >
                                <div className="mt-0.5">
                                    {info.task.completed ? (
                                        <CheckCircleIcon className="w-5 h-5 text-[var(--color-accent-text)]" />
                                    ) : (
                                        <div className="w-5 h-5 rounded border-2 border-[var(--color-text-secondary)] hover:border-[var(--color-accent-bg)] transition-colors"></div>
                                    )}
                                </div>
                                <div>
                                    <p className={`font-medium ${info.task.completed ? 'text-[var(--color-text-secondary)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                                        {info.task.text}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                        {info.planTitle} • {info.subject}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TodaysFocus;
