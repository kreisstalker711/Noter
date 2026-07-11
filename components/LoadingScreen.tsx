"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen: React.FC = () => {
  const messages = [
    "Reading OCR...",
    "Correcting OCR mistakes...",
    "Understanding concepts...",
    "Finding important points...",
    "Creating flashcards...",
    "Preparing quiz...",
    "Almost finished...",
  ];

  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[420px] select-none space-y-6">
      
      {/* Circular Loading Animation */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Orbit track */}
        <div className="absolute inset-0 rounded-full border-4 border-secondary" />
        
        {/* Animated spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
        />
        
        {/* Inner floating book/star icon */}
        <motion.div
          animate={{ scale: [0.9, 1.05, 0.9] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border"
        >
          <Loader2 className="w-5 h-5 text-foreground animate-spin" />
        </motion.div>
      </div>

      {/* Message changes transition */}
      <div className="space-y-1.5 h-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.h3
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-base font-extrabold text-foreground tracking-tight"
          >
            {messages[msgIdx]}
          </motion.h3>
        </AnimatePresence>
        
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
          Noter AI is compiling your study guide
        </p>
      </div>

      {/* Progress guide hint dots */}
      <div className="flex items-center space-x-1.5 justify-center pt-2">
        {messages.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx <= msgIdx ? "bg-primary scale-110" : "bg-secondary"
            }`}
          />
        ))}
      </div>

    </div>
  );
};
