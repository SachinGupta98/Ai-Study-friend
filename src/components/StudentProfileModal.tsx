import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_OPTIONS = [
  'Class 8th',
  'Class 9th',
  'Class 10th',
  'Class 11th',
  'Class 12th',
  'JEE Aspirant (11th/12th/Dropper)',
  'NEET Aspirant (11th/12th/Dropper)',
  'B.Tech / College Student',
  'Other Competitive Exams',
];

const STREAM_OPTIONS = [
  'Science (PCM - Physics, Chemistry, Maths)',
  'Science (PCB - Physics, Chemistry, Biology)',
  'Science (PCMB)',
  'Commerce (Accounts, BST, Economics)',
  'Arts / Humanities',
  'Computer Science & Programming',
  'Foundation General',
];

const BOARD_OPTIONS = [
  'CBSE (Session 2026–27 Synced)',
  'ICSE / ISC',
  'State Board (UP / Maharashtra / Bihar / etc.)',
  'IB / Cambridge',
  'Other',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [studentClass, setStudentClass] = useState(profile?.studentClass || 'Class 10th');
  const [stream, setStream] = useState(profile?.stream || 'Science (PCM - Physics, Chemistry, Maths)');
  const [board, setBoard] = useState(profile?.board || 'CBSE (Session 2026–27 Synced)');
  const [age, setAge] = useState(profile?.age || '16');
  const [academicGoal, setAcademicGoal] = useState(profile?.academicGoal || 'Score 95%+ in Board Exam');
  const [schoolCollege, setSchoolCollege] = useState(profile?.schoolCollege || '');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setStudentClass(profile.studentClass || 'Class 10th');
      setStream(profile.stream || 'Science (PCM - Physics, Chemistry, Maths)');
      setBoard(profile.board || 'CBSE (Session 2026–27 Synced)');
      setAge(profile.age || '16');
      setAcademicGoal(profile.academicGoal || 'Score 95%+ in Board Exam');
      setSchoolCollege(profile.schoolCollege || '');
    }
  }, [profile]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        studentClass,
        stream,
        board,
        age: age.trim(),
        academicGoal: academicGoal.trim(),
        schoolCollege: schoolCollege.trim(),
      });
      toast.success('Student profile updated successfully! 🎉');
      onClose();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
        {/* Full screen backdrop click dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-[var(--color-surface-primary)] border border-[var(--color-border)] shadow-2xl text-[var(--color-text-primary)] overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Sticky Modal Top Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-primary)]/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 text-white font-black text-base sm:text-lg flex items-center justify-center shadow-lg border-2 border-white/20 flex-shrink-0">
                {getInitials(fullName || profile?.email || 'Student')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-[var(--color-text-primary)] truncate max-w-[200px] sm:max-w-xs">
                    {fullName || 'Student Profile'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-[220px] sm:max-w-sm mt-0.5">
                  {profile?.email || 'Logged in student'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-center transition flex-shrink-0"
              aria-label="Close"
              title="Close Profile"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form id="student-profile-form" onSubmit={handleSave} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                👤 Student Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sachin Gupta"
                required
                className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                📧 Registered Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full bg-[var(--color-surface-secondary)]/50 border border-[var(--color-border)]/60 rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-secondary)] cursor-not-allowed"
              />
            </div>

            {/* Grid: Class & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  🎓 Class / Academic Level
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  🎂 Age
                </label>
                <input
                  type="number"
                  min="10"
                  max="35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="16"
                  className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            {/* Grid: Stream & Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  🔬 Stream / Subject Focus
                </label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                >
                  {STREAM_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  🏛️ Board / Curriculum
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                >
                  {BOARD_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Academic Goal */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                🎯 Academic Goal / Target Exam
              </label>
              <input
                type="text"
                value={academicGoal}
                onChange={(e) => setAcademicGoal(e.target.value)}
                placeholder="e.g. Score 95%+ in Board Exam, Top 1000 in JEE"
                className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>

            {/* School / Institute */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                🏫 School / Coaching Institute (Optional)
              </label>
              <input
                type="text"
                value={schoolCollege}
                onChange={(e) => setSchoolCollege(e.target.value)}
                placeholder="e.g. Kendriya Vidyalaya / Delhi Public School"
                className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>
          </form>

          {/* Sticky Modal Bottom Action Footer — ALWAYS 100% ACCESSIBLE */}
          <div className="p-4 sm:p-5 border-t border-[var(--color-border)] bg-[var(--color-surface-primary)]/95 backdrop-blur-md sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Are you sure you want to sign out?")) {
                  await logout();
                  onClose();
                }
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
            >
              Sign Out
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-secondary)] rounded-xl hover:bg-[var(--color-surface-tertiary)] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="student-profile-form"
                disabled={isSaving}
                className="flex-1 sm:flex-none px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? <Spinner className="w-4 h-4" /> : <span>Save Profile Details</span>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default StudentProfileModal;
