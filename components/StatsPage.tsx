"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { 
  LineChart, FileText, Camera, Image as ImageIcon, 
  Trash2, ArrowRight, Calendar, Layers, CheckSquare, Sparkles 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

export const StatsPage: React.FC = () => {
  const { 
    studyMaterials, 
    setActiveStudyData, 
    setActiveTab, 
    deleteStudyMaterial 
  } = useApp();

  // 1. Calculate real user metrics
  const totalScans = studyMaterials.length;
  
  const totalPDFs = studyMaterials.filter(
    (item) => item.sourceType === "PDF" || (item as any).sourceType?.toLowerCase() === "pdf"
  ).length;
  
  const totalImages = studyMaterials.filter(
    (item) => 
      item.sourceType === "Image" || 
      item.sourceType === "Camera" || 
      (item as any).sourceType?.toLowerCase() === "image" ||
      (item as any).sourceType?.toLowerCase() === "camera"
  ).length;

  const totalFlashcards = studyMaterials.reduce(
    (sum, item) => sum + (item.flashcards?.length || 0), 0
  );

  const totalQuizzes = studyMaterials.reduce(
    (sum, item) => sum + (item.quiz?.length || 0), 0
  );

  // Extract and format last scan date
  let lastScanDate = "No scans yet";
  if (studyMaterials.length > 0) {
    const dates = studyMaterials
      .map((item) => new Date(item.createdAt || "").getTime())
      .filter((time) => !isNaN(time));
    
    if (dates.length > 0) {
      const latestTime = Math.max(...dates);
      const latestDate = new Date(latestTime);
      lastScanDate = latestDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
  }

  // Format date helper for history cards
  const formatCardDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Unknown Date";
      
      const dayStr = d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      const timeStr = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });
      return `${dayStr} • ${timeStr}`;
    } catch {
      return "Unknown Date";
    }
  };

  const handleOpenWorkspace = (item: any) => {
    setActiveStudyData(item);
    setActiveTab("scan");
    console.log("[Client] Global workspace state loaded for:", item.chapterTitle);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering open workspace on click
    if (confirm("Are you sure you want to delete this study guide from your history?")) {
      deleteStudyMaterial(id);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full select-none pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-none">Stats & History</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1.5">
            Monitor real study guide metrics and restore previous worksheets.
          </p>
        </div>

        <Button
          onClick={() => setActiveTab("scan")}
          className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs shadow-sm flex items-center gap-1.5"
        >
          <Camera size={14} />
          Scan Notes
        </Button>
      </div>

      {/* Stats Counter Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
              Total Scans
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-foreground">{totalScans}</span>
              <span className="text-[10px] text-muted-foreground font-bold">docs</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
              PDF Uploads
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-foreground">{totalPDFs}</span>
              <span className="text-[10px] text-muted-foreground font-bold">files</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
              Images / Camera
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-foreground">{totalImages}</span>
              <span className="text-[10px] text-muted-foreground font-bold">scans</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
              Last Scan Date
            </span>
            <div className="flex items-baseline truncate">
              <span className="text-base font-black text-foreground tracking-tight leading-none">
                {lastScanDate}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aggregate Counts Section */}
      {totalScans > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4.5 rounded-2xl border border-border bg-secondary/30 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-card border border-border text-foreground">
              <Layers size={16} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider leading-none">
                Total Flashcards
              </p>
              <h4 className="text-lg font-extrabold text-foreground mt-1 leading-none">{totalFlashcards}</h4>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl border border-border bg-secondary/30 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-card border border-border text-foreground">
              <CheckSquare size={16} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider leading-none">
                Total Quiz Questions
              </p>
              <h4 className="text-lg font-extrabold text-foreground mt-1 leading-none">{totalQuizzes}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Scan History feed section */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-foreground tracking-widest uppercase">
          Scan History Feed
        </h2>

        <AnimatePresence mode="popLayout">
          {totalScans === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center p-12 text-center py-20 border border-dashed rounded-3xl bg-card min-h-[350px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/40 border border-border flex items-center justify-center mb-4 text-muted-foreground/60">
                <FileText size={20} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">No Study Guides Yet</h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] font-semibold leading-relaxed">
                Start by scanning your first textbook page or uploading a PDF.
              </p>
              <Button
                onClick={() => setActiveTab("scan")}
                className="mt-5 h-9.5 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs shadow-sm"
              >
                Scan Notes
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3.5">
              {studyMaterials.map((item, index) => {
                const guideId = (item as any).id;
                const source = item.sourceType || "Camera";
                const dateLabel = formatCardDate(item.createdAt || "");
                
                return (
                  <motion.div
                    key={guideId || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => handleOpenWorkspace(item)}
                    className="p-5.5 rounded-2xl border border-border bg-card shadow-sm hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer group relative flex flex-col sm:flex-row justify-between items-start gap-4 select-text"
                  >
                    <div className="space-y-2.5 flex-1 pr-6">
                      <div className="flex items-center space-x-2">
                        {/* Source icon */}
                        <div className="p-1.5 rounded-lg border border-border bg-secondary text-muted-foreground">
                          {source === "PDF" ? (
                            <FileText size={13} />
                          ) : source === "Camera" ? (
                            <Camera size={13} />
                          ) : (
                            <ImageIcon size={13} />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {source}
                        </span>
                        <span className="text-muted-foreground/40 text-[9px]">•</span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {dateLabel}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {item.chapterTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-1 line-clamp-2 pr-4">
                          {item.summary}
                        </p>
                      </div>

                      {/* Stat counters */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border border-border bg-secondary text-foreground">
                          {item.flashcards?.length || 0} Flashcards
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border border-border bg-secondary text-foreground">
                          {item.quiz?.length || 0} MCQ Questions
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border border-border bg-secondary text-foreground">
                          {item.keywords?.length || 0} Keywords
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto h-full gap-2 shrink-0 pt-2 sm:pt-0">
                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDelete(e, guideId)}
                        className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition cursor-pointer order-last sm:order-first self-end sm:self-auto"
                        title="Delete Study Guide"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Continue studying CTA button */}
                      <Button
                        onClick={() => handleOpenWorkspace(item)}
                        variant="ghost"
                        className="h-8.5 px-3 rounded-lg border border-border bg-secondary text-foreground hover:bg-foreground hover:text-background transition-all duration-200 cursor-pointer text-[10px] font-extrabold flex items-center gap-1 leading-none shadow-sm"
                      >
                        Continue Studying
                        <ArrowRight size={10} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
