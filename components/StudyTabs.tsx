"use client";

import React from "react";
import { clsx } from "clsx";

export type StudyTabType = "summary" | "points" | "cards" | "quiz" | "keywords";

interface StudyTabsProps {
  activeTab: StudyTabType;
  setActiveTab: (tab: StudyTabType) => void;
}

export const StudyTabs: React.FC<StudyTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "points", label: "Takeaways" },
    { id: "cards", label: "Flashcards" },
    { id: "quiz", label: "Quiz" },
    { id: "keywords", label: "Keywords" }
  ] as const;

  return (
    <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-secondary border border-border overflow-x-auto max-w-xl mx-auto w-full select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95",
              isActive
                ? "bg-background text-foreground shadow-sm font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/25"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
