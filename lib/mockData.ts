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

export const initialCollections: Collection[] = [
  { id: "physics", name: "Physics", iconName: "Atom", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", cardCount: 128, progress: 87 },
  { id: "chemistry", name: "Chemistry", iconName: "FlaskConical", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20", cardCount: 99, progress: 60 },
  { id: "math", name: "Mathematics", iconName: "Binary", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", cardCount: 150, progress: 45 },
  { id: "biology", name: "Biology", iconName: "Dna", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", cardCount: 162, progress: 75 },
  { id: "history", name: "History", iconName: "BookOpen", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", cardCount: 45, progress: 30 }
];

export const initialFlashcards: Flashcard[] = [
  // Physics flashcards
  {
    id: "p1",
    collectionId: "physics",
    front: "What is Newton's First Law?",
    back: "An object will remain at rest or in uniform motion unless acted upon by an external force (often called the law of inertia).",
    isFavorite: true,
    isBookmarked: true,
    mastery: "easy",
    createdAt: Date.now()
  },
  {
    id: "p2",
    collectionId: "physics",
    front: "What is Photosynthesis?",
    back: "Process by which plants convert sunlight into food. (Note: Primarily Biology, but sometimes grouped in General Science!).",
    isFavorite: false,
    isBookmarked: false,
    mastery: "medium",
    createdAt: Date.now() - 3600000
  },
  {
    id: "p3",
    collectionId: "physics",
    front: "What are the raw materials for Photosynthesis?",
    back: "Carbon dioxide, water, and sunlight in the presence of chlorophyll.",
    isFavorite: false,
    isBookmarked: true,
    mastery: "hard",
    createdAt: Date.now() - 7200000
  },
  {
    id: "p4",
    collectionId: "physics",
    front: "Define Work done by a constant force.",
    back: "Work (W) is defined as the product of the force (F) magnitude and the displacement (d) component in the direction of the force: W = F * d * cos(theta).",
    isFavorite: true,
    isBookmarked: false,
    mastery: "unstudied",
    createdAt: Date.now() - 10800000
  },
  {
    id: "p5",
    collectionId: "physics",
    front: "State the law of conservation of mechanical energy.",
    back: "The total mechanical energy (potential + kinetic) of an isolated system remains constant if only conservative forces act on it.",
    isFavorite: false,
    isBookmarked: false,
    mastery: "unstudied",
    createdAt: Date.now() - 14400000
  },

  // Chemistry flashcards
  {
    id: "c1",
    collectionId: "chemistry",
    front: "What is the atomic number of Carbon?",
    back: "Carbon has an atomic number of 6, representing 6 protons in its nucleus.",
    isFavorite: true,
    isBookmarked: false,
    mastery: "easy",
    createdAt: Date.now()
  },
  {
    id: "c2",
    collectionId: "chemistry",
    front: "Explain Covalent Bonding.",
    back: "A chemical bond formed when two atoms share electrons, typically between nonmetal atoms with similar electronegativities.",
    isFavorite: false,
    isBookmarked: true,
    mastery: "medium",
    createdAt: Date.now() - 3600000
  },

  // Math flashcards
  {
    id: "m1",
    collectionId: "math",
    front: "What is the quadratic formula?",
    back: "x = (-b ± √(b² - 4ac)) / 2a, used to find the roots of a quadratic equation ax² + bx + c = 0.",
    isFavorite: true,
    isBookmarked: true,
    mastery: "easy",
    createdAt: Date.now()
  },

  // Biology flashcards
  {
    id: "b1",
    collectionId: "biology",
    front: "What is the function of Mitochondria?",
    back: "Often called the powerhouse of the cell, it performs cellular respiration, converting nutrients into ATP (energy).",
    isFavorite: true,
    isBookmarked: true,
    mastery: "easy",
    createdAt: Date.now()
  },

  // History flashcards
  {
    id: "h1",
    collectionId: "history",
    front: "When did World War II end?",
    back: "World War II officially ended on September 2, 1945, with the formal signing of surrender documents by Japan.",
    isFavorite: false,
    isBookmarked: false,
    mastery: "medium",
    createdAt: Date.now()
  }
];

export const initialQuizzes: Quiz[] = [
  {
    id: "q1",
    collectionId: "physics",
    title: "Force and Motion Quiz",
    difficulty: "Medium",
    questions: [
      {
        id: "q1_1",
        question: "What is the SI unit of Force?",
        options: ["Newton", "Pascal", "Joule", "Watt"],
        correctAnswerIndex: 0,
        explanation: "The SI unit of force is the Newton (N), named after Sir Isaac Newton. It is defined as 1 kg·m/s²."
      },
      {
        id: "q1_2",
        question: "Which law is known as the Law of Inertia?",
        options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
        correctAnswerIndex: 0,
        explanation: "Newton's First Law states that an object will remain at rest or in motion unless acted upon by an external force, directly defining inertia."
      },
      {
        id: "q1_3",
        question: "What is the formula for acceleration?",
        options: ["a = v / t", "a = d / t", "a = F * m", "a = W / t"],
        correctAnswerIndex: 0,
        explanation: "Acceleration is the rate of change of velocity over time, expressed as a = v / t (or delta v / delta t)."
      }
    ]
  }
];

export const initialStats = {
  streak: 12,
  xp: 850,
  studyTime: 2.4, // in hours
  cardsReviewed: 256,
  accuracy: 89,   // percentage
  quizzesTaken: 12,
  dailyStudyHistory: [
    { name: "Mon", hours: 1.2 },
    { name: "Tue", hours: 2.1 },
    { name: "Wed", hours: 1.5 },
    { name: "Thu", hours: 3.0 },
    { name: "Fri", hours: 2.4 },
    { name: "Sat", hours: 0.8 },
    { name: "Sun", hours: 1.8 }
  ],
  achievements: [
    { id: "a1", title: "First Steps", description: "Scan your first handwritten note.", unlocked: true, icon: "Sparkles", progress: 100 },
    { id: "a2", title: "Consistent Learner", description: "Keep up a 7-day study streak.", unlocked: true, icon: "Zap", progress: 100 },
    { id: "a3", title: "Quiz Master", description: "Score 90% or above in any quiz.", unlocked: false, icon: "Trophy", progress: 80 },
    { id: "a4", title: "Flashcard Pro", description: "Create over 100 flashcards.", unlocked: true, icon: "Layers", progress: 100 },
    { id: "a5", title: "Subject Explorer", description: "Study 5 different subjects.", unlocked: true, icon: "GraduationCap", progress: 100 }
  ]
};
