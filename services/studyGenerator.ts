"use server";

import { getGroqClient } from "../lib/groq";

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
 * Server action to clean OCR text and generate study materials using Groq API.
 */
export async function generateStudyMaterial(
  ocrText: string
): Promise<StudyMaterialResult> {
  const groq = getGroqClient();

  // 1. Fallback Mock Data Generator (Runs if GROQ_API_KEY is not defined)
  if (!groq) {
    console.log("Using fail-safe mock study material generator.");
    
    // Simulate server latency (1.8 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1800));

    return {
      cleanText: ocrText || "No source text provided.",
      chapterTitle: "Kinematics & Constant Acceleration Dynamics",
      summary: "This chapter covers the fundamental principles of kinematics, focusing on constant acceleration, equations of motion, displacement, velocity vectors, and gravity-induced free fall. It establishes the relationship between forces and resulting movement profiles.",
      importantPoints: [
        "Kinematics describes object positions, velocity vectors, and accelerations over study intervals without considering force origins.",
        "Constant acceleration conditions permit usage of standard kinematic equations of motion.",
        "Gravity induces uniform vertical acceleration during free fall (approximated at 9.8 m/s² on Earth's surface).",
        "Displacement is a vector representation of the difference between starting and final positions.",
        "Velocity represents rate of displacement change over time, whereas speed is a simple magnitude scalar.",
        "Instantaneous acceleration is calculated as the derivative of velocity vectors with respect to time intervals.",
        "Air resistance is typically ignored in simple constant acceleration projectile simulations.",
        "Graphical plotting of velocity vs time vectors displays acceleration values as the curve gradient."
      ],
      flashcards: [
        {
          question: "What is the difference between displacement and distance?",
          answer: "Displacement is a vector quantity representing change in position (shortest path), while distance is a scalar representing path length travelled.",
          difficulty: "Easy"
        },
        {
          question: "State the equation relating final velocity, initial velocity, acceleration, and displacement.",
          answer: "v² = u² + 2as, where v is final velocity, u is initial velocity, a is acceleration, and s is displacement.",
          difficulty: "Medium"
        },
        {
          question: "What acceleration does an object experience in a vacuum free fall on Earth?",
          answer: "It experiences a constant downward gravitational acceleration of approximately 9.81 m/s².",
          difficulty: "Easy"
        },
        {
          question: "How is average velocity calculated on a displacement-time graph?",
          answer: "By finding the slope (rise over run) of the chord connecting the start and end points of the interval.",
          difficulty: "Medium"
        },
        {
          question: "Under what condition can the four standard kinematic equations be applied?",
          answer: "They can only be applied when the acceleration of the object is constant throughout the motion.",
          difficulty: "Hard"
        }
      ],
      quiz: [
        {
          question: "Which of the following is a vector quantity?",
          options: ["Speed", "Distance", "Time", "Velocity"],
          correctAnswer: "Velocity",
          explanation: "Velocity possesses both magnitude and direction, making it a vector quantity, unlike speed, distance, or time which are scalars."
        },
        {
          question: "An object is thrown vertically upwards. At its peak height, its velocity is:",
          options: ["9.8 m/s²", "0 m/s", "Maximum velocity", "Equal to initial velocity"],
          correctAnswer: "0 m/s",
          explanation: "At the highest peak point, the object stops momentarily to reverse its direction, meaning velocity is zero."
        },
        {
          question: "A car accelerates from rest at 2 m/s² for 5 seconds. What is its final velocity?",
          options: ["5 m/s", "10 m/s", "15 m/s", "20 m/s"],
          correctAnswer: "10 m/s",
          explanation: "Using v = u + at, where u = 0, a = 2, and t = 5: v = 0 + 2 * 5 = 10 m/s."
        },
        {
          question: "The area under a velocity-time graph represents:",
          options: ["Acceleration", "Speed", "Displacement", "Jerk"],
          correctAnswer: "Displacement",
          explanation: "The integration (area under the curve) of velocity over time calculates total displacement."
        },
        {
          question: "An object falls freely from rest. What distance does it fall in the first second?",
          options: ["4.9 m", "9.8 m", "19.6 m", "0.5 m"],
          correctAnswer: "4.9 m",
          explanation: "Using s = ut + 0.5at², where u = 0, a = 9.8, and t = 1: s = 0 + 0.5 * 9.8 * 1² = 4.9 meters."
        },
        {
          question: "If displacement is modeled as s(t) = 3t² + 2t, what is instantaneous velocity at t = 2s?",
          options: ["8 m/s", "10 m/s", "14 m/s", "16 m/s"],
          correctAnswer: "14 m/s",
          explanation: "Velocity is the derivative of displacement: v(t) = ds/dt = 6t + 2. Evaluating at t = 2: v(2) = 6(2) + 2 = 14 m/s."
        },
        {
          question: "Which constant represents rate of change of acceleration?",
          options: ["Force", "Jerk", "Momentum", "Velocity"],
          correctAnswer: "Jerk",
          explanation: "Jerk is defined as the time derivative of acceleration (da/dt)."
        },
        {
          question: "A projectile is launched at a 45-degree angle. Its horizontal acceleration component is:",
          options: ["9.8 m/s²", "4.9 m/s²", "0 m/s²", "9.8 * cos(45) m/s²"],
          correctAnswer: "0 m/s²",
          explanation: "Assuming negligible air resistance, there are no horizontal forces acting on a projectile, so horizontal acceleration is zero."
        },
        {
          question: "An object moving at 6 m/s accelerates at 4 m/s² for 3 seconds. Find final velocity.",
          options: ["10 m/s", "12 m/s", "18 m/s", "24 m/s"],
          correctAnswer: "18 m/s",
          explanation: "Using v = u + at: v = 6 + 4 * 3 = 18 m/s."
        },
        {
          question: "Which of the following is the scalar equivalent of displacement?",
          options: ["Speed", "Velocity", "Distance", "Acceleration"],
          correctAnswer: "Distance",
          explanation: "Distance measures total length of path travelled without direction, making it the scalar equivalent of displacement."
        }
      ],
      keywords: ["Velocity", "Acceleration", "Displacement", "Free Fall", "Kinematics", "Gravity", "Vector Quantity", "Equations of Motion"],
      isMock: true
    };
  }

  // 2. Real Groq AI completion flow
  try {
    // --- STEP 1: OCR CLEANING ---
    const ocrCleanPrompt = `You are an OCR correction assistant.
The following text was extracted from a scanned document and may contain OCR mistakes.
Correct spelling errors.
Fix broken words.
Reconstruct incomplete sentences.
Preserve the original meaning.
Do NOT summarize.
Return ONLY the corrected text.

Source OCR Text:
"${ocrText}"`;

    const cleanCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: ocrCleanPrompt }],
      temperature: 0.1,
    });

    const cleanText = cleanCompletion.choices[0]?.message?.content || ocrText;

    // --- STEP 2: GENERATE STUDY MATERIAL ---
    const generatePrompt = `You are an expert study assistant.
Analyze the following chapter and return ONLY valid JSON.

Generate:
1. chapterTitle
2. summary (maximum 200 words)
3. importantPoints (return 8-12 important bullet points)
4. flashcards (return list of questions, answers, and difficulties: "Easy", "Medium", or "Hard")
5. quiz (generate exactly 10 multiple-choice questions. Each question must contain: question, options [exactly 4 strings], correctAnswer [must match one of options exactly], explanation)
6. keywords (return the most important technical terms or vocabulary words)

Return ONLY a JSON object that satisfies this schema:
{
  "chapterTitle": "string",
  "summary": "string",
  "importantPoints": ["string"],
  "flashcards": [
    {
      "question": "string",
      "answer": "string",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ],
  "keywords": ["string"]
}

Source Cleaned Text:
"${cleanText}"`;

    const materialCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: generatePrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" } // Enforce JSON formatting
    });

    const rawJson = materialCompletion.choices[0]?.message?.content || "";
    const parsedData = JSON.parse(rawJson);

    // Validate expected structure elements
    const result: StudyMaterialResult = {
      cleanText,
      chapterTitle: parsedData.chapterTitle || "Untitled Chapter",
      summary: parsedData.summary || "Summary generation failed.",
      importantPoints: Array.isArray(parsedData.importantPoints) ? parsedData.importantPoints : [],
      flashcards: Array.isArray(parsedData.flashcards) ? parsedData.flashcards : [],
      quiz: Array.isArray(parsedData.quiz) ? parsedData.quiz : [],
      keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : []
    };

    return result;
  } catch (err) {
    console.error("Groq AI Generation Server Error:", err);
    throw new Error("AI Generation failed. Please try again or check API configuration.");
  }
}
