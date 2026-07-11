"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "./ui/card";
import { Progress as ProgressBar } from "./ui/progress";
import { 
  BarChart3, Zap, Clock, Trophy, Target, Award,
  Sparkles, CheckCircle2, ChevronRight, HelpCircle
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";

export const Progress: React.FC = () => {
  const { stats } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">Monitor your streak, mastery level, and achievements</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hours Studied */}
        <Card className="border border-border/80 bg-card shadow-sm p-4.5 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Study Time</span>
            <h3 className="text-lg font-black text-foreground mt-0.5">{stats.studyTime} hrs</h3>
          </div>
        </Card>

        {/* Cards Reviewed */}
        <Card className="border border-border/80 bg-card shadow-sm p-4.5 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Zap size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Cards Reviewed</span>
            <h3 className="text-lg font-black text-foreground mt-0.5">{stats.cardsReviewed}</h3>
          </div>
        </Card>

        {/* Quiz Accuracy */}
        <Card className="border border-border/80 bg-card shadow-sm p-4.5 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
            <Target size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Accuracy</span>
            <h3 className="text-lg font-black text-foreground mt-0.5">{stats.accuracy}%</h3>
          </div>
        </Card>

        {/* Quizzes Taken */}
        <Card className="border border-border/80 bg-card shadow-sm p-4.5 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Quizzes Taken</span>
            <h3 className="text-lg font-black text-foreground mt-0.5">{stats.quizzesTaken}</h3>
          </div>
        </Card>
      </div>

      {/* Analytics Graph */}
      <Card className="border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/80">Study Overview</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Focus tracking analysis</p>
          </div>
          <div className="flex space-x-1.5 bg-secondary/60 border border-border/40 p-0.5 rounded-lg text-xs font-semibold">
            <button className="px-2.5 py-1 rounded-md bg-card text-foreground shadow-sm">Week</button>
            <button className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground">Month</button>
          </div>
        </div>

        <div className="w-full h-[240px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.dailyStudyHistory}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorHoursProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}h`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "var(--card)", 
                    borderColor: "var(--border)", 
                    borderRadius: "12px",
                    fontSize: "12px"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#7c3aed" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorHoursProgress)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/20 rounded-xl">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </Card>

      {/* Achievements Column */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/80">Achievements</h2>
          <span className="text-xs font-bold text-primary hover:underline cursor-pointer">View All</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.achievements.map((ach) => (
            <Card 
              key={ach.id}
              className={`border border-border/80 bg-card p-5 relative overflow-hidden transition duration-200 ${
                ach.unlocked ? "shadow-sm border-primary/10" : "opacity-80 border-dashed"
              }`}
            >
              <div className="flex items-start space-x-4 relative z-10">
                <div className={`p-3 rounded-2xl ${
                  ach.unlocked 
                    ? "bg-primary/10 text-primary" 
                    : "bg-secondary text-muted-foreground/70"
                }`}>
                  <Award size={22} className={ach.unlocked ? "fill-primary/10" : ""} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-foreground leading-snug">{ach.title}</h4>
                    {ach.unlocked ? (
                      <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{ach.description}</p>
                  
                  {/* Progress Indicator */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>Progress</span>
                      <span>{ach.progress}%</span>
                    </div>
                    <ProgressBar value={ach.progress} className="h-1.5" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
