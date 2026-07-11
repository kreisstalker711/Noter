import { createWorker } from "tesseract.js";

/**
 * Client-side OCR processor using Tesseract.js
 * Exposes a worker recognize queue and tracks progress steps.
 */
export const extractText = async (
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  // Initialize worker with logger using Tesseract.js v5 signature
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (onProgress) {
        let statusText = "Processing...";
        if (m.status === "loading tesseract core") {
          statusText = "Reading image...";
          onProgress(statusText, m.progress || 0.1);
        } else if (m.status === "initializing api") {
          statusText = "Detecting text...";
          onProgress(statusText, m.progress || 0.35);
        } else if (m.status === "recognizing text") {
          statusText = "Preparing results...";
          onProgress(statusText, m.progress || 0.7);
        } else {
          onProgress(statusText, 0.2);
        }
      }
    },
  });

  try {
    // Generate object URL for image file
    const imageUrl = URL.createObjectURL(file);

    // Run OCR recognize
    const { data: { text } } = await worker.recognize(imageUrl);

    // Clean up worker and URL resources
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);

    return text;
  } catch (err) {
    console.error("Tesseract OCR process error:", err);
    try {
      await worker.terminate();
    } catch (_) {}
    throw err;
  }
};
