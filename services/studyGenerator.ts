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
  cleanText: string;
  chapterTitle: string;
  summary: string;
  importantPoints: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  keywords: string[];
  isMock?: boolean;
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
