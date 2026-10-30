import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './Auth';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { FireIcon } from './icons/FireIcon';
import { TimerIcon } from './icons/TimerIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';

interface LandingPageProps {
  onAuthSuccess: (username: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
  };

  const closeAuth = () => {
    setAuthModalMode(null);
  };

  const curriculaBadges = [
    { name: 'Class 10th (CBSE 2026–27)', tag: 'Maths, Science, SST' },
    { name: 'Class 9th (NCF-SE 2023)', tag: 'New Chapters Synced' },
    { name: 'Class 8th (Curiosity)', tag: 'Foundation Prep' },
    { name: 'Class 11th & 12th PCM/PCB', tag: 'Physics, Chem, Bio, Maths' },
    { name: 'Class 11th & 12th Commerce', tag: 'Accounts, BST, Economics' },
    { name: 'JEE Main & Advanced', tag: 'Rank Boosting Roadmaps' },
    { name: 'NEET Medical', tag: 'NCERT In-depth Mastery' },
    { name: 'Computer Science & Python', tag: 'Code, SQL & Projects' },
  ];

  const features = [
    {
      icon: '📅',
      title: 'Official 2026–27 Syllabus Roadmaps',
      tag: 'CBSE & NCF-SE 2023',
      description: 'Zero hallucination. Generates day-by-day study tasks strictly mapped to the newly prescribed chapters and topics for Classes 8–12.',
      color: 'from-cyan-500/20 to-blue-500/10',
      border: 'hover:border-cyan-400/50',
    },
    {
      icon: '📐',
      title: 'Textbook-Grade Math & Science KaTeX',
      tag: 'Rigorous Precision',
      description: 'Formulas and derivations formatted cleanly just like in your textbooks with inline $E=mc^2$ and block equations with full step breakdown.',
      color: 'from-purple-500/20 to-indigo-500/10',
      border: 'hover:border-purple-400/50',
    },
    {
      icon: '📄',
      title: 'PDF & Document Intelligence',
      tag: 'Chat with Any Doc',
      description: 'Upload textbook chapters, school notes, or sample papers. Ask questions with citations and generate instant revision flashcards & quizzes.',
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'hover:border-emerald-400/50',
    },
    {
      icon: '⏱️',
      title: 'Pomodoro Timer & Ambient Soundscapes',
      tag: 'Binaural Flow State',
      description: 'Lock in with built-in ambient sounds (Lofi Rain, Deep Space, Cafe, White Noise) and persist focus minutes automatically to your dashboard.',
      color: 'from-amber-500/20 to-orange-500/10',
      border: 'hover:border-amber-400/50',
    },
    {
      icon: '🔥',
      title: 'Gamified Streaks & Heatmap Matrix',
      tag: 'Consistency Pays',
      description: 'Stay accountable with a GitHub-style study heatmap, XP level ups from Apprentice to Grandmaster, and unlockable milestone badges.',
      color: 'from-rose-500/20 to-pink-500/10',
      border: 'hover:border-rose-400/50',
    },
    {
      icon: '🖨️',
      title: 'Textbook-Quality PDF Notes Export',
      tag: 'One-Click Printable',
      description: 'Export any chat explanation, doubt session, or study plan into a beautifully structured, printable PDF with headers, callout cards, and clean symbols.',
      color: 'from-sky-500/20 to-cyan-500/10',
      border: 'hover:border-sky-400/50',
    },
  ];

  const faqs = [
    {
      q: 'Is Vidya AI updated with the latest Session 2026–27 CBSE syllabus?',
      a: 'Yes, 100%! We have officially integrated the complete 2026–27 curriculum issued by the Directorate of Education, GNCT of Delhi, CBSE, and NCF-SE 2023 for Classes 8, 9, 10, 11, and 12. Your study plans and tutor queries reference only valid chapters.',
    },
    {
      q: 'Can it solve complex mathematical equations and derivations?',
      a: 'Absolutely. Vidya AI renders full KaTeX math notation for algebra, calculus, physics derivations, and chemical equations with step-by-step explanations, intuitive analogies, and common exam traps to avoid.',
    },
    {
      q: 'How does the streak and activity heatmap work?',
      a: 'Every time you complete a study roadmap task, engage in a tutor session, solve a doubt, finish a quiz, or complete a focus timer interval, your daily activity is logged and your streak increases!',
    },
    {
      q: 'Is it completely free to start?',
      a: 'Yes! You can create your free account in 10 seconds and instantly generate study roadmaps, chat with the AI tutor, and upload documents.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-cyan-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* ── Background Glow Orbs ────────────────────────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-96 left-1/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[160px]" />
      </div>

      {/* ── Navigation Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070b14]/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🧠
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Vidya<span className="text-cyan-400">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  2026–27 Synced
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Next-Gen AI Study Companion</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition">Features</a>
            <a href="#curriculum" className="hover:text-cyan-400 transition">Syllabus</a>
            <a href="#demo" className="hover:text-cyan-400 transition">Live Demo</a>
            <a href="#faq" className="hover:text-cyan-400 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => openAuth('login')}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 transition active:scale-95"
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glowing Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 shadow-xl mb-6 sm:mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-cyan-300">Official Session 2026–27 Syllabus</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 hidden sm:inline">Classes 8–12, JEE & NEET</span>
          <span className="text-xs">✨</span>
        </motion.div>

        {/* Main Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12]"
        >
          Study Smarter, Not Harder With Your{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            AI Study Co-Pilot.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
        >
          Turn academic stress into effortless mastery. Personalized week-by-week study roadmaps, 24/7 concept tutoring with real mathematical derivations, PDF notes intelligence, and ambient focus timers.
        </motion.p>

        {/* Primary CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
        >
          <button
            onClick={() => openAuth('signup')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/30 transition duration-200 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🚀 Start Learning Free</span>
            <span className="text-cyan-200">→</span>
          </button>
          <button
            onClick={() => openAuth('login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>✨ Sign In to Dashboard</span>
          </button>
        </motion.div>

        {/* Social Proof Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-amber-400">★★★★★</span>
            <span className="text-slate-300 font-bold">4.9/5</span> from students
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-400">✓</span>
            <span>Zero Hallucinations</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-cyan-400">⚡</span>
            <span>Real-time Groq AI Engine</span>
          </div>
        </motion.div>

        {/* ── Live Interactive Mockup Showcase ─────────────────────────────── */}
        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 sm:mt-16 relative max-w-5xl mx-auto text-left"
        >
          {/* Card Frame */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden backdrop-blur-2xl">
            {/* macOS Window Bar */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-400">Vidya AI • Session 2026–27 Master Class</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                AI Tutor Active
              </div>
            </div>

            {/* Showcase Content */}
            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: AI Tutor Dialogue */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    You
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    &quot;Can you explain the quadratic formula and prove irrationality of √3 from Class 10th Real Numbers?&quot;
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                    AI
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <span>📌 Concept Overview: Fundamental Theorem of Arithmetic</span>
                    </p>
                    <p className="text-slate-300 text-xs">
                      In the updated 2026–27 CBSE curriculum, we prove irrationality by contradiction. Assume √3 = a/b where a and b are coprime integers (b ≠ 0):
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 font-mono text-xs text-cyan-300 text-center">
                      3b² = a² ⟹ 3 divides a² ⟹ 3 divides a
                    </div>
                    <p className="text-xs text-slate-400">
                      Since both a and b share a common factor of 3, this contradicts our coprimality premise. Hence, √3 is strictly irrational! 🎯
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Stats Pills & Focus Demo */}
              <div className="space-y-3.5">
                {/* Streak Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 uppercase tracking-wider">Daily Streak</span>
                    <span className="text-base">🔥</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">14</span>
                    <span className="text-xs text-amber-300 font-semibold">Days Continuous</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">+50 XP bonus earned today</p>
                </div>

                {/* Pomodoro Timer Preview */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 uppercase tracking-wider">Deep Focus Flow</span>
                    <span className="text-base">⏱️</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-white">24:45</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                      Binaural Beats
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div className="bg-cyan-400 h-1.5 rounded-full w-3/4" />
                  </div>
                </div>

                {/* Roadmap Progress Preview */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Active Roadmap</span>
                  <p className="text-xs font-bold text-white mt-1">Class 10th Real Numbers & Polynomials</p>
                  <p className="text-[11px] text-emerald-400 mt-1 font-semibold">✓ 6 of 8 Tasks Completed (75%)</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Curricula Marquee ─────────────────────────────────────────────── */}
      <section id="curriculum" className="py-12 border-y border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Tailored For All Indian & Competitive Standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {curriculaBadges.map((badge, idx) => (
              <div
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all hover:scale-105 cursor-default flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="font-bold text-white">{badge.name}</span>
                <span className="text-[10px] text-slate-500">• {badge.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ───────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Everything You Need</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Built for Students Who Want Results.
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            No more jumping between 10 different apps. Vidya AI merges smart curriculum roadmaps, personal tutoring, note generation, and focus tools in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${feat.color} bg-slate-900/60 border border-slate-800 ${feat.border} transition-all shadow-xl backdrop-blur-xl relative overflow-hidden`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-2xl mb-4 shadow-inner">
                {feat.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                {feat.tag}
              </span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">Got questions? We've got answers.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <span className={`text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Epic Bottom CTA ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/40 p-8 sm:p-14 shadow-2xl overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Join Free Today</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-2 mb-4 tracking-tight">
            Ready to Ace Your Next Exam?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Create your account in seconds and unlock personalized roadmaps, step-by-step doubt solutions, and deep focus sessions.
          </p>

          <button
            onClick={() => openAuth('signup')}
            className="px-9 py-4 rounded-2xl text-base sm:text-lg font-black text-white bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 shadow-2xl shadow-cyan-500/40 transition transform hover:-translate-y-1 active:scale-95"
          >
            Create Your Free Account Now →
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>Vidya AI • Session 2026–27 Academic Companion • Powered by High-Speed Groq AI</p>
      </footer>

      {/* ── Auth Modal (Login / Sign Up) ──────────────────────────────────── */}
      <AnimatePresence>
        {authModalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md relative"
            >
              <Auth
                onAuthSuccess={onAuthSuccess}
                initialMode={authModalMode}
                onClose={closeAuth}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

