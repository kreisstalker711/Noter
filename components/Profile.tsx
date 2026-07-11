"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress as ProgressBar } from "./ui/progress";
import { 
  User, Sun, Moon, LogOut, Award, Clock, 
  Layers, CheckSquare, Sparkles, ChevronRight 
} from "lucide-react";
import Image from "next/image";

export const Profile: React.FC = () => {
  const { user, theme, toggleTheme, logoutUser, stats } = useApp();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">Manage your student credentials and preferences</p>
      </div>

      {/* User Info Card */}
      <Card className="border border-border/80 bg-card overflow-hidden shadow-sm relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <CardContent className="p-6 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center font-black text-primary text-3xl overflow-hidden">
            {user?.photoURL ? (
              <Image src={user.photoURL} alt={user.name} fill sizes="80px" className="object-cover" />
            ) : (
              user?.name.charAt(0).toUpperCase() || "U"
            )}
          </div>

          {/* User Bio */}
          <div className="flex-1 text-center md:text-left space-y-3.5 w-full">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">{user?.name || "Kathiravan S."}</h2>
              <p className="text-xs text-muted-foreground font-semibold">{user?.email || "kathiravan@gmail.com"}</p>
            </div>

            {/* Level System */}
            <div className="space-y-1.5 max-w-sm mx-auto md:mx-0">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span className="text-primary uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse" />
                  Level {user?.level || 12} Student
                </span>
                <span>850 / 1000 XP</span>
              </div>
              <ProgressBar value={85} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <Card className="border border-border/80 bg-card shadow-sm p-4">
          <Clock size={16} className="mx-auto text-primary mb-1.5" />
          <div className="text-lg font-black text-foreground">{stats.studyTime}h</div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Study Focus</div>
        </Card>

        <Card className="border border-border/80 bg-card shadow-sm p-4">
          <Layers size={16} className="mx-auto text-purple-500 mb-1.5" />
          <div className="text-lg font-black text-foreground">{stats.cardsReviewed}</div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Reviewed</div>
        </Card>

        <Card className="border border-border/80 bg-card shadow-sm p-4">
          <CheckSquare size={16} className="mx-auto text-pink-500 mb-1.5" />
          <div className="text-lg font-black text-foreground">{stats.quizzesTaken}</div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Quizzes</div>
        </Card>
      </div>

      {/* Settings Options List */}
      <Card className="border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="divide-y divide-border/60">
          {/* Theme Switcher Toggle */}
          <div className="flex items-center justify-between p-4.5">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-secondary text-foreground">
                {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Dark Mode</h4>
                <p className="text-[11px] text-muted-foreground font-semibold">Toggle between Light + Black and Dark + White</p>
              </div>
            </div>
            {/* Toggle switch slider */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === "dark" ? "bg-primary" : "bg-secondary-foreground/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sign Out Action */}
          <button
            onClick={logoutUser}
            className="flex items-center justify-between p-4.5 w-full text-left hover:bg-destructive/5 group transition cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-destructive/10 text-destructive group-hover:scale-110 transition duration-300">
                <LogOut size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-destructive">Sign Out</h4>
                <p className="text-[11px] text-muted-foreground font-semibold">Terminate session on this device</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </Card>
    </div>
  );
};
