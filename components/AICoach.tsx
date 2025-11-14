

import React, { useState } from 'react';
import { getAICoachInsight } from '../services/geminiService';
import { CoachIcon } from './icons/CoachIcon';
import Spinner from './Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface AICoachProps {
    stats: {
        currentStreak: number;
        totalTasksCompleted: number;
        quizzesTaken: number;
        averageQuizScore: number;
        plansCreated: number;
    };
}

const AICoach: React.FC<AICoachProps> = ({ stats }) => {
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetInsight = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAICoachInsight(stats);
            setInsight(result);
        } catch (err: any) {
            setError(err.message || "Could not fetch insights. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                <CoachIcon className="w-6 h-6 text-[var(--color-accent-text)]" />
                AI Coach Insights
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">Get personalized feedback and suggestions on your study habits based on your progress.</p>
            
            {!insight && !isLoading && (
                 <button
                    onClick={handleGetInsight}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition-transform duration-200 active:scale-95"
                >
                    <SparklesIcon className="w-5 h-5" />
                    Get AI Insights
                </button>
            )}

            {isLoading && <div className="flex justify-center items-center p-4"><Spinner /></div>}
            
            {error && (
                <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger-text)] p-3 rounded-md text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={handleGetInsight}
                        className="font-semibold bg-[var(--color-danger-text)]/10 hover:bg-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] py-1 px-3 rounded-md transition-colors ml-4"
                    >
                        Retry
                    </button>
                </div>
            )}

            {insight && (
                <div className="mt-4 p-4 bg-[var(--color-surface-secondary)]/50 border-l-4 border-[var(--color-accent-text)] rounded">
                    <p className="text-[var(--color-text-primary)] italic">{insight}</p>
                </div>
            )}
        </div>
    );
};

export default AICoach;