"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog } from "./ui/dialog";
import { 
  FolderPlus, Search, Trash2, Edit3, ArrowRight,
  BookOpen, Atom, FlaskConical, Binary, Dna, FileText, ChevronRight
} from "lucide-react";
import { Collection } from "../lib/mockData";
import { EmptyLibrary } from "./dashboard/EmptyLibrary";

export const Collections: React.FC = () => {
  const { 
    collections, 
    addCollection, 
    deleteCollection, 
    renameCollection,
    setCurrentCollectionId,
    setActiveTab 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("BookOpen");

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const iconsList = [
    { name: "Atom", label: "Physics" },
    { name: "FlaskConical", label: "Chemistry" },
    { name: "Binary", label: "Math" },
    { name: "Dna", label: "Biology" },
    { name: "BookOpen", label: "General" }
  ];

  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case "Atom": return <Atom size={18} />;
      case "FlaskConical": return <FlaskConical size={18} />;
      case "Binary": return <Binary size={18} />;
      case "Dna": return <Dna size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    await addCollection(newColName.trim(), selectedIcon);
    setNewColName("");
    setIsCreateOpen(false);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || !renameTargetId) return;
    await renameCollection(renameTargetId, renameValue.trim());
    setRenameValue("");
    setRenameTargetId(null);
    setIsRenameOpen(false);
  };

  const triggerRename = (col: Collection) => {
    setRenameTargetId(col.id);
    setRenameValue(col.name);
    setIsRenameOpen(true);
  };

  const handleCollectionSelect = (colId: string) => {
    setCurrentCollectionId(colId);
    setActiveTab("study" as any); // Redirects to Study Mode automatically
  };

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Organize your study assets into folders</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl flex items-center gap-1.5 font-semibold text-xs md:text-sm cursor-pointer shadow-sm"
        >
          <FolderPlus size={16} />
          New Folder
        </Button>
      </div>

      {/* Search Filter Row */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 border-border/80 bg-card/45 backdrop-blur-sm"
        />
      </div>

      {/* Collections Grid */}
      {filteredCollections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCollections.map((col) => (
            <Card 
              key={col.id}
              className="border border-border/85 bg-card hover:bg-muted/10 hover:shadow-md hover:border-primary/20 transition-all duration-350 overflow-hidden cursor-pointer"
              onClick={() => handleCollectionSelect(col.id)}
            >
              <CardContent className="p-5 flex flex-col justify-between h-44">
                {/* Header Icon + Actions */}
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl border ${col.color || 'bg-purple-500/10 text-purple-600 border-purple-500/20'}`}>
                    {getCollectionIcon(col.iconName)}
                  </div>
                  <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => triggerRename(col)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
                      title="Rename Folder"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => deleteCollection(col.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                      title="Delete Folder"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-1.5 mt-4">
                  <h3 className="text-base font-extrabold text-foreground leading-tight">{col.name}</h3>
                  <div className="flex items-center text-xs font-bold text-muted-foreground space-x-1.5">
                    <span>{col.cardCount} flashcards</span>
                    <span>•</span>
                    <span className="text-primary">{col.progress}% mastered</span>
                  </div>
                </div>

                {/* Progress bar footer */}
                <div className="mt-3.5 space-y-1.5 w-full">
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${col.progress}%` }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyLibrary />
      )}

      {/* CREATE COLLECTION DIALOG */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Folder 📂"
        description="Establish a new subject workspace to manage documents, flashcards, and quizzes."
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Folder Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Physics Quantum Mechanics"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              required
              className="h-11 border-border/80"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Category Icon
            </label>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {iconsList.map((ico) => (
                <button
                  key={ico.name}
                  type="button"
                  onClick={() => setSelectedIcon(ico.name)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                    selectedIcon === ico.name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {getCollectionIcon(ico.name)}
                  <span className="text-[9px] font-bold mt-0.5">{ico.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Create Folder
            </Button>
          </div>
        </form>
      </Dialog>

      {/* RENAME COLLECTION DIALOG */}
      <Dialog
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Folder ✏️"
        description="Input a new title for this subject workspace folder."
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              New Folder Name
            </label>
            <Input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              required
              className="h-11 border-border/80"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Apply Name
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
