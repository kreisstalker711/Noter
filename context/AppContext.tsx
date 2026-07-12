"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth as fbAuth, db as fbDb, isMockFirebase } from "../lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where
} from "firebase/firestore";
import { 
  initialCollections, 
  initialFlashcards, 
  initialQuizzes, 
  initialStats, 
  Collection, 
  Flashcard, 
  Quiz 
} from "../lib/mockData";
import { StudyMaterialResult } from "../services/studyGenerator";

type PageType = "splash" | "onboarding" | "auth" | "app";
type TabType = "home" | "library" | "progress" | "profile" | "settings" | "scan" | "pdf" | "chat" | "quiz" | "flashcards" | "study" | "bonus" | "stats";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  level: number;
}

interface AppContextProps {
  user: UserProfile | null;
  loading: boolean;
  currentPage: PageType;
  activeTab: TabType;
  theme: "light" | "dark";
  collections: Collection[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  stats: typeof initialStats;
  currentCollectionId: string | null;
  
  // Real Study Guides & Workspace Context
  studyMaterials: StudyMaterialResult[];
  activeStudyData: StudyMaterialResult | null;
  setActiveStudyData: (data: StudyMaterialResult | null) => void;
  fetchStudyMaterials: () => Promise<void>;
  deleteStudyMaterial: (id: string) => Promise<void>;
  
  // Navigation
  setCurrentPage: (page: PageType) => void;
  setActiveTab: (tab: TabType) => void;
  setCurrentCollectionId: (id: string | null) => void;
  
  // Auth Functions
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Theme Toggle
  toggleTheme: () => void;
  
  // Firestore / Local Database functions
  addCollection: (name: string, iconName?: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  renameCollection: (id: string, newName: string) => Promise<void>;
  addFlashcard: (collectionId: string, front: string, back: string) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  updateFlashcard: (id: string, front: string, back: string) => Promise<void>;
  updateFlashcardMastery: (id: string, mastery: "easy" | "medium" | "hard") => Promise<void>;
  toggleFavoriteFlashcard: (id: string) => Promise<void>;
  toggleBookmarkFlashcard: (id: string) => Promise<void>;
  addQuiz: (quiz: Quiz) => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  addStudyTime: (hours: number) => Promise<void>;
  incrementStreak: () => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<PageType>("splash");
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);

  // Core data states
  const [collections, setCollections] = useState<Collection[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<typeof initialStats>(initialStats);

  // Scanned study guides states
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialResult[]>([]);
  const [activeStudyData, setActiveStudyData] = useState<StudyMaterialResult | null>(null);

  // Theme Syncing
  useEffect(() => {
    // Load local storage theme if exists
    const savedTheme = localStorage.getItem("noter_theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("noter_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Auth & Data Initial Sync (Checks Firebase vs Mock LocalStorage)
  useEffect(() => {
    if (!isMockFirebase && fbAuth) {
      const unsubscribe = onAuthStateChanged(fbAuth, async (fbUser) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            name: fbUser.displayName || "User",
            email: fbUser.email || "",
            photoURL: fbUser.photoURL || undefined,
            level: 12
          };
          setUser(profile);
          // Sync database from Firestore
          await syncFromFirestore(fbUser.uid);
          
          // If onboarding wasn't completed, stay there
          const completedOnboarding = localStorage.getItem(`onboarding_${fbUser.uid}`);
          if (completedOnboarding === "true") {
            setCurrentPage("app");
          } else {
            setCurrentPage("onboarding");
          }
        } else {
          setUser(null);
          // Clear current local structures or fall back to pre-seeded static mocks for demo login
          loadLocalMocks();
          setCurrentPage("auth");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock mode auth initialization
      setTimeout(() => {
        const savedMockUser = localStorage.getItem("mock_user");
        if (savedMockUser) {
          const parsedUser = JSON.parse(savedMockUser) as UserProfile;
          setUser(parsedUser);
          loadUserData(parsedUser.uid);
          
          const completedOnboarding = localStorage.getItem(`onboarding_${parsedUser.uid}`);
          if (completedOnboarding === "true") {
            setCurrentPage("app");
          } else {
            setCurrentPage("onboarding");
          }
        } else {
          loadLocalMocks();
          setCurrentPage("splash");
        }
        setLoading(false);
      }, 1500);
    }
  }, []);

  // Helper: load seed details locally
  const loadLocalMocks = () => {
    setCollections(initialCollections);
    setFlashcards(initialFlashcards);
    setQuizzes(initialQuizzes);
    setStats(initialStats);
  };

  // Fetch scanned study guides from database
  const fetchStudyMaterials = async () => {
    if (!user) return;
    if (isMockFirebase) {
      const saved = localStorage.getItem("noter_study_materials") || "[]";
      const parsed = JSON.parse(saved);
      const userGuides = parsed.filter((item: any) => item.userId === user.uid);
      setStudyMaterials(userGuides);
    } else if (fbDb) {
      try {
        const q = query(
          collection(fbDb, "studyMaterials"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list: StudyMaterialResult[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any);
        });
        // Sort in client memory by date desc
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setStudyMaterials(list);
      } catch (err) {
        console.error("Error fetching study materials:", err);
      }
    }
  };

  const deleteStudyMaterial = async (id: string) => {
    if (isMockFirebase) {
      const saved = localStorage.getItem("noter_study_materials") || "[]";
      const parsed = JSON.parse(saved);
      const filtered = parsed.filter((item: any) => item.id !== id);
      localStorage.setItem("noter_study_materials", JSON.stringify(filtered));
      setStudyMaterials((prev) => prev.filter((item) => (item as any).id !== id));
      if (activeStudyData && (activeStudyData as any).id === id) {
        setActiveStudyData(null);
      }
      console.log("[Client] Mock studyMaterial deleted.");
    } else if (fbDb) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(fbDb, "studyMaterials", id));
        setStudyMaterials((prev) => prev.filter((item) => (item as any).id !== id));
        if (activeStudyData && (activeStudyData as any).id === id) {
          setActiveStudyData(null);
        }
        console.log("[Client] Firestore studyMaterial deleted.");
      } catch (err) {
        console.error("Error deleting study material:", err);
      }
    }
  };

  // Sync study guide fetchers on user state change
  useEffect(() => {
    if (user) {
      fetchStudyMaterials();
    }
  }, [user]);

  // Sync firestore data
  const syncFromFirestore = async (userId: string) => {
    if (!fbDb) return;
    try {
      // Fetch stats
      const statsRef = doc(fbDb, "users", userId, "data", "stats");
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        setStats(statsSnap.data() as any);
      } else {
        await setDoc(statsRef, initialStats);
        setStats(initialStats);
      }

      // Fetch collections (don't seed)
      const collectionsCol = collection(fbDb, "users", userId, "collections");
      const collectionsSnap = await getDocs(collectionsCol);
      const cols: Collection[] = [];
      collectionsSnap.forEach((d) => {
        cols.push({ id: d.id, ...d.data() } as Collection);
      });
      setCollections(cols);

      // Fetch flashcards (don't seed)
      const flashcardsCol = collection(fbDb, "users", userId, "flashcards");
      const flashcardsSnap = await getDocs(flashcardsCol);
      const cards: Flashcard[] = [];
      flashcardsSnap.forEach((d) => {
        cards.push({ id: d.id, ...d.data() } as Flashcard);
      });
      setFlashcards(cards);

      // Fetch quizzes (don't seed)
      const quizzesCol = collection(fbDb, "users", userId, "quizzes");
      const quizzesSnap = await getDocs(quizzesCol);
      const qz: Quiz[] = [];
      quizzesSnap.forEach((d) => {
        qz.push({ id: d.id, ...d.data() } as Quiz);
      });
      setQuizzes(qz);
    } catch (err) {
      console.error("Firestore sync error, reverting to local data", err);
      loadLocalMocks();
    }
  };

  // Load user data from localStorage in mock mode
  const loadUserData = (userId: string) => {
    const savedCollections = localStorage.getItem(`collections_${userId}`);
    const savedCards = localStorage.getItem(`flashcards_${userId}`);
    const savedQuizzes = localStorage.getItem(`quizzes_${userId}`);
    const savedStats = localStorage.getItem(`stats_${userId}`);

    if (savedCollections) setCollections(JSON.parse(savedCollections));
    else setCollections(initialCollections);

    if (savedCards) setFlashcards(JSON.parse(savedCards));
    else setFlashcards(initialFlashcards);

    if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes));
    else setQuizzes(initialQuizzes);

    if (savedStats) setStats(JSON.parse(savedStats));
    else setStats(initialStats);
  };

  // Save data to storage (either Firestore or local storage)
  const persistData = async (
    userId: string,
    updatedCollections?: Collection[],
    updatedCards?: Flashcard[],
    updatedQuizzes?: Quiz[],
    updatedStats?: typeof initialStats
  ) => {
    if (updatedCollections) {
      setCollections(updatedCollections);
      if (!isMockFirebase && fbDb) {
        // Sync collections (for simple demo, we do local states, write-through to DB)
      } else {
        localStorage.setItem(`collections_${userId}`, JSON.stringify(updatedCollections));
      }
    }
    if (updatedCards) {
      setFlashcards(updatedCards);
      if (!isMockFirebase && fbDb) {
        // Write card through
      } else {
        localStorage.setItem(`flashcards_${userId}`, JSON.stringify(updatedCards));
      }
    }
    if (updatedQuizzes) {
      setQuizzes(updatedQuizzes);
      if (!isMockFirebase && fbDb) {
        // Write quiz through
      } else {
        localStorage.setItem(`quizzes_${userId}`, JSON.stringify(updatedQuizzes));
      }
    }
    if (updatedStats) {
      setStats(updatedStats);
      if (!isMockFirebase && fbDb) {
        const statsRef = doc(fbDb, "users", userId, "data", "stats");
        await setDoc(statsRef, updatedStats);
      } else {
        localStorage.setItem(`stats_${userId}`, JSON.stringify(updatedStats));
      }
    }
  };

  // AUTH ACTIONS
  const loginWithEmail = async (email: string, pass: string) => {
    if (!isMockFirebase && fbAuth) {
      try {
        await signInWithEmailAndPassword(fbAuth, email, pass);
      } catch (err: any) {
        if (
          err.code === "auth/configuration-not-found" ||
          err.message?.includes("CONFIGURATION_NOT_FOUND") ||
          err.code?.includes("invalid-api-key") ||
          err.message?.includes("INVALID_API_KEY")
        ) {
          console.warn("Firebase Auth not configured in console. Falling back to local mode.");
          const mockUser: UserProfile = {
            uid: `mock_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
            name: email.split("@")[0],
            email: email,
            level: 12
          };
          localStorage.setItem("mock_user", JSON.stringify(mockUser));
          setUser(mockUser);
          loadUserData(mockUser.uid);
          
          const completedOnboarding = localStorage.getItem(`onboarding_${mockUser.uid}`);
          if (completedOnboarding === "true") {
            setCurrentPage("app");
          } else {
            setCurrentPage("onboarding");
          }
          throw new Error("Firebase Auth is not enabled in your Firebase Console. We've automatically logged you in via local Demo Mode so you can study!");
        } else {
          throw err;
        }
      }
    } else {
      // Simulate API call
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (pass.length < 6) {
            reject(new Error("Password must be at least 6 characters."));
            return;
          }
          const mockUser: UserProfile = {
            uid: `mock_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
            name: email.split("@")[0],
            email: email,
            level: 12
          };
          localStorage.setItem("mock_user", JSON.stringify(mockUser));
          setUser(mockUser);
          loadUserData(mockUser.uid);
          
          const completedOnboarding = localStorage.getItem(`onboarding_${mockUser.uid}`);
          if (completedOnboarding === "true") {
            setCurrentPage("app");
          } else {
            setCurrentPage("onboarding");
          }
          resolve();
        }, 1200);
      });
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    if (!isMockFirebase && fbAuth) {
      try {
        const credentials = await createUserWithEmailAndPassword(fbAuth, email, pass);
        await updateProfile(credentials.user, { displayName: name });
        if (fbDb) {
          // Create user document in firestore
          await setDoc(doc(fbDb, "users", credentials.user.uid), {
            uid: credentials.user.uid,
            name,
            email,
            createdAt: Date.now()
          });
        }
      } catch (err: any) {
        if (
          err.code === "auth/configuration-not-found" ||
          err.message?.includes("CONFIGURATION_NOT_FOUND") ||
          err.code?.includes("invalid-api-key") ||
          err.message?.includes("INVALID_API_KEY")
        ) {
          console.warn("Firebase Auth not configured in console. Falling back to local mode.");
          const mockUser: UserProfile = {
            uid: `mock_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
            name: name,
            email: email,
            level: 12
          };
          localStorage.setItem("mock_user", JSON.stringify(mockUser));
          setUser(mockUser);
          
          // Seed new user collections locally
          localStorage.setItem(`collections_${mockUser.uid}`, JSON.stringify(initialCollections));
          localStorage.setItem(`flashcards_${mockUser.uid}`, JSON.stringify(initialFlashcards));
          localStorage.setItem(`quizzes_${mockUser.uid}`, JSON.stringify(initialQuizzes));
          localStorage.setItem(`stats_${mockUser.uid}`, JSON.stringify(initialStats));
          
          loadUserData(mockUser.uid);
          setCurrentPage("onboarding");
          throw new Error("Firebase Auth is not enabled in your Firebase Console. We've automatically logged you in via local Demo Mode so you can study!");
        } else {
          throw err;
        }
      }
    } else {
      // Simulate API call
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (pass.length < 6) {
            reject(new Error("Password must be at least 6 characters."));
            return;
          }
          const mockUser: UserProfile = {
            uid: `mock_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
            name: name,
            email: email,
            level: 12
          };
          localStorage.setItem("mock_user", JSON.stringify(mockUser));
          setUser(mockUser);
          
          // Seed new user collections locally
          localStorage.setItem(`collections_${mockUser.uid}`, JSON.stringify(initialCollections));
          localStorage.setItem(`flashcards_${mockUser.uid}`, JSON.stringify(initialFlashcards));
          localStorage.setItem(`quizzes_${mockUser.uid}`, JSON.stringify(initialQuizzes));
          localStorage.setItem(`stats_${mockUser.uid}`, JSON.stringify(initialStats));
          
          loadUserData(mockUser.uid);
          setCurrentPage("onboarding");
          resolve();
        }, 1200);
      });
    }
  };

  const loginWithGoogle = async () => {
    if (!isMockFirebase && fbAuth) {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(fbAuth, provider);
      } catch (err: any) {
        if (
          err.code === "auth/configuration-not-found" ||
          err.message?.includes("CONFIGURATION_NOT_FOUND") ||
          err.code?.includes("invalid-api-key") ||
          err.message?.includes("INVALID_API_KEY")
        ) {
          console.warn("Firebase Auth not configured in console. Falling back to local mode.");
          const mockUser: UserProfile = {
            uid: "mock_google_user",
            name: "Kathiravan S.",
            email: "kathiravan@gmail.com",
            photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kathiravan",
            level: 12
          };
          localStorage.setItem("mock_user", JSON.stringify(mockUser));
          setUser(mockUser);
          loadUserData(mockUser.uid);
          
          const completedOnboarding = localStorage.getItem(`onboarding_${mockUser.uid}`);
          if (completedOnboarding === "true") {
            setCurrentPage("app");
          } else {
            setCurrentPage("onboarding");
          }
          throw new Error("Firebase Auth is not enabled in your Firebase Console. We've automatically logged you in via local Demo Mode so you can study!");
        } else {
          throw err;
        }
      }
    } else {
      // Simulate Google Auth
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const mockUser: UserProfile = {
            uid: "mock_google_user",
            name: "Kathiravan S.",
            email: "kathiravan@gmail.com",
            photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kathiravan",
            level: 12
          };
          localStorage.setItem("mock_user", JSON.stringify(mockUser));
          setUser(mockUser);
          loadUserData(mockUser.uid);
          
          const completedOnboarding = localStorage.getItem(`onboarding_${mockUser.uid}`);
          if (completedOnboarding === "true") {
            setCurrentPage("app");
          } else {
            setCurrentPage("onboarding");
          }
          resolve();
        }, 1000);
      });
    }
  };

  const logoutUser = async () => {
    if (!isMockFirebase && fbAuth) {
      await signOut(fbAuth);
    } else {
      localStorage.removeItem("mock_user");
      setUser(null);
      setCurrentPage("auth");
    }
  };

  const resetPassword = async (email: string) => {
    if (!isMockFirebase && fbAuth) {
      // Direct Firebase action is excluded for simplicity unless explicitly needed
      // Real firebase resets can be handled easily via auth package
    } else {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 800);
      });
    }
  };

  // DATABASE OPERATIONS
  const addCollection = async (name: string, iconName = "Folder") => {
    if (!user) return;
    const newCol: Collection = {
      id: `col_${Date.now()}`,
      name,
      iconName,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      cardCount: 0,
      progress: 0
    };

    const updated = [newCol, ...collections];
    await persistData(user.uid, updated);
    
    // Firestore write if available
    if (!isMockFirebase && fbDb) {
      try {
        await setDoc(doc(fbDb, "users", user.uid, "collections", newCol.id), newCol);
      } catch (e) {
        console.error("Firestore write failed", e);
      }
    }
  };

  const deleteCollection = async (id: string) => {
    if (!user) return;
    const updatedCols = collections.filter((c) => c.id !== id);
    const updatedCards = flashcards.filter((c) => c.collectionId !== id);
    const updatedQuizzes = quizzes.filter((q) => q.collectionId !== id);

    await persistData(user.uid, updatedCols, updatedCards, updatedQuizzes);

    if (!isMockFirebase && fbDb) {
      try {
        // Delete document (flashcards & quizzes should ideally be batch-deleted)
        const firestore = require("firebase/firestore");
        await firestore.deleteDoc(doc(fbDb, "users", user.uid, "collections", id));
      } catch (e) {
        console.error("Firestore delete failed", e);
      }
    }
  };

  const renameCollection = async (id: string, newName: string) => {
    if (!user) return;
    const updated = collections.map((c) => c.id === id ? { ...c, name: newName } : c);
    await persistData(user.uid, updated);

    if (!isMockFirebase && fbDb) {
      try {
        await updateDoc(doc(fbDb, "users", user.uid, "collections", id), { name: newName });
      } catch (e) {
        console.error("Firestore rename failed", e);
      }
    }
  };

  const addFlashcard = async (collectionId: string, front: string, back: string) => {
    if (!user) return;
    const newCard: Flashcard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      collectionId,
      front,
      back,
      isFavorite: false,
      isBookmarked: false,
      mastery: "unstudied",
      createdAt: Date.now()
    };

    const updatedCards = [newCard, ...flashcards];
    
    // Recalculate card counts
    const updatedCols = collections.map((col) => {
      if (col.id === collectionId) {
        return { ...col, cardCount: col.cardCount + 1 };
      }
      return col;
    });

    await persistData(user.uid, updatedCols, updatedCards);

    if (!isMockFirebase && fbDb) {
      try {
        await setDoc(doc(fbDb, "users", user.uid, "flashcards", newCard.id), newCard);
        await updateDoc(doc(fbDb, "users", user.uid, "collections", collectionId), {
          cardCount: (collections.find(c => c.id === collectionId)?.cardCount || 0) + 1
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const deleteFlashcard = async (id: string) => {
    if (!user) return;
    const cardToDelete = flashcards.find((c) => c.id === id);
    if (!cardToDelete) return;

    const updatedCards = flashcards.filter((c) => c.id !== id);
    const updatedCols = collections.map((col) => {
      if (col.id === cardToDelete.collectionId) {
        return { ...col, cardCount: Math.max(0, col.cardCount - 1) };
      }
      return col;
    });

    await persistData(user.uid, updatedCols, updatedCards);

    if (!isMockFirebase && fbDb) {
      try {
        const firestore = require("firebase/firestore");
        await firestore.deleteDoc(doc(fbDb, "users", user.uid, "flashcards", id));
        await updateDoc(doc(fbDb, "users", user.uid, "collections", cardToDelete.collectionId), {
          cardCount: Math.max(0, (collections.find(c => c.id === cardToDelete.collectionId)?.cardCount || 1) - 1)
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const updateFlashcard = async (id: string, front: string, back: string) => {
    if (!user) return;
    const updatedCards = flashcards.map((c) => c.id === id ? { ...c, front, back } : c);
    await persistData(user.uid, undefined, updatedCards);

    if (!isMockFirebase && fbDb) {
      try {
        await updateDoc(doc(fbDb, "users", user.uid, "flashcards", id), { front, back });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const updateFlashcardMastery = async (id: string, mastery: "easy" | "medium" | "hard") => {
    if (!user) return;
    const updatedCards = flashcards.map((c) => c.id === id ? { ...c, mastery } : c);
    
    // Increment stats
    const studyHoursGain = 0.02; // Roughly 1-2 minutes per card review
    const xpGain = mastery === "easy" ? 15 : mastery === "medium" ? 10 : 5;
    
    const targetCard = flashcards.find(c => c.id === id);
    let updatedCols = collections;
    
    if (targetCard) {
      const colId = targetCard.collectionId;
      const colCards = updatedCards.filter(c => c.collectionId === colId);
      const easyCards = colCards.filter(c => c.mastery === "easy").length;
      const progressPercent = colCards.length > 0 ? Math.round((easyCards / colCards.length) * 100) : 0;
      
      updatedCols = collections.map(col => {
        if (col.id === colId) {
          return { ...col, progress: progressPercent };
        }
        return col;
      });
    }

    const updatedStats = {
      ...stats,
      xp: stats.xp + xpGain,
      studyTime: Math.round((stats.studyTime + studyHoursGain) * 10) / 10,
      cardsReviewed: stats.cardsReviewed + 1,
    };

    await persistData(user.uid, updatedCols, updatedCards, undefined, updatedStats);

    if (!isMockFirebase && fbDb) {
      try {
        await updateDoc(doc(fbDb, "users", user.uid, "flashcards", id), { mastery });
        if (targetCard) {
          const colId = targetCard.collectionId;
          const colCards = updatedCards.filter(c => c.collectionId === colId);
          const easyCards = colCards.filter(c => c.mastery === "easy").length;
          const progressPercent = colCards.length > 0 ? Math.round((easyCards / colCards.length) * 100) : 0;
          await updateDoc(doc(fbDb, "users", user.uid, "collections", colId), { progress: progressPercent });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleFavoriteFlashcard = async (id: string) => {
    if (!user) return;
    const updatedCards = flashcards.map((c) => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c);
    await persistData(user.uid, undefined, updatedCards);

    if (!isMockFirebase && fbDb) {
      try {
        const target = flashcards.find(c => c.id === id);
        if (target) {
          await updateDoc(doc(fbDb, "users", user.uid, "flashcards", id), { isFavorite: !target.isFavorite });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleBookmarkFlashcard = async (id: string) => {
    if (!user) return;
    const updatedCards = flashcards.map((c) => c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c);
    await persistData(user.uid, undefined, updatedCards);

    if (!isMockFirebase && fbDb) {
      try {
        const target = flashcards.find(c => c.id === id);
        if (target) {
          await updateDoc(doc(fbDb, "users", user.uid, "flashcards", id), { isBookmarked: !target.isBookmarked });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const addQuiz = async (quiz: Quiz) => {
    if (!user) return;
    const updatedQuizzes = [quiz, ...quizzes];
    await persistData(user.uid, undefined, undefined, updatedQuizzes);

    if (!isMockFirebase && fbDb) {
      try {
        await setDoc(doc(fbDb, "users", user.uid, "quizzes", quiz.id), quiz);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const addXp = async (amount: number) => {
    if (!user) return;
    const updatedStats = {
      ...stats,
      xp: stats.xp + amount
    };
    await persistData(user.uid, undefined, undefined, undefined, updatedStats);
  };

  const addStudyTime = async (hours: number) => {
    if (!user) return;
    const updatedStats = {
      ...stats,
      studyTime: Math.round((stats.studyTime + hours) * 10) / 10
    };
    await persistData(user.uid, undefined, undefined, undefined, updatedStats);
  };

  const incrementStreak = () => {
    if (!user) return;
    const updatedStats = {
      ...stats,
      streak: stats.streak + 1
    };
    persistData(user.uid, undefined, undefined, undefined, updatedStats);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        currentPage,
        activeTab,
        theme,
        collections,
        flashcards,
        quizzes,
        stats,
        currentCollectionId,
        
        studyMaterials,
        activeStudyData,
        setActiveStudyData,
        fetchStudyMaterials,
        deleteStudyMaterial,
        
        setCurrentPage,
        setActiveTab,
        setCurrentCollectionId,
        
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logoutUser,
        resetPassword,
        
        toggleTheme,
        
        addCollection,
        deleteCollection,
        renameCollection,
        addFlashcard,
        deleteFlashcard,
        updateFlashcard,
        updateFlashcardMastery,
        toggleFavoriteFlashcard,
        toggleBookmarkFlashcard,
        addQuiz,
        addXp,
        addStudyTime,
        incrementStreak
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
