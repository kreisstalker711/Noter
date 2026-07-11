"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";

export const EmptyState: React.FC = () => {
  return (
    <Card className="border border-border bg-card shadow-sm p-8 text-center select-none max-w-xl mx-auto rounded-2xl relative overflow-hidden">
      <CardContent className="flex flex-col items-center space-y-4.5 p-0">
        
        {/* Notebook illustration */}
        <div className="relative w-24 h-24 text-muted-foreground/35 flex items-center justify-center">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <motion.g
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              {/* Binder Cover */}
              <rect x="25" y="15" width="55" height="70" rx="6" fill="var(--secondary)" stroke="var(--border)" strokeWidth="2.5" />
              {/* Spine loops */}
              <line x1="22" y1="28" x2="30" y2="28" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="40" x2="30" y2="40" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="52" x2="30" y2="52" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="64" x2="30" y2="64" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
              {/* Scan indicator line */}
              <motion.line
                x1="30"
                y1="30"
                x2="75"
                y2="30"
                animate={{ y: [0, 40, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                stroke="var(--foreground)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              {/* Inner pages details */}
              <path d="M35,22 L72,22 L72,78 L35,78 Z" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
            </motion.g>
          </svg>
        </div>

        {/* Informative text */}
        <div className="space-y-1 max-w-sm">
          <h3 className="text-sm font-extrabold text-foreground tracking-tight">No file selected</h3>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            Scan a page or import a PDF to begin.
          </p>
        </div>
        
      </CardContent>
    </Card>
  );
};
