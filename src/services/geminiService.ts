// Note: Swapped to Groq API behind the scenes for reliability and zero rate limits.
import { Curriculum, Task, ChatMessage, WeeklyPlan, Quiz, StudyPlan } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const handleGroqError = (error: any, context: string): Error => {
    console.error(`Error during '${context}':`, error);
    if (!navigator.onLine) return new Error("You appear to be offline. Please check your internet connection.");
    const errorMessage = (error?.message || '').toLowerCase();
    if (errorMessage.includes('429')) return new Error("The AI service is busy. Please wait a moment and try again.");
    if (errorMessage.includes('model_decommissioned') || errorMessage.includes('decommissioned'))
        return new Error("This AI model has been retired. Please contact support.");
    if (errorMessage.includes('401') || errorMessage.includes('invalid_api_key'))
        return new Error("Invalid API key. Please check your VITE_GROQ_API_KEY in .env");
    // Surface the real Groq error message if available
    const groqDetail = error?.message?.match(/"message":"([^"]+)"/)?.[1];
    if (groqDetail) return new Error(groqDetail);
    return new Error(`An unexpected error occurred (${context}). Please try again.`);
};


const makeGroqRequest = async (payload: any) => {
    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errText}`);
    }
    return response;
};

export const generateStudyPlan = async (curriculum: Curriculum, subject: string, goal: string, duration: string): Promise<any> => {
    const prompt = `
        You are an expert academic planner. Create a detailed, week-by-week plan based on the user's request.
        Category: ${curriculum}
        Topic: ${subject}
        User's Goal: "${goal}"
        Desired Duration: ${duration}
        Generate a comprehensive plan that breaks down the learning goal into manageable weekly and daily tasks. Ensure output is STRICTLY valid JSON returning exactly this structure:
        {
          "plan_title": "String",
          "duration_weeks": Number,
          "weekly_plans": [
            {
               "week": Number,
               "topic_focus": "String",
               "daily_tasks": [
                  { "day": "Monday", "tasks": ["Task 1", "Task 2"] }
               ]
            }
          ]
        }
    `;

    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7
        });
        const data = await response.json();
        const jsonText = data.choices[0].message.content;
        const parsedPlan = JSON.parse(jsonText);

        const transformedWeeklyPlans = parsedPlan.weekly_plans.map((week: any) => ({
            ...week,
            daily_tasks: week.daily_tasks.map((day: any) => ({
                ...day,
                tasks: day.tasks.map((taskText: string): Task => ({ text: taskText, completed: false }))
            }))
        }));
        return { ...parsedPlan, weekly_plans: transformedWeeklyPlans };
    } catch (error) {
        throw handleGroqError(error, 'generateStudyPlan');
    }
};

const transformHistory = (history: ChatMessage[]) => {
    return history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text || ""
    })).filter(msg => msg.content);
};

const getTutorSystemInstruction = (curriculum: Curriculum, subject: string): string => {
    const mathInstruction = `IMPORTANT: For all mathematical formulas, equations, and symbols, use KaTeX-compatible LaTeX. Use single dollar signs ($...$) for inline math and double dollar signs ($$...$$) for block equations.`;
    if (curriculum === 'Programming Help') {
        return `You are "Vidya AI", an expert AI coding mentor. Helping with: ${subject}. Adopt the persona of an expert programmer. ${mathInstruction}`;
    }
    return `You are "Vidya AI", an expert AI tutor. Helping with ${curriculum} - ${subject}. Explain concepts clearly. ${mathInstruction}`;
};

export const getTutorResponseStream = async function* (
    curriculum: Curriculum,
    subject: string,
    history: ChatMessage[],
    message: string,
    image?: { base64: string, mimeType: string }
) {
    const systemInstruction = getTutorSystemInstruction(curriculum, subject);
    let model = "llama-3.3-70b-versatile";
    const messages: any[] = [{ role: "system", content: systemInstruction }, ...transformHistory(history)];

    if (image) {
        model = "meta-llama/llama-4-scout-17b-16e-instruct";
        const content: any[] = [];
        if (message) content.push({ type: "text", text: message });
        content.push({ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } });
        messages.push({ role: "user", content });
    } else if (message) {
        messages.push({ role: "user", content: message });
    }

    try {
        const response = await makeGroqRequest({ model, messages, stream: true, temperature: 0.7 });
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data:") && trimmed !== "data: [DONE]") {
                    try {
                        const json = JSON.parse(trimmed.substring(5));
                        const chunkText = json.choices[0]?.delta?.content || "";
                        if (chunkText) yield { text: chunkText };
                    } catch (e) { /* ignore */ }
                }
            }
        }
    } catch (error) {
        throw handleGroqError(error, 'getTutorResponseStream');
    }
};

export const getGeneralChatResponseStream = async function* (
    history: ChatMessage[],
    message: string,
    image?: { base64: string, mimeType: string }
) {
    const systemInstruction = `You are "Vidya AI" in a friendly, conversational mode. Support the student, act as a career counselor when needed. Use markdown.`;
    const historyForModel = history.length > 20 ? [history[0], ...history.slice(-20)] : history;
    const messages: any[] = [{ role: "system", content: systemInstruction }, ...transformHistory(historyForModel)];
    let model = "llama-3.3-70b-versatile";

    if (image) {
        model = "meta-llama/llama-4-scout-17b-16e-instruct";
        const content: any[] = [];
        if (message) content.push({ type: "text", text: message });
        content.push({ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } });
        messages.push({ role: "user", content });
    } else if (message) {
        messages.push({ role: "user", content: message });
    }

    try {
        const response = await makeGroqRequest({ model, messages, stream: true });
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data:") && trimmed !== "data: [DONE]") {
                    try {
                        const json = JSON.parse(trimmed.substring(5));
                        const text = json.choices[0]?.delta?.content || "";
                        if (text) yield { text };
                    } catch (e) { /* ignore */ }
                }
            }
        }
    } catch (error) {
        throw handleGroqError(error, 'getGeneralChatResponseStream');
    }
};

export const formatCode = async (code: string): Promise<string> => {
    const prompt = `You are a code formatting tool. Format this code according to standard conventions. Do not add explanations. Output in a markdown code block.\n${code}`;
    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });
        const data = await response.json();
        const fullText = data.choices[0].message.content;
        const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/;
        const match = fullText.match(codeBlockRegex);
        return match && match[1] ? match[1].trim() : fullText;
    } catch (error) {
        throw handleGroqError(error, 'formatCode');
    }
};

export const solveDoubt = async (problem: string, image?: { base64: string, mimeType: string }): Promise<string> => {
    const prompt = `You are an expert AI Tutor. Analyze the problem. Provide a detailed, step-by-step solution. Format using KaTeX \`$...\$ \` and \`$$...$$\`.\n\nProblem: "${problem}"`;
    let model = "llama-3.3-70b-versatile";
    const content: any[] = [{ type: "text", text: prompt }];

    if (image) {
        model = "meta-llama/llama-4-scout-17b-16e-instruct";
        content.push({ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } });
    }

    try {
        const response = await makeGroqRequest({
            model,
            messages: [{ role: "user", content }],
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw handleGroqError(error, 'solveDoubt');
    }
};

export const simplifyExplanation = async (explanation: string): Promise<string> => {
    const prompt = `You are an expert teacher. Simplify this explanation "like they are 10 years old". Use a simple analogy.\n\nOriginal:\n${explanation}`;
    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw handleGroqError(error, 'simplifyExplanation');
    }
};

export const generateMotivationalMessage = async (progress: number, subject: string): Promise<string> => {
    const prompt = `You are an AI Study Coach. Student completed ${progress}% of their tasks in ${subject}. Write a 2 sentence motivational message based on this progress.`;
    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw handleGroqError(error, 'generateMotivationalMessage');
    }
};

export const adaptStudyPlan = async (weekPlan: WeeklyPlan, subject: string): Promise<any> => {
    const prompt = `You are an AI Study Coach. A student studying "${subject}" is overwhelmed. Revise this weekly plan to make it more manageable. Output strictly as JSON.
    Expected JSON Structure:
    { "day": "Day Name", "tasks": ["Task 1", "Task 2"] } arrays inside a daily_tasks array nested in a weekly plan object. Just return the same structure with simpler tasks.
    \nOriginal Plan: ${JSON.stringify(weekPlan.daily_tasks)}`;

    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        throw handleGroqError(error, 'adaptStudyPlan');
    }
};

export const generateQuiz = async (curriculum: Curriculum, subject: string): Promise<Quiz> => {
    const prompt = `Generate a 5-question multiple-choice quiz on ${curriculum} - ${subject}. Return STRICT JSON conforming exactly to this structure:
    {
      "questions": [
        {
          "question": "Question text (use $..$ for KaTeX)",
          "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
          "correct_answer": "Opt 1",
          "explanation": "Why it's correct"
        }
      ]
    }`;
    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        throw handleGroqError(error, 'generateQuiz');
    }
};

export const getAICoachInsight = async (stats: any): Promise<string> => {
    const prompt = `You are an AI coach. Student stats: Streak ${stats.currentStreak}, Tasks ${stats.totalTasksCompleted}, Quizzes ${stats.quizzesTaken}, Score ${stats.averageQuizScore}%. Write a 2 sentence insight.`;
    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw handleGroqError(error, 'getAICoachInsight');
    }
};

export const generateSpeechFromText = async (_text: string): Promise<string> => {
    // Deprecated for Native TTS
    return "";
};

export const reschedulePlan = async (currentPlan: StudyPlan): Promise<WeeklyPlan[]> => {
    const prompt = `
You are a highly intelligent, empathetic study coach AI. A student has missed some tasks in their study plan and needs you to reschedule them so they can catch up without feeling overwhelmed.

Here is their current plan data in JSON format:
${JSON.stringify(currentPlan, null, 2)}

Your job is to identify tasks where "completed": false and their "taskDate" (if tracked) or logical position implies they are overdue. 
Intelligently shift these incomplete tasks to future days within the existing weeks, or add an additional week if absolutely necessary. Ensure the daily workload remains balanced.

Return the updated plan structure strictly as a valid JSON array of WeeklyPlan objects matching exactly this TypeScript structure:
Array<{
    week: number;
    topic_focus: string;
    daily_tasks: Array<{
        day: string; // "Monday", "Tuesday", etc.
        tasks: Array<{ text: string; completed: false; completedAt?: string }>
    }>
}>

Respond ONLY with the raw JSON array. Do not include markdown formatting or explanations.`;

    try {
        const response = await makeGroqRequest({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";

        // Output might contain markdown code blocks, clean it:
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleanContent);
    } catch (error) {
        throw handleGroqError(error, 'reschedulePlan');
    }
};
