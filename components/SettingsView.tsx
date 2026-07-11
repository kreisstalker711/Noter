"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { 
  Bell, Globe, Lock, ShieldAlert, Check,
  ChevronRight, Trash2, HelpCircle
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, logoutUser } = useApp();
  
  const [notify, setNotify] = useState(true);
  const [language, setLanguage] = useState("English");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const languages = ["English", "Spanish", "French", "Tamil", "Hindi"];

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirm.toLowerCase() === "delete") {
      setIsDeleteOpen(false);
      logoutUser();
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">Adjust preferences and account options</p>
      </div>

      {/* Main Settings Panel */}
      <Card className="border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="divide-y divide-border/60">
          
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4.5">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-secondary text-foreground">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Push Notifications</h4>
                <p className="text-[11px] text-muted-foreground font-semibold">Daily study reminders and achievements alerts</p>
              </div>
            </div>
            <button
              onClick={() => setNotify(!notify)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notify ? "bg-primary" : "bg-secondary-foreground/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notify ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between p-4.5">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-secondary text-foreground">
                <Globe size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">App Theme</h4>
                <p className="text-[11px] text-muted-foreground font-semibold">Currently set to {theme === "light" ? "Light + Black" : "Dark + White"}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition cursor-pointer text-foreground"
            >
              Toggle Mode
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between p-4.5">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-secondary text-foreground">
                <Globe size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Preferred Language</h4>
                <p className="text-[11px] text-muted-foreground font-semibold">Change default language in application pages</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-bold px-2 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition cursor-pointer text-foreground focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Privacy Terms policy */}
          <div className="flex items-center justify-between p-4.5 hover:bg-muted/10 transition cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-secondary text-foreground">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Privacy & Security</h4>
                <p className="text-[11px] text-muted-foreground font-semibold">View terms, storage controls, and encryption keys</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/60" />
          </div>

        </div>
      </Card>

      {/* Danger Zone */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-red-500">Danger Zone</h2>
        <Card className="border border-red-500/20 bg-card overflow-hidden shadow-sm">
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center justify-between p-4.5 w-full text-left hover:bg-red-500/5 group transition cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500 group-hover:scale-110 transition duration-300">
                <Trash2 size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-red-500">Delete Account</h4>
                <p className="text-[11px] text-muted-foreground font-semibold">Permanently delete user profile, collections, and flashcards</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-500/60" />
          </button>
        </Card>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION DIALOG */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Account ⚠️"
        description="This action is irreversible. All of your synced flashcards, notes, analytics, and achievements will be erased from Firestore database."
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
          <div className="space-y-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Warning</p>
              <p className="opacity-95 font-medium mt-0.5">Please confirm that you want to delete your profile by writing "delete" below.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Verification Input
            </label>
            <Input
              type="text"
              placeholder='Type "delete"'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              required
              className="h-11 border-border/80"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteConfirm.toLowerCase() !== "delete"}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Delete Permanently
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
