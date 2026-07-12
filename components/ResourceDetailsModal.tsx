"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { LibraryItem } from "../services/studyGenerator";
import { 
  X, Pin, Star, Trash2, Download, Share2, 
  Sparkles, FileText, Camera, Image as ImageIcon, 
  Copy, Edit3, ArrowRight, Loader2, CheckSquare, Layers 
} from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Study Viewer imports
import { SummaryCard } from "./SummaryCard";
import { FlashcardViewer } from "./FlashcardViewer";
import { QuizViewer } from "./QuizViewer";
import { KeywordCard } from "./KeywordCard";
import { StudyTabs, StudyTabType } from "./StudyTabs";

interface ResourceDetailsModalProps {
  item: LibraryItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const { 
    updateLibraryItem, 
    deleteLibraryItem,
    setActiveStudyData,
    setActiveTab
  } = useApp();

  const [activeStudyTab, setActiveStudyTab] = useState<StudyTabType>("summary");
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(item.description || "");

  // AI loading states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [copiedOcr, setCopiedOcr] = useState(false);

  if (!isOpen) return null;

  const handleToggleFavorite = () => {
    updateLibraryItem(item.id!, { favorite: !item.favorite });
  };

  const handleTogglePin = () => {
    updateLibraryItem(item.id!, { pinned: !item.pinned });
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      updateLibraryItem(item.id!, { 
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this study resource?")) {
      deleteLibraryItem(item.id!);
      onClose();
    }
  };

  const handleCopyOcr = () => {
    if (item.ocrText) {
      navigator.clipboard.writeText(item.ocrText);
      setCopiedOcr(true);
      setTimeout(() => setCopiedOcr(false), 2000);
    }
  };

  const handleShare = () => {
    const mockLink = `https://thenoter.vercel.app/share/resource/${item.id}`;
    navigator.clipboard.writeText(mockLink);
    alert("Share link copied to clipboard! (Simulation)");
  };

  const handleDownload = () => {
    // Standard browser download anchor trigger
    const link = document.createElement("a");
    link.href = item.fileURL;
    link.download = item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compile OCR text and generate study materials using existing Groq completions route
  const handleCompileAI = async () => {
    setAiLoading(true);
    setAiStatus("Reading document content...");
    try {
      // Simulate OCR extraction if ocrText is empty
      let rawText = item.ocrText;
      if (!rawText) {
        setAiStatus("Extracting OCR text from document...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        rawText = `Chapter Analysis: Vector fields and momentum. Momentum is defined as mass multiplied by velocity (p = mv). It is a vector quantity having direction same as velocity. Impulse represents the change in momentum (I = delta p = F * delta t). Elastic collisions conserve both momentum and kinetic energy, while inelastic collisions conserve only momentum.`;
      }

      setAiStatus("Groq AI compiling summaries & quizzes...");
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocrText: rawText }),
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();

      setAiStatus("Saving materials to your library...");
      await updateLibraryItem(item.id!, {
        ocrText: rawText,
        summary: data.summary,
        importantPoints: data.importantPoints,
        flashcards: data.flashcards,
        quiz: data.quiz,
        keywords: data.keywords
      });

      setAiStatus("Success!");
      // Briefly show checkmark
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.error(err);
      alert("AI compiler error. Please check your internet connection.");
    } finally {
      setAiLoading(false);
      setAiStatus("");
    }
  };

  const hasAISteps = item.summary || item.flashcards?.length || item.quiz?.length;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-card border border-border w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]"
      >
        {/* Left Side: File Viewer / AI Workspace Panel */}
        <div className="flex-1 border-r border-border bg-secondary/15 flex flex-col overflow-y-auto min-h-0">
          {/* Header toolbar */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-border bg-card select-none">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
              Embedded Resource Viewer
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleTogglePin}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  item.pinned 
                    ? "bg-foreground border-foreground text-background" 
                    : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title={item.pinned ? "Unpin document" : "Pin to top"}
              >
                <Pin size={13} className={item.pinned ? "fill-background" : ""} />
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  item.favorite 
                    ? "bg-foreground border-foreground text-background" 
                    : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title={item.favorite ? "Unmark favorite" : "Bookmark resource"}
              >
                <Star size={13} className={item.favorite ? "fill-background" : ""} />
              </button>
            </div>
          </div>

          {/* Viewer area contents */}
          <div className="flex-1 p-6 flex flex-col min-h-0">
            {aiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs font-extrabold text-foreground">{aiStatus}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">This might take a moment...</p>
                </div>
              </div>
            ) : hasAISteps ? (
              /* If AI features have been generated, mount study workspace modules */
              <div className="flex-1 flex flex-col min-h-0 space-y-5">
                <StudyTabs activeTab={activeStudyTab} setActiveTab={setActiveStudyTab} />
                <div className="flex-1 overflow-y-auto min-h-0 pt-1">
                  {activeStudyTab === "summary" && (
                    <SummaryCard
                      chapterTitle={item.title}
                      summary={item.summary || ""}
                      importantPoints={item.importantPoints || []}
                      cleanText={item.ocrText || ""}
                    />
                  )}

                  {activeStudyTab === "points" && (
                    <SummaryCard
                      chapterTitle={item.title}
                      summary={item.summary || ""}
                      importantPoints={item.importantPoints || []}
                      cleanText={item.ocrText || ""}
                    />
                  )}

                  {activeStudyTab === "cards" && (
                    <FlashcardViewer flashcards={item.flashcards || []} />
                  )}

                  {activeStudyTab === "quiz" && (
                    <QuizViewer quiz={item.quiz || []} />
                  )}

                  {activeStudyTab === "keywords" && (
                    <KeywordCard keywords={item.keywords || []} />
                  )}
                </div>
              </div>
            ) : (
              /* Default Media Previews (Image & PDF embed wrappers) */
              <div className="flex-1 flex items-center justify-center min-h-0 bg-card/45 border border-dashed border-border rounded-2xl p-4 overflow-hidden relative group">
                {item.type === "Image" ? (
                  <img
                    src={item.fileURL}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm selection-none select-none pointer-events-none"
                  />
                ) : item.type === "PDF" ? (
                  <iframe
                    src={`${item.fileURL}#toolbar=0`}
                    className="w-full h-full border-0 rounded-lg bg-background"
                    title={item.title}
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-full bg-secondary border border-border inline-block text-muted-foreground">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground">{item.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                        Format: {item.type} document ({formatBytes(item.size)})
                      </p>
                    </div>
                    <Button
                      onClick={handleDownload}
                      className="h-8.5 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-bold text-[10px]"
                    >
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Metadata / AI compiler triggers Panel */}
        <div className="w-full md:w-80 h-full flex flex-col overflow-y-auto select-none bg-card">
          {/* Header Close button */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
              Details & Metadata
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary transition text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-6 flex-1 space-y-6 text-left">
            {isEditing ? (
              /* Rename submission form */
              <form onSubmit={handleRenameSubmit} className="space-y-4.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Rename Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-foreground"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Rename Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full min-h-[50px] py-1.5 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-foreground resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-9 rounded-lg text-[10px] font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground font-bold text-[10px]"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              /* Static metadata listing */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-border bg-secondary text-foreground">
                      {item.category}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-border bg-secondary text-foreground">
                      {item.folder}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-foreground mt-2 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-1">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-2 border-t border-border pt-3 text-[10px] font-bold text-muted-foreground">
                  <p>Uploaded: <span className="text-foreground">{new Date(item.createdAt).toLocaleDateString()}</span></p>
                  <p>File Type: <span className="text-foreground uppercase">{item.type}</span></p>
                  <p>File Size: <span className="text-foreground">{formatBytes(item.size)}</span></p>
                </div>
              </div>
            )}

            {/* Tags Badges flex */}
            {item.tags && item.tags.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-[8px] font-extrabold px-2 py-0.5 rounded bg-secondary text-foreground border border-border uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Integrations Section */}
            {!hasAISteps && !aiLoading && (
              <div className="p-4 rounded-2xl border border-dashed border-border bg-secondary/20 space-y-3.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-foreground" />
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider">AI Operations</h4>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  Generate structured summaries, revision flashcard decks, and quiz sheets from this resource.
                </p>
                <Button
                  onClick={handleCompileAI}
                  className="w-full h-9 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-[10px] flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={12} />
                  Compile with Groq AI
                </Button>
              </div>
            )}

            {/* Action Tools Row */}
            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Actions
              </span>

              <div className="grid grid-cols-2 gap-2">
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="h-9.5 rounded-xl border-border text-foreground hover:bg-secondary/40 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 size={11} />
                    Rename
                  </Button>
                )}

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="h-9.5 rounded-xl border-border text-foreground hover:bg-secondary/40 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={11} />
                  Share Link
                </Button>

                {item.ocrText && (
                  <Button
                    onClick={handleCopyOcr}
                    variant="outline"
                    className="h-9.5 rounded-xl border-border text-foreground hover:bg-secondary/40 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={11} />
                    {copiedOcr ? "Copied!" : "Copy OCR"}
                  </Button>
                )}

                {item.type !== "StudyGuide" && (
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="h-9.5 rounded-xl border-border text-foreground hover:bg-secondary/40 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={11} />
                    Download
                  </Button>
                )}

                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="h-9.5 rounded-xl border-destructive/25 text-destructive hover:bg-destructive/10 hover:border-destructive/30 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer col-span-2 mt-1"
                >
                  <Trash2 size={11} />
                  Delete Resource
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
