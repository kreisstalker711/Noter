import { NextResponse } from "next/server";
import { getGroqClient } from "../../../lib/groq";

export const dynamic = "force-dynamic";

function cleanMalformedJson(str: string): string {
  let cleaned = str.trim();
  // Remove markdown code block wraps if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  // Extract content between first '{' and last '}'
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  return cleaned;
}

function extractRobustData(parsedData: any, subjectData: any, cleanText: string) {
  const keys = Object.keys(parsedData || {});
  const findVal = (keyNames: string[]) => {
    for (const kn of keyNames) {
      const match = keys.find(k => k.toLowerCase() === kn.toLowerCase());
      if (match) return parsedData[match];
    }
    return undefined;
  };

  const chapterTitle = findVal(["chapterTitle", "title", "chapter"]) || subjectData.chapter || "Untitled Chapter";
  
  let summary = findVal(["summary", "description", "abstract"]);
  if (!summary || typeof summary !== "string") {
    summary = cleanText.split(/[.!?]+/).slice(0, 2).join(". ") + ".";
  }

  let importantPoints = findVal(["importantPoints", "points", "takeaways", "keyPoints"]);
  if (!Array.isArray(importantPoints)) {
    importantPoints = typeof importantPoints === "string" ? [importantPoints] : [];
  }
  if (importantPoints.length === 0) {
    importantPoints = cleanText.split(/[.!?]+/).slice(1, 4).map(s => s.trim()).filter(Boolean);
  }

  let flashcards = findVal(["flashcards", "cards", "questions"]);
  if (!Array.isArray(flashcards)) flashcards = [];
  flashcards = flashcards.map((f: any) => {
    if (!f || typeof f !== "object") return null;
    const fKeys = Object.keys(f);
    const fFind = (names: string[]) => {
      const m = fKeys.find(k => names.includes(k.toLowerCase()));
      return m ? f[m] : undefined;
    };
    return {
      question: fFind(["question", "q"]) || "Study question",
      answer: fFind(["answer", "a"]) || "Refer to text.",
      difficulty: fFind(["difficulty", "diff"]) || "Medium"
    };
  }).filter(Boolean);

  let quiz = findVal(["quiz", "questions", "test", "quizQuestions"]);
  if (!Array.isArray(quiz)) quiz = [];
  quiz = quiz.map((q: any) => {
    if (!q || typeof q !== "object") return null;
    const qKeys = Object.keys(q);
    const qFind = (names: string[]) => {
      const m = qKeys.find(k => names.includes(k.toLowerCase()));
      return m ? q[m] : undefined;
    };
    const question = qFind(["question", "q"]) || "Select the correct option.";
    let options = qFind(["options", "opts", "answers"]);
    if (!Array.isArray(options)) {
      options = ["True", "False", "Not mentioned", "None of the above"];
    }
    while (options.length < 4) options.push(`Option ${options.length + 1}`);
    options = options.slice(0, 4);

    const correctAnswer = qFind(["correctanswer", "correct", "answer"]) || options[0];
    const explanation = qFind(["explanation", "exp", "reason"]) || "Based on reading section.";
    return { question, options, correctAnswer, explanation };
  }).filter(Boolean);

  let keywords = findVal(["keywords", "terms", "tags", "vocab"]);
  if (!Array.isArray(keywords)) {
    keywords = typeof keywords === "string" ? [keywords] : ["Study", "Concept"];
  }

  return {
    chapterTitle,
    summary,
    importantPoints,
    flashcards,
    quiz,
    keywords
  };
}

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
      
      try {
        const materialCompletion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: generatePrompt }],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });

        rawJson = materialCompletion.choices[0]?.message?.content || "";
        const duration = Date.now() - startTime;
        console.log(`[API] Attempt ${attempt} finished in ${duration}ms`);

        const cleanedJson = cleanMalformedJson(rawJson);
        const tempParsed = JSON.parse(cleanedJson);
        
        // Validation check for key sections
        const normKeys = Object.keys(tempParsed || {}).map(k => k.toLowerCase());
        const hasSummary = normKeys.includes("summary");
        const hasQuiz = normKeys.includes("quiz");

        if (hasSummary && hasQuiz) {
          parsedData = extractRobustData(tempParsed, subjectData, cleanText);
        } else {
          console.warn("[API] Attempt failed validation check (missing summary or quiz).");
          if (attempt === 2) {
            // Force heal whatever we got on final attempt
            parsedData = extractRobustData(tempParsed || {}, subjectData, cleanText);
          }
        }
      } catch (jsonErr) {
        console.error(`[API] JSON parsing failed on attempt ${attempt}:`, jsonErr);
        if (attempt === 2) {
          // If JSON parse failed completely on final attempt, construct a fully healed blank schema from cleanedText
          console.warn("[API] Parse failed on final attempt. Healing from cleaned text.");
          parsedData = extractRobustData({}, subjectData, cleanText);
        }
      }
    }

    if (!parsedData) {
      parsedData = extractRobustData({}, subjectData, cleanText);
    }

    // Validate keys and shape
    const result = {
      cleanText,
      chapterTitle: parsedData.chapterTitle,
      summary: parsedData.summary,
      importantPoints: parsedData.importantPoints,
      flashcards: parsedData.flashcards,
      quiz: parsedData.quiz,
      keywords: parsedData.keywords,
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
