"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { StudyMaterialResult } from "../services/studyGenerator";
import { 
  Folder, FileText, Camera, Image as ImageIcon, 
  Search, Plus, Grid, List, Pin, Star, 
  Trash2, MoreVertical, ChevronRight, 
  BookOpen, Filter, ArrowUpDown, Edit3, 
  FolderInput, X, AlertCircle 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

export const Library: React.FC = () => {
  const { 
    studyMaterials, 
    updateStudyMaterial, 
    deleteStudyMaterial,
    setActiveStudyData,
    setActiveTab,
    customCategories,
    addCustomCategory
  } = useApp();

  // Explorer states
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Alphabetical">("Newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Custom Category addition
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Actions Dialog overlays
  const [renameTarget, setRenameTarget] = useState<StudyMaterialResult | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  
  const [moveTarget, setMoveTarget] = useState<StudyMaterialResult | null>(null);

  // Default Categories folders
  const defaultCategories = [
    "Physics", "Chemistry", "Biology", 
    "Mathematics", "History", "Computer Science"
  ];
  const allCategories = [...defaultCategories, ...customCategories];

  // 1. Calculate Statistics
  const totalScans = studyMaterials.length;
  const imageCount = studyMaterials.filter(item => item.sourceType === "Camera" || item.sourceType === "Image").length;
  const pdfCount = studyMaterials.filter(item => item.sourceType === "PDF").length;
  
  // Count distinct categories/subjects assigned in documents
  const assignedCats = new Set(studyMaterials.map(item => (item as any).category || "General"));
  const categoriesCount = assignedCats.size;

  // 2. Filter & Sort Items
  const filteredItems = studyMaterials
    .filter((item) => {
      // Category folder filter
      const category = (item as any).category || "General";
      if (activeCategory !== "All" && category !== activeCategory) return false;

      // Search filters
      if (searchQuery.trim()) {
        const queryStr = searchQuery.toLowerCase();
        const titleMatch = item.chapterTitle.toLowerCase().includes(queryStr);
        const subjectMatch = ((item as any).category || "General").toLowerCase().includes(queryStr);
        const keywordMatch = item.keywords?.some(k => k.toLowerCase().includes(queryStr));
        const summaryMatch = item.summary?.toLowerCase().includes(queryStr);
        return titleMatch || subjectMatch || keywordMatch || summaryMatch;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      if (sortBy === "Newest") return dateB - dateA;
      if (sortBy === "Oldest") return dateA - dateB;
      if (sortBy === "Alphabetical") return a.chapterTitle.localeCompare(b.chapterTitle);
      return 0;
    });

  const handleOpenItem = (item: StudyMaterialResult) => {
    setActiveStudyData(item);
    setActiveTab("scan"); // Redirect to the scan Study Workspace page!
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (renameTarget && renameTitle.trim()) {
      await updateStudyMaterial(renameTarget.id!, { chapterTitle: renameTitle.trim() });
      setRenameTarget(null);
      setRenameTitle("");
    }
  };

  const handleMoveCategory = async (category: string) => {
    if (moveTarget) {
      await updateStudyMaterial(moveTarget.id!, { category } as any);
      setMoveTarget(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this study guide? This will clear its local IndexedDB file.")) {
      await deleteStudyMaterial(id);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCustomCategory(newCatName.trim());
      setNewCatName("");
      setShowAddCat(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 select-none max-w-4xl mx-auto w-full text-left">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-none">📚 Library</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1.5">
            Organize, search, and review your compiled study resources.
          </p>
        </div>

        <Button
          onClick={() => setActiveTab("scan")}
          className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus size={14} />
          Scan Notes
        </Button>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Total Scans</span>
          <span className="text-xl font-black text-foreground">{totalScans}</span>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Images</span>
          <span className="text-xl font-black text-foreground">{imageCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">PDFs</span>
          <span className="text-xl font-black text-foreground">{pdfCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Subjects</span>
          <span className="text-xl font-black text-foreground">{categoriesCount}</span>
        </div>
      </div>

      {/* Search & Sort Panel */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes, summaries, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          />
        </div>

        {/* Sort and View controls */}
        <div className="flex gap-2">
          <div className="flex items-center space-x-1.5 px-3 border border-border rounded-xl bg-card text-xs text-foreground cursor-pointer select-none">
            <ArrowUpDown size={13} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-0 text-[11px] font-bold focus:outline-none cursor-pointer appearance-none pr-1"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Alphabetical">A-Z</option>
            </select>
          </div>

          <div className="flex border border-border rounded-xl overflow-hidden bg-card shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 cursor-pointer transition ${viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 cursor-pointer transition ${viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Categories chips scroll and custom category add buttons */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
            Folders & Subjects
          </span>
          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={11} />
            Custom Category
          </button>
        </div>

        {showAddCat && (
          <form onSubmit={handleAddCategorySubmit} className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. English, Economics"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border border-border bg-card text-xs focus:outline-none"
              required
            />
            <Button
              type="submit"
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0"
            >
              Add
            </Button>
          </form>
        )}

        <div className="overflow-x-auto scrollbar-none flex space-x-2 pb-1.5">
          <button
            onClick={() => setActiveCategory("All")}
            className={`h-8.5 px-4 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
              activeCategory === "All"
                ? "bg-foreground border-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-8.5 px-4 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                activeCategory === cat
                  ? "bg-foreground border-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Library Grid Feed */}
      <div className="pt-2">
        <AnimatePresence mode="popLayout">
          {studyMaterials.length === 0 ? (
            /* Empty state when no study materials exist at all */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center p-12 text-center py-20 border border-dashed rounded-3xl bg-card min-h-[350px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 text-muted-foreground">
                <BookOpen size={20} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">No study materials yet</h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] font-semibold leading-relaxed">
                Start scanning your first chapter to build your personal exam library.
              </p>
              <Button
                onClick={() => setActiveTab("scan")}
                className="mt-5 h-9.5 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs shadow-sm"
              >
                Scan Notes
              </Button>
            </motion.div>
          ) : filteredItems.length === 0 ? (
            /* Empty state when search/filter produces 0 matches */
            <div className="text-center py-12 p-6 border border-dashed border-border rounded-2xl text-muted-foreground">
              <AlertCircle size={24} className="mx-auto text-muted-foreground/60 mb-2.5" />
              <p className="text-xs font-bold">No results match your search parameters.</p>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4" 
              : "space-y-2.5"}
            >
              {filteredItems.map((item, idx) => (
                <LibraryCard
                  key={item.id || idx}
                  item={item}
                  viewMode={viewMode}
                  onOpen={() => handleOpenItem(item)}
                  onRename={() => {
                    setRenameTarget(item);
                    setRenameTitle(item.chapterTitle);
                  }}
                  onMove={() => setMoveTarget(item)}
                  onDelete={() => handleDeleteItem(item.id!)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- RENAME DIALOG MODAL --- */}
      <AnimatePresence>
        {renameTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-card border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Rename Title</span>
                <button onClick={() => setRenameTarget(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={14} />
                </button>
              </div>
              <form onSubmit={handleRenameSubmit} className="p-5 space-y-4">
                <input
                  type="text"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
                  required
                />
                <div className="flex gap-2 justify-end pt-1">
                  <Button type="button" variant="outline" onClick={() => setRenameTarget(null)} className="h-9 px-3 rounded-lg text-xs font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                    Rename
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MOVE CATEGORY DRAWER MODAL --- */}
      <AnimatePresence>
        {moveTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-card border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Move Folder</span>
                <button onClick={() => setMoveTarget(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={14} />
                </button>
              </div>
              <div className="p-5 max-h-60 overflow-y-auto space-y-1">
                <button
                  onClick={() => handleMoveCategory("General")}
                  className="w-full py-2 px-3 text-left hover:bg-secondary rounded-lg text-xs font-bold flex items-center justify-between text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <span>General (Default)</span>
                  <ChevronRight size={12} />
                </button>
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleMoveCategory(cat)}
                    className="w-full py-2 px-3 text-left hover:bg-secondary rounded-lg text-xs font-bold flex items-center justify-between text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <span>{cat}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Individual Library Card --- */
interface LibraryCardProps {
  item: StudyMaterialResult;
  viewMode: "grid" | "list";
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({
  item,
  viewMode,
  onOpen,
  onRename,
  onMove,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  const fileType = item.sourceType || "Image";
  const categoryName = (item as any).category || "General";
  const isAI = item.summary || item.flashcards?.length;

  const cardDate = new Date(item.createdAt || "").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (viewMode === "list") {
    return (
      <div 
        className="p-3.5 px-4 rounded-xl border border-border bg-card shadow-xs hover:border-foreground/20 hover:shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 relative"
        onClick={onOpen}
      >
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          <div className="p-2 rounded-lg border border-border bg-secondary text-muted-foreground shrink-0">
            {fileType === "PDF" ? (
              <FileText size={14} />
            ) : (
              <ImageIcon size={14} />
            )}
          </div>

          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-extrabold text-foreground truncate">{item.chapterTitle}</h4>
              {isAI && (
                <span className="text-[7px] font-extrabold px-1 rounded bg-foreground text-background shrink-0 uppercase tracking-widest">
                  AI
                </span>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground font-semibold leading-none mt-1">
              {categoryName} • {cardDate}
            </p>
          </div>
        </div>

        {/* Dropdown Options trigger */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <MoreVertical size={14} />
          </button>
          
          <AnimatePresence>
            {showActions && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowActions(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-8 z-40 bg-card border border-border p-1 w-28 rounded-lg shadow-md text-left text-[10px] font-bold text-muted-foreground space-y-0.5"
                >
                  <button 
                    onClick={() => { onOpen(); setShowActions(false); }}
                    className="w-full py-1.5 px-2 hover:bg-secondary hover:text-foreground rounded flex items-center justify-between cursor-pointer"
                  >
                    <span>Open</span>
                  </button>
                  <button 
                    onClick={() => { onRename(); setShowActions(false); }}
                    className="w-full py-1.5 px-2 hover:bg-secondary hover:text-foreground rounded flex items-center justify-between cursor-pointer"
                  >
                    <span>Rename</span>
                  </button>
                  <button 
                    onClick={() => { onMove(); setShowActions(false); }}
                    className="w-full py-1.5 px-2 hover:bg-secondary hover:text-foreground rounded flex items-center justify-between cursor-pointer"
                  >
                    <span>Move</span>
                  </button>
                  <button 
                    onClick={() => { onDelete(); setShowActions(false); }}
                    className="w-full py-1.5 px-2 hover:bg-secondary text-destructive hover:bg-destructive/10 rounded flex items-center justify-between cursor-pointer"
                  >
                    <span>Delete</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-xs hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl text-left relative overflow-hidden group flex flex-col justify-between h-44">
      {/* Clickable Card Body Area */}
      <CardContent 
        className="p-5 flex-1 flex flex-col justify-between cursor-pointer select-text"
        onClick={onOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-[8px] font-black text-foreground border border-border bg-secondary/85 px-1.5 py-0.5 rounded uppercase tracking-wider">
                {categoryName}
              </span>
              <span className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest">
                {fileType}
              </span>
            </div>
            <h3 className="text-xs font-black text-foreground group-hover:text-primary transition-colors line-clamp-2 pr-4 leading-normal">
              {item.chapterTitle}
            </h3>
          </div>

          {/* AI Badge indicator */}
          {isAI && (
            <span className="text-[7px] font-extrabold px-1 rounded bg-foreground text-background uppercase tracking-widest shrink-0 mt-0.5 select-none">
              AI Notes
            </span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <span className="text-[9px] text-muted-foreground font-bold leading-none">
            {cardDate}
          </span>
          
          {/* Action options trigger */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer shadow-xs bg-card"
            >
              <MoreVertical size={12} />
            </button>

            <AnimatePresence>
              {showActions && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowActions(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 bottom-8 z-40 bg-card border border-border p-1 w-28 rounded-lg shadow-md text-left text-[10px] font-bold text-muted-foreground space-y-0.5"
                  >
                    <button 
                      onClick={() => { onOpen(); setShowActions(false); }}
                      className="w-full py-1.5 px-2 hover:bg-secondary hover:text-foreground rounded flex items-center justify-between cursor-pointer"
                    >
                      <span>Open</span>
                    </button>
                    <button 
                      onClick={() => { onRename(); setShowActions(false); }}
                      className="w-full py-1.5 px-2 hover:bg-secondary hover:text-foreground rounded flex items-center justify-between cursor-pointer"
                    >
                      <span>Rename</span>
                    </button>
                    <button 
                      onClick={() => { onMove(); setShowActions(false); }}
                      className="w-full py-1.5 px-2 hover:bg-secondary hover:text-foreground rounded flex items-center justify-between cursor-pointer"
                    >
                      <span>Move</span>
                    </button>
                    <button 
                      onClick={() => { onDelete(); setShowActions(false); }}
                      className="w-full py-1.5 px-2 hover:bg-secondary text-destructive hover:bg-destructive/10 rounded flex items-center justify-between cursor-pointer"
                    >
                      <span>Delete</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
