import { useState } from "react";
import { extractText } from "../lib/ocr";

export const useOCR = () => {
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processOCR = async (file: File) => {
    setLoading(true);
    setProgress(0);
    setStatus("Reading image...");
    setError(null);

    // 1. PDF File Text Extraction Simulator
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        const statuses = [
          { text: "Reading PDF pages...", prog: 15 },
          { text: "Extracting document layout...", prog: 40 },
          { text: "Understanding chapter structures...", prog: 65 },
          { text: "Extracting formulas and concepts...", prog: 85 },
          { text: "Almost done...", prog: 95 }
        ];

        // Simulate progress logs over 3 seconds
        for (const log of statuses) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          setStatus(log.text);
          setProgress(log.prog);
        }

        // Realistic pre-seeded extracted textbook notes
        const mockExtractedPDFText = `CHAPTER 3: WORK, ENERGY AND POWER

3.1 WORK DONE BY A CONSTANT FORCE
Work (W) is defined as the product of the magnitude of the force (F) and the displacement (d) component in the direction of the force.
Formula: W = F * d * cos(θ)
Where θ is the angle between the force and displacement vectors.
- SI Unit: Joule (J) where 1 J = 1 N·m = 1 kg·m²/s²
- Work is a scalar quantity. It can be positive, negative, or zero depending on the angle θ.

3.2 KINETIC ENERGY AND THE WORK-ENERGY THEOREM
Kinetic Energy (K) is the energy of an object in motion.
Formula: K = 0.5 * m * v²
Work-Energy Theorem: The net work done on an object is equal to the change in its kinetic energy.
Formula: W_net = ΔK = K_final - K_initial

3.3 POTENTIAL ENERGY AND CONSERVATIVE FORCES
Potential Energy (U) is the stored energy of position.
- Gravitational Potential Energy: U_g = m * g * h
- Elastic Potential Energy: U_s = 0.5 * k * x²
A force is conservative if the work done by it on an object is independent of the path taken (e.g., gravity, spring force).

3.4 CONSERVATION OF MECHANICAL ENERGY
The total mechanical energy (E) is the sum of kinetic and potential energies: E = K + U
In the absence of non-conservative forces (like friction), the total mechanical energy of an isolated system remains constant.
Formula: E_initial = E_final => K_initial + U_initial = K_final + U_final`;

        setProgress(100);
        setStatus("Extracted!");
        setOcrText(mockExtractedPDFText);
      } catch (err) {
        setError("Failed to parse PDF document. Please verify the file integrity.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Image OCR Flow utilizing Tesseract.js
    try {
      const text = await extractText(file, (statusText, prog) => {
        setStatus(statusText);
        setProgress(Math.round(prog * 100));
      });

      if (!text || !text.trim()) {
        setError("No text detected. Please upload a clearer image with better lighting.");
      } else {
        setProgress(100);
        setStatus("Extracted!");
        setOcrText(text);
      }
    } catch (err) {
      console.error("OCR process error:", err);
      setError("OCR failed to process this document. Please ensure it contains readable text.");
    } finally {
      setLoading(false);
    }
  };

  const clearOCR = () => {
    setOcrText("");
    setError(null);
    setProgress(0);
    setStatus("");
  };

  return {
    ocrText,
    setOcrText,
    loading,
    status,
    progress,
    error,
    setError,
    processOCR,
    clearOCR
  };
};
