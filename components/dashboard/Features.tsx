"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Layers, CheckSquare, FileText, Network, Sparkles } from "lucide-react";

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export const Features: React.FC = () => {
  const list: Feature[] = [
    {
      title: "AI Flashcards",
      desc: "Smart flashcards from your notes",
      icon: <Layers size={16} />
    },
    {
      title: "AI Quiz Generator",
      desc: "Generate quizzes automatically",
      icon: <CheckSquare size={16} />
    },
    {
      title: "Chapter Summary",
      desc: "Get concise chapter summaries",
      icon: <FileText size={16} />
    },
    {
      title: "Mind Maps",
      desc: "Visualize concepts beautifully",
      icon: <Network size={16} />
    },
    {
      title: "AI Study Assistant",
      desc: "Chat with your notes using AI",
      icon: <Sparkles size={16} />
    }
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="space-y-4 select-none">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/85">What You Can Do</h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        {list.map((feat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="border border-border bg-card shadow-sm hover:shadow transition duration-200 h-full">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <div className="p-2.5 rounded-xl bg-secondary text-foreground border border-border/40">
                  {feat.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-extrabold text-foreground leading-tight tracking-tight">
                    {feat.title}
                  </h4>
                  <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed max-w-[100px] mx-auto">
                    {feat.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
