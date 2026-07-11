"use client";

import React from "react";
import { AppProvider, useApp } from "../context/AppContext";
import { Splash } from "../components/Splash";
import { Onboarding } from "../components/Onboarding";
import { AuthPages } from "../components/AuthPages";
import { Navbar } from "../components/Navbar";
import { Dashboard } from "../components/Dashboard";
import { Collections } from "../components/Collections";
import { Progress } from "../components/Progress";
import { Profile } from "../components/Profile";
import { SettingsView } from "../components/SettingsView";
import { Navbar as NavbarTop } from "../components/dashboard/Navbar";
import ScanPage from "./scan/page";
import { Brain, Camera, FileText, CheckSquare, BookOpen, Layers } from "lucide-react";

function AppRouter() {
  const { currentPage, activeTab, user } = useApp();

  if (currentPage === "splash") {
    return <Splash />;
  }

  if (currentPage === "onboarding") {
    return <Onboarding />;
  }

  if (currentPage === "auth") {
    return <AuthPages />;
  }

  // Active App Dashboard Shell Layout
  if (currentPage === "app") {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Navigation Sidebar / Bottom Bar */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto max-h-screen select-text">
          {/* Global Top Search bar */}
          <NavbarTop />

          {/* Page body content */}
          <div className="flex-1 p-6 md:p-8">
            {activeTab === "home" && <Dashboard />}
            {activeTab === "library" && <Collections />}
            {activeTab === "progress" && <Progress />}
            {activeTab === "profile" && <Profile />}
            {activeTab === "settings" && <SettingsView />}
            {activeTab === "scan" && <ScanPage />}
            {activeTab === "pdf" && <ScanPage />}

          {activeTab === "chat" && (
            <div className="flex flex-col items-center justify-center p-12 text-center py-20 border border-dashed rounded-2xl min-h-[400px]">
              <Brain className="w-16 h-16 text-primary animate-pulse mb-4" />
              <h2 className="text-xl font-bold text-foreground">AI Chat Assistant</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-[340px]">
                We will build the ChatGPT-style conversation workspace for querying notes in the next phase!
              </p>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="flex flex-col items-center justify-center p-12 text-center py-20 border border-dashed rounded-2xl min-h-[400px]">
              <CheckSquare className="w-16 h-16 text-primary animate-pulse mb-4" />
              <h2 className="text-xl font-bold text-foreground">Take Quiz</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-[340px]">
                We will build the interactive AI quiz question tracker and timers in the next phase!
              </p>
            </div>
          )}

          {activeTab === "study" && (
            <div className="flex flex-col items-center justify-center p-12 text-center py-20 border border-dashed rounded-2xl min-h-[400px]">
              <BookOpen className="w-16 h-16 text-primary animate-pulse mb-4" />
              <h2 className="text-xl font-bold text-foreground">Study Mode</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-[340px]">
                We will build the Anki-style deck swipe and flip review interface in the next phase!
              </p>
            </div>
          )}
          </div>
        </main>
      </div>
    );
  }

  return <Splash />;
}

export default function Home() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

