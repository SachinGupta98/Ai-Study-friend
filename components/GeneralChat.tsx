import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import { getGeneralChatResponseStream } from '../services/geminiService';
import { getCompanionChatHistory, saveCompanionChatHistory } from '../services/authService';
import { ChatMessage, GroundingSource } from '../types';
import Spinner from './Spinner';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { SendIcon } from './icons/SendIcon';
import { UserMessage, ModelMessage } from './ChatMessage';
import { fileToDataUrl } from '../utils/fileUtils';
import { ShareIcon } from './icons/ShareIcon';
import { PdfIcon } from './icons/PdfIcon';
import TypingIndicator from './TypingIndicator';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';

const GeneralChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastUserMessageRef = useRef<ChatMessage | null>(null);


  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  useEffect(() => {
    if (selectedImage) {
        const objectUrl = URL.createObjectURL(selectedImage);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    } else {
        setPreviewUrl(null);
    }
  }, [selectedImage]);
  
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
    // This effect runs once on mount to load history.
    const savedChat = getCompanionChatHistory();
    
    if (savedChat && savedChat.length > 0) {
        setMessages(savedChat);
    } else {
        setMessages([{ role: 'model', text: "Hi there! Feel free to chat with me about anything on your mind. How's your day going?", image: undefined }]);
    }
  }, []); // Runs only on mount.

  // This effect is responsible for saving the chat history on unmount.
  useEffect(() => {
    return () => {
      // The ref ensures we have the latest messages when the component unmounts.
      saveCompanionChatHistory(messagesRef.current);
    };
  }, []); // The empty dependency array ensures this cleanup runs only on unmount.

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatError]);
  
  const handleCareerGuidanceClick = () => {
    setInput("I'm interested in career guidance. Can you tell me about potential paths, required skills, and job market trends for someone studying Full Stack Web Development?");
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  const handleSendMessage = useCallback(async () => {
    if ((!input.trim() && !selectedImage) || isTyping || isRecording) return;

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
        const stream = await getGeneralChatResponseStream(currentHistory, userMessageText, imagePayload);
        let responseText = '';
        const sources: GroundingSource[] = [];
        const sourceUrls = new Set<string>();

        setMessages(prev => [...prev, { role: 'model', text: '', image: undefined }]);

        for await (const chunk of stream) {
            responseText += chunk.text;
            
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                for (const groundingChunk of chunk.candidates[0].groundingMetadata.groundingChunks) {
                    if (groundingChunk.web && !sourceUrls.has(groundingChunk.web.uri)) {
                        sources.push({
                            uri: groundingChunk.web.uri,
                            title: groundingChunk.web.title || groundingChunk.web.uri
                        });
                        sourceUrls.add(groundingChunk.web.uri);
                    }
                }
            }

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { 
                    role: 'model', 
                    text: responseText, 
                    sources: sources.length > 0 ? [...sources] : undefined 
                };
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error from AI companion:", error);
        setChatError((error as Error).message);
    } finally {
        setIsTyping(false);
    }
  }, [input, selectedImage, isTyping, isRecording, messages]);
  
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
        const stream = await getGeneralChatResponseStream(messages, text, imagePayload);
        let responseText = '';
        const sources: GroundingSource[] = [];
        const sourceUrls = new Set<string>();
        
        setMessages(prev => [...prev, { role: 'model', text: '', image: undefined }]);

        for await (const chunk of stream) {
            responseText += chunk.text;

            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                for (const groundingChunk of chunk.candidates[0].groundingMetadata.groundingChunks) {
                    if (groundingChunk.web && !sourceUrls.has(groundingChunk.web.uri)) {
                         sources.push({
                            uri: groundingChunk.web.uri,
                            title: groundingChunk.web.title || groundingChunk.web.uri
                        });
                        sourceUrls.add(groundingChunk.web.uri);
                    }
                }
            }

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { 
                    role: 'model', 
                    text: responseText, 
                    sources: sources.length > 0 ? [...sources] : undefined 
                };
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error from AI companion on retry:", error);
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

  const handleRemoveImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
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

  const formatCompanionChatForSharing = (chatMessages: ChatMessage[]): string => {
    let shareText = `AI Companion Chat\n\n---\n\n`;
    
    chatMessages.forEach(msg => {
        const prefix = msg.role === 'user' ? 'You' : 'AI Companion';
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
  
  const handleShareChat = async () => {
    if (messages.length <= 1) return;
    if (!navigator.share) {
        alert("Sharing is not supported on this browser.");
        return;
    }

    const shareText = formatCompanionChatForSharing(messages);

    try {
        await navigator.share({
            title: 'My Chat with AI Companion',
            text: shareText,
        });
    } catch (error) {
        console.error("Error sharing chat:", error);
    }
  };

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
        doc.text('AI Companion Chat', margin, y);
        y += lineHeight * 2;

        messages.forEach(msg => {
            // Minimum space required for a message block (prefix + one line)
            const minBlockHeight = lineHeight * 2; 
            if (y > pageHeight - margin - minBlockHeight) {
                doc.addPage();
                y = margin;
            }
            
            const prefix = msg.role === 'user' ? 'You:' : 'AI Companion:';
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

        doc.save('ai-companion-chat.pdf');
    } catch (error) {
        console.error("Error exporting PDF:", error);
    } finally {
        setIsExporting(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 bg-[var(--color-surface-primary)]/80 backdrop-blur-sm border-b border-[var(--color-border)] flex items-center justify-between">
        <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">AI Companion</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Your friendly space to chat and unwind</p>
        </div>
        <div className="flex items-center gap-1">
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
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length <= 2 && (
            <div className="p-4 text-center border-b border-[var(--color-border)]">
                <button 
                    onClick={handleCareerGuidanceClick}
                    className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] hover:border-[var(--color-accent-text)] transition-all duration-200 shadow-sm"
                >
                   🚀 Explore Career Paths
                </button>
            </div>
        )}
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
            placeholder="Type a message, use the mic, or add a photo..."
            className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md p-2 pr-36 text-[var(--color-text-primary)] resize-none focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
            rows={2}
            disabled={isTyping || isRecording}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
                onClick={handleToggleRecording}
                disabled={isTyping}
                className={`p-2 transition rounded-full hover:bg-[var(--color-surface-tertiary)] ${isRecording ? 'text-red-500' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)]'}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                title={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {isRecording ? <StopCircleIcon className="w-6 h-6 animate-pulse" /> : <MicrophoneIcon className="w-6 h-6" />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping || !!selectedImage || isRecording}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] disabled:text-[var(--color-surface-tertiary)] disabled:cursor-not-allowed transition rounded-full hover:bg-[var(--color-surface-tertiary)]"
                aria-label="Attach image"
            >
                <PaperclipIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={(!input.trim() && !selectedImage) || isTyping || isRecording}
              className="bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] text-[var(--color-text-on-accent)] font-bold p-2 rounded-md transition duration-200"
              aria-label="Send message"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralChat;