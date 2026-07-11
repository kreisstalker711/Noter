export interface Flashcard {
  id: string;
  collectionId: string;
  front: string;
  back: string;
  isFavorite: boolean;
  isBookmarked: boolean;
  mastery: "easy" | "medium" | "hard" | "unstudied";
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  iconName: string;
  color: string;
  cardCount: number;
  progress: number; // 0 to 100
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  collectionId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: QuizQuestion[];
}

export const initialCollections: Collection[] = [];

export const initialFlashcards: Flashcard[] = [];

export const initialQuizzes: Quiz[] = [];

export interface StudyHistoryItem {
  name: string;
  hours: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  progress: number;
}

export interface StatsData {
  streak: number;
  xp: number;
  studyTime: number;
  cardsReviewed: number;
  accuracy: number;
  quizzesTaken: number;
  dailyStudyHistory: StudyHistoryItem[];
  achievements: Achievement[];
}

export const initialStats: StatsData = {
  streak: 0,
  xp: 0,
  studyTime: 0, // in hours
  cardsReviewed: 0,
  accuracy: 0,   // percentage
  quizzesTaken: 0,
  dailyStudyHistory: [],
  achievements: []
};
