"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { Camera, Brain, Layers, ArrowRight, Sparkles, Wand2 } from "lucide-react";

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
  illustration: React.ReactNode;
}

export const Onboarding: React.FC = () => {
  const { user, setCurrentPage } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: "Scan Notes",
      description: "Convert your handwritten notebook photos or files directly into digital study materials using advanced Tesseract OCR.",
      icon: <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      color: "from-purple-500/20 to-indigo-500/20",
      badge: "Step 1: Capture",
      illustration: (
        <div className="relative w-48 h-48 bg-card rounded-3xl border border-border shadow-md flex items-center justify-center overflow-hidden">
          <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center p-4">
            <Camera className="w-12 h-12 text-primary animate-bounce" />
            <span className="text-xs font-semibold text-muted-foreground mt-2">Scanning Page...</span>
          </div>
          {/* Decorative scanning line */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
          />
        </div>
      )
    },
    {
      title: "AI Understands Notes",
      description: "Our integrated Groq AI reads, summarizes, extracts formula sheets, identifies key concepts, and detects difficult sections.",
      icon: <Brain className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
      color: "from-pink-500/20 to-purple-500/20",
      badge: "Step 2: Process",
      illustration: (
        <div className="relative w-48 h-48 bg-card rounded-3xl border border-border shadow-md flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center text-center p-4">
            <div className="relative">
              <Brain className="w-16 h-16 text-pink-500" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </motion.div>
            </div>
            <span className="text-xs font-semibold text-foreground mt-3">Extracting Concepts</span>
            <div className="flex space-x-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping delay-200" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Generate Flashcards & Quizzes",
      description: "Convert notes into interactive Anki-style flashcards with mnemonics, voice reading, and auto-generated difficulty-adjusted quizzes.",
      icon: <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      color: "from-blue-500/20 to-indigo-500/20",
      badge: "Step 3: Master",
      illustration: (
        <div className="relative w-48 h-48 bg-card rounded-3xl border border-border shadow-md flex items-center justify-center">
          {/* Deck effect */}
          <div className="absolute w-36 h-24 bg-card border border-border/80 rounded-xl rotate-6 translate-x-2 translate-y-2 shadow-sm" />
          <div className="absolute w-36 h-24 bg-card border border-border/90 rounded-xl -rotate-3 -translate-x-1 translate-y-1 shadow-sm" />
          <div className="relative w-36 h-24 bg-card border border-primary/30 rounded-xl shadow-md p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Physics</span>
              <Wand2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[11px] font-bold text-foreground leading-tight mt-1">What is Newton's First Law?</p>
            <div className="flex justify-end">
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Swipe to flip</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      if (user) {
        localStorage.setItem(`onboarding_${user.uid}`, "true");
      }
      setCurrentPage("app");
    }
  };

  const handleSkip = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.uid}`, "true");
    }
    setCurrentPage("app");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center space-y-0.5">
          <span className="text-lg font-bold tracking-tight text-foreground">Noter</span>
          <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">AI</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center space-y-6 w-full"
          >
            {/* Step Badge */}
            <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary">
              {slides[currentSlide].badge}
            </span>

            {/* Illustration */}
            <div className="py-6 flex items-center justify-center relative w-full">
              {/* Blur gradient behind */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-tr ${slides[currentSlide].color} rounded-full blur-[40px] opacity-70`} />
              {slides[currentSlide].illustration}
            </div>

            {/* Slide Title & Text */}
            <div className="space-y-3 px-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2.5">
                {slides[currentSlide].icon}
                {slides[currentSlide].title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {slides[currentSlide].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="flex items-center space-x-2.5 py-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/45"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="w-full px-4">
          <Button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 group text-base font-semibold py-6 rounded-xl cursor-pointer"
          >
            {currentSlide === slides.length - 1 ? (
              <>
                Get Started
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              <>
                Next Slide
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
