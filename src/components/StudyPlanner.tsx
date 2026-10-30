
import React, { useState, useCallback, useMemo } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { saveStudyPlan } from '../services/authService';
import { getOfficialSyllabus } from '../data/syllabus2026_27';
// FIX: Imported the `WeeklyPlan` type from `../types` to resolve the "Cannot find name 'WeeklyPlan'" error.
import { Curriculum, StudyPlan, WeeklyPlan, Task } from '../types';
import TopicSelector from './TopicSelector';
import Spinner from './Spinner';
import { SparklesIcon } from './icons/SparklesIcon';
import { ACADEMIC_DATA } from '../constants';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ShareIcon } from './icons/ShareIcon';
import PlanSkeleton from './PlanSkeleton';
import toast from 'react-hot-toast';

interface WeeklyPlanCardProps {
    weekData: WeeklyPlan;
    onToggleTask?: (day: string, taskIndex: number) => void;
    onReorderTask?: (sourceDay: string, sourceIndex: number, destDay: string, destIndex: number) => void;
    planCreatedAt: string;
    weekIndex: number;
}

export const WeeklyPlanCard: React.FC<WeeklyPlanCardProps> = ({ weekData, onToggleTask, onReorderTask }) => {
    const [highlightedTask, setHighlightedTask] = useState<string | null>(null);
    const [draggedItem, setDraggedItem] = useState<{ day: string, index: number } | null>(null);

    const handleTaskClick = (day: string, taskIndex: number) => {
        if (onToggleTask) {
            onToggleTask(day, taskIndex);
            setHighlightedTask(`${day}-${taskIndex}`);
            // Remove the highlight after the animation completes
            setTimeout(() => setHighlightedTask(null), 700);
        }
    };

    const getTaskTitle = (task: Task): string => {
        if (task.completed) {
            return "Click to uncheck this task.";
        }
        return "Click to mark this task as completed.";
    };

    return (
        <div className="bg-[var(--color-surface-primary)]/50 rounded-lg p-4 border border-[var(--color-border)] transition hover:border-[var(--color-accent-text)]/50 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-[var(--color-accent-text)]">{weekData.week}: {weekData.topic_focus}</h3>
            <div className="mt-3 space-y-3">
                {weekData.daily_tasks.map((dayPlan) => (
                    <div key={dayPlan.day}>
                        <p className="font-semibold text-[var(--color-text-primary)]">{dayPlan.day}</p>
                        <ul className="space-y-1 mt-1">
                            {dayPlan.tasks.map((task, idx) => {
                                const taskTitle = getTaskTitle(task);
                                const isHighlighted = highlightedTask === `${dayPlan.day}-${idx}`;
                                const isDragged = draggedItem?.day === dayPlan.day && draggedItem?.index === idx;

                                return (
                                    <li
                                        key={idx}
                                        draggable={!!onReorderTask}
                                        onDragStart={(e) => {
                                            setDraggedItem({ day: dayPlan.day, index: idx });
                                            e.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItem && onReorderTask) {
                                                onReorderTask(draggedItem.day, draggedItem.index, dayPlan.day, idx);
                                            }
                                            setDraggedItem(null);
                                        }}
                                        className={`flex items-start gap-3 ml-4 transition-all duration-300 p-1 -m-1 rounded-md 
                                            ${task.completed ? 'opacity-60' : 'opacity-100'} 
                                            ${isHighlighted ? 'flash-highlight' : ''} 
                                            ${onReorderTask ? 'cursor-grab active:cursor-grabbing hover:bg-[var(--color-surface-secondary)]/30' : ''}
                                            ${isDragged ? 'opacity-30 border-dashed border-2 border-[var(--color-accent-text)]' : ''}
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            id={`task-${weekData.week}-${dayPlan.day}-${idx}`}
                                            checked={task.completed}
                                            onChange={onToggleTask ? () => handleTaskClick(dayPlan.day, idx) : undefined}
                                            disabled={!onToggleTask}
                                            className={`mt-1 flex-shrink-0 w-4 h-4 rounded bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-accent-bg)] focus:ring-[var(--color-accent-ring)] ${onToggleTask ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            title={taskTitle}
                                        />
                                        <label
                                            htmlFor={`task-${weekData.week}-${dayPlan.day}-${idx}`}
                                            className={`text-[var(--color-text-secondary)] transition-colors duration-300 ${task.completed ? 'line-through' : ''} ${onToggleTask ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            title={taskTitle}
                                        >
                                            {task.text}
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};


const StudyPlanner: React.FC = () => {
    const [curriculum, setCurriculum] = useState<Curriculum>('JEE');
    const [subject, setSubject] = useState<string>(ACADEMIC_DATA['JEE'].subjects[0]);
    const [goal, setGoal] = useState<string>('Crack the exam with a top rank');
    const [duration, setDuration] = useState<string>('3 months');
    const [plan, setPlan] = useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
    const [showAllChapters, setShowAllChapters] = useState<boolean>(false);

    const officialSyllabus = useMemo(() => {
        return getOfficialSyllabus(curriculum, subject);
    }, [curriculum, subject]);

    const handleGeneratePlan = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPlan(null);
        setIsPlanSaved(false); // Reset save state
        try {
            const result = await generateStudyPlan(curriculum, subject, goal, duration);

            const newPlan: StudyPlan = {
                ...result,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                curriculum,
                subject,
                goal,
            };

            setPlan(newPlan);
            try {
                await saveStudyPlan(newPlan);
                setIsPlanSaved(true);
                toast.success("Study plan generated & auto-saved to your dashboard!");
            } catch (saveErr) {
                console.error("Auto-save study plan failed:", saveErr);
            }

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [curriculum, subject, goal, duration]);

    const handleSavePlan = useCallback(async () => {
        if (!plan) return;
        try {
            await saveStudyPlan(plan);
            setIsPlanSaved(true);
        } catch (err: any) {
            console.error("Failed to save plan:", err);
            setError(`Could not save the plan: ${err.message || 'Unknown error'}`);
            toast.error(`Save failed: ${err.message || 'Unknown error'}`);
        }
    }, [plan]);

    const formatPlanForSharing = (planToFormat: StudyPlan): string => {
        let shareText = `${planToFormat.plan_title}\n\n`;
        shareText += `A ${planToFormat.duration_weeks}-week roadmap for ${planToFormat.subject} (${planToFormat.curriculum})\n`;
        shareText += `Goal: ${planToFormat.goal}\n\n`;

        planToFormat.weekly_plans.forEach(week => {
            shareText += `--- WEEK ${week.week}: ${week.topic_focus} ---\n\n`;
            week.daily_tasks.forEach(day => {
                shareText += `*${day.day}*\n`;
                day.tasks.forEach(task => {
                    shareText += `- [${task.completed ? 'x' : ' '}] ${task.text}\n`;
                });
                shareText += '\n';
            });
        });

        return shareText;
    };

    const handleSharePlan = async () => {
        if (!plan) return;
        if (!navigator.share) {
            toast.error("Sharing is not supported on this browser. You can manually copy the plan.");
            return;
        }

        const shareText = formatPlanForSharing(plan);

        try {
            await navigator.share({
                title: `My Study Plan: ${plan.plan_title}`,
                text: shareText,
            });
            toast.success("Plan shared successfully!");
        } catch (error) {
            console.error("Error sharing plan:", error);
            // Ignore abort errors from the user cancelling the share dialog
            if ((error as any).name !== 'AbortError') {
                toast.error("Failed to share the plan.");
            }
        }
    };

    const handleToggleTask = useCallback((weekIndex: number, day: string, taskIndex: number) => {
        setPlan(prevPlan => {
            if (!prevPlan) return null;

            const updatedPlan = JSON.parse(JSON.stringify(prevPlan)) as StudyPlan;

            const week = updatedPlan.weekly_plans[weekIndex];
            if (!week) return prevPlan;

            const dayTasks = week.daily_tasks.find(d => d.day === day);
            if (dayTasks && dayTasks.tasks[taskIndex]) {
                const task = dayTasks.tasks[taskIndex];

                // If user is trying to mark a task as complete, check if it's for today.
                if (!task.completed) {
                    // Log the real-life date!
                    task.completedAt = new Date().toISOString();
                } else {
                    task.completedAt = undefined;
                }

                task.completed = !task.completed;

                // Fire and forget auto-save
                saveStudyPlan(updatedPlan).catch(console.error);
                return updatedPlan;
            }
            return prevPlan;
        });
    }, []);

    const handleReorderTask = useCallback((weekIndex: number, sourceDay: string, sourceIndex: number, destDay: string, destIndex: number) => {
        setPlan(prevPlan => {
            if (!prevPlan) return null;

            const updatedPlan = JSON.parse(JSON.stringify(prevPlan)) as StudyPlan;
            const week = updatedPlan.weekly_plans[weekIndex];
            if (!week) return prevPlan;

            const sourceDayPlan = week.daily_tasks.find(d => d.day === sourceDay);
            const destDayPlan = week.daily_tasks.find(d => d.day === destDay);

            if (sourceDayPlan && destDayPlan) {
                // Remove from source
                const [movedTask] = sourceDayPlan.tasks.splice(sourceIndex, 1);
                // Insert at destination
                destDayPlan.tasks.splice(destIndex, 0, movedTask);

                // Keep history updated if it was saved
                if (isPlanSaved) {
                    saveStudyPlan(updatedPlan).catch(console.error);
                }

                return updatedPlan;
            }
            return prevPlan;
        });
    }, [isPlanSaved]);

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
            <div className="bg-[var(--color-surface-primary)]/75 backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-5 shadow-xl relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📅</span>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                            Personalized AI Study Roadmap
                        </h2>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            Curated for CBSE / State Boards (Class 8–12), JEE, NEET, and competitive exams
                        </p>
                    </div>
                </div>

                <TopicSelector
                    curriculum={curriculum}
                    setCurriculum={setCurriculum}
                    subject={subject}
                    setSubject={setSubject}
                    disabled={isLoading}
                />

                {/* 🌟 2026–27 Verified Syllabus Banner & Quick Chapter Selection */}
                {officialSyllabus && (
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3 shadow-inner">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="font-bold text-xs md:text-sm text-cyan-300">
                                    Session 2026–27 Syllabus Synced ({officialSyllabus.chapters.length} Official Chapters)
                                </span>
                                {officialSyllabus.code && (
                                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 text-[10px] font-mono font-bold">
                                        Code: {officialSyllabus.code}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAllChapters(!showAllChapters)}
                                className="text-xs text-cyan-400 hover:text-cyan-200 font-bold underline underline-offset-4 transition self-start sm:self-auto"
                            >
                                {showAllChapters ? '▲ Collapse Chapter List' : `▼ Browse All ${officialSyllabus.chapters.length} Chapters`}
                            </button>
                        </div>

                        {/* Quick Selection Chapter Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-slate-400 mr-1">
                                📌 Quick Target:
                            </span>
                            {(showAllChapters ? officialSyllabus.chapters : officialSyllabus.chapters.slice(0, 7)).map((ch, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setGoal(`Master ${typeof ch.number === 'number' ? `Chapter ${ch.number}: ` : ''}${ch.name}`)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 text-xs font-medium transition active:scale-95"
                                    title={`Topics: ${ch.topics.slice(0, 3).join(', ')}...`}
                                >
                                    {typeof ch.number === 'number' ? `Ch ${ch.number}: ` : ''}{ch.name}
                                </button>
                            ))}
                            {!showAllChapters && officialSyllabus.chapters.length > 7 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllChapters(true)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-cyan-400 text-xs font-semibold"
                                >
                                    +{officialSyllabus.chapters.length - 7} more...
                                </button>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="goal" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                            🎯 Your Specific Goal
                        </label>
                        <input
                            type="text"
                            id="goal"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none transition shadow-inner font-medium"
                            placeholder="e.g., Score 95%+ in Board Exam, Master Calculus"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="duration" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                ⏳ Duration / Timeline
                            </label>
                            <div className="flex gap-1">
                                {['4 weeks', '3 months', '6 months'].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDuration(d)}
                                        className="text-[10px] px-2.5 py-1 rounded-md bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-cyan-400 transition font-medium cursor-pointer"
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input
                            type="text"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none transition shadow-inner font-medium"
                            placeholder="e.g., 6 weeks"
                        />
                    </div>
                </div>

                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 active:scale-98"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
                    <span className="text-sm font-black tracking-wide">
                        {isLoading ? 'Crafting Your Master Plan...' : 'Generate AI Study Plan'}
                    </span>
                </button>
            </div>

            {isLoading && <PlanSkeleton />}

            {error && (
                <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger-text)] p-3 rounded-md text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={handleGeneratePlan}
                        className="font-semibold bg-[var(--color-danger-text)]/10 hover:bg-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] py-1 px-3 rounded-md transition-colors ml-4"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!isLoading && plan && (
                <div className="space-y-4">
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4 text-center md:flex md:items-center md:justify-between">
                        <div className="md:text-left">
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{plan.plan_title}</h2>
                            <p className="text-[var(--color-text-secondary)]">A {plan.duration_weeks}-week roadmap for {plan.subject} ({plan.curriculum})</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center justify-center gap-2">
                            <button
                                onClick={handleSharePlan}
                                disabled={!plan}
                                className="flex items-center justify-center gap-2 w-full md:w-auto bg-[var(--color-surface-tertiary)] hover:bg-[var(--color-surface-tertiary)]/80 disabled:bg-[var(--color-surface-secondary)] disabled:text-[var(--color-text-secondary)] disabled:cursor-not-allowed text-[var(--color-text-primary)] font-bold py-2 px-4 rounded-md transition duration-200 border border-transparent"
                            >
                                <ShareIcon className="w-5 h-5" />
                                <span>Share</span>
                            </button>
                            <button
                                onClick={handleSavePlan}
                                disabled={isPlanSaved}
                                className="flex items-center justify-center gap-2 w-full md:w-auto bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-success-bg)] disabled:border-[var(--color-success-border)] disabled:text-[var(--color-success-text)] disabled:cursor-not-allowed text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition duration-200 border border-transparent disabled:border"
                            >
                                {isPlanSaved ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                                {isPlanSaved ? 'Saved to History' : 'Save Plan'}
                            </button>
                        </div>
                    </div>

                    {!isPlanSaved && (
                        <div className="bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success-text)] p-3 rounded-md text-center text-sm">
                            Save the plan to your history to start tracking your progress.
                        </div>
                    )}

                    <div className="space-y-4">
                        {plan.weekly_plans.map((week, index) => (
                            <WeeklyPlanCard
                                key={week.week}
                                weekData={week}
                                onToggleTask={isPlanSaved ? (day, taskIndex) => handleToggleTask(index, day, taskIndex) : undefined}
                                onReorderTask={(sourceDay, sourceIndex, destDay, destIndex) => handleReorderTask(index, sourceDay, sourceIndex, destDay, destIndex)}
                                planCreatedAt={plan.createdAt}
                                weekIndex={index}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyPlanner;