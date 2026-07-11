"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import { Hash, Info } from "lucide-react";

interface KeywordCardProps {
  keywords: string[];
}

export const KeywordCard: React.FC<KeywordCardProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-2xl min-h-[180px] bg-card">
        <Info className="w-8 h-8 opacity-40 mb-2.5" />
        <span className="text-xs font-bold">No key terms extracted in this study set.</span>
      </div>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-sm rounded-2xl select-none">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Key Terms</h3>
          <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
            These are the most important vocabulary words and concepts extracted from this document page.
          </p>
        </div>

        {/* Wrapping Flex Tag Pill Container */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          {keywords.map((word, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary transition-colors duration-150 text-xs font-bold text-foreground cursor-default"
            >
              <Hash size={11} className="text-muted-foreground/60 shrink-0" />
              <span>{word}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
