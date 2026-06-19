import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import { getTutorResponseStream, formatCode, generateQuiz } from '../services/geminiService';
import { getTutorChatHistory, saveTutorChatSession, saveQuizResult } from '../services/authService';
import { Curriculum, ChatMessage, TutorChatSession, Quiz, QuizQuestion, QuizRecord } from '../types';
import TopicSelector from './TopicSelector';
import Spinner from './Spinner';
import { ACADEMIC_DATA } from '../constants';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { SendIcon } from './icons/SendIcon';
import { UserMessage, ModelMessage } from './ChatMessage';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { fileToDataUrl } from '../utils/fileUtils';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import DoubtSolver from './DoubtSolver';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { ShareIcon } from './icons/ShareIcon';
import { PdfIcon } from './icons/PdfIcon';
import TypingIndicator from './TypingIndicator';
import { QuizIcon } from './icons/QuizIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';

type TutorMode = 'selector' | 'chat' | 'doubt';

const TutorChat: React.FC = () => {
  const [tutorMode, setTutorMode] = useState<TutorMode>('selector');
  const [curriculum, setCurriculum] = useState<Curriculum>('Programming Help');
  const [subject, setSubject] = useState<string>(ACADEMIC_DATA['Programming Help'].subjects[0]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // --- Quiz State ---
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  // ------------------

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // Using `any` for SpeechRecognition for cross-browser compatibility
  
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const messagesRef = useRef(messages);
  const sessionDetailsRef = useRef({ id: currentSessionId, curriculum, subject });
  const lastUserMessageRef = useRef<ChatMessage | null>(null);


  useEffect(() => {
    messagesRef.current = messages;
    sessionDetailsRef.current = { id: currentSessionId, curriculum, subject };
  }, [messages, currentSessionId, curriculum, subject]);

  // Save chat on component unmount
  useEffect(() => {
    return () => {
      if (isSessionStarted && sessionDetailsRef.current.id && messagesRef.current.length > 1) {
          saveTutorChatSession({
              id: sessionDetailsRef.current.id,
              curriculum: sessionDetailsRef.current.curriculum,
              subject: sessionDetailsRef.current.subject,
              lastUpdatedAt: new Date().toISOString(),
              messages: messagesRef.current,
          });
      }
    };
  }, [isSessionStarted]);
  
  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported by this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    
    recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
    };

    recognition.onend = () => {
        setIsRecording(false);
    };
    
    recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
            console.log('Speech recognition stopped: No speech detected.');
        } else {
            console.error('Speech recognition error:', event.error);
        }
        setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatError]);

  useEffect(() => {
    if (selectedImage) {
        const objectUrl = URL.createObjectURL(selectedImage);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    } else {
        setPreviewUrl(null);
    }
  }, [selectedImage]);
  
  const resetQuizState = () => {
      setQuiz(null);
      setIsGeneratingQuiz(false);
      setQuizError(null);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setQuizCompleted(false);
  };

  const handleStartSession = useCallback(() => {
    const history = getTutorChatHistory();
    const savedSessions = history
        .filter(s => s.curriculum === curriculum && s.subject === subject)
        .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
    
    const latestSession = savedSessions[0];
    
    if (latestSession && latestSession.messages.length > 0) {
        setMessages(latestSession.messages);
        setCurrentSessionId(latestSession.id);
    } else {
        let initialMessage = `Hi! I'm Vidya AI, your personal tutor for ${subject}. How can I help you today? You can ask me questions or upload an image of a problem.`;
        if (curriculum === 'Programming Help') {
            initialMessage = `Hi! I'm Vidya AI, your expert coding mentor for ${subject}. Ask me to explain a concept, debug your code, or show you best practices!`;
        }
        setMessages([{ role: 'model', text: initialMessage, image: undefined }]);
        setCurrentSessionId(`session-${Date.now()}`); // Create a new unique ID
    }
    
    setIsSessionStarted(true);
  }, [curriculum, subject]);
  
  const handleChangeTopic = useCallback(() => {
    if (isSessionStarted && sessionDetailsRef.current.id && messagesRef.current.length > 1) {
        saveTutorChatSession({
            id: sessionDetailsRef.current.id,
            curriculum: sessionDetailsRef.current.curriculum,
            subject: sessionDetailsRef.current.subject,
            lastUpdatedAt: new Date().toISOString(),
            messages: messagesRef.current,
        });
    }
    setIsSessionStarted(false);
    setCurrentSessionId(null);
    resetQuizState();
  }, [isSessionStarted]);

  const handleNewChat = useCallback(() => {
    // A new chat is being started. Generate a new session ID for it.
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);

    const { curriculum, subject } = sessionDetailsRef.current;
    let initialMessage = `Hi! I'm Vidya AI, your personal tutor for ${subject}. How can I help you today? You can ask me questions or upload an image of a problem.`;
    if (curriculum === 'Programming Help') {
        initialMessage = `Hi! I'm Vidya AI, your expert coding mentor for ${subject}. Ask me to explain a concept, debug your code, or show you best practices!`;
    }
    setMessages([{ role: 'model', text: initialMessage, image: undefined }]);
    
    setInput('');
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    resetQuizState();
  }, []);

  const handleSendMessage = useCallback(async () => {
    if ((!input.trim() && !selectedImage) || isTyping || isFormatting || isRecording) return;

    const userMessageText = input.trim();
    let userMessageImage: string | undefined = undefined;
    let imagePayload: { base64: string, mimeType: string } | undefined = undefined;
    
    if (selectedImage) {
        try {
            const dataUrl = await fileToDataUrl(selectedImage);
            userMessageImage = dataUrl;
            imagePayload = {
                base64: dataUrl.split(',')[1],
                mimeType: selectedImage.type
            };
        } catch (error) {
            console.error("Error processing image:", error);
            setChatError("Failed to process image. Please try another file.");
            return;
        }
    }

    const currentHistory = messages;
    const newMessage: ChatMessage = { role: 'user', text: userMessageText, image: userMessageImage };
    lastUserMessageRef.current = newMessage;
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsTyping(true);
    setChatError(null);

    try {
        const stream = await getTutorResponseStream(
            sessionDetailsRef.current.curriculum,
            sessionDetailsRef.current.subject,
            currentHistory,
            userMessageText,
            imagePayload
        );
        let responseText = '';
        setMessages(prev => [...prev, { role: 'model', text: '', image: undefined }]);

        for await (const chunk of stream) {
            responseText += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: responseText, image: undefined };
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error from AI tutor:", error);
        setChatError((error as Error).message);
    } finally {
        setIsTyping(false);
    }
  }, [input, selectedImage, isTyping, isFormatting, isRecording, messages]);

  const handleRetrySendMessage = useCallback(async () => {
    if (!lastUserMessageRef.current) return;

    const lastMessage = lastUserMessageRef.current;
    const { text, image } = lastMessage;
    
    let imagePayload: { base64: string, mimeType: string } | undefined = undefined;
    if (image) {
        try {
            const [header, base64] = image.split(',');
            const mimeTypeMatch = header.match(/:(.*?);/);
            if (base64 && mimeTypeMatch && mimeTypeMatch[1]) {
                imagePayload = { base64, mimeType: mimeTypeMatch[1] };
            }
        } catch (error) {
            console.error("Error processing retry image:", error);
            setChatError("Could not process the image for retry.");
            return;
        }
    }

    setIsTyping(true);
    setChatError(null);
    try {
        const stream = await getTutorResponseStream(
            sessionDetailsRef.current.curriculum,
            sessionDetailsRef.current.subject,
            messages,
            text,
            imagePayload
        );
        let responseText = '';
        setMessages(prev => [...prev, { role: 'model', text: '', image: undefined }]);

        for await (const chunk of stream) {
            responseText += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: responseText, image: undefined };
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error from AI tutor on retry:", error);
        setChatError((error as Error).message);
    } finally {
        setIsTyping(false);
    }
}, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedImage(e.target.files[0]);
    }
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
        recognitionRef.current?.stop();
    } else {
        recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleRemoveImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const formatChatForSharing = (chatMessages: ChatMessage[], chatSubject: string, chatCurriculum: Curriculum): string => {
    let shareText = `AI Tutor Chat: ${chatSubject} (${chatCurriculum})\n\n---\n\n`;
    
    chatMessages.forEach(msg => {
        const prefix = msg.role === 'user' ? 'You' : 'Vidya AI';
        shareText += `${prefix}:\n`;
        if (msg.image) {
            shareText += '[Image Attached]\n';
        }
        if (msg.text) {
            shareText += `${msg.text}\n\n`;
        }
    });

    return shareText;
  };

  const handleShareChat = useCallback(async () => {
    if (messages.length <= 1) return;
    if (!navigator.share) {
        alert("Sharing is not supported on this browser.");
        return;
    }

    const shareText = formatChatForSharing(
        messages, 
        sessionDetailsRef.current.subject, 
        sessionDetailsRef.current.curriculum
    );

    try {
        await navigator.share({
            title: `AI Tutor Chat: ${sessionDetailsRef.current.subject}`,
            text: shareText,
        });
    } catch (error) {
        console.error("Error sharing chat:", error);
    }
  }, [messages]);

  const handleExportPdf = useCallback(async () => {
    if (messages.length <= 1) return;
    setIsExporting(true);

    try {
        const doc = new jsPDF();
        const margin = 15;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;
        const usableWidth = doc.internal.pageSize.width - (margin * 2);
        let y = margin;

        // Title
        doc.setFontSize(18);
        doc.text(`AI Tutor Chat: ${subject} (${curriculum})`, margin, y);
        y += lineHeight * 2;

        messages.forEach(msg => {
            // Minimum space required for a message block (prefix + one line)
            const minBlockHeight = lineHeight * 2; 
            if (y > pageHeight - margin - minBlockHeight) {
                doc.addPage();
                y = margin;
            }

            const prefix = msg.role === 'user' ? 'You:' : 'Vidya AI:';
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(prefix, margin, y);
            y += lineHeight;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            
            let content = msg.text || '';
            if (msg.image) {
                content = '[Image Attached]\n' + content;
            }

            const textLines = doc.splitTextToSize(content, usableWidth);
            
            textLines.forEach((line: string) => {
                if (y > pageHeight - margin) { // Check if current line fits
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += lineHeight;
            });

            y += lineHeight / 2; // Add a little space after each message
        });

        doc.save(`ai-tutor-${subject.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (error) {
        console.error("Error exporting PDF:", error);
    } finally {
        setIsExporting(false);
    }
  }, [messages, subject, curriculum]);

  const handleFormatCode = useCallback(async () => {
    if (!input.trim() || isFormatting || isTyping) return;

    setIsFormatting(true);
    try {
        const formattedCode = await formatCode(input);
        setInput(formattedCode);
    } catch (error) {
        console.error("Failed to format code:", error);
        // We could show a toast or a temporary error message here.
    } finally {
        setIsFormatting(false);
    }
  }, [input, isFormatting, isTyping]);
  
  const handleGenerateQuiz = useCallback(async () => {
    resetQuizState();
    setIsGeneratingQuiz(true);
    try {
      const result = await generateQuiz(sessionDetailsRef.current.curriculum, sessionDetailsRef.current.subject);
      if (result.questions && result.questions.length > 0) {
        setQuiz(result);
        setUserAnswers(new Array(result.questions.length).fill(null));
      } else {
        setQuizError("The AI couldn't generate a quiz for this topic. Please try again.");
      }
    } catch (err: any) {
      setQuizError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, []);
  
  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answer;
      return newAnswers;
    });
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    const score = userAnswers.reduce((acc, answer, index) => {
        return answer === quiz.questions[index].correct_answer ? acc + 1 : acc;
    }, 0);

    const quizRecord: QuizRecord = {
        quizTitle: `Quiz on ${sessionDetailsRef.current.subject} (${sessionDetailsRef.current.curriculum})`,
        score: score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date().toISOString()
    };
    saveQuizResult(quizRecord);
    setQuizCompleted(true);
  };
  
  if (tutorMode === 'selector') {
    return (
        <div className="p-4 md:p-8 flex flex-col justify-center items-center h-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">AI Tutor</h2>
                <p className="text-[var(--color-text-secondary)]">How would you like to get help today?</p>
            </div>
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                    onClick={() => setTutorMode('chat')} 
                    className="flex flex-col items-center justify-center text-center p-6 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-secondary)]/50 hover:border-[var(--color-accent-text)] transition-all duration-200 transform hover:-translate-y-1"
                >
                    <ChatBubbleIcon className="w-12 h-12 text-[var(--color-accent-text)] mb-3" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Start a Conversation</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Engage in a full chat session with the AI Tutor on any topic.</p>
                </button>
                <button 
                    onClick={() => setTutorMode('doubt')} 
                    className="flex flex-col items-center justify-center text-center p-6 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-secondary)]/50 hover:border-[var(--color-accent-text)] transition-all duration-200 transform hover:-translate-y-1"
                >
                    <QuestionMarkCircleIcon className="w-12 h-12 text-[var(--color-accent-text)] mb-3" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Solve a Specific Doubt</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Upload an image or text of a single problem for a step-by-step solution.</p>
                </button>
            </div>
        </div>
    );
  }
  
  if (tutorMode === 'doubt') {
    return <DoubtSolver onBack={() => setTutorMode('selector')} />;
  }
  
  // if (tutorMode === 'chat')
  if (!isSessionStarted) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center h-full">
        <div className="w-full max-w-lg bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-6 space-y-4 relative">
            <button
                onClick={() => setTutorMode('selector')}
                className="absolute top-4 left-4 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                aria-label="Go back"
                title="Go back"
            >
                <ArrowUturnLeftIcon className="w-6 h-6" />
            </button>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] text-center pt-8">Start AI Tutor Session</h2>
          <TopicSelector 
            curriculum={curriculum}
            setCurriculum={setCurriculum}
            subject={subject}
            setSubject={setSubject}
            disabled={false}
          />
          <button
            onClick={handleStartSession}
            className="w-full bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Start Session
          </button>
        </div>
      </div>
    );
  }

  const renderQuiz = () => {
    if (isGeneratingQuiz) {
        return <div className="flex-1 flex flex-col justify-center items-center"><Spinner /><p className="mt-2 text-[var(--color-text-secondary)]">Generating your quiz...</p></div>;
    }
    if (quizError) {
        return <div className="flex-1 flex flex-col justify-center items-center p-4">
             <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger-text)] p-4 rounded-md text-center max-w-md">
                <p className="font-semibold mb-1">Failed to generate quiz</p>
                <p className="text-sm mb-4">{quizError}</p>
                <div className="flex justify-center items-center gap-4">
                    <button onClick={resetQuizState} className="font-semibold text-sm bg-transparent hover:bg-[var(--color-danger-text)]/10 text-[var(--color-danger-text)] py-1 px-3 rounded-md transition-colors border border-[var(--color-danger-text)]">
                        Back to Chat
                    </button>
                    <button onClick={handleGenerateQuiz} className="font-semibold text-sm bg-[var(--color-danger-text)]/10 hover:bg-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] py-1 px-3 rounded-md transition-colors">
                        Retry
                    </button>
                </div>
             </div>
        </div>;
    }
    if (!quiz) return null;

    if (quizCompleted) {
        const score = userAnswers.reduce((acc, answer, index) => {
            return answer === quiz.questions[index].correct_answer ? acc + 1 : acc;
        }, 0);
        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">Quiz Results</h3>
                    <p className="text-lg text-[var(--color-accent-text)] font-semibold">You scored {score} out of {quiz.questions.length}</p>
                </div>
                {quiz.questions.map((q, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === q.correct_answer;
                    return (
                        <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'bg-[var(--color-success-bg)] border-[var(--color-success-border)]' : 'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]'}`}>
                            <p className="font-semibold text-[var(--color-text-primary)] mb-2">{index + 1}. {q.question}</p>
                            <p className="text-sm"><span className={`font-bold ${isCorrect ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>Your Answer:</span> {userAnswer || "Not answered"}</p>
                            {!isCorrect && <p className="text-sm"><span className="font-bold text-[var(--color-success-text)]">Correct Answer:</span> {q.correct_answer}</p>}
                            <p className="mt-2 pt-2 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]"><span className="font-semibold">Explanation:</span> {q.explanation}</p>
                        </div>
                    );
                })}
                 <div className="text-center mt-6 flex justify-center items-center gap-4">
                    <button onClick={resetQuizState} className="bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] font-semibold py-2 px-4 rounded-md transition duration-200">
                        Back to Chat
                    </button>
                     <button onClick={handleGenerateQuiz} className="bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition duration-200">
                        Start New Quiz
                    </button>
                </div>
            </div>
        );
    }
    
    const currentQ = quiz.questions[currentQuestionIndex];
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                <p className="text-sm text-center text-[var(--color-text-secondary)] mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                <p className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">{currentQ.question}</p>
                <div className="space-y-3">
                    {currentQ.options.map(option => (
                        <button 
                            key={option} 
                            onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                            className={`w-full text-left p-3 border rounded-lg transition-colors duration-200 ${userAnswers[currentQuestionIndex] === option ? 'bg-[var(--color-accent-bg)] border-[var(--color-accent-text)] text-[var(--color-text-on-accent)]' : 'bg-[var(--color-surface-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]'}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                    <button 
                        onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <button 
                            onClick={handleSubmitQuiz}
                            disabled={userAnswers.includes(null)}
                            className="bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition duration-200"
                        >
                            Submit
                        </button>
                    ) : (
                         <button 
                            onClick={() => setCurrentQuestionIndex(p => Math.min(quiz.questions.length - 1, p + 1))}
                            disabled={currentQuestionIndex === quiz.questions.length - 1}
                             className="bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition duration-200"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
  };
  
  const renderChat = () => (
      <>
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
            msg.role === 'user'
                ? <UserMessage key={index} text={msg.text} image={msg.image} />
                : <ModelMessage key={index} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            {chatError && (
                <div className="px-4 py-2">
                    <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger-text)] p-3 rounded-md text-sm flex items-center justify-between">
                        <span>{chatError}</span>
                        <button
                            onClick={handleRetrySendMessage}
                            className="font-semibold bg-[var(--color-danger-text)]/10 hover:bg-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] py-1 px-3 rounded-md transition-colors ml-4"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-[var(--color-surface-primary)]/80 backdrop-blur-sm border-t border-[var(--color-border)]">
            <div className="relative">
                {previewUrl && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-[var(--color-background-start)] rounded-lg border border-[var(--color-border)]">
                        <img src={previewUrl} alt="Preview" className="h-24 w-auto rounded" />
                        <button 
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-[var(--color-surface-secondary)] rounded-full text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
                }}
                placeholder="Ask a question, describe the image, or use the mic..."
                className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md p-2 pr-48 text-[var(--color-text-primary)] resize-none focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                rows={3}
                disabled={isTyping || isFormatting || isRecording}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 {curriculum === 'Programming Help' && (
                    <button
                        onClick={handleFormatCode}
                        disabled={!input.trim() || isFormatting || isTyping || isRecording}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] disabled:text-[var(--color-surface-tertiary)] disabled:cursor-not-allowed transition rounded-full hover:bg-[var(--color-surface-tertiary)]"
                        aria-label="Format code"
                        title="Format Code"
                    >
                        {isFormatting ? <Spinner /> : <CodeBracketIcon className="w-6 h-6" />}
                    </button>
                )}
                <button
                    onClick={handleToggleRecording}
                    disabled={isTyping || isFormatting}
                    className={`p-2 transition rounded-full hover:bg-[var(--color-surface-tertiary)] ${isRecording ? 'text-red-500' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)]'}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isRecording ? <StopCircleIcon className="w-6 h-6 animate-pulse" /> : <MicrophoneIcon className="w-6 h-6" />}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isTyping || isFormatting || !!selectedImage || isRecording}
                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] disabled:text-[var(--color-surface-tertiary)] disabled:cursor-not-allowed transition rounded-full hover:bg-[var(--color-surface-tertiary)]"
                    aria-label="Attach image"
                >
                    <PaperclipIcon className="w-6 h-6" />
                </button>
                <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !selectedImage) || isTyping || isFormatting || isRecording}
                className="bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] text-[var(--color-text-on-accent)] font-bold p-2 rounded-md transition duration-200"
                aria-label="Send message"
                >
                <SendIcon className="w-6 h-6" />
                </button>
            </div>
            </div>
        </div>
      </>
  );

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 bg-[var(--color-surface-primary)]/80 backdrop-blur-sm border-b border-[var(--color-border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">AI Tutor: {subject} ({curriculum})</h2>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleNewChat} 
                className="text-sm text-[var(--color-accent-text)] hover:underline"
             >
                Start New Chat
             </button>
             <button 
                onClick={handleChangeTopic} 
                className="text-sm text-[var(--color-accent-text)] hover:underline"
             >
                Change Topic
             </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
            <button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz || !!quiz}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] disabled:text-[var(--color-surface-tertiary)] disabled:cursor-not-allowed transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                aria-label="Generate Quiz"
                title="Generate Quiz"
            >
                <QuizIcon className="w-6 h-6" />
            </button>
            <button
                onClick={handleShareChat}
                disabled={messages.length <= 1}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] disabled:text-[var(--color-surface-tertiary)] disabled:cursor-not-allowed transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                aria-label="Share Chat"
                title="Share Chat"
            >
                <ShareIcon className="w-6 h-6" />
            </button>
            <button
                onClick={handleExportPdf}
                disabled={messages.length <= 1 || isExporting}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] disabled:text-[var(--color-surface-tertiary)] disabled:cursor-not-allowed transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                aria-label="Export as PDF"
                title="Export as PDF"
            >
                {isExporting ? <Spinner /> : <PdfIcon className="w-6 h-6" />}
            </button>
        </div>
      </header>
      {isGeneratingQuiz || quiz ? renderQuiz() : renderChat()}
    </div>
  );
};

export default TutorChat;