export interface Flashcard {
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudyMaterialResult {
  id?: string;
  userId?: string;
  createdAt?: string;
  sourceType?: "PDF" | "Camera" | "Image";
  fileName?: string;
  mode?: string;
  chatHistory?: any[];
  cleanText: string;
  chapterTitle: string;
  summary: string;
  importantPoints: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  keywords: string[];
  isMock?: boolean;
}

export interface LibraryItem {
  id?: string;
  userId: string;
  title: string;
  description: string;
  fileURL: string;
  thumbnail?: string;
  category: string;
  folder: string; // e.g. "Root" or "Semester 1"
  tags: string[];
  createdAt: string;
  updatedAt: string;
  type: "PDF" | "Image" | "Word" | "PowerPoint" | "Text" | "StudyGuide";
  size: number; // in bytes
  favorite: boolean;
  pinned: boolean;
  ocrText?: string;
  summary?: string;
  importantPoints?: string[];
  keywords?: string[];
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
}

/**
 * Calls the API route POST /api/generate to clean OCR text and generate study materials.
 */
export async function generateStudyMaterial(
  ocrText: string
): Promise<StudyMaterialResult> {
  console.log("[Client] Calling generateStudyMaterial()");
  console.log("[Client] Sending request to API");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ocrText }),
    });

    console.log("[Client] Client received response", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API responded with status: ${response.status}`);
    }

    console.log("[Client] Parsing JSON");
    const data: StudyMaterialResult = await response.json();
    return data;
  } catch (err: any) {
    console.error("[Client] generateStudyMaterial error:", err);
    throw err;
  }
}
