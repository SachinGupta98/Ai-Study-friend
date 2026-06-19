import React, { useState, useEffect, useRef } from 'react';
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


export const UserMessage: React.FC<{ text: string; image?: string }> = ({ text, image }) => (
    <div className="flex justify-end slide-in-bottom">
        <div className="bg-[var(--color-accent-bg)] rounded-lg p-3 max-w-lg text-[var(--color-text-on-accent)]">
            {image && <img src={image} alt="User upload" className="rounded-md mb-2 max-w-full h-auto" style={{maxWidth: '320px'}} />}
            {text && <p>{text}</p>}
        </div>
    </div>
);

// Custom component to render the <pre> tag with a copy button
const PreWithCopy: React.FC<React.ComponentPropsWithoutRef<'pre'>> = ({ children }) => {
    const [copied, setCopied] = useState(false);

    // ReactMarkdown passes a `code` element as the single child
    const codeElement = React.Children.only(children) as React.ReactElement<HTMLElement>;
    const codeString = codeElement.props.children ? String(codeElement.props.children).replace(/\n$/, '') : '';
    const language = codeElement.props.className?.replace('language-', '') || 'text';

    const handleCopy = () => {
        if (codeString) {
            navigator.clipboard.writeText(codeString).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Revert back after 2 seconds
            }, (err) => {
                console.error('Failed to copy text: ', err);
            });
        }
    };
    
    return (
        <div className="relative group bg-[var(--color-surface-primary)]/80 rounded-lg my-4">
             <div className="flex items-center justify-between bg-[var(--color-surface-secondary)]/80 text-[var(--color-text-secondary)] text-xs px-3 py-1.5 rounded-t-lg border-b border-[var(--color-border)]">
                <span>{language}</span>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--color-text-primary)] transition-colors"
                    aria-label="Copy code to clipboard"
                >
                    {copied ? (
                        <>
                            <CheckIcon className="w-4 h-4 text-green-500" />
                            Copied
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            {/* The actual <pre> tag that ReactMarkdown wants */}
            <pre className="p-4 overflow-x-auto text-sm">{children}</pre>
        </div>
    );
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
            pre: PreWithCopy,
            table: ({ node, ...props }) => <div className="table-wrapper"><table {...props} /></div>,
        }}
    >
        {content}
    </ReactMarkdown>
);

export const ModelMessage: React.FC<{ children?: React.ReactNode; message?: ChatMessage }> = ({ children, message }) => {
    const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
    const [isSimplifying, setIsSimplifying] = useState(false);
    const [simplifyError, setSimplifyError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    
    const originalText = message?.text ?? (typeof children === 'string' ? children : null);
    const sources = message?.sources;
    const canBeSimplified = originalText && originalText.split(' ').length > 15;

    // Cleanup speech synthesis on component unmount
    useEffect(() => {
        return () => {
            if (utteranceRef.current && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleToggleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else if (originalText) {
            // Stop any currently playing audio before starting a new one
            window.speechSynthesis.cancel();

            const newUtterance = new SpeechSynthesisUtterance(originalText);
            utteranceRef.current = newUtterance;
            
            newUtterance.onend = () => {
                setIsSpeaking(false);
                utteranceRef.current = null;
            };
            newUtterance.onerror = (event) => {
                console.error("SpeechSynthesisUtterance.onerror:", event);
                setIsSpeaking(false);
                utteranceRef.current = null;
            };
            
            // This is a common workaround to "wake up" the speech synthesis engine on some browsers.
            // It ensures the voice list is populated before trying to speak.
            window.speechSynthesis.getVoices();
            
            setTimeout(() => {
                window.speechSynthesis.speak(newUtterance);
                setIsSpeaking(true);
            }, 50);
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
        <div className="flex justify-start slide-in-bottom">
            <div className="relative group bg-[var(--color-surface-secondary)] rounded-lg p-3 max-w-lg">
                 {/* Action buttons container */}
                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {canBeSimplified && !simplifiedText && (
                        <button 
                            onClick={handleSimplify}
                            disabled={isSimplifying}
                            className="p-1.5 bg-[var(--color-warning-bg)] rounded-full text-white hover:bg-[var(--color-warning-bg-hover)] disabled:bg-[var(--color-surface-tertiary)]"
                            title="Explain Like I'm 10"
                        >
                        {isSimplifying ? <Spinner /> : <LightbulbIcon className="w-4 h-4" />}
                        </button>
                    )}
                    {originalText && (
                         <button 
                            onClick={handleToggleSpeak}
                            className="p-1.5 bg-[var(--color-surface-primary)] rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                            title={isSpeaking ? "Stop reading" : "Read aloud"}
                        >
                           {isSpeaking ? <StopCircleIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                <div className="prose prose-sm max-w-full prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-headings:my-4 prose-blockquote:my-3 prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-0 prose-pre:rounded-none dark:prose-invert">
                    {originalText ? (
                       <MarkdownRenderer content={originalText} />
                    ) : (
                        children
                    )}
                </div>
                
                {(simplifiedText || isSimplifying || simplifyError) && (
                     <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-warning-text)] mb-2">
                           <LightbulbIcon className="w-5 h-5" />
                           Simplified Explanation
                        </h4>
                        {isSimplifying && <div className="flex justify-center"><Spinner /></div>}
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
                            <div className="prose prose-sm max-w-full prose-p:my-2 dark:prose-invert">
                                <MarkdownRenderer content={simplifiedText} />
                            </div>
                        )}
                    </div>
                )}
                 {sources && sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50">
                        <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Sources:</h4>
                        <ul className="space-y-1.5">
                            {sources.map((source, index) => (
                                <li key={index} className="flex items-start gap-2">
                                     <span className="text-xs text-[var(--color-text-secondary)] mt-0.5">[{index + 1}]</span>
                                     <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-accent-text)] hover:underline break-all" title={source.uri}>
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