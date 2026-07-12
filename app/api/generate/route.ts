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

    // --- PRE-VALIDATION: Check if text is sufficient ---
    const wordCount = ocrText.trim().split(/\s+/).length;
    if (wordCount < 10) {
      console.warn(`[API] OCR text size of ${wordCount} words is insufficient.`);
      return NextResponse.json(
        { error: "The uploaded document does not contain enough readable information to generate study material." },
        { status: 400 }
      );
    }

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
        category: "Physics",
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
Do NOT summarize or add external information.
Return ONLY the corrected text.

Source OCR Text:
"${ocrText}"`;

    const cleanCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: ocrCleanPrompt }],
      temperature: 0.1,
    });

    const cleanText = cleanCompletion.choices[0]?.message?.content || ocrText;
    console.log("[API] Groq response received (OCR correction). Cleaned text length:", cleanText.length);

    // --- STEP 2: DEDICATED SUBJECT & CHAPTER DETECTION ---
    console.log("[API] Starting subject classification");
    const subjectDetectPrompt = `You are an academic classifier.
Analyze the provided cleaned OCR text and determine the academic subject, chapter title, and your classification confidence score (integer 0-100).
Select the subject ONLY from these categories: Physics, Chemistry, Biology, Mathematics, History, Computer Science, English, Economics, Business Studies, Languages, General.

Cleaned OCR Text:
"${cleanText}"

Return ONLY a JSON object satisfying this schema:
{
  "subject": "string",
  "chapter": "string",
  "confidence": number
}`;

    const subjectCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: subjectDetectPrompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const subjectJson = subjectCompletion.choices[0]?.message?.content || "";
    console.log("[API] Subject classification received:", subjectJson);
    const subjectData = JSON.parse(subjectJson);

    if (subjectData.confidence < 80) {
      console.warn(`[API] Classification confidence of ${subjectData.confidence}% is below the 80% threshold.`);
      return NextResponse.json(
        { error: "We could not confidently identify this chapter. Please upload a clearer image." },
        { status: 422 }
      );
    }

    // --- STEP 3: STUDY MATERIAL GENERATION WITH RETRY VALIDATION ---
    const generatePrompt = `You are an expert study assistant.
Analyze the provided cleaned text and generate study materials.
You MUST obey these strict rules to prevent hallucinations:
1. Use ONLY the facts explicitly mentioned in the source text.
2. Never invent, assume, or pull in external information.
3. If the source text is insufficient, incomplete, or gibberish, return the warning inside the summary.
4. Keep the subject as: ${subjectData.subject} and chapter title as: ${subjectData.chapter}.

Generate:
1. chapterTitle (must match: ${subjectData.chapter})
2. summary (maximum 200 words summarizing only the source text)
3. importantPoints (return 8-12 bullet points of key takeaways)
4. flashcards (return list of questions, answers, and difficulties: "Easy", "Medium", or "Hard")
5. quiz (generate exactly 10 multiple-choice questions from the text. Each question must contain: question, options [exactly 4 strings], correctAnswer, explanation)
6. keywords (return list of technical terms found in the text)

Return ONLY a JSON object that satisfies this schema:
{
  "chapterTitle": "string",
  "summary": "string",
  "importantPoints": ["string"],
  "flashcards": [
    { "question": "string", "answer": "string", "difficulty": "Easy" | "Medium" | "Hard" }
  ],
  "quiz": [
    { "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "explanation": "string" }
  ],
  "keywords": ["string"]
}

Source Cleaned Text:
"${cleanText}"`;

    let attempt = 0;
    let parsedData = null;
    let rawJson = "";

    while (attempt < 2 && !parsedData) {
      attempt++;
      console.log(`[API] AI generation attempt ${attempt} started`);
      const startTime = Date.now();
      
      const materialCompletion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: generatePrompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      rawJson = materialCompletion.choices[0]?.message?.content || "";
      const duration = Date.now() - startTime;
      console.log(`[API] Attempt ${attempt} finished in ${duration}ms`);

      try {
        parsedData = JSON.parse(rawJson);
        
        // Response Validation Checks
        const summaryValid = parsedData.summary && parsedData.summary.length > 5;
        const quizValid = Array.isArray(parsedData.quiz) && parsedData.quiz.length > 0;
        
        if (!summaryValid || !quizValid) {
          console.warn("[API] Response validation failed. Retrying...");
          parsedData = null; // force retry
        }
      } catch (jsonErr) {
        console.error("[API] JSON parsing failed on attempt", attempt, jsonErr);
        parsedData = null;
      }
    }

    if (!parsedData) {
      throw new Error("Failed to generate a valid study guide after multiple attempts.");
    }

    // Validate keys and shape
    const result = {
      cleanText,
      chapterTitle: parsedData.chapterTitle || subjectData.chapter || "Untitled Chapter",
      summary: parsedData.summary || "Summary generation failed.",
      importantPoints: Array.isArray(parsedData.importantPoints) ? parsedData.importantPoints : [],
      flashcards: Array.isArray(parsedData.flashcards) ? parsedData.flashcards : [],
      quiz: Array.isArray(parsedData.quiz) ? parsedData.quiz : [],
      keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : [],
      category: subjectData.subject || "General"
    };

    console.log("[API] Study guide generated successfully.");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API] Groq AI Generation Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate study materials." },
      { status: 500 }
    );
  }
}
