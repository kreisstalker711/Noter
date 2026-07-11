"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import Image from "next/image";

export const Splash: React.FC = () => {
  const { user, loading, setCurrentPage } = useApp();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Keep splash active for at least 2.5s for premium brand impact
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeElapsed && !loading) {
      if (user) {
        const completedOnboarding = localStorage.getItem(`onboarding_${user.uid}`);
        if (completedOnboarding === "true") {
          setCurrentPage("app");
        } else {
          setCurrentPage("onboarding");
        }
      } else {
        setCurrentPage("auth");
      }
    }
  }, [minTimeElapsed, loading, user, setCurrentPage]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[80px] dark:bg-primary/5 animate-pulse-glow" />

      {/* Main Branding Card */}
      <div className="flex flex-col items-center space-y-6 z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative w-24 h-24 flex items-center justify-center"
        >
          {/* Logo container */}
          <div className="relative w-24 h-24 overflow-hidden rounded-3xl shadow-lg border border-border/10 bg-card p-1">
            <Image
              src="/logo.png"
              alt="Noter Logo"
              fill
              sizes="96px"
              className="object-cover rounded-3xl"
              priority
            />
          </div>
        </motion.div>

        {/* Brand Text */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Noter
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-sm font-medium text-muted-foreground tracking-wide"
          >
            Turn your notes into knowledge
          </motion.p>
        </div>

        {/* Loading Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-8"
        >
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      </div>

      {/* Subtle branding footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 text-xs font-semibold uppercase tracking-widest text-muted-foreground z-10"
      >
        Apple + Notion Inspired
      </motion.div>
    </div>
  );
};
