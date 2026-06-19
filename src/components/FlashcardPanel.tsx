import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard, FlashcardDeck } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// ─── SM-2 Algorithm ───────────────────────────────────────────────────────────
// Quality: 0=Again, 1=Hard, 2=Good, 3=Easy
function applySpacedRepetition(card: Flashcard, quality: 0 | 1 | 2 | 3): Flashcard {
    let { interval, easeFactor, repetitions } = card;

    if (quality < 2) {
        // Failed — reset
        repetitions = 0;
        interval = 1;
    } else {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        repetitions += 1;
    }

    // Update ease factor: EF' = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return { ...card, interval, easeFactor, repetitions, nextReviewDate: nextReviewDate.toISOString() };
}

// ─── Mini Markdown renderer for cards ─────────────────────────────────────────
const CardMarkdown: React.FC<{ content: string }> = ({ content }) => (
    <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        className="text-sm leading-relaxed"
    >
        {content}
    </ReactMarkdown>
);

// ─── Quality buttons config ────────────────────────────────────────────────────
const QUALITY_BUTTONS: { label: string; emoji: string; quality: 0 | 1 | 2 | 3; color: string }[] = [
    { label: 'Again',  emoji: '😵', quality: 0, color: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' },
    { label: 'Hard',   emoji: '😓', quality: 1, color: 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20' },
    { label: 'Good',   emoji: '😊', quality: 2, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' },
    { label: 'Easy',   emoji: '🚀', quality: 3, color: 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' },
];

// ─── Props ─────────────────────────────────────────────────────────────────────
interface FlashcardPanelProps {
    deck: FlashcardDeck;
    onUpdateDeck: (updatedDeck: FlashcardDeck) => void;
    onClose: () => void;
}

const FlashcardPanel: React.FC<FlashcardPanelProps> = ({ deck, onUpdateDeck, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionDone, setSessionDone] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [view, setView] = useState<'browse' | 'review'>('browse');

    // Cards due for review (nextReviewDate <= today)
    const dueCards = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return deck.cards.filter(c => c.nextReviewDate.split('T')[0] <= today);
    }, [deck.cards]);

    const reviewCards = dueCards.length > 0 ? dueCards : deck.cards;
    const currentCard = reviewCards[currentIndex];

    const handleRate = (quality: 0 | 1 | 2 | 3) => {
        const updatedCard = applySpacedRepetition(currentCard, quality);
        const updatedCards = deck.cards.map(c => c.id === updatedCard.id ? updatedCard : c);
        onUpdateDeck({ ...deck, cards: updatedCards });
        setReviewedCount(prev => prev + 1);
        setIsFlipped(false);

        if (currentIndex + 1 >= reviewCards.length) {
            setSessionDone(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionDone(false);
        setReviewedCount(0);
    };

    // ─── Browse View ──────────────────────────────────────────────────────────
    if (view === 'browse') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="rounded-xl border border-[var(--color-border)] overflow-hidden"
                style={{ background: 'var(--color-surface-primary)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                    <div>
                        <h3 className="font-bold text-sm text-[var(--color-text-primary)]">🃏 {deck.title}</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            {deck.cards.length} cards · {dueCards.length} due for review
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setView('review'); setCurrentIndex(0); setIsFlipped(false); setSessionDone(false); setReviewedCount(0); }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-text-on-accent)] hover:bg-[var(--color-accent-bg-hover)] transition"
                        >
                            {dueCards.length > 0 ? `Review ${dueCards.length} Due` : 'Review All'}
                        </button>
                        <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-lg leading-none">✕</button>
                    </div>
                </div>

                {/* Card list */}
                <div className="divide-y divide-[var(--color-border)] max-h-64 overflow-y-auto">
                    {deck.cards.map((card, i) => {
                        const today = new Date().toISOString().split('T')[0];
                        const isDue = card.nextReviewDate.split('T')[0] <= today;
                        return (
                            <div key={card.id} className="px-4 py-2.5 flex items-start gap-3">
                                <span className="text-xs font-bold text-[var(--color-text-secondary)] mt-0.5 w-5 shrink-0">{i + 1}.</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{card.question}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">{card.answer}</p>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-semibold ${isDue ? 'bg-orange-500/15 text-orange-400' : 'bg-green-500/15 text-green-400'}`}>
                                    {isDue ? 'Due' : `+${card.interval}d`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    }

    // ─── Review Session Done ───────────────────────────────────────────────────
    if (sessionDone) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-[var(--color-border)] p-6 text-center"
                style={{ background: 'var(--color-surface-primary)' }}
            >
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-bold text-[var(--color-text-primary)] mb-1">Session Complete!</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    You reviewed {reviewedCount} card{reviewedCount !== 1 ? 's' : ''}. Great work!
                </p>
                <div className="flex justify-center gap-3">
                    <button onClick={handleRestart} className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition">
                        Review Again
                    </button>
                    <button onClick={() => setView('browse')} className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-text-on-accent)] hover:bg-[var(--color-accent-bg-hover)] transition font-semibold">
                        View All Cards
                    </button>
                </div>
            </motion.div>
        );
    }

    // ─── Review Session (flip card) ────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-xl border border-[var(--color-border)] overflow-hidden"
            style={{ background: 'var(--color-surface-primary)' }}
        >
            {/* Progress header */}
            <div className="px-4 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            {currentIndex + 1} / {reviewCards.length}
                        </span>
                        <div className="flex-1 bg-[var(--color-surface-secondary)] rounded-full h-1.5">
                            <div
                                className="bg-[var(--color-accent-bg)] h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${((currentIndex) / reviewCards.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => setView('browse')} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition">
                        Browse
                    </button>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-lg leading-none">✕</button>
                </div>
            </div>

            {/* Flip Card */}
            <div className="p-4">
                <div
                    className="relative cursor-pointer select-none"
                    style={{ perspective: '1000px', minHeight: '120px' }}
                    onClick={() => setIsFlipped(prev => !prev)}
                >
                    <motion.div
                        className="relative w-full"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front */}
                        <div
                            className="w-full rounded-xl p-4 text-center border border-[var(--color-border)] min-h-[120px] flex flex-col items-center justify-center"
                            style={{ backfaceVisibility: 'hidden', background: 'var(--color-surface-secondary)' }}
                        >
                            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 font-semibold">Question</span>
                            <div className="text-sm font-semibold text-[var(--color-text-primary)] text-center">
                                <CardMarkdown content={currentCard?.question || ''} />
                            </div>
                            <span className="text-[10px] text-[var(--color-text-secondary)] mt-3 opacity-60">Tap to reveal answer</span>
                        </div>

                        {/* Back */}
                        <div
                            className="absolute inset-0 w-full rounded-xl p-4 border border-[var(--color-accent-text)]/30 min-h-[120px] flex flex-col items-center justify-center"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                background: 'var(--color-surface-secondary)',
                            }}
                        >
                            <span className="text-[10px] uppercase tracking-wider text-[var(--color-accent-text)] mb-2 font-semibold">Answer</span>
                            <div className="text-sm text-[var(--color-text-primary)] text-center">
                                <CardMarkdown content={currentCard?.answer || ''} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Rating buttons — only show when flipped */}
                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="mt-3 grid grid-cols-4 gap-2"
                        >
                            {QUALITY_BUTTONS.map(({ label, emoji, quality, color }) => (
                                <button
                                    key={label}
                                    onClick={() => handleRate(quality)}
                                    className={`flex flex-col items-center py-2 px-1 rounded-lg border text-[10px] font-bold transition-all ${color}`}
                                >
                                    <span className="text-base mb-0.5">{emoji}</span>
                                    {label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default FlashcardPanel;
