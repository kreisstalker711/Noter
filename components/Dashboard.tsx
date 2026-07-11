"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Camera, FileText, ImageIcon, ArrowRight, 
  Trash2, Sparkles, LineChart 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

export const Dashboard: React.FC = () => {
  const { 
    user, 
    studyMaterials, 
    setActiveStudyData, 
    setActiveTab, 
    deleteStudyMaterial 
  } = useApp();

  // Show the 3 most recent study guides
  const recentGuides = studyMaterials.slice(0, 3);

  const handleOpenWorkspace = (item: any) => {
    setActiveStudyData(item);
    setActiveTab("scan");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this study guide from your history?")) {
      deleteStudyMaterial(id);
    }
  };

  const formatCardDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Unknown Date";
      const dayStr = d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full select-none pb-12">
      {/* Welcome Hero Panel */}
      <Card className="border border-border bg-card shadow-sm rounded-3xl relative overflow-hidden">
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-[10px] font-extrabold text-foreground tracking-wider uppercase">
              <Sparkles size={10} className="text-foreground animate-pulse" />
              <span>Workspace Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight pt-1">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold max-w-md leading-relaxed">
              Ready to create your next study guide? Scan handwritten notes, upload textbook PDFs, or capture images.
            </p>
          </div>

          <Button
            onClick={() => setActiveTab("scan")}
            className="h-11 px-6.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Camera size={15} />
            Scan Notes
          </Button>
        </CardContent>
      </Card>

      {/* Recent Study Guides Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-foreground tracking-widest uppercase">
            Recent Study Guides
          </h2>
          {studyMaterials.length > 3 && (
            <button
              onClick={() => setActiveTab("stats")}
              className="text-[10px] font-extrabold text-muted-foreground hover:text-foreground tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-colors"
            >
              View All History
              <ArrowRight size={10} />
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {recentGuides.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center p-10 text-center py-16 border border-dashed rounded-3xl bg-card min-h-[250px]"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/40 border border-border flex items-center justify-center mb-3.5 text-muted-foreground/60">
                <FileText size={18} />
              </div>
              <h3 className="text-sm font-extrabold text-foreground">No study guides yet</h3>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px] font-semibold leading-relaxed">
                Scan your first note page or drag and drop a PDF to compile your materials.
              </p>
              <Button
                onClick={() => setActiveTab("scan")}
                className="mt-4 h-9 px-5 rounded-lg font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-[10px] shadow-sm"
              >
                Scan Notes
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3.5">
              {recentGuides.map((item, index) => {
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
                    className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer group relative flex flex-col sm:flex-row justify-between items-start gap-4 select-text"
                  >
                    <div className="space-y-2 flex-1 pr-6">
                      <div className="flex items-center space-x-2">
                        {/* Source icon */}
                        <div className="p-1 rounded-md border border-border bg-secondary text-muted-foreground">
                          {source === "PDF" ? (
                            <FileText size={11} />
                          ) : source === "Camera" ? (
                            <Camera size={11} />
                          ) : (
                            <ImageIcon size={11} />
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {source}
                        </span>
                        <span className="text-muted-foreground/40 text-[9px]">•</span>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {dateLabel}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {item.chapterTitle}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed mt-0.5 line-clamp-2 pr-4">
                          {item.summary}
                        </p>
                      </div>

                      {/* Stat counters */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-border bg-secondary text-foreground">
                          {item.flashcards?.length || 0} Flashcards
                        </span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-border bg-secondary text-foreground">
                          {item.quiz?.length || 0} MCQ Questions
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto h-full gap-2 shrink-0 pt-2 sm:pt-0">
                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDelete(e, guideId)}
                        className="p-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition cursor-pointer order-last sm:order-first self-end sm:self-auto"
                        title="Delete Study Guide"
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Continue studying CTA button */}
                      <Button
                        onClick={() => handleOpenWorkspace(item)}
                        variant="ghost"
                        className="h-8 px-2.5 rounded-lg border border-border bg-secondary text-foreground hover:bg-foreground hover:text-background transition-all duration-200 cursor-pointer text-[9px] font-extrabold flex items-center gap-1 leading-none shadow-sm"
                      >
                        Continue Studying
                        <ArrowRight size={9} />
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
