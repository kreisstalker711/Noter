"use client";

import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Camera, FileText } from "lucide-react";

export const Hero: React.FC = () => {
  const { user, setActiveTab } = useApp();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm select-none">
      
      {/* Text Context Area */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 space-y-4.5 max-w-lg text-center md:text-left z-10"
      >
        <div className="space-y-2">
          <h1 className="text-2.5xl md:text-3.5xl font-black tracking-tight text-foreground leading-tight">
            Welcome, {user?.name.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
            Let's turn your notes into knowledge. Get started in a few simple steps.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start pt-1.5">
          <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.985 }} className="w-full sm:w-auto">
            <Button
              onClick={() => setActiveTab("scan" as any)}
              className="w-full sm:w-auto h-11 px-5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Camera size={16} />
              Start Scanning
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.985 }} className="w-full sm:w-auto">
            <Button
              onClick={() => setActiveTab("pdf" as any)}
              variant="outline"
              className="w-full sm:w-auto h-11 px-5 rounded-xl font-bold border-border text-foreground hover:bg-secondary flex items-center justify-center gap-2 cursor-pointer shadow-sm bg-background"
            >
              <FileText size={16} />
              Upload PDF
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side: Apple/Notion styled monochrome binder illustration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-40 h-40 md:w-48 md:h-48 relative shrink-0"
      >
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-foreground/15 dark:text-foreground/10">
          {/* Base reader/scanner device */}
          <rect x="30" y="110" width="130" height="60" rx="14" fill="currentColor" stroke="var(--border)" strokeWidth="3" />
          <rect x="40" y="120" width="110" height="40" rx="8" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
          {/* Glass scanner reflection line */}
          <line x1="50" y1="130" x2="140" y2="150" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Curved dotted sync wire */}
          <path d="M150,140 C170,110 160,80 140,70" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" fill="none" />

          {/* Floating notebook sheet */}
          <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <rect x="75" y="30" width="80" height="95" rx="8" fill="var(--background)" stroke="var(--border)" strokeWidth="3" />
            
            {/* Spiral binder loops at the top of the sheet */}
            <circle cx="85" cy="38" r="2.5" fill="var(--border)" />
            <circle cx="95" cy="38" r="2.5" fill="var(--border)" />
            <circle cx="105" cy="38" r="2.5" fill="var(--border)" />
            <circle cx="115" cy="38" r="2.5" fill="var(--border)" />
            <circle cx="125" cy="38" r="2.5" fill="var(--border)" />
            <circle cx="135" cy="38" r="2.5" fill="var(--border)" />
            <circle cx="145" cy="38" r="2.5" fill="var(--border)" />
            
            {/* Written text line mockups */}
            <line x1="90" y1="55" x2="140" y2="55" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="90" y1="70" x2="135" y2="70" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="90" y1="85" x2="120" y2="85" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="90" y1="100" x2="130" y2="100" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};
