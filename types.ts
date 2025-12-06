export enum AppView {
  LANDING = 'LANDING',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  EXAM = 'EXAM',
  CERTIFICATE = 'CERTIFICATE',
}

export interface UserProfile {
  name: string;
  gender: string;
  qualification: string;
  background: string;
  nationality: string;
  profession: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  topics: string[];
  badge: string;
}

export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ExamResult {
  score: number;
  passed: boolean;
  attempts: number;
}

export const LEVELS_DATA: Level[] = [
  {
    id: 1,
    title: "AI Genesis",
    description: "Understanding the very basics of Artificial Intelligence and Neural Networks.",
    isLocked: false,
    isCompleted: false,
    topics: ["What is AI?", "Neural Networks Basics", "Machine Learning vs Deep Learning"],
    badge: "Neural Novice"
  },
  {
    id: 2,
    title: "The Transformer Era",
    description: "Deep dive into the architecture that changed everything: GPT, BERT, and Attention mechanisms.",
    isLocked: true,
    isCompleted: false,
    topics: ["Transformer Architecture", "Attention Mechanism", "GPT Origins"],
    badge: "Transformer Tactician"
  },
  {
    id: 3,
    title: "Modern Titans: Gemini & Grok",
    description: "Exploring the capabilities of Google's Gemini and xAI's Grok.",
    isLocked: true,
    isCompleted: false,
    topics: ["Gemini Multimodality", "Grok Real-time capabilities", "Context Windows"],
    badge: "Gemini Guardian"
  },
  {
    id: 4,
    title: "The Future of Synthesis",
    description: "Generative Video, Audio, and Reasoning Models.",
    isLocked: true,
    isCompleted: false,
    topics: ["Generative Video", "Reasoning Models", "Ethics & Safety"],
    badge: "Synthesis Sage"
  }
];