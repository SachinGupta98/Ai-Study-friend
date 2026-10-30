import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { simplifyExplanation } from '../services/geminiService';
import Spinner from './Spinner';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';
import { ChatMessage } from '../types';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import toast from 'react-hot-toast';

/**
 * Normalizes LaTeX math text from AI responses:
 * 1. Cleans up broken model outputs like $70\text{k} -> $70k
 * 2. Escapes monetary amounts ($70k, $100, $150k) with \$ so remark-math does not mistake currency for math
 * 3. Preserves legitimate inline math ($...$) and block math ($$...$$)
 */
export const sanitizeLatexContent = (text: string): string => {
    if (!text) return '';
    // Fix $70\text{k} or $95\text{k} into $70k
    let cleaned = text.replace(/\$(\d+(?:\.\d+)?)\\text\{([a-zA-Z]+)\}/g, '$$$1$2');
    // Escape monetary currency dollar signs immediately preceding numbers or ranges (e.g. $70k, $110 - $150k)
    cleaned = cleaned.replace(/(^|[^\\])\$(\d[\d,.]*(?:k|m|b|K|M|B)?(?:\b|\s*-\s*\$?\d[\d,.]*(?:k|m|b|K|M|B)?\b))/g, '$1\\$$2');
    return cleaned;
};

export const UserMessage: React.FC<{ text: string; image?: string }> = ({ text, image }) => (
    <div className="flex justify-end slide-in-bottom my-3">
        <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white rounded-2xl rounded-tr-xs p-4 sm:p-5 max-w-[85%] md:max-w-[75%] shadow-md border border-cyan-400/20 break-words">
            {image && (
                <img
                    src={image}
                    alt="User upload"
                    className="rounded-xl mb-3 max-w-full h-auto border border-white/20 shadow-sm"
                    style={{ maxWidth: '360px' }}
                />
            )}
            {text && <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{text}</p>}
        </div>
    </div>
);

// Custom component to render the <pre> tag with a copy button
const PreWithCopy: React.FC<React.ComponentPropsWithoutRef<'pre'>> = ({ children }) => {
    const [copied, setCopied] = useState(false);

    const codeElement = React.Children.only(children) as React.ReactElement<HTMLElement>;
    const codeString = codeElement.props.children ? String(codeElement.props.children).replace(/\n$/, '') : '';
    const language = codeElement.props.className?.replace('language-', '') || 'text';

    const handleCopy = () => {
        if (codeString) {
            navigator.clipboard.writeText(codeString).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }, (err) => {
                console.error('Failed to copy code: ', err);
            });
        }
    };

    return (
        <div className="relative group bg-[var(--color-surface-primary)]/90 rounded-xl my-4 border border-[var(--color-border)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] text-xs px-3.5 py-2 border-b border-[var(--color-border)]">
                <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[var(--color-accent-text)]">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--color-text-primary)] transition-colors px-2 py-0.5 rounded hover:bg-[var(--color-surface-tertiary)]"
                    aria-label="Copy code to clipboard"
                >
                    {copied ? (
                        <>
                            <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-green-500 font-bold">Copied</span>
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">{children}</pre>
        </div>
    );
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
            pre: PreWithCopy,
            table: ({ node, ...props }) => (
                <div className="my-4 overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-sm">
                    <table className="min-w-full divide-y divide-[var(--color-border)] text-sm" {...props} />
                </div>
            ),
        }}
    >
        {content}
    </ReactMarkdown>
);

export const ModelMessage: React.FC<{ children?: React.ReactNode; message?: ChatMessage }> = ({ children, message }) => {
    const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
    const [isSimplifying, setIsSimplifying] = useState(false);
    const [simplifyError, setSimplifyError] = useState<string | null>(null);
    const [copiedMessage, setCopiedMessage] = useState(false);

    const { isPlaying: isSpeaking, playAudio, stopAudio } = useAudioPlayback();
    const [isFetchingAudio, setIsFetchingAudio] = useState(false);

    const originalText = message?.text ?? (typeof children === 'string' ? children : null);
    const sources = message?.sources;
    const canBeSimplified = originalText && originalText.split(' ').length > 15;

    const handleCopyAll = () => {
        if (!originalText) return;
        navigator.clipboard.writeText(originalText).then(() => {
            setCopiedMessage(true);
            toast.success("Response copied to clipboard!");
            setTimeout(() => setCopiedMessage(false), 2000);
        }).catch(err => {
            console.error("Failed to copy response:", err);
        });
    };

    const handleToggleSpeak = async () => {
        if (isSpeaking || isFetchingAudio) {
            stopAudio();
            setIsFetchingAudio(false);
            return;
        }

        if (!originalText) return;

        setIsFetchingAudio(true);
        try {
            await playAudio(originalText);
        } catch (error) {
            console.error("Failed to play audio:", error);
            toast.error("Sorry, could not generate audio for this message.");
        } finally {
            setIsFetchingAudio(false);
        }
    };

    const handleSimplify = async () => {
        if (!originalText || isSimplifying) return;
        setIsSimplifying(true);
        setSimplifyError(null);
        setSimplifiedText(null);
        try {
            const result = await simplifyExplanation(originalText);
            setSimplifiedText(result);
        } catch (err: any) {
            setSimplifyError(err.message || 'Failed to simplify.');
        } finally {
            setIsSimplifying(false);
        }
    };

    return (
        <div className="w-full slide-in-bottom my-4">
            <div className="w-full rounded-2xl bg-[var(--color-surface-secondary)]/90 border border-[var(--color-border)] p-4 sm:p-6 shadow-sm overflow-hidden transition-all duration-200">
                {/* Header: AI Badge on Left, Action Tools on Right */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-sm shadow-md text-white flex-shrink-0">
                            🧠
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs sm:text-sm text-[var(--color-text-primary)]">
                                    Vidya AI
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                                    PRO
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex items-center gap-1">
                        {originalText && (
                            <button
                                onClick={handleCopyAll}
                                className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] rounded-lg hover:bg-[var(--color-surface-tertiary)] transition"
                                title="Copy response"
                                aria-label="Copy response"
                            >
                                {copiedMessage ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}
                            </button>
                        )}
                        {canBeSimplified && !simplifiedText && (
                            <button
                                onClick={handleSimplify}
                                disabled={isSimplifying}
                                className="p-1.5 text-[var(--color-text-secondary)] hover:text-amber-400 rounded-lg hover:bg-[var(--color-surface-tertiary)] transition"
                                title="Explain Like I'm 10"
                                aria-label="Simplify explanation"
                            >
                                {isSimplifying ? <Spinner className="w-4 h-4" /> : <LightbulbIcon className="w-4 h-4" />}
                            </button>
                        )}
                        {originalText && (
                            <button
                                onClick={handleToggleSpeak}
                                disabled={isFetchingAudio}
                                className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] rounded-lg hover:bg-[var(--color-surface-tertiary)] transition"
                                title={isSpeaking ? "Stop reading" : "Read aloud"}
                                aria-label="Text to speech"
                            >
                                {isFetchingAudio ? <Spinner className="w-4 h-4" /> : (isSpeaking ? <StopCircleIcon className="w-4 h-4 text-red-500" /> : <SpeakerWaveIcon className="w-4 h-4" />)}
                            </button>
                        )}
                    </div>
                </div>

                {/* Markdown Body: Full responsive width, centered typography, clean KaTeX formulas */}
                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--color-text-primary)] leading-relaxed break-words overflow-x-auto dark:prose-invert">
                    {originalText ? (
                        <MarkdownRenderer content={sanitizeLatexContent(originalText)} />
                    ) : (
                        children
                    )}
                </div>

                {/* Simplified Explanation Box */}
                {(simplifiedText || isSimplifying || simplifyError) && (
                    <div className="mt-4 pt-3.5 border-t border-[var(--color-border)]/60 bg-amber-500/5 rounded-xl p-3 border border-amber-500/20">
                        <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--color-warning-text)] mb-2">
                            <LightbulbIcon className="w-4 h-4" />
                            Simplified Explanation (Easy to Grasp)
                        </h4>
                        {isSimplifying && <div className="flex justify-center p-2"><Spinner /></div>}
                        {simplifyError && (
                            <div className="bg-[var(--color-danger-bg)]/50 border border-[var(--color-danger-border)]/50 text-[var(--color-danger-text)] p-2 mt-2 rounded-md text-xs flex items-center justify-between">
                                <span>{simplifyError}</span>
                                <button
                                    onClick={handleSimplify}
                                    className="font-semibold bg-[var(--color-danger-text)]/10 hover:bg-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] py-0.5 px-2 rounded-md transition-colors ml-2"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                        {simplifiedText && (
                            <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] dark:prose-invert">
                                <MarkdownRenderer content={sanitizeLatexContent(simplifiedText)} />
                            </div>
                        )}
                    </div>
                )}

                {/* Web Sources */}
                {sources && sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--color-border)]/60">
                        <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                            Sources & References:
                        </h4>
                        <ul className="space-y-1.5">
                            {sources.map((source, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-xs text-[var(--color-text-secondary)] mt-0.5">[{index + 1}]</span>
                                    <a
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[var(--color-accent-text)] hover:underline break-all"
                                        title={source.uri}
                                    >
                                        {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
