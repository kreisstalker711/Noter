"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Home, Camera, Folder, MessageSquare, User, 
  Settings, HelpCircle, Sparkles, LogOut 
} from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";
import { Button } from "./ui/button";

type TabType = "home" | "scan" | "library" | "chat" | "profile" | "settings";

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const mainNavItems = [
    { id: "home", label: "Home", icon: <Home size={18} /> },
    { id: "scan", label: "Scan", icon: <Camera size={18} /> },
    { id: "library", label: "Library", icon: <Folder size={18} /> },
    { id: "chat", label: "AI Chat", icon: <MessageSquare size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
  ] as const;

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId as any);
  };

  return (
    <>
      {/* Desktop Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 border-r border-border bg-card p-5.5 justify-between z-20 select-none">
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center space-x-2 px-1">
            <div className="relative w-7 h-7 overflow-hidden rounded-lg border border-border bg-background p-0.5 shadow-sm">
              <Image
                src="/logo.png"
                alt="Noter Logo"
                fill
                sizes="28px"
                className="object-cover rounded-lg"
              />
            </div>
            <span className="font-extrabold text-foreground tracking-tight leading-none text-base">Noter</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-2">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id || (
                (item.id === "scan" && activeTab === "scan") ||
                (item.id === "library" && (activeTab === "library" || activeTab === "study" || activeTab === "flashcards")) ||
                (item.id === "chat" && activeTab === "chat")
              );
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id as any)}
                  className={clsx(
                    "flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-[0.98]",
                    isActive
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/45 hover:text-foreground"
                  )}
                >
                  <span className={clsx("transition-transform duration-200", isActive && "scale-105")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Elements */}
        <div className="space-y-5">
          {/* Upgrade to Pro Card */}
          <div className="p-4 rounded-xl border border-border bg-secondary/30 relative overflow-hidden space-y-3">
            <div className="flex items-start space-x-2 text-foreground">
              <Sparkles size={14} className="shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider">Upgrade to Pro</h4>
                <p className="text-[10px] leading-relaxed text-muted-foreground font-semibold">
                  Unlock unlimited scans, AI chat and more.
                </p>
              </div>
            </div>
            <Button
              className="w-full h-8.5 rounded-lg font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-[10px]"
            >
              Upgrade
            </Button>
          </div>

          {/* Settings & Support Links */}
          <div className="space-y-1 px-1">
            <button
              onClick={() => handleTabClick("settings")}
              className={clsx(
                "flex items-center space-x-3 w-full py-2 text-[11px] font-bold transition cursor-pointer text-muted-foreground hover:text-foreground",
                activeTab === "settings" && "text-foreground font-extrabold"
              )}
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
            
            <button
              className="flex items-center space-x-3 w-full py-2 text-[11px] font-bold transition cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <HelpCircle size={14} />
              <span>Help & Support</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card flex items-center justify-around px-2 pb-safe z-30 shadow-sm">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id || (
            (item.id === "scan" && activeTab === "scan") ||
            (item.id === "library" && (activeTab === "library" || activeTab === "study" || activeTab === "flashcards")) ||
            (item.id === "chat" && activeTab === "chat")
          );
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id as any)}
              className={clsx(
                "flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-150 cursor-pointer active:scale-90",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={clsx(
                "p-1.5 rounded-lg transition-colors duration-200", 
                isActive && "bg-secondary text-foreground"
              )}>
                {item.icon}
              </div>
              <span className="text-[8px] font-extrabold mt-0.5 tracking-wider uppercase leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
