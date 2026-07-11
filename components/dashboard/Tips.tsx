"use client";

import React from "react";
import { Camera, FileText, BookOpen, Calendar } from "lucide-react";

interface TipItem {
  text: string;
  icon: React.ReactNode;
}

export const Tips: React.FC = () => {
  const tips: TipItem[] = [
    { text: "Take clear photos in good lighting.", icon: <Camera size={15} /> },
    { text: "Keep pages flat for better scans.", icon: <FileText size={15} /> },
    { text: "Scan one chapter at a time.", icon: <BookOpen size={15} /> },
    { text: "Review flashcards daily to remember.", icon: <Calendar size={15} /> }
  ];

  return (
    <div className="space-y-4 select-none">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/85">Tips for Best Results</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {tips.map((tip, idx) => (
          <div 
            key={idx}
            className="flex items-center space-x-3.5 p-4 rounded-xl border border-border bg-card shadow-sm"
          >
            {/* Icon Block */}
            <div className="p-2 rounded-lg bg-secondary text-foreground border border-border/40 shrink-0">
              {tip.icon}
            </div>
            
            {/* Text description */}
            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed pr-2">
              {tip.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
