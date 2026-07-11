"use client";

import React from "react";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface OCRProgressProps {
  status: string;
  progress: number; // 0 to 100
}

export const OCRProgress: React.FC<OCRProgressProps> = ({ status, progress }) => {
  return (
    <Card className="border border-border bg-card shadow-sm max-w-xl mx-auto rounded-2xl select-none relative overflow-hidden">
      {/* Background glowing line animation */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-secondary overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="h-full w-1/3 bg-primary"
        />
      </div>

      <CardContent className="p-6.5 flex flex-col items-center justify-center text-center space-y-5">
        
        {/* Loading Spinner with percentage */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="absolute text-[10px] font-black text-foreground">
            {progress}%
          </span>
        </div>

        {/* Text descriptions */}
        <div className="space-y-3 w-full">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-foreground tracking-tight">{status}</h4>
            <p className="text-[10px] font-semibold text-muted-foreground leading-relaxed">
              Tesseract OCR is scanning text layouts. Please keep this tab active.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-xs mx-auto w-full pt-1">
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
