import React, { useState } from 'react';
import { Quiz } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface QuizModalProps {
    quiz: Quiz;
    curriculum: string;
    subject: string;
    onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ quiz, curriculum, subject, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>(new Array(quiz.questions.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = quiz.questions[currentIndex];

    const handleSelectOption = (option: string) => {
        if (isFinished) return;
        const updated = [...userAnswers];
        updated[currentIndex] = option;
        setUserAnswers(updated);
    };

    const handleNext = () => {
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const score = userAnswers.reduce((acc, ans, i) => {
        return ans === quiz.questions[i].correct_answer ? acc + 1 : acc;
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                            {curriculum} • {subject}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)]">
                            {isFinished ? '🎉 Quiz Completed!' : `Question ${currentIndex + 1} of ${quiz.questions.length}`}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-5 space-y-4">
                    {!isFinished ? (
                        <div className="space-y-4">
                            {/* Question text */}
                            <div className="text-sm md:text-base font-semibold text-[var(--color-text-primary)] leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {currentQuestion.question}
                                </ReactMarkdown>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 pt-2">
                                {currentQuestion.options.map((opt, i) => {
                                    const selected = userAnswers[currentIndex] === opt;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectOption(opt)}
                                            className={`w-full text-left p-3.5 rounded-2xl text-xs md:text-sm font-medium border transition-all duration-200 flex items-center justify-between ${
                                                selected
                                                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                                                    : 'bg-[var(--color-surface-secondary)]/80 border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-cyan-500/40 hover:bg-[var(--color-surface-secondary)]'
                                            }`}
                                        >
                                            <span>{opt}</span>
                                            {selected && <span className="text-cyan-400 font-bold">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Results summary */
                        <div className="space-y-6 text-center py-4">
                            <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mx-auto">
                                <span className="text-3xl font-black text-cyan-400">{score}/{quiz.questions.length}</span>
                                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
                                    {Math.round((score / quiz.questions.length) * 100)}% Score
                                </span>
                            </div>

                            <div className="space-y-3 text-left">
                                {quiz.questions.map((q, idx) => {
                                    const isCorrect = userAnswers[idx] === q.correct_answer;
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                                                isCorrect
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                                            }`}
                                        >
                                            <p className="font-bold text-[var(--color-text-primary)] mb-1">
                                                Q{idx + 1}: {q.question}
                                            </p>
                                            <p className="text-[11px]">
                                                Your answer: <span className="font-semibold">{userAnswers[idx] || 'Not answered'}</span>
                                            </p>
                                            {!isCorrect && (
                                                <p className="text-[11px] text-emerald-400 mt-0.5">
                                                    Correct answer: <span className="font-semibold">{q.correct_answer}</span>
                                                </p>
                                            )}
                                            {q.explanation && (
                                                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1.5 italic">
                                                    💡 {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                    {!isFinished ? (
                        <>
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white disabled:opacity-40 transition"
                            >
                                ← Prev
                            </button>
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                {userAnswers[currentIndex] ? 'Selected' : 'Choose an answer'}
                            </span>
                            <button
                                onClick={handleNext}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition"
                            >
                                {currentIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next →'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transition"
                        >
                            Close Quiz
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
