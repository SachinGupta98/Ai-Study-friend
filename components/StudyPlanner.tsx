

import React, { useState, useCallback } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { saveStudyPlan } from '../services/authService';
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

interface WeeklyPlanCardProps {
  weekData: WeeklyPlan;
  onToggleTask?: (day: string, taskIndex: number) => void;
  planCreatedAt: string;
  weekIndex: number;
}

export const WeeklyPlanCard: React.FC<WeeklyPlanCardProps> = ({ weekData, onToggleTask, planCreatedAt, weekIndex }) => {
    const [highlightedTask, setHighlightedTask] = useState<string | null>(null);

    const handleTaskClick = (day: string, taskIndex: number) => {
        if (onToggleTask) {
            onToggleTask(day, taskIndex);
            setHighlightedTask(`${day}-${taskIndex}`);
            // Remove the highlight after the animation completes
            setTimeout(() => setHighlightedTask(null), 700);
        }
    };

    const getTaskTitle = (day: string, task: Task): string => {
        if (task.completed) {
            return "Click to mark this task as incomplete.";
        }

        const dayMap: { [key: string]: number } = {
            'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
        };

        const planStartDate = new Date(planCreatedAt);
        const dayOfWeekOfCreation = planStartDate.getDay(); // 0=Sun, 1=Mon...
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

        const taskDateString = taskDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        if (taskDate.getTime() === today.getTime()) {
            return "Click to complete this task.";
        } else if (taskDate.getTime() > today.getTime()) {
            return `You can complete this task on ${taskDateString}.`;
        } else { // taskDate < today
            return `This task was for ${taskDateString}. You can only complete tasks for the current day.`;
        }
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
                                const taskTitle = getTaskTitle(dayPlan.day, task);
                                const isHighlighted = highlightedTask === `${dayPlan.day}-${idx}`;
                                return (
                                <li key={idx} className={`flex items-start gap-3 ml-4 transition-all duration-300 p-1 -m-1 rounded-md ${task.completed ? 'opacity-60' : 'opacity-100'} ${isHighlighted ? 'flash-highlight' : ''}`}>
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
    } catch (err) {
        console.error("Failed to save plan:", err);
        setError("Could not save the plan. Please try again.");
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
        alert("Sharing is not supported on this browser. You can manually copy the plan.");
        return;
    }

    const shareText = formatPlanForSharing(plan);

    try {
        await navigator.share({
            title: `My Study Plan: ${plan.plan_title}`,
            text: shareText,
        });
    } catch (error) {
        console.error("Error sharing plan:", error);
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
                const dayMap: { [key: string]: number } = {
                    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
                };
                
                const planStartDate = new Date(updatedPlan.createdAt);
                const dayOfWeekOfCreation = planStartDate.getDay(); // 0=Sun, 1=Mon...
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
                    return prevPlan; // Do not update state
                }
            }

            task.completed = !task.completed;

            // Auto-save progress
            saveStudyPlan(updatedPlan);
            return updatedPlan;
        }
        return prevPlan;
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Create Your Personalized Study Plan</h2>
        <TopicSelector 
            curriculum={curriculum}
            setCurriculum={setCurriculum}
            subject={subject}
            setSubject={setSubject}
            disabled={isLoading}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="goal" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Your Goal</label>
                <input 
                    type="text" 
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                    placeholder="e.g., Cover entire syllabus"
                />
            </div>
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Duration</label>
                <input 
                    type="text" 
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                    placeholder="e.g., 6 weeks"
                />
            </div>
        </div>
        <button
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] disabled:text-[var(--color-text-secondary)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition-transform duration-200 active:scale-95"
        >
          {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
          {isLoading ? 'Generating Plan...' : 'Generate with AI'}
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