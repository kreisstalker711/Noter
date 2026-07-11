"use client";

import React, { useState } from "react";
import { Flashcard } from "../services/studyGenerator";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  ChevronLeft, ChevronRight, RotateCcw, 
  Bookmark, BookmarkCheck, Copy, Check, Info 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards }) => {
  const [currIdx, setCurrIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-2xl min-h-[260px] bg-card">
        <Info className="w-8 h-8 opacity-40 mb-2.5" />
        <span className="text-xs font-bold">No flashcards found in this study set.</span>
      </div>
    );
  }

  const activeCard = flashcards[currIdx];

  const handleNext = () => {
    setFlipped(false);
    setCurrIdx((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrIdx((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop card flip on bookmark click
    setBookmarks((prev) => ({
      ...prev,
      [currIdx]: !prev[currIdx]
    }));
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop card flip on copy click
    if (!activeCard) return;
    const copyText = `Q: ${activeCard.question}\nA: ${activeCard.answer}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const isBookmarked = !!bookmarks[currIdx];

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full space-y-6 select-none">
      
      {/* Cards counter and indicator */}
      <div className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground px-1">
        <span>
          Card {currIdx + 1} of {flashcards.length}
        </span>
        <span className={clsx(
          "px-2.5 py-0.5 rounded-full border text-[10px]",
          activeCard.difficulty === "Easy" && "border-green-500/20 bg-green-500/10 text-green-500",
          activeCard.difficulty === "Medium" && "border-yellow-500/20 bg-yellow-500/10 text-yellow-500",
          activeCard.difficulty === "Hard" && "border-red-500/20 bg-red-500/10 text-red-500"
        )}>
          {activeCard.difficulty}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        className="w-full h-72 sm:h-80 cursor-pointer relative perspective"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full h-full transform-style-3d relative"
        >
          {/* Card Front (Question) */}
          <Card className="absolute inset-0 border border-border bg-card shadow-sm rounded-2xl flex flex-col justify-between p-6 backface-hidden">
            {/* Top row actions */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Question</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-foreground transition active:scale-90"
                  title="Copy Card"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                </button>
                <button
                  onClick={toggleBookmark}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-foreground transition active:scale-90"
                  title="Bookmark Card"
                >
                  {isBookmarked ? <BookmarkCheck size={13} className="text-primary" /> : <Bookmark size={13} />}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="flex-1 flex items-center justify-center py-4 select-text">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground text-center leading-relaxed tracking-tight max-w-sm px-2">
                {activeCard.question}
              </h3>
            </div>

            {/* Bottom hint label */}
            <span className="text-[10px] text-muted-foreground text-center font-bold">
              Click Card or Flip button to see Answer
            </span>
          </Card>

          {/* Card Back (Answer) */}
          <Card 
            className="absolute inset-0 border border-border bg-card shadow-sm rounded-2xl flex flex-col justify-between p-6 backface-hidden rotate-y-180"
          >
            {/* Top row actions */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Answer</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-foreground transition active:scale-90"
                  title="Copy Card"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                </button>
                <button
                  onClick={toggleBookmark}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-foreground transition active:scale-90"
                  title="Bookmark Card"
                >
                  {isBookmarked ? <BookmarkCheck size={13} className="text-primary" /> : <Bookmark size={13} />}
                </button>
              </div>
            </div>

            {/* Answer Text */}
            <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto select-text pr-2">
              <p className="text-xs sm:text-sm font-semibold text-foreground text-center leading-relaxed max-w-md">
                {activeCard.answer}
              </p>
            </div>

            {/* Bottom hint label */}
            <span className="text-[10px] text-muted-foreground text-center font-bold">
              Click Card to return to Question
            </span>
          </Card>
        </motion.div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={handlePrev}
          variant="outline"
          className="h-10 w-10 p-0 rounded-xl border-border text-foreground hover:bg-secondary flex items-center justify-center cursor-pointer bg-background"
        >
          <ChevronLeft size={16} />
        </Button>

        <Button
          onClick={handleFlip}
          variant="outline"
          className="h-10 px-5 rounded-xl border-border text-foreground hover:bg-secondary flex items-center justify-center gap-1.5 cursor-pointer font-bold bg-background text-xs"
        >
          <RotateCcw size={13} />
          Flip
        </Button>

        <Button
          onClick={handleNext}
          variant="outline"
          className="h-10 w-10 p-0 rounded-xl border-border text-foreground hover:bg-secondary flex items-center justify-center cursor-pointer bg-background"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

    </div>
  );
};
