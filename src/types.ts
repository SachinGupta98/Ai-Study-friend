

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export type Curriculum = 'NCERT' | 'JEE' | 'NEET' | 'Programming Help' | 'Commerce' | 'Arts' | 'CAT' | 'GATE' | 'UPSC';

export interface Task {
  text: string;
  completed: boolean;
  completedAt?: string; // ISO string recording the real-world completion date
}

export interface DailyTask {
  day: string;
  tasks: Task[];
}

export interface WeeklyPlan {
  week: number;
  topic_focus: string;
  daily_tasks: DailyTask[];
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  curriculum: Curriculum;
  subject: string;
  goal: string;
  plan_title: string;
  duration_weeks: number;
  weekly_plans: WeeklyPlan[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  sources?: GroundingSource[];
}

export interface TutorChatSession {
  id: string;
  curriculum: Curriculum;
  subject: string;
  lastUpdatedAt: string;
  messages: ChatMessage[];
  flashcardDecks?: FlashcardDeck[];
}

// ── Flashcard / Spaced Repetition (SM-2 algorithm) ────────────────────────────

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  // SM-2 fields
  interval: number;       // days until next review
  easeFactor: number;     // SM-2 EF, starts at 2.5
  repetitions: number;    // how many times reviewed successfully
  nextReviewDate: string; // ISO date string
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;          // auto-named from message context
  messageIndex: number;   // which AI message this deck was created from
  cards: Flashcard[];
  createdAt: string;
}

export interface QuizRecord {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface User {
  username: string;
  passwordHash: string; // Storing hashed passwords
  studyPlans: StudyPlan[];
  tutorChatHistory?: TutorChatSession[];
  companionChatHistory?: ChatMessage[];
  quizHistory?: QuizRecord[];
}