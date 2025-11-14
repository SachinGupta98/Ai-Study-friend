

import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { Curriculum, StudyPlan, Task, ChatMessage, WeeklyPlan, Quiz } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = ai.models;

/**
 * A centralized error handler for Gemini API calls.
 * It inspects the error and returns a more user-friendly error message.
 * @param error - The error object caught.
 * @param context - A string describing the operation that failed (e.g., 'generateStudyPlan').
 * @returns An Error object with a user-friendly message.
 */
const handleGeminiError = (error: any, context: string): Error => {
    console.error(`Error during '${context}':`, error);

    let userMessage = "An unexpected error occurred. Please try again.";

    // Check for network connectivity issues first
    if (!navigator.onLine) {
        return new Error("You appear to be offline. Please check your internet connection.");
    }

    const errorMessage = (error?.message || '').toLowerCase();

    if (error instanceof SyntaxError) {
        userMessage = "The AI returned a response in an unexpected format. Please try again.";
    } else if (errorMessage.includes('api_key') || errorMessage.includes('permission denied')) {
        // Per guidelines, we don't ask the user for a key, but we can signal a config issue.
        userMessage = "There's a configuration issue with the AI service. Unable to proceed.";
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        userMessage = "The service is currently busy. Please wait a moment and try again.";
    } else if (errorMessage.includes('500') || errorMessage.includes('internal')) {
        userMessage = "The AI service is experiencing technical difficulties. Please try again later.";
    } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
        userMessage = "The request was blocked for safety reasons. Please adjust your prompt and try again.";
    } else if (errorMessage.includes('failed to fetch')) {
        // Generic network-related error
        userMessage = "Could not connect to the AI service. Please check your network connection.";
    } else {
        // Use a context-specific fallback message
        switch (context) {
            case 'generateStudyPlan':
                userMessage = "Failed to generate study plan. The model might be unable to create a plan for the selected options.";
                break;
            case 'getTutorResponseStream':
                userMessage = "Failed to get a response from the AI tutor.";
                break;
            case 'getGeneralChatResponseStream':
                userMessage = "Failed to get a response from the AI companion.";
                break;
            case 'formatCode':
                userMessage = "Failed to format the code. Please try again.";
                break;
            case 'solveDoubt':
                userMessage = "Failed to generate a solution for the doubt. Please try again.";
                break;
            case 'simplifyExplanation':
                userMessage = "Failed to simplify the explanation. Please try again.";
                break;
            case 'generateMotivationalMessage':
                userMessage = "Failed to generate a motivational message.";
                break;
            case 'adaptStudyPlan':
                userMessage = "Failed to adapt the study plan.";
                break;
            case 'generateQuiz':
                userMessage = "Failed to generate a quiz for this topic. The AI may not have enough information, or the topic could be too broad. Please try again or rephrase the subject.";
                break;
            case 'getAICoachInsight':
                userMessage = "Failed to generate AI coach insights. Please try again later.";
                break;
        }
    }

    return new Error(userMessage);
};


const studyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        plan_title: {
            type: Type.STRING,
            description: "A creative and motivating title for the study plan."
        },
        duration_weeks: {
            type: Type.INTEGER,
            description: "The total number of weeks for the study plan."
        },
        weekly_plans: {
            type: Type.ARRAY,
            description: "An array of weekly study plans.",
            items: {
                type: Type.OBJECT,
                properties: {
                    week: {
                        type: Type.INTEGER,
                        description: "The week number (e.g., 1, 2, 3)."
                    },
                    topic_focus: {
                        type: Type.STRING,
                        description: "The main topics or chapters to focus on for the week."
                    },
                    daily_tasks: {
                        type: Type.ARRAY,
                        description: "A breakdown of tasks for each day of the week.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: {
                                    type: Type.STRING,
                                    description: "The day of the week (e.g., Monday, Tuesday)."
                                },
                                tasks: {
                                    type: Type.ARRAY,
                                    description: "A list of specific tasks or sub-topics for the day.",
                                    items: { type: Type.STRING }
                                }
                            },
                             required: ['day', 'tasks']
                        }
                    }
                },
                required: ['week', 'topic_focus', 'daily_tasks']
            }
        }
    },
    required: ['plan_title', 'duration_weeks', 'weekly_plans']
};


export const generateStudyPlan = async (curriculum: Curriculum, subject: string, goal: string, duration: string): Promise<any> => {
    const prompt = `
        You are an expert academic planner. Create a detailed, week-by-week plan based on the user's request.
        
        Category: ${curriculum}
        Topic: ${subject}
        User's Goal: "${goal}"
        Desired Duration: ${duration}
        
        Generate a comprehensive plan that breaks down the learning goal into manageable weekly and daily tasks. 
        The plan should be practical and motivating. Ensure the daily tasks are specific and actionable.
        If the topic is academic, focus on syllabus coverage. 
        If it's for a competitive exam like CAT, GATE, or UPSC, create a rigorous, strategy-focused plan covering core concepts, practice, and revision.
    `;

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: studyPlanSchema,
                temperature: 0.7
            }
        });
        
        const jsonText = response.text.trim();
        const parsedPlan = JSON.parse(jsonText);

        // Transform tasks from strings to objects for progress tracking
        const transformedWeeklyPlans = parsedPlan.weekly_plans.map((week: any) => ({
            ...week,
            daily_tasks: week.daily_tasks.map((day: any) => ({
                ...day,
                tasks: day.tasks.map((taskText: string): Task => ({ text: taskText, completed: false }))
            }))
        }));

        return { ...parsedPlan, weekly_plans: transformedWeeklyPlans };

    } catch (error) {
        throw handleGeminiError(error, 'generateStudyPlan');
    }
};

const transformHistory = (history: ChatMessage[]) => {
    return history
        .filter(msg => msg.text || msg.image) // Filter out empty messages
        .map(msg => {
            const parts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [];
            if (msg.text) {
                parts.push({ text: msg.text });
            }
            if (msg.image) {
                // The stored image is a data URL: "data:image/jpeg;base64,..."
                const [header, base64] = msg.image.split(',');
                if (header && base64) {
                    const mimeTypeMatch = header.match(/:(.*?);/);
                    if (mimeTypeMatch && mimeTypeMatch[1]) {
                        parts.push({
                            inlineData: {
                                data: base64,
                                mimeType: mimeTypeMatch[1]
                            }
                        });
                    }
                }
            }
            return {
                role: msg.role,
                parts: parts
            };
        });
};

export const getTutorResponseStream = async (
    curriculum: Curriculum,
    subject: string,
    history: ChatMessage[],
    message: string,
    image?: { base64: string, mimeType: string }
) => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro',
        history: transformHistory(history),
        config: {
            systemInstruction: getTutorSystemInstruction(curriculum, subject),
        },
    });

    const parts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [];

    if (image) {
        parts.push({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            }
        });
    }

    if (message) {
        parts.push({ text: message });
    }

    if (parts.length === 0) {
        throw new Error("Cannot send an empty message.");
    }

    try {
        const result = await chat.sendMessageStream({ message: { parts } });
        return result;
    } catch (error) {
        throw handleGeminiError(error, 'getTutorResponseStream');
    }
};


const getTutorSystemInstruction = (curriculum: Curriculum, subject: string): string => {
    const mathInstruction = `IMPORTANT: For all mathematical formulas, equations, and symbols, use KaTeX-compatible LaTeX. Use single dollar signs (\`$...$\`) for inline math and double dollar signs (\`$$...$$\`) for block equations. This is crucial for correct rendering.`;
    
    if (curriculum === 'Programming Help') {
        return `You are "Vidya AI", an expert AI coding mentor.
        Your current context is helping with: ${subject}.
        Adopt the persona of an expert programmer and senior developer. 
        Provide clear explanations for programming concepts, help debug code, suggest best practices, and write efficient, well-documented code examples.
        When an image of code is provided, analyze it, identify errors, and suggest improvements.
        Use markdown for clear formatting, especially for code blocks (\`\`\`language). Be precise and encouraging.`;
    } 
    if (['CAT', 'GATE', 'UPSC'].includes(curriculum)) {
        return `You are "Vidya AI", an expert AI mentor for Indian competitive exams.
        Your current context is ${curriculum} - ${subject}.
        Adopt the persona of a seasoned coach. Provide in-depth explanations of complex topics, offer strategic advice for exam preparation, analyze past trends, and help with time management and revision strategies.
        If an image of a problem is provided, solve it with a detailed, step-by-step explanation suitable for a high-level competitive exam.
        Use markdown for clear formatting of tables, lists, and key points.
        ${mathInstruction}`;
    } 
    return `You are "Vidya AI", an expert AI tutor specializing in Indian academic curricula like NCERT, JEE, and NEET. 
        Your current context is ${curriculum} - ${subject}.
        Explain concepts clearly, provide step-by-step solutions to problems, and be encouraging and friendly. 
        If an image is provided, analyze it and answer any questions related to it.
        Use markdown for formatting, especially for tables, lists, and to make your explanations easy to understand.
        ${mathInstruction}`;
};

const HISTORY_SUMMARY_THRESHOLD = 10; // Start summarizing after this many messages (user + model turns)
const MESSAGES_TO_RETAIN_POST_SUMMARY = 4; // Keep this many recent messages raw for immediate context

/**
 * An internal helper function to summarize a conversation history.
 * @param historyToSummarize - The array of ChatMessage to summarize.
 * @returns A string containing the summary.
 */
const _summarizeHistory = async (historyToSummarize: ChatMessage[]): Promise<string> => {
    // We don't need to summarize the initial greeting
    if (historyToSummarize.length === 0) return "";

    const summarizationPrompt = `
        Briefly summarize the following chat exchange between a "user" and a "model" (an AI companion). 
        Capture the key topics, the general tone, and any important information mentioned. 
        The summary should be a concise paragraph, written as if you are recapping the memory of the conversation.

        Chat History to Summarize:
        ${historyToSummarize.map(msg => `${msg.role}: ${msg.text}`).join('\n')}
    `;

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash', // Flash is efficient for summarization
            contents: summarizationPrompt,
            config: { temperature: 0.3 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing history:", error);
        // If summarization fails, return a simple notice instead of throwing, to not break the chat flow.
        return "Could not summarize the previous part of the conversation.";
    }
};

export const getGeneralChatResponseStream = async (
    history: ChatMessage[],
    message: string,
    image?: { base64: string, mimeType: string }
) => {
    const systemInstruction = `You are "Vidya AI" in a friendly, conversational mode. 
        Your role is to be a supportive and empathetic companion. 
        You can chat with students about their day, hobbies, real-life problems, or any general topic they want to discuss, including images they might share. 
        Your tone should be encouraging, positive, and non-judgmental. 
        You are not a formal tutor in this mode, so avoid academic lectures unless the user specifically asks for help with a concept. 
        Focus on being a good listener and a friendly conversational partner. Use markdown for readability.`;
    
    let historyForModel = history;

    if (history.length > HISTORY_SUMMARY_THRESHOLD) {
        try {
            // We summarize all messages except the initial greeting and the most recent ones.
            const messagesToSummarize = history.slice(1, -MESSAGES_TO_RETAIN_POST_SUMMARY);
            const recentMessages = history.slice(-MESSAGES_TO_RETAIN_POST_SUMMARY);
            
            if (messagesToSummarize.length > 0) {
                const summary = await _summarizeHistory(messagesToSummarize);
                
                const summaryMessage: ChatMessage = {
                    role: 'model', // The summary is context for the model, framed as a memory it has.
                    text: `(Here is a summary of our conversation so far, to refresh my memory: ${summary})`
                };
                
                // Reconstruct the history for the model: Initial Greeting -> Summary -> Recent Messages
                historyForModel = [history[0], summaryMessage, ...recentMessages];
            }
        } catch (error) {
            // If summarization fails, we proceed with a truncated history to avoid token limit errors.
            console.error("Failed to process history summarization, proceeding with truncated history.", error);
            const retainCount = MESSAGES_TO_RETAIN_POST_SUMMARY * 2; // Keep a bit more if summary fails
            historyForModel = [history[0], ...history.slice(-retainCount)];
        }
    }
    
    // Create a fresh, stateless chat instance for every message to ensure stability.
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro',
        history: transformHistory(historyForModel), // Use the potentially summarized history
        config: {
            systemInstruction: systemInstruction,
        },
    });

    const parts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [];

    if (image) {
        parts.push({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            }
        });
    }

    if (message) {
        parts.push({ text: message });
    }

    if (parts.length === 0) {
        throw new Error("Cannot send an empty message.");
    }

    try {
        const result = await chat.sendMessageStream({ message: { parts } });
        return result;
    } catch (error) {
        throw handleGeminiError(error, 'getGeneralChatResponseStream');
    }
};

export const formatCode = async (code: string): Promise<string> => {
    const prompt = `
        You are a code formatting tool. 
        Your ONLY task is to format the following code snippet according to standard conventions for its language.
        Do NOT add explanations, comments, or change the logic.
        Only return the formatted code inside a single markdown code block.
        
        Code to format:
        ${code}
    `;

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.1
            }
        });

        const fullText = response.text.trim();
        // Regex to extract code from a markdown block, handles optional language identifier
        const codeBlockRegex = /```(?:\w*\n)?([\s\S]*?)```/;
        const match = fullText.match(codeBlockRegex);

        if (match && match[1]) {
            return match[1].trim();
        }

        // Fallback if the model doesn't use a code block, just returns the raw code
        return fullText;

    } catch (error) {
        throw handleGeminiError(error, 'formatCode');
    }
};

export const solveDoubt = async (
    problem: string,
    image?: { base64: string, mimeType: string }
): Promise<string> => {
    const prompt = `
        You are an expert AI Tutor. A student needs help with the following problem.
        Analyze the problem presented in the text and/or image.
        Provide a detailed, step-by-step solution. 
        Explain the reasoning behind each step clearly and concisely.
        Format your response using markdown for readability (e.g., for tables, lists, bold text).
        IMPORTANT: For all mathematical formulas, equations, and symbols, use KaTeX-compatible LaTeX. Use single dollar signs (\`$...$\`) for inline math and double dollar signs (\`$$...$$\`) for block equations.

        Problem: "${problem}"
    `;

    const parts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [{ text: prompt }];
    
    // Add the image after the main prompt for better context
    if (image) {
        parts.push({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            }
        });
    }

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
        });
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'solveDoubt');
    }
};

export const simplifyExplanation = async (explanation: string): Promise<string> => {
    const prompt = `
        You are an expert teacher with a talent for making complex topics simple.
        A student has received the following technical explanation and needs it simplified.
        Your task is to re-explain the concept "like they are 10 years old".
        Use a simple analogy or a real-world example to make it easy to understand.
        Break it down into very simple steps. Keep the tone friendly and encouraging.
        If the original text contained math formulas in LaTeX, you can simplify the explanation around them, but do not attempt to simplify the formulas themselves.

        Original Explanation to Simplify:
        ---
        ${explanation}
        ---
    `;

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.8
            }
        });
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'simplifyExplanation');
    }
};

export const generateMotivationalMessage = async (progress: number, subject: string): Promise<string> => {
    const prompt = `
        You are an AI Study Coach. A student studying "${subject}" has completed ${progress}% of their tasks for the week.
        Write a short (2-3 sentences), personalized, and encouraging message based on their progress.
        - If progress is high (>= 75%), praise their dedication and tell them to keep up the momentum.
        - If progress is medium (40-74%), acknowledge their effort and encourage them to stay consistent.
        - If progress is low (< 40%), be gentle and supportive. Remind them that it's okay to have a slow start and suggest focusing on one small task to get going.
        Do not sound robotic. Be warm and empathetic.
    `;

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash', // Flash is suitable for this simple task
            contents: prompt,
            config: {
                temperature: 0.9
            }
        });
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'generateMotivationalMessage');
    }
};

const weeklyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        week: { type: Type.INTEGER },
        topic_focus: { type: Type.STRING },
        daily_tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['day', 'tasks']
          }
        }
    },
    required: ['week', 'topic_focus', 'daily_tasks']
};

export const adaptStudyPlan = async (weekPlan: WeeklyPlan, subject: string): Promise<any> => {
    const prompt = `
      You are an AI Study Coach. A student studying "${subject}" is feeling overwhelmed with the plan for Week ${weekPlan.week}, which focuses on "${weekPlan.topic_focus}".
      Your task is to revise this week's plan to make it more manageable, focusing only on the most critical concepts to help them get back on track.
      Break down the larger tasks into smaller, more achievable steps. The goal is to reduce stress and build momentum.
      Maintain the same structure but adjust the tasks.
      
      Original Week's Plan:
      ${JSON.stringify(weekPlan.daily_tasks, null, 2)}
      
      Return the complete, revised weekly plan object in JSON format.
    `;

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: weeklyPlanSchema
            }
        });

        const jsonText = response.text.trim();
        const parsedPlan = JSON.parse(jsonText);

        // Transform tasks from strings to objects for progress tracking
        const transformedDailyTasks = parsedPlan.daily_tasks.map((day: any) => ({
            ...day,
            tasks: day.tasks.map((taskText: string): Task => ({ text: taskText, completed: false }))
        }));
        
        return { ...parsedPlan, daily_tasks: transformedDailyTasks };

    } catch (error) {
        throw handleGeminiError(error, 'adaptStudyPlan');
    }
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of 5 quiz questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The quiz question. Any math should be in KaTeX-compatible LaTeX." },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 possible string answers. Any math should be in KaTeX-compatible LaTeX.",
                        items: { type: Type.STRING }
                    },
                    correct_answer: { type: Type.STRING, description: "The correct answer from the options array." },
                    explanation: { type: Type.STRING, description: "A brief explanation for why the correct answer is right. Any math should be in KaTeX-compatible LaTeX." }
                },
                required: ["question", "options", "correct_answer", "explanation"]
            }
        }
    },
    required: ["questions"]
};

export const generateQuiz = async (curriculum: Curriculum, subject: string): Promise<Quiz> => {
    const prompt = `
        You are an expert quiz creator for Indian students. 
        Your task is to generate a 5-question multiple-choice quiz on the following topic.
        The questions should be relevant to the curriculum and test key concepts.
        Each question must have exactly 4 options.
        IMPORTANT: For any mathematical or scientific notation, use KaTeX-compatible LaTeX (e.g., $...$ for inline, $$...$$ for block).

        Curriculum: ${curriculum}
        Subject: ${subject}
        
        Return the quiz in the specified JSON format.
    `;
    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        throw handleGeminiError(error, 'generateQuiz');
    }
};

export const getAICoachInsight = async (stats: {
    currentStreak: number;
    totalTasksCompleted: number;
    quizzesTaken: number;
    averageQuizScore: number;
    plansCreated: number;
}): Promise<string> => {
    const { currentStreak, totalTasksCompleted, quizzesTaken, averageQuizScore, plansCreated } = stats;
    
    const prompt = `
        You are "Vidya AI", an expert AI Study Coach. Your role is to provide a short (2-3 sentences), personalized, and encouraging insight to a student based on their recent performance. Be warm, empathetic, and provide one actionable suggestion. Do not sound robotic.
        
        Here is the student's data:
        - Current Study Streak: ${currentStreak} days
        - Total Tasks Completed: ${totalTasksCompleted}
        - Total Quizzes Taken: ${quizzesTaken}
        - Average Quiz Score: ${averageQuizScore}%
        - Study Plans Created: ${plansCreated}

        Analyze the data and generate an insightful message. For example:
        - If streak is high, praise consistency.
        - If quiz score is high, suggest tackling a harder topic.
        - If tasks completed is high but quiz score is low, suggest reviewing fundamentals.
        - If they have many plans, praise their ambition but suggest focusing on one.
        - If they are just starting, give a welcoming and encouraging message.
        
        Generate the insight now.
    `;

    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.9 }
        });
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'getAICoachInsight');
    }
};