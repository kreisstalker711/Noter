"use client";

import React, { useState } from "react";
import { QuizQuestion } from "../services/studyGenerator";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { 
  ChevronLeft, ChevronRight, CheckCircle2, 
  XCircle, HelpCircle, Award, RotateCcw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface QuizViewerProps {
  quiz: QuizQuestion[];
}

export const QuizViewer: React.FC<QuizViewerProps> = ({ quiz }) => {
  const [currIdx, setCurrIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-2xl min-h-[260px] bg-card">
        <HelpCircle className="w-8 h-8 opacity-40 mb-2.5" />
        <span className="text-xs font-bold">No quiz questions generated for this study set.</span>
      </div>
    );
  }

  const activeQ = quiz[currIdx];
  const isSubmitted = !!submitted[currIdx];
  const selectedAnswer = userAnswers[currIdx];

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOpt(option);
    setUserAnswers((prev) => ({
      ...prev,
      [currIdx]: option
    }));
  };

  const handleSubmit = () => {
    if (!selectedOpt) return;
    setSubmitted((prev) => ({
      ...prev,
      [currIdx]: true
    }));
  };

  const handleNext = () => {
    if (currIdx < quiz.length - 1) {
      setCurrIdx((prev) => prev + 1);
      setSelectedOpt(userAnswers[currIdx + 1] || null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currIdx > 0) {
      setCurrIdx((prev) => prev - 1);
      setSelectedOpt(userAnswers[currIdx - 1] || null);
    }
  };

  const handleRestart = () => {
    setCurrIdx(0);
    setSelectedOpt(null);
    setUserAnswers({});
    setSubmitted({});
    setQuizCompleted(false);
  };

  // Calculate total score
  const correctCount = quiz.reduce((count, q, idx) => {
    return userAnswers[idx] === q.correctAnswer ? count + 1 : count;
  }, 0);

  const accuracyPercent = Math.round((correctCount / quiz.length) * 100);

  // Scorecard View
  if (quizCompleted) {
    return (
      <Card className="border border-border bg-card shadow-sm rounded-2xl max-w-md mx-auto select-none overflow-hidden">
        <CardContent className="p-7.5 flex flex-col items-center text-center space-y-6">
          <div className="p-4.5 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center">
            <Award size={36} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-foreground tracking-tight">Quiz Completed!</h3>
            <p className="text-xs text-muted-foreground font-semibold">
              Here is your study accuracy report for this chapter.
            </p>
          </div>

          {/* Accuracy circle preview / progress */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-muted-foreground px-1">
              <span>ACCURACY SCORE</span>
              <span>{correctCount} / {quiz.length} ({accuracyPercent}%)</span>
            </div>
            <Progress value={accuracyPercent} className="h-2" />
          </div>

          {/* Score comments */}
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-[280px]">
            {accuracyPercent >= 80 
              ? "Excellent work! You have mastered the core concepts of this scanned page." 
              : accuracyPercent >= 50 
              ? "Good effort! Flip through the flashcards to review the items you missed."
              : "Review the chapter summary and try scanning this document again for better coverage."}
          </p>

          <Button
            onClick={handleRestart}
            className="w-full h-10.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <RotateCcw size={14} />
            Restart Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col max-w-xl mx-auto w-full space-y-5 select-none">
      
      {/* Quiz Progress header */}
      <div className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground px-1">
        <span>
          Question {currIdx + 1} of {quiz.length}
        </span>
        <span>
          Score: {correctCount}
        </span>
      </div>

      {/* Main Question Card */}
      <Card className="border border-border bg-card shadow-sm rounded-2xl relative overflow-hidden">
        
        {/* Animated Question Progress line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currIdx + 1) / quiz.length) * 100}%` }}
          />
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Question Text */}
          <h3 className="text-sm font-extrabold text-foreground leading-relaxed select-text">
            {activeQ.question}
          </h3>

          {/* Options List */}
          <div className="space-y-2.5">
            {activeQ.options.map((opt, oIdx) => {
              const isSelected = selectedOpt === opt;
              const isCorrectOpt = opt === activeQ.correctAnswer;
              
              return (
                <button
                  key={oIdx}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={isSubmitted}
                  className={clsx(
                    "w-full text-left p-3.5 rounded-xl text-xs font-bold border transition duration-150 flex items-center justify-between cursor-pointer",
                    !isSubmitted && isSelected && "bg-secondary text-foreground border-primary",
                    !isSubmitted && !isSelected && "bg-background border-border hover:bg-secondary/45 text-foreground/85",
                    isSubmitted && isSelected && isCorrectOpt && "bg-green-500/10 border-green-500 text-green-600",
                    isSubmitted && isSelected && !isCorrectOpt && "bg-red-500/10 border-red-500 text-red-600",
                    isSubmitted && !isSelected && isCorrectOpt && "bg-green-500/10 border-green-500 text-green-600",
                    isSubmitted && !isSelected && !isCorrectOpt && "bg-background border-border opacity-50 text-foreground/60"
                  )}
                >
                  <span className="select-text pr-4">{opt}</span>
                  {isSubmitted && isCorrectOpt && <CheckCircle2 size={15} className="text-green-500 shrink-0" />}
                  {isSubmitted && isSelected && !isCorrectOpt && <XCircle size={15} className="text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Area */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-secondary/35 border border-border/80 text-xs font-semibold leading-relaxed text-muted-foreground select-text"
              >
                <div className="flex items-center space-x-1.5 text-foreground font-extrabold mb-1">
                  <HelpCircle size={13} />
                  <span>Explanation:</span>
                </div>
                {activeQ.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action Button */}
          {!isSubmitted && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedOpt}
              className="w-full h-10.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer text-xs"
            >
              Submit Answer
            </Button>
          )}

        </CardContent>
      </Card>

      {/* Slide Navigation Footers */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrev}
          disabled={currIdx === 0}
          variant="outline"
          className="h-10 px-4.5 rounded-xl border-border text-foreground hover:bg-secondary flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-background text-xs"
        >
          <ChevronLeft size={15} />
          Previous
        </Button>

        {isSubmitted && (
          <Button
            onClick={handleNext}
            className="h-10 px-5.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 cursor-pointer text-xs"
          >
            {currIdx === quiz.length - 1 ? "Finish Quiz" : "Next"}
            <ChevronRight size={15} />
          </Button>
        )}
      </div>

    </div>
  );
};
