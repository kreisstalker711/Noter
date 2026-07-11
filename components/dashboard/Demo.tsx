"use client";

import React from "react";
import { useApp } from "../../context/AppContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { BookOpen } from "lucide-react";

export const Demo: React.FC = () => {
  const { setActiveTab, setCurrentCollectionId } = useApp();

  const handleOpenDemo = () => {
    setCurrentCollectionId("physics");
    setActiveTab("study" as any);
  };

  return (
    <Card className="border border-border bg-card shadow-sm hover:shadow transition duration-200 select-none">
      <CardContent className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side Info */}
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border/40 shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-extrabold text-foreground tracking-tight">Try a Sample</h4>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Explore a demo chapter to see how Noter works.
            </p>
          </div>
        </div>

        {/* Right Side Action */}
        <Button
          onClick={handleOpenDemo}
          className="h-10 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs px-5 sm:w-auto"
        >
          Open Demo
        </Button>
      </CardContent>
    </Card>
  );
};
