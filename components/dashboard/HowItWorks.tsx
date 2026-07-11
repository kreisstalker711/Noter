"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, Focus, Brain, GraduationCap, ArrowRight } from "lucide-react";

interface Step {
  num: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export const HowItWorks: React.FC = () => {
  const steps: Step[] = [
    {
      num: "1. Scan Notes",
      title: "Scan Notes",
      desc: "Capture your notes",
      icon: <Camera size={18} />
    },
    {
      num: "2. AI Reads Text",
      title: "AI Reads Text",
      desc: "AI extracts and understands text",
      icon: <Focus size={18} />
    },
    {
      num: "3. Generates Flashcards",
      title: "Generates Flashcards",
      desc: "Key points become smart flashcards",
      icon: <Brain size={18} />
    },
    {
      num: "4. Study Smarter",
      title: "Study Smarter",
      desc: "Revise, take quizzes and master topics",
      icon: <GraduationCap size={18} />
    }
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="space-y-4 select-none">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/85">How Noter Works</h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col lg:flex-row items-center justify-between p-6 rounded-2xl border border-border bg-card shadow-sm gap-6 overflow-x-auto"
      >
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {/* Step Block */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col items-center text-center flex-1 max-w-[200px]"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl border border-border bg-background text-foreground flex items-center justify-center shadow-sm mb-3">
                {step.icon}
              </div>
              
              {/* Step Info */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground leading-tight">{step.num}</h4>
                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed max-w-[140px]">
                  {step.desc}
                </p>
              </div>
            </motion.div>

            {/* Connecting Arrow (hidden on mobile, displayed only on large screens between blocks) */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex items-center text-muted-foreground/40 shrink-0">
                <ArrowRight size={16} />
              </div>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
