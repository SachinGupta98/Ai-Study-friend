import { Curriculum } from './types';

export const ACADEMIC_DATA: Record<Curriculum, { subjects: string[] }> = {
  'Class 8th': {
    subjects: [
      'Mathematics',
      'Science',
      'Social Science (History)',
      'Social Science (Geography)',
      'Social Science (Civics)',
      'English',
      'Hindi',
      'Sanskrit'
    ],
  },
  'Class 9th': {
    subjects: [
      'Mathematics',
      'Science (Physics)',
      'Science (Chemistry)',
      'Science (Biology)',
      'Social Science (History)',
      'Social Science (Geography)',
      'Social Science (Political Science)',
      'Social Science (Economics)',
      'English Language & Literature',
      'Hindi',
      'Information Technology (IT 402)',
      'Artificial Intelligence (AI 417)'
    ],
  },
  'Class 10th': {
    subjects: [
      'Mathematics',
      'Science (Physics)',
      'Science (Chemistry)',
      'Science (Biology)',
      'Social Science (History)',
      'Social Science (Geography)',
      'Social Science (Political Science)',
      'Social Science (Economics)',
      'English (First Flight)',
      'Hindi',
      'Information Technology (IT 402)',
      'Computer Applications (Code 165)'
    ],
  },
  'Class 11th': {
    subjects: [
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology',
      'Accountancy',
      'Business Studies',
      'Economics',
      'Computer Science (Python)',
      'English Core'
    ],
  },
  'Class 12th': {
    subjects: [
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology',
      'Accountancy',
      'Business Studies',
      'Economics',
      'Computer Science (Python & SQL)',
      'English Core'
    ],
  },
  'NCERT': {
    subjects: [
      'Physics (11th)',
      'Physics (12th)',
      'Chemistry (11th)',
      'Chemistry (12th)',
      'Maths (11th)',
      'Maths (12th)',
      'Biology (11th)',
      'Biology (12th)'
    ],
  },
  'JEE': {
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
  },
  'NEET': {
    subjects: ['Physics', 'Chemistry', 'Biology'],
  },
  'Programming Help': {
    subjects: [
      'Python',
      'C',
      'C++',
      'Java',
      'Full Stack Web Development',
      'Frontend Development (HTML, CSS, JS, React)',
      'Backend Development (Node.js, Express, Python)',
      'App Development (React Native / Android)'
    ],
  },
  'Commerce': {
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Applied Mathematics', 'English'],
  },
  'Arts': {
    subjects: ['History', 'Political Science', 'Geography', 'Sociology', 'Psychology', 'English'],
  },
  'CAT': {
    subjects: ['Quantitative Aptitude', 'Verbal Ability & Reading Comprehension', 'Data Interpretation & Logical Reasoning'],
  },
  'GATE': {
    subjects: ['Computer Science', 'Mechanical Engineering', 'Electronics & Communication', 'Civil Engineering'],
  },
  'UPSC': {
    subjects: ['Indian Polity & Governance', 'History of India & National Movement', 'Indian & World Geography', 'Indian Economy', 'General Science & Environment'],
  }
};
