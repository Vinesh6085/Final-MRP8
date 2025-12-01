
export interface User {
  id: string;
  email: string;
  password?: string; // In a real app, this would be hashed. For this mock, we store it.
  name: string; // Full name for display
  firstName?: string; // Added for detailed profile
  lastName?: string;  // Added for detailed profile
  role: 'Student' | 'Instructor';
  streak?: number;
  avatar?: string;
}

export interface AuthResponse {
  user: User | null;
  token?: string;
  error?: string;
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  content: string; // HTML or Markdown text for reading
  youtubeId?: string; // Optional video for this specific module
  deadline?: string; // Added deadline for specific topic/module
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  nextTask: string;
  thumbnail: string;
  description?: string;
  deadline?: string; // Course level deadline
  modules?: Module[]; // Added for detailed course content
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: { questionIndex: number; selectedOption: string; isCorrect: boolean }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface CareerRoadmap {
  id: string;
  title: string;
  description: string;
  steps: number;
  icon: string | React.ReactNode;
}

export interface RoadmapStep {
  phaseName: string;
  description: string;
  skills: string[];
  duration: string;
}

export interface GeneratedRoadmap {
  role: string;
  description: string;
  steps: RoadmapStep[];
}

export interface Recommendation {
  title: string;
  platform: string;
  type: 'Course' | 'Certification';
  difficulty: string;
  description: string;
  link: string; // URL to the resource
}

export interface ResearchResult {
  id: string;
  title: string;
  type: 'Paper' | 'Book' | 'Journal' | 'Article' | 'Thesis';
  authors: string[];
  year: string;
  publication: string;
  summary: string;
  link: string;
}
