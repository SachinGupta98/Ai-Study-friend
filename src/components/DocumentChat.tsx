import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromFile, ExtractedDoc } from '../utils/pdfExtractor';
import { askDocumentStream, summarizeDocument, generateQuizFromDoc } from '../services/geminiService';
import { ChatMessage, Quiz } from '../types';
import Spinner from './Spinner';
import QuizModal from './QuizModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import toast from 'react-hot-toast';

const DocumentChat: React.FC = () => {
    const [doc, setDoc] = useState<ExtractedDoc | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputQuestion, setInputQuestion] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFile = async (file: File) => {
        if (!file) return;
        setIsParsing(true);
        setDoc(null);
        setMessages([]);
        setSummary(null);
        setQuiz(null);

        try {
            const extracted = await extractTextFromFile(file);
            if (!extracted.text.trim()) {
                throw new Error("Could not extract any text from this file. It might be scanned image-only PDF.");
            }
            setDoc(extracted);
            toast.success(`Loaded "${file.name}" (${extracted.pageCount} pages, ~${extracted.wordCount} words)`);
            
            // Add initial greeting from Doc AI
            setMessages([
                {
                    role: 'model',
                    text: `Hello! I've loaded **"${file.name}"** (${extracted.pageCount} page${extracted.pageCount > 1 ? 's' : ''}, ${extracted.wordCount} words).\n\nYou can ask me any question about this document, or click one of the quick actions below to generate an **Executive Summary** or **Practice Quiz**!`
                }
            ]);
        } catch (err: any) {
            console.error("PDF extraction failed:", err);
            toast.error(err.message || "Failed to parse document");
        } finally {
            setIsParsing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleAskQuestion = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputQuestion.trim() || !doc || isStreaming) return;

        const question = inputQuestion.trim();
        setInputQuestion('');

        const userMsg: ChatMessage = { role: 'user', text: question };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setIsStreaming(true);

        // Placeholder for AI streaming reply
        const modelMsg: ChatMessage = { role: 'model', text: '' };
        setMessages([...newHistory, modelMsg]);

        try {
            const stream = askDocumentStream(doc.text, newHistory, question);
            let accumulated = '';
            for await (const chunk of stream) {
                accumulated += chunk.text;
                setMessages(prev => {
                    const copy = [...prev];
                    copy[copy.length - 1] = { role: 'model', text: accumulated };
                    return copy;
                });
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to generate answer");
            setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                    role: 'model',
                    text: `⚠️ Error generating answer: ${err.message || 'Please try again.'}`
                };
                return copy;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!doc || isSummarizing) return;
        setIsSummarizing(true);
        try {
            const result = await summarizeDocument(doc.text);
            setSummary(result);
            toast.success("Summary generated!");
        } catch (err: any) {
            toast.error(err.message || "Failed to summarize");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!doc || isGeneratingQuiz) return;
        setIsGeneratingQuiz(true);
        try {
            const generatedQuiz = await generateQuizFromDoc(doc.text);
            setQuiz(generatedQuiz);
            toast.success("Document quiz ready!");
        } catch (err: any) {
            toast.error(err.message || "Failed to generate quiz");
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)]/70 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📄</span>
                        <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                            AI Document & PDF Chat
                        </h2>
                    </div>
                    <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-1">
                        Upload NCERT chapters, lecture notes, or PDF textbooks — get instant summaries, ask questions, or take quizzes!
                    </p>
                </div>

                {doc && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] hover:border-cyan-500/50 text-[var(--color-text-primary)] transition"
                        >
                            Change File
                        </button>
                        <button
                            onClick={() => { setDoc(null); setMessages([]); setSummary(null); }}
                            className="text-xs px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Area when no doc is loaded */}
            {!doc && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 md:p-14 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
                        ${isDragging 
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-2xl scale-[1.01]' 
                            : 'border-[var(--color-border)] bg-[var(--color-surface-primary)]/40 hover:border-cyan-500/50 hover:bg-[var(--color-surface-primary)]/80'
                        }
                    `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        accept=".pdf,.txt,.md,.csv,.json"
                        className="hidden"
                    />

                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition duration-300">
                            {isParsing ? <Spinner /> : '📚'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                                {isParsing ? 'Extracting text from document...' : 'Drop your study PDF or notes here'}
                            </h3>
                            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-1">
                                Supports PDF, TXT, Markdown • Up to 40 pages analyzed instantly
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={isParsing}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs md:text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95"
                        >
                            Browse Files
                        </button>
                    </div>
                </div>
            )}

            {/* Document Active View */}
            {doc && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Doc Stats & Quick Actions */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-[var(--color-surface-primary)]/60 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-5 shadow-lg space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
                                    📑
                                </div>
                                <div className="truncate">
                                    <h4 className="font-bold text-sm text-[var(--color-text-primary)] truncate" title={doc.name}>
                                        {doc.name}
                                    </h4>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {doc.pageCount} page{doc.pageCount > 1 ? 's' : ''} • ~{doc.wordCount.toLocaleString()} words
                                    </p>
                                </div>
                            </div>

                            <hr className="border-[var(--color-border)]" />

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                    Instant AI Tools
                                </p>

                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={isSummarizing}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] transition group"
                                >
                                    <span className="flex items-center gap-2">
                                        <span>⚡</span> Executive Summary
                                    </span>
                                    {isSummarizing ? <Spinner /> : <span className="text-[var(--color-text-secondary)] group-hover:translate-x-0.5 transition">→</span>}
                                </button>

                                <button
                                    onClick={handleGenerateQuiz}
                                    disabled={isGeneratingQuiz}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] transition group"
                                >
                                    <span className="flex items-center gap-2">
                                        <span>🎯</span> Document Quiz (5 Qs)
                                    </span>
                                    {isGeneratingQuiz ? <Spinner /> : <span className="text-[var(--color-text-secondary)] group-hover:translate-x-0.5 transition">→</span>}
                                </button>
                            </div>
                        </div>

                        {/* Executive Summary Card if generated */}
                        {summary && (
                            <div className="bg-[var(--color-surface-primary)]/70 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-5 shadow-lg space-y-3 max-h-96 overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                                        📌 Document Summary
                                    </h4>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(summary); toast.success("Copied to clipboard!"); }}
                                        className="text-[10px] px-2 py-1 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="prose prose-invert prose-xs max-w-none text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                        {summary}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Interactive Chat Stream */}
                    <div className="lg:col-span-2 bg-[var(--color-surface-primary)]/60 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
                        {/* Chat Messages */}
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-sm shadow-md flex-shrink-0">
                                            🤖
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs shadow-md'
                                                : 'bg-[var(--color-surface-secondary)]/90 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-bl-xs'
                                        }`}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}
                            {isStreaming && (
                                <div className="flex items-center gap-2 text-xs text-cyan-400 pl-11">
                                    <span className="animate-pulse">● Thinking & analyzing document...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input bar */}
                        <form
                            onSubmit={handleAskQuestion}
                            className="p-3 md:p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 backdrop-blur-md flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={inputQuestion}
                                onChange={(e) => setInputQuestion(e.target.value)}
                                placeholder="Ask any doubt or question about this document..."
                                disabled={isStreaming}
                                className="flex-1 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs md:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                            />
                            <button
                                type="submit"
                                disabled={!inputQuestion.trim() || isStreaming}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs md:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5"
                            >
                                <span>Send</span>
                                <span>🚀</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Quiz Modal from Document */}
            {quiz && (
                <QuizModal
                    quiz={quiz}
                    curriculum="NCERT"
                    subject={doc?.name || "Document"}
                    onClose={() => setQuiz(null)}
                />
            )}
        </div>
    );
};

export default DocumentChat;
