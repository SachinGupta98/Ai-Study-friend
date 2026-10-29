// Note: Powered by Groq API with robust model fallback support
import { Curriculum, Task, ChatMessage, WeeklyPlan, Quiz, StudyPlan } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-120b";

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
    if (error?.message && !error.message.includes('[object Object]')) {
        return new Error(error.message);
    }
    return new Error(`An unexpected error occurred (${context}). Please try again.`);
};

const cleanAndParseJson = (rawContent: string): any => {
    let text = (rawContent || "").trim();
    // Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    // Find bounding braces for object or array
    const firstBrace = text.search(/[{\[]/);
    if (firstBrace !== -1) {
        const isObject = text[firstBrace] === '{';
        const lastBrace = isObject ? text.lastIndexOf('}') : text.lastIndexOf(']');
        if (lastBrace !== -1 && lastBrace > firstBrace) {
            text = text.substring(firstBrace, lastBrace + 1);
        }
    }
    return JSON.parse(text);
};

const makeGroqRequest = async (payload: any) => {
    const candidateModels = [
        payload.model || DEFAULT_MODEL,
        DEFAULT_MODEL,
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-20b"
    ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

    let lastError: any = null;

    for (let i = 0; i < candidateModels.length; i++) {
        const model = candidateModels[i];
        try {
            const currentPayload = { ...payload, model };
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentPayload)
            });

            if (response.ok) {
                return response;
            }

            const errText = await response.text();
            const isModelUnavailable =
                response.status === 404 ||
                response.status === 400 ||
                errText.includes("does not exist") ||
                errText.includes("access to it") ||
                errText.includes("decommissioned") ||
                errText.includes("model_not_found");

            if (isModelUnavailable && i < candidateModels.length - 1) {
                console.warn(`[Groq] Model '${model}' unavailable: ${errText}. Falling back to '${candidateModels[i + 1]}'`);
                continue;
            }

            throw new Error(`Groq API error ${response.status}: ${errText}`);
        } catch (err: any) {
            lastError = err;
            const errMsg = String(err?.message || "");
            if (
                (errMsg.includes("does not exist") ||
                 errMsg.includes("access to it") ||
                 errMsg.includes("decommissioned")) &&
                i < candidateModels.length - 1
            ) {
                continue;
            }
            throw err;
        }
    }

    throw lastError || new Error("Failed to get response from Groq AI service.");
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
            model: DEFAULT_MODEL,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7
        });
        const data = await response.json();
        const jsonText = data.choices[0]?.message?.content || "{}";
        const parsedPlan = cleanAndParseJson(jsonText);

        const rawWeeks = Array.isArray(parsedPlan.weekly_plans)
            ? parsedPlan.weekly_plans
            : Array.isArray(parsedPlan.weeklyPlans)
            ? parsedPlan.weeklyPlans
            : Array.isArray(parsedPlan.weeks)
            ? parsedPlan.weeks
            : [];

        const transformedWeeklyPlans = rawWeeks.map((week: any, wIdx: number) => {
            const rawDaily = Array.isArray(week.daily_tasks)
                ? week.daily_tasks
                : Array.isArray(week.dailyTasks)
                ? week.dailyTasks
                : Array.isArray(week.days)
                ? week.days
                : [];

            const daily_tasks = rawDaily.map((day: any) => {
                const rawTasks = Array.isArray(day.tasks)
                    ? day.tasks
                    : Array.isArray(day.taskList)
                    ? day.taskList
                    : [];

                const tasks = rawTasks.map((t: any) => {
                    if (typeof t === 'string') return { text: t, completed: false };
                    if (t && typeof t === 'object') {
                        return { text: t.text || t.task || t.title || String(t), completed: Boolean(t.completed) };
                    }
                    return { text: String(t), completed: false };
                });

                return {
                    day: day.day || day.day_name || day.name || 'Day',
                    tasks
                };
            });

            return {
                week: Number(week.week || wIdx + 1),
                topic_focus: week.topic_focus || week.topic || week.focus || `Week ${wIdx + 1}`,
                daily_tasks
            };
        });

        const plan_title = parsedPlan.plan_title || parsedPlan.title || `${subject} (${curriculum}) Study Plan`;
        const duration_weeks = Number(parsedPlan.duration_weeks || parsedPlan.duration || 4);

        return {
            plan_title,
            duration_weeks,
            weekly_plans: transformedWeeklyPlans,
            // Keep aliases for backwards compatibility
            title: plan_title,
            duration: duration_weeks,
            weeklyPlans: transformedWeeklyPlans
        };
    } catch (error) {
        throw handleGroqError(error, 'generateStudyPlan');
    }
};

const transformHistory = (history: ChatMessage[]) => history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.text
}));

const getTutorSystemInstruction = (curriculum: Curriculum, subject: string) => `
You are 'Vidya AI', a world-class, engaging, and patient academic tutor dedicated to helping students master concepts for ${curriculum} (${subject}).

CRITICAL FORMATTING & PRESENTATION RULES:
1. 🎨 Visual Structure & Emojis:
   - Use meaningful emojis and markdown headers to organize answers into clear, beautifully digestible textbook sections.
   - Standard structure for conceptual answers and doubts:
     • 📌 **Concept Overview**: Clear, concise definition of the topic.
     • 💡 **Intuitive Analogy**: A relatable real-world visualization.
     • 📐 **Formulas & Key Principles**: Exact equations with variable definitions.
     • 📝 **Step-by-Step Textbook Solution / Derivation**: Numbered steps explaining the *why* behind every transition.
     • ⚠️ **Common Pitfalls & Mistakes**: Typical exam traps students fall into.
     • 🎯 **High-Yield Exam Tip**: Quick shortcut, mnemonic, or NCERT/exam-specific highlight.
     • 🧠 **Quick Concept Check**: 1 short multiple-choice or conceptual check to verify learning.

2. 🧮 Textbook-Quality Mathematical & Scientific Formulas:
   - Always format ALL algebraic expressions, formulas, physical units, and chemical equations using standard KaTeX notation.
   - Use single dollar signs \`$...$\` for inline math (e.g., $E = mc^2$, $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$).
   - Use double dollar signs \`$$...$$\` on isolated lines for display / block math equations and derivations:
     $$ \\int_{a}^{b} f(x)\\,dx = F(b) - F(a) $$
   - Write out complete steps clearly, just like in standard textbooks (NCERT, Hall & Knight, Irodov, Campbell Biology).
   - Use proper LaTeX syntax: fractions (\\frac{a}{b}), square roots (\\sqrt{x}), powers (x^2), subscripts (a_n), vectors (\\vec{v}), and Greek letters (\\alpha, \\beta, \\theta, \\lambda, \\Delta).

3. 🎓 Tone & Encouragement:
   - Warm, inspiring, and rigorous. Keep the student excited to learn!
`;

export const getTutorResponseStream = async function* (
    curriculum: Curriculum,
    subject: string,
    history: ChatMessage[],
    message: string,
    image?: { base64: string, mimeType: string }
) {
    const systemInstruction = getTutorSystemInstruction(curriculum, subject);
    let model = DEFAULT_MODEL;
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
    const systemInstruction = `You are "Vidya AI", a friendly, knowledgeable academic and career mentor. Use clean Markdown formatting with clear section headers, helpful bullet points, emojis (📌, 💡, 🎯, 🚀), and textbook-style KaTeX math ($...$ inline, $$...$$ block) whenever discussing academic, scientific, or mathematical topics.`;
    const historyForModel = history.length > 20 ? [history[0], ...history.slice(-20)] : history;
    const messages: any[] = [{ role: "system", content: systemInstruction }, ...transformHistory(historyForModel)];
    let model = DEFAULT_MODEL;

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
            model: DEFAULT_MODEL,
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
    const prompt = `You are an expert AI Tutor. Analyze the student's problem with textbook clarity and precision.
Structure your solution using vibrant emojis and clear sections:
- 📌 **Problem Statement & Core Principle**
- 📐 **Given Data & Governing Formulas** (Write formulas using KaTeX $...$ inline and $$...$$ display blocks)
- 📝 **Step-by-Step Textbook Solution & Calculation** (Explain each line clearly)
- 🎯 **Final Answer** (Clearly highlighted)
- 💡 **Key Concept Tip & Exam Takeaway**

Problem: "${problem}"`;
    let model = DEFAULT_MODEL;
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
            model: DEFAULT_MODEL,
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
            model: DEFAULT_MODEL,
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
            model: DEFAULT_MODEL,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        const data = await response.json();
        const jsonText = data.choices[0]?.message?.content || "{}";
        return cleanAndParseJson(jsonText);
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
            model: DEFAULT_MODEL,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        const data = await response.json();
        const jsonText = data.choices[0]?.message?.content || "{}";
        return cleanAndParseJson(jsonText);
    } catch (error) {
        throw handleGroqError(error, 'generateQuiz');
    }
};

export const getAICoachInsight = async (stats: any): Promise<string> => {
    const prompt = `You are an AI coach. Student stats: Streak ${stats.currentStreak}, Tasks ${stats.totalTasksCompleted}, Quizzes ${stats.quizzesTaken}, Score ${stats.averageQuizScore}%. Write a 2 sentence insight.`;
    try {
        const response = await makeGroqRequest({
            model: DEFAULT_MODEL,
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
            model: DEFAULT_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "[]";
        return cleanAndParseJson(content);
    } catch (error) {
        throw handleGroqError(error, 'reschedulePlan');
    }
};

export const askDocumentStream = async function* (
    docContext: string,
    history: ChatMessage[],
    question: string
) {
    const trimmedContext = docContext.slice(0, 18000);
    const systemInstruction = `You are "Vidya Doc AI", an expert academic document analyzer and tutor.
You have been provided with the student's study document/notes below.
Always base your answers primarily on this document context. If relevant, cite page numbers or sections mentioned in the text.
Explain concepts clearly, break down formulas step-by-step, and format math using KaTeX ($...$ for inline, $$...$$ for block).
If the document doesn't contain the answer, politely mention that and provide the correct academic explanation.

=== DOCUMENT CONTENT ===
${trimmedContext}
=========================`;

    const historyForModel = history.length > 10 ? history.slice(-10) : history;
    const messages: any[] = [
        { role: "system", content: systemInstruction },
        ...transformHistory(historyForModel),
        { role: "user", content: question }
    ];

    try {
        const response = await makeGroqRequest({
            model: DEFAULT_MODEL,
            messages,
            stream: true,
            temperature: 0.4
        });
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
        throw handleGroqError(error, 'askDocumentStream');
    }
};

export const summarizeDocument = async (docText: string): Promise<string> => {
    const trimmedContext = docText.slice(0, 15000);
    const prompt = `You are an expert educator. Provide an executive summary of this study material.
Structure your output in clean Markdown:
1. 📌 **Executive Overview** (2-3 concise paragraphs)
2. 🔑 **Core Concepts & Definitions** (bullet points with bold terms)
3. 📐 **Important Formulas / Rules / Theorems** (format math using KaTeX $...$)
4. 💡 **Top 5 High-Yield Exam Takeaways**

Document:
"""
${trimmedContext}
"""`;

    try {
        const response = await makeGroqRequest({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5
        });
        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    } catch (error) {
        throw handleGroqError(error, 'summarizeDocument');
    }
};

export const generateQuizFromDoc = async (docText: string): Promise<Quiz> => {
    const trimmedContext = docText.slice(0, 12000);
    const prompt = `Based strictly on this study document, create a challenging 5-question multiple choice test.
Format as STRICT JSON conforming exactly to this schema:
{
  "questions": [
    {
      "question": "Question text (use $..$ for math)",
      "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
      "correct_answer": "Opt A",
      "explanation": "Detailed explanation citing concepts from the text"
    }
  ]
}

Document:
"""
${trimmedContext}
"""`;

    try {
        const response = await makeGroqRequest({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.6
        });
        const data = await response.json();
        const jsonText = data.choices[0]?.message?.content || "{}";
        return cleanAndParseJson(jsonText);
    } catch (error) {
        throw handleGroqError(error, 'generateQuizFromDoc');
    }
};

export const generateFlashcards = async (
    text: string,
    count: number = 6
): Promise<{ question: string; answer: string }[]> => {
    const prompt = `You are a study assistant. From the following explanation, generate exactly ${count} flashcard question-and-answer pairs that test key concepts. Each answer should be concise (1-3 sentences). Use KaTeX ($...$) for any math.

Return STRICT JSON conforming exactly to this structure:
{
  "flashcards": [
    { "question": "...", "answer": "..." }
  ]
}

Explanation to convert:
"""
${text.slice(0, 3000)}
"""`;

    try {
        const response = await makeGroqRequest({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.6,
        });
        const data = await response.json();
        const jsonText = data.choices[0]?.message?.content || "{}";
        const parsed = cleanAndParseJson(jsonText);
        return parsed.flashcards || [];
    } catch (error) {
        throw handleGroqError(error, 'generateFlashcards');
    }
};
