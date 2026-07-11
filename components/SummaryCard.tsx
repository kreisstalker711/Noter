"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { ChevronDown, ChevronUp, FileText, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SummaryCardProps {
  chapterTitle: string;
  summary: string;
  importantPoints: string[];
  cleanText: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  chapterTitle,
  summary,
  importantPoints,
  cleanText
}) => {
  const [showOcr, setShowOcr] = useState(false);

  return (
    <div className="space-y-5.5 select-none">
      
      {/* Chapter Title Card */}
      <Card className="border border-border bg-card shadow-sm rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-3 text-foreground">
            <div className="p-2.5 rounded-xl bg-secondary border border-border/40 shrink-0">
              <FileText size={18} />
            </div>
            <h2 className="text-lg font-black tracking-tight leading-tight">{chapterTitle}</h2>
          </div>
          
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chapter Summary</h4>
            <p className="text-xs text-foreground leading-relaxed font-semibold select-text pr-2">
              {summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Points Card */}
      {importantPoints.length > 0 && (
        <Card className="border border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-4.5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Key Takeaways</h3>
            
            <ul className="space-y-3.5 select-text">
              {importantPoints.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs font-semibold text-foreground leading-relaxed">
                  <CheckCircle2 size={14} className="text-foreground shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Source OCR Text Accordion */}
      <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowOcr(!showOcr)}
          className="w-full p-4.5 px-6 flex items-center justify-between font-bold text-xs text-foreground bg-secondary/15 hover:bg-secondary/45 transition duration-150 cursor-pointer"
        >
          <span>Show Cleaned Source Text</span>
          {showOcr ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showOcr && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border bg-background/30"
            >
              <div className="p-6 text-xs text-muted-foreground leading-relaxed font-semibold font-mono select-text whitespace-pre-wrap max-h-80 overflow-y-auto pr-4">
                {cleanText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

    </div>
  );
};
