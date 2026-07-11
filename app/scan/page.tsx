"use client";

import React, { useState, useRef, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useOCR } from "../../hooks/useOCR";
import { ScanOptions } from "../../components/ScanOptions";
import { ImagePreview } from "../../components/ImagePreview";
import { OCRProgress } from "../../components/OCRProgress";
import { TextEditor } from "../../components/TextEditor";
import { EmptyState } from "../../components/EmptyState";
import { Dialog } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, RefreshCw, X, AlertCircle } from "lucide-react";
import Image from "next/image";

// AI Generation imports
import { generateStudyMaterial, StudyMaterialResult } from "../../services/studyGenerator";
import { LoadingScreen } from "../../components/LoadingScreen";
import { SummaryCard } from "../../components/SummaryCard";
import { FlashcardViewer } from "../../components/FlashcardViewer";
import { QuizViewer } from "../../components/QuizViewer";
import { KeywordCard } from "../../components/KeywordCard";
import { StudyTabs, StudyTabType } from "../../components/StudyTabs";
import { db, isMockFirebase } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ScanPage() {
  const context = React.useContext(AppContext);
  const setActiveTab = context?.setActiveTab || (() => {});
  
  const {
    ocrText,
    setOcrText,
    loading: ocrLoading,
    status: ocrStatus,
    progress: ocrProgress,
    error: ocrError,
    setError,
    processOCR,
    clearOCR
  } = useOCR();

  const [file, setFile] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AI workspace states
  const [generationLoading, setGenerationLoading] = useState(false);
  const [studyData, setStudyData] = useState<StudyMaterialResult | null>(null);
  const [activeStudyTab, setActiveStudyTab] = useState<StudyTabType>("summary");

  const videoRef = useRef<HTMLVideoElement>(null);

  // Close camera tracks when unmounting
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const openCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Prioritize rear camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please verify device permissions.");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const snappedFile = new File([blob], `camera_snap_${Date.now()}.jpg`, {
              type: "image/jpeg"
            });
            setFile(snappedFile);
            closeCamera();
          }
        },
        "image/jpeg",
        0.9
      );
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    clearOCR();
  };

  const handleClear = () => {
    setFile(null);
    clearOCR();
  };

  const handleExtract = async () => {
    if (!file) return;
    await processOCR(file);
  };

  const handleContinue = async () => {
    if (!ocrText) return;
    setGenerationLoading(true);
    setError(null);
    setCameraError(null);

    try {
      // 1. Trigger server action to clean OCR and generate JSON files via Groq SDK
      const data = await generateStudyMaterial(ocrText);
      setStudyData(data);

      // 2. Save study guides to Firestore db
      const currentUserId = context?.user?.uid || "mock-user-id";
      const docData = {
        cleanText: data.cleanText,
        chapterTitle: data.chapterTitle,
        summary: data.summary,
        importantPoints: data.importantPoints,
        flashcards: data.flashcards,
        quiz: data.quiz,
        keywords: data.keywords,
        createdAt: new Date().toISOString(),
        userId: currentUserId
      };

      if (isMockFirebase) {
        // Save to local storage for sandboxed test logins
        const saved = localStorage.getItem("noter_study_materials") || "[]";
        const parsed = JSON.parse(saved);
        parsed.push({ ...docData, id: `mock-${Date.now()}` });
        localStorage.setItem("noter_study_materials", JSON.stringify(parsed));
        console.log("Study guides saved to Mock LocalStorage.");
      } else {
        // Save to Firebase Firestore StudyMaterials Collection
        await addDoc(collection(db, "studyMaterials"), docData);
        console.log("Study guides saved successfully to Firebase Firestore.");
      }
    } catch (err) {
      console.error("AI study generation failed:", err);
      setError("AI Generation failed. Please verify network access or check Groq API configuration.");
    } finally {
      setGenerationLoading(false);
    }
  };

  const handleResetWorkspace = () => {
    setStudyData(null);
    setFile(null);
    clearOCR();
  };

  // --- STATE 1: AI GENERATION LOADING VIEW ---
  if (generationLoading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6 select-none max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-8 h-8 overflow-hidden rounded-xl border border-border bg-card p-0.5 shadow-sm">
              <Image
                src="/logo.png"
                alt="Noter Logo"
                fill
                sizes="32px"
                className="object-cover rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight leading-none">Generating Study Guide</h1>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1">
                Please wait while Groq AI constructs summaries and deck flashcards...
              </p>
            </div>
          </div>
        </div>

        <LoadingScreen />
      </div>
    );
  }

  // --- STATE 2: ACTIVE STUDY WORKSPACE VIEW ---
  if (studyData) {
    return (
      <div className="space-y-6 pb-20 md:pb-6 select-none max-w-4xl mx-auto w-full">
        {/* Workspace Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetWorkspace}
              className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition cursor-pointer active:scale-95"
              title="Start New Scan"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight leading-none">Study Workspace</h1>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1">
                Explore structured chapter summaries, flashcards, and quizzes.
              </p>
            </div>
          </div>

          <Button
            onClick={handleResetWorkspace}
            variant="outline"
            className="h-9 px-4.5 rounded-xl border-border text-foreground hover:bg-secondary cursor-pointer text-[11px] font-bold bg-background hidden sm:flex"
          >
            Start New Scan
          </Button>
        </div>

        {/* Tab Menu Segment controls */}
        <StudyTabs activeTab={activeStudyTab} setActiveTab={setActiveStudyTab} />

        {/* Tab Content Display */}
        <div className="pt-2">
          {activeStudyTab === "summary" && (
            <SummaryCard
              chapterTitle={studyData.chapterTitle}
              summary={studyData.summary}
              importantPoints={studyData.importantPoints}
              cleanText={studyData.cleanText}
            />
          )}

          {activeStudyTab === "points" && (
            <SummaryCard
              chapterTitle={studyData.chapterTitle}
              summary={studyData.summary}
              importantPoints={studyData.importantPoints}
              cleanText={studyData.cleanText}
            />
          )}

          {activeStudyTab === "cards" && (
            <FlashcardViewer flashcards={studyData.flashcards} />
          )}

          {activeStudyTab === "quiz" && (
            <QuizViewer quiz={studyData.quiz} />
          )}

          {activeStudyTab === "keywords" && (
            <KeywordCard keywords={studyData.keywords} />
          )}
        </div>
      </div>
    );
  }

  // --- STATE 3: DEFAULT SCAN OPTIONS / OCR FLOW VIEW ---
  return (
    <div className="space-y-6 pb-20 md:pb-6 select-none max-w-4xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setActiveTab("home")}
          className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition cursor-pointer active:scale-90"
          title="Back to Home"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center space-x-2.5">
          <div className="relative w-8 h-8 overflow-hidden rounded-xl border border-border bg-card p-0.5 shadow-sm">
            <Image
              src="/logo.png"
              alt="Noter Logo"
              fill
              sizes="32px"
              className="object-cover rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight leading-none">Scan Notes</h1>
            <p className="text-[11px] text-muted-foreground font-semibold mt-1">
              Extract text from photos and PDFs using OCR.
            </p>
          </div>
        </div>
      </div>

      {/* Input Options Grid */}
      <ScanOptions
        onFileSelect={handleFileSelect}
        onError={setError}
        onOpenCamera={openCamera}
        disabled={ocrLoading}
      />

      {/* Main OCR Workflow State Render */}
      <AnimatePresence mode="wait">
        {ocrError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2.5 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold max-w-xl mx-auto"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{ocrError}</span>
          </motion.div>
        )}

        {/* OCR loading indicator */}
        {ocrLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-6"
          >
            <OCRProgress status={ocrStatus} progress={ocrProgress} />
          </motion.div>
        )}

        {/* Text editor area showing extracted OCR text */}
        {!ocrLoading && ocrText !== "" && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="py-2"
          >
            <TextEditor
              text={ocrText}
              onChange={setOcrText}
              onClear={handleClear}
              onContinue={handleContinue}
            />
          </motion.div>
        )}

        {/* Selected file preview (Images/PDF) */}
        {!ocrLoading && file && ocrText === "" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-5"
          >
            <ImagePreview file={file} onClear={handleClear} />
            <div className="flex justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleExtract}
                  className="h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer text-sm shadow-sm"
                >
                  <RefreshCw size={15} className="animate-spin-slow" />
                  Extract Text
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Empty state (No file selected) */}
        {!ocrLoading && !file && ocrText === "" && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="py-4"
          >
            <EmptyState />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HTML5 Camera Snapper dialog modal */}
      <Dialog
        isOpen={isCameraOpen}
        onClose={closeCamera}
        title="Webcam Snapper 📷"
        description="Fit notebook pages in the screen focus bounds and press capture."
      >
        <div className="space-y-4 pt-2 select-none">
          {cameraError ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{cameraError}</span>
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-xl bg-black border border-border overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-6 border-2 border-dashed border-white/30 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold bg-black/40 px-2 py-0.5 rounded">
                  Document Focus
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeCamera}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={capturePhoto}
              disabled={!!cameraError || !stream}
              className="flex-1 h-11 rounded-xl cursor-pointer bg-primary text-primary-foreground font-bold"
            >
              Capture Frame
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
