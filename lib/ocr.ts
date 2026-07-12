import { createWorker } from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * Client-side canvas image preprocessing filter to enhance text legibility.
 * Applies grayscale, contrast boost, sharpening, and binarization.
 */
export async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(URL.createObjectURL(file));
          return;
        }

        // 1. Scale up low-resolution images for better text recognition
        const scale = 1.5;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw scaled image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = imgData.width;
        const h = imgData.height;

        // 2. Grayscale & Contrast adjustments
        // Contrast enhancement factor
        const contrast = 60; // range [-255, 255]
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Grayscale conversion
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Contrast boost
          gray = factor * (gray - 128) + 128;
          gray = Math.max(0, Math.min(255, gray));

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        // 3. Apply 3x3 Sharpening Convolution Filter
        const weights = [
           0, -1,  0,
          -1,  5, -1,
           0, -1,  0
        ];
        const side = Math.round(Math.sqrt(weights.length));
        const halfSide = Math.floor(side / 2);
        const outputData = ctx.createImageData(w, h);
        const dst = outputData.data;

        // Temporary copy of grayscale pixels
        const src = new Uint8ClampedArray(data);

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const sy = y;
            const sx = x;
            const dstOff = (y * w + x) * 4;
            
            // Calculate convolution sum
            let rSum = 0;
            for (let cy = 0; cy < side; cy++) {
              for (let cx = 0; cx < side; cx++) {
                const scy = Math.min(h - 1, Math.max(0, sy + cy - halfSide));
                const scx = Math.min(w - 1, Math.max(0, sx + cx - halfSide));
                const srcOff = (scy * w + scx) * 4;
                const wt = weights[cy * side + cx];
                rSum += src[srcOff] * wt;
              }
            }

            // Clamping value between 0-255
            const finalVal = Math.max(0, Math.min(255, rSum));

            // Binarization adaptive threshold (e.g. 128)
            const binary = finalVal > 120 ? 255 : 0;

            dst[dstOff] = binary;
            dst[dstOff + 1] = binary;
            dst[dstOff + 2] = binary;
            dst[dstOff + 3] = 255; // fully opaque alpha
          }
        }

        ctx.putImageData(outputData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.onerror = () => reject(new Error("Image render failed"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File load failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * Client-side OCR processor using Tesseract.js
 */
export const extractText = async (
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<OcrResult> => {
  // Initialize worker with logger
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
    let imageUrl = "";
    if (file.type.startsWith("image/")) {
      console.log("[OCR] Preprocessing image before extraction...");
      imageUrl = await preprocessImage(file);
    } else {
      imageUrl = URL.createObjectURL(file);
    }

    // Run OCR recognize
    const { data: { text, confidence } } = await worker.recognize(imageUrl);

    // Clean up worker
    await worker.terminate();
    if (imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }

    return {
      text: text || "",
      confidence: confidence || 0
    };
  } catch (err) {
    console.error("Tesseract OCR process error:", err);
    try {
      await worker.terminate();
    } catch (_) {}
    throw err;
  }
};
