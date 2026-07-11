"use client";

import React from "react";
import { useApp } from "../../context/AppContext";
import { Search, Bell, Sun, Moon } from "lucide-react";
import Image from "next/image";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, user } = useApp();

  return (
    <nav className="flex items-center justify-between px-6 py-4.5 border-b border-border bg-background select-none">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center space-x-2.5">
        <div className="relative w-7.5 h-7.5 overflow-hidden rounded-lg border border-border bg-card p-0.5 shadow-sm">
          <Image
            src="/logo.png"
            alt="Noter Logo"
            fill
            sizes="30px"
            className="object-cover rounded-lg"
          />
        </div>
        <span className="text-lg font-black tracking-tight text-foreground">Noter</span>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden sm:block relative max-w-md w-full mx-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
        <input
          type="text"
          placeholder="Search notes, PDFs or flashcards..."
          className="w-full pl-9.5 pr-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Right: Actions Bell, Theme, Profile */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <button className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Profile Avatar */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center font-bold text-foreground text-xs shadow-sm">
          {user?.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt={user.name} 
              fill 
              sizes="32px"
              className="object-cover" 
            />
          ) : (
            user?.name.charAt(0).toUpperCase() || "U"
          )}
        </div>
      </div>
    </nav>
  );
};
