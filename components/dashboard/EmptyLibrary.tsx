"use client";

import React from "react";
import { useApp } from "../../context/AppContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Camera, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export const EmptyLibrary: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <Card className="border border-border bg-card shadow-sm p-8 text-center select-none max-w-xl mx-auto rounded-2xl">
      <CardContent className="flex flex-col items-center space-y-5 p-0">
        
        {/* Notebook illustration */}
        <div className="relative w-28 h-28 text-muted-foreground/35 flex items-center justify-center">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <motion.g
              animate={{ rotate: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              {/* Binder Cover */}
              <rect x="25" y="15" width="55" height="70" rx="6" fill="var(--secondary)" stroke="var(--border)" strokeWidth="2.5" />
              {/* Spine loops */}
              <line x1="22" y1="28" x2="30" y2="28" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="40" x2="30" y2="40" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="52" x2="30" y2="52" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="64" x2="30" y2="64" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              {/* Inner pages hint */}
              <path d="M35,22 L72,22 L72,78 L35,78 Z" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
              {/* Empty page decoration lines */}
              <line x1="42" y1="35" x2="65" y2="35" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="42" y1="48" x2="60" y2="48" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="42" y1="61" x2="55" y2="61" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
            </motion.g>
          </svg>
        </div>

        {/* Informative text */}
        <div className="space-y-2 max-w-sm">
          <h3 className="text-base font-extrabold text-foreground tracking-tight">Your Library is Empty</h3>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            Scan your first notes to start building your personal study library.
          </p>
        </div>

        {/* Scan notes trigger button */}
        <Button
          onClick={() => setActiveTab("scan" as any)}
          className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer text-xs shadow-sm"
        >
          <Camera size={14} />
          Scan Notes
        </Button>
        
      </CardContent>
    </Card>
  );
};
