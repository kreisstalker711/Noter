import { NextResponse } from "next/server";
import { getGroqClient } from "../../../lib/groq";

export const dynamic = "force-dynamic";

/**
 * Next.js API Route handler for AI generation
 * POST /api/generate
 */
export async function POST(request: Request) {
  console.log("[API] API request received");
  
  try {
    const { ocrText } = await request.json();
    if (!ocrText) {
      console.warn("[API] Empty ocrText payload received");
      return NextResponse.json(
        { error: "No OCR text provided." },
        { status: 400 }
      );
    }

    const groq = getGroqClient();

    // Fallback Mock data generator if GROQ_API_KEY is not defined
    if (!groq) {
      console.log("[API] No Groq API Key found. Using mock study material generator.");
      
      // Simulate server latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockData = {
        cleanText: ocrText,
        chapterTitle: "Kinematics & Constant Acceleration Dynamics",
        summary: "This chapter covers the fundamental principles of kinematics, focusing on constant acceleration, equations of motion, displacement, velocity vectors, and gravity-induced free fall. It establishes the relationship between forces and resulting movement profiles.",
        importantPoints: [
          "Kinematics describes object positions, velocity vectors, and accelerations over study intervals without considering force origins.",
          "Constant acceleration conditions permit usage of standard kinematic equations of motion.",
          "Gravity induces uniform vertical acceleration during free fall (approximated at 9.8 m/s² on Earth's surface).",
          "Displacement is a vector representation of the difference between starting and final positions.",
          "Velocity represents rate of displacement change over time, whereas speed is a simple magnitude scalar."
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
          }
        ],
        keywords: ["Velocity", "Acceleration", "Displacement", "Free Fall", "Kinematics", "Gravity"],
        isMock: true
      };

      console.log("[API] Returning response (Mock Data)");
      return NextResponse.json(mockData);
    }

    // --- STEP 1: OCR CLEANING ---
    console.log("[API] Groq request started (OCR correction)");
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
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: ocrCleanPrompt }],
      temperature: 0.1,
    });

    const cleanText = cleanCompletion.choices[0]?.message?.content || ocrText;
    console.log("[API] Groq response received (OCR correction)");

    // --- STEP 2: GENERATE STUDY MATERIAL ---
    console.log("[API] Groq request started (Study material generation)");
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
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: generatePrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const rawJson = materialCompletion.choices[0]?.message?.content || "";
    console.log("[API] Groq response received (Study material generation)");

    console.log("[API] Parsing JSON");
    const parsedData = JSON.parse(rawJson);

    // Validate keys and shape
    const result = {
      cleanText,
      chapterTitle: parsedData.chapterTitle || "Untitled Chapter",
      summary: parsedData.summary || "Summary generation failed.",
      importantPoints: Array.isArray(parsedData.importantPoints) ? parsedData.importantPoints : [],
      flashcards: Array.isArray(parsedData.flashcards) ? parsedData.flashcards : [],
      quiz: Array.isArray(parsedData.quiz) ? parsedData.quiz : [],
      keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : []
    };

    console.log("[API] Returning response");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API] Groq AI Generation Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate study materials." },
      { status: 500 }
    );
  }
}
