"use client";

import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../../context/AppContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Camera, Upload, MessageSquare } from "lucide-react";

export const QuickActions: React.FC = () => {
  const { setActiveTab } = useApp();

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4.5 select-none"
    >
      {/* 1. Scan Notes */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border bg-card shadow-sm hover:shadow transition duration-200 h-full flex flex-col justify-between">
          <CardContent className="p-5.5 space-y-4">
            <div className="p-3 rounded-xl bg-secondary text-foreground w-11 h-11 flex items-center justify-center border border-border/40">
              <Camera size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground tracking-tight">Scan Notes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Scan handwritten or printed notes using your camera.
              </p>
            </div>
          </CardContent>
          <div className="p-5.5 pt-0">
            <Button
              onClick={() => setActiveTab("scan" as any)}
              className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs"
            >
              Start Scanning
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* 2. Upload PDF */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border bg-card shadow-sm hover:shadow transition duration-200 h-full flex flex-col justify-between">
          <CardContent className="p-5.5 space-y-4">
            <div className="p-3 rounded-xl bg-secondary text-foreground w-11 h-11 flex items-center justify-center border border-border/40">
              <Upload size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground tracking-tight">Upload PDF</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Upload PDFs, slides or images from your device.
              </p>
            </div>
          </CardContent>
          <div className="p-5.5 pt-0">
            <Button
              onClick={() => setActiveTab("pdf" as any)}
              className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs"
            >
              Upload File
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* 3. AI Chat (Initially Disabled) */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 bg-card/45 shadow-none opacity-60 h-full flex flex-col justify-between border-dashed">
          <CardContent className="p-5.5 space-y-4">
            <div className="p-3 rounded-xl bg-secondary/50 text-muted-foreground/80 w-11 h-11 flex items-center justify-center border border-border/30">
              <MessageSquare size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-muted-foreground tracking-tight flex items-center gap-1.5">
                AI Chat
              </h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">
                Ask anything from your notes. Upload notes to unlock.
              </p>
            </div>
          </CardContent>
          <div className="p-5.5 pt-0">
            <Button
              disabled
              className="w-full h-10 rounded-xl font-bold bg-secondary text-muted-foreground/60 border border-border/20 cursor-not-allowed text-xs"
            >
              Upload Notes First
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
