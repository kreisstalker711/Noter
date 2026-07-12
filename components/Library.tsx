"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { LibraryItem } from "../services/studyGenerator";
import { 
  Folder, FileText, Camera, Image as ImageIcon, 
  Search, Plus, Grid, List, Pin, Star, 
  Trash2, MoreVertical, Sparkles, ChevronRight, 
  Calendar as CalendarIcon, HardDrive, Filter, 
  ArrowUpDown, File, AlertCircle 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { LibraryUploadModal } from "./LibraryUploadModal";
import { ResourceDetailsModal } from "./ResourceDetailsModal";

export const Library: React.FC = () => {
  const { 
    libraryItems, 
    customCategories, 
    updateLibraryItem,
    deleteLibraryItem 
  } = useApp();

  // Navigation / Folder states
  const [currentFolder, setCurrentFolder] = useState("Root");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Alphabetical" | "Size" | "Category">("Newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals visibility togglers
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<LibraryItem | null>(null);

  // New folder dialog
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Exam Calendar planner states
  const [exams, setExams] = useState<{ date: string; title: string }[]>([
    { date: "2026-07-15", title: "Physics Finals" },
    { date: "2026-07-22", title: "Math Semester Exam" }
  ]);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamDate, setNewExamDate] = useState("");

  // Categories list
  const defaultCategories = [
    "All", "Mathematics", "Physics", "Chemistry", "Biology", 
    "Computer Science", "English", "History", "Economics", 
    "Business Studies", "Languages"
  ];
  const allCategories = [...defaultCategories, ...customCategories];

  // 1. Calculate Stats
  const totalFiles = libraryItems.length;
  const imageCount = libraryItems.filter(item => item.type === "Image").length;
  const pdfCount = libraryItems.filter(item => item.type === "PDF").length;
  const aiGuidesCount = libraryItems.filter(item => item.summary || item.flashcards?.length).length;
  
  // Storage Tracker
  const storageLimit = 10 * 1024 * 1024 * 1024; // 10 GB limit
  const storageUsed = libraryItems.reduce((sum, item) => sum + (item.size || 0), 0);
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  // Extract all distinct folders created at the current directory level
  const allFolders = Array.from(
    new Set(
      libraryItems
        .map(item => item.folder)
        .filter(f => f && f !== "Root")
    )
  );

  // Filter study resources
  const filteredItems = libraryItems
    .filter((item) => {
      // Check folder matches
      if (item.folder !== currentFolder) return false;
      // Check category matches
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      // Search matching queries
      if (searchQuery.trim()) {
        const queryStr = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(queryStr);
        const descMatch = item.description?.toLowerCase().includes(queryStr);
        const catMatch = item.category.toLowerCase().includes(queryStr);
        const tagMatch = item.tags?.some(t => t.toLowerCase().includes(queryStr));
        const ocrMatch = item.ocrText?.toLowerCase().includes(queryStr);
        const summaryMatch = item.summary?.toLowerCase().includes(queryStr);
        return titleMatch || descMatch || catMatch || tagMatch || ocrMatch || summaryMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "Oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "Alphabetical") return a.title.localeCompare(b.title);
      if (sortBy === "Size") return (b.size || 0) - (a.size || 0);
      if (sortBy === "Category") return a.category.localeCompare(b.category);
      return 0;
    });

  const pinnedItems = filteredItems.filter(item => item.pinned);
  const unpinnedItems = filteredItems.filter(item => !item.pinned);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // We can easily create a folder by mapping it to a sample guide or updating library items folders list
      alert(`Folder "${newFolderName}" created! Add items to it from the Upload menu.`);
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExamTitle.trim() && newExamDate) {
      setExams(prev => [...prev, { date: newExamDate, title: newExamTitle.trim() }]);
      setNewExamTitle("");
      setNewExamDate("");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Safe navigation breadcrumb
  const navigateBackToRoot = () => {
    setCurrentFolder("Root");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto w-full select-none pb-16">
      
      {/* Left panel: main folder explorer */}
      <div className="flex-1 space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-none">Library</h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1.5">
              Organize and review all study resources in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowNewFolder(!showNewFolder)}
              variant="outline"
              className="h-10 px-4 rounded-xl border-border hover:bg-secondary text-xs font-bold bg-background flex items-center gap-1.5 cursor-pointer"
            >
              <Folder size={14} />
              Add Folder
            </Button>
            <Button
              onClick={() => setUploadOpen(true)}
              className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs shadow-sm flex items-center gap-1.5"
            >
              <Plus size={14} />
              Upload Resource
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between h-20 text-left">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Total Files</span>
            <span className="text-xl font-black text-foreground">{totalFiles}</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between h-20 text-left">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Images</span>
            <span className="text-xl font-black text-foreground">{imageCount}</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between h-20 text-left">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">PDFs</span>
            <span className="text-xl font-black text-foreground">{pdfCount}</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between h-20 text-left">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">AI Notes</span>
            <span className="text-xl font-black text-foreground">{aiGuidesCount}</span>
          </div>
        </div>

        {/* Search and sorting bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, PDFs, images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            />
          </div>

          <div className="flex gap-2 justify-between">
            {/* Sort controls */}
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
                <option value="Size">Size</option>
                <option value="Category">Subject</option>
              </select>
            </div>

            {/* View mode toggle */}
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

        {/* Categories scroll panel */}
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 flex space-x-2 pb-2">
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

        {/* Folder Creation Input dialog */}
        <AnimatePresence>
          {showNewFolder && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col sm:flex-row gap-3 items-center"
            >
              <input
                type="text"
                placeholder="Folder name (e.g. Semester 1, Mid Term...)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full flex-1 h-9.5 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-foreground"
              />
              <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                <Button
                  onClick={() => setShowNewFolder(false)}
                  variant="outline"
                  className="h-9.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  className="h-9.5 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-xs cursor-pointer"
                >
                  Create
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Folders and Breadcrumbs Header */}
        <div className="space-y-3.5">
          {/* Breadcrumbs navigation track */}
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-bold">
            <span 
              onClick={navigateBackToRoot}
              className={`hover:text-foreground cursor-pointer ${currentFolder === "Root" ? "text-foreground font-extrabold" : ""}`}
            >
              Root
            </span>
            {currentFolder !== "Root" && (
              <>
                <ChevronRight size={12} className="text-muted-foreground/50" />
                <span className="text-foreground font-extrabold">{currentFolder}</span>
              </>
            )}
          </div>

          {/* Folder lists inside root */}
          {currentFolder === "Root" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {allFolders.map(folderName => (
                <Card 
                  key={folderName}
                  onClick={() => setCurrentFolder(folderName)}
                  className="border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl group text-left"
                >
                  <CardContent className="p-4.5 flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground group-hover:text-foreground transition-colors">
                      <Folder size={18} className="fill-muted-foreground/25" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-extrabold text-foreground truncate pr-2">
                        {folderName}
                      </h4>
                      <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                        {libraryItems.filter(item => item.folder === folderName).length} items
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Resource Items feed (Grid vs List toggle) */}
        <div className="space-y-4 pt-1">
          <AnimatePresence mode="popLayout">
            {totalFiles === 0 ? (
              /* Empty Library State */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center p-12 text-center py-20 border border-dashed rounded-3xl bg-card min-h-[350px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary/40 border border-border flex items-center justify-center mb-4 text-muted-foreground/60">
                  <FileText size={20} />
                </div>
                <h3 className="text-base font-extrabold text-foreground">Your Library is Empty</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] font-semibold leading-relaxed">
                  Upload notes, PDFs or images to begin building your study collection.
                </p>
                <Button
                  onClick={() => setUploadOpen(true)}
                  className="mt-5 h-9.5 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs shadow-sm"
                >
                  Upload Notes
                </Button>
              </motion.div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 gap-4" 
                : "space-y-2.5"}
              >
                {/* Pinned Items separator */}
                {pinnedItems.map((item, idx) => (
                  <ResourceCard 
                    key={item.id || idx} 
                    item={item} 
                    viewMode={viewMode}
                    onOpen={() => setSelectedResource(item)} 
                  />
                ))}

                {/* Normal Items list */}
                {unpinnedItems.map((item, idx) => (
                  <ResourceCard 
                    key={item.id || idx} 
                    item={item} 
                    viewMode={viewMode}
                    onOpen={() => setSelectedResource(item)} 
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right panel sidebar (Exam calendar and Storage Progress bar) */}
      <div className="w-full lg:w-72 space-y-6 text-left select-none shrink-0">
        
        {/* Storage card container */}
        <Card className="border border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <HardDrive size={15} className="text-muted-foreground" />
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Storage Usage</h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs font-black text-foreground">
                <span>{formatBytes(storageUsed)}</span>
                <span className="text-[9px] text-muted-foreground font-bold">of 10 GB limit</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${storagePercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Planner Calendar widget */}
        <Card className="border border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon size={15} className="text-muted-foreground" />
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Exam Planner</h4>
            </div>

            {/* List upcoming events */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {exams.length === 0 ? (
                <p className="text-[10px] text-muted-foreground font-semibold">No upcoming exams scheduled.</p>
              ) : (
                exams.map((ex, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border bg-secondary/35 text-[11px] font-bold text-foreground flex justify-between items-center gap-2">
                    <span className="truncate">{ex.title}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">{new Date(ex.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                ))
              )}
            </div>

            {/* New event addition form */}
            <form onSubmit={handleAddExam} className="pt-2 border-t border-border space-y-2 text-left">
              <input
                type="text"
                placeholder="Exam Title"
                value={newExamTitle}
                onChange={(e) => setNewExamTitle(e.target.value)}
                className="w-full h-8 px-2.5 rounded bg-background border border-border text-[10px] focus:outline-none focus:border-foreground"
                required
              />
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="flex-1 h-8 px-2 rounded bg-background border border-border text-[10px] focus:outline-none focus:border-foreground"
                  required
                />
                <Button
                  type="submit"
                  className="h-8 px-3 rounded bg-primary text-primary-foreground hover:opacity-90 font-bold text-[10px] cursor-pointer shrink-0"
                >
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Upload and Details Overlay Modals */}
      <AnimatePresence>
        {uploadOpen && (
          <LibraryUploadModal 
            isOpen={uploadOpen} 
            onClose={() => setUploadOpen(false)} 
            currentFolder={currentFolder}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedResource && (
          <ResourceDetailsModal
            item={selectedResource}
            isOpen={!!selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Resource Card Sub-component --- */
interface ResourceCardProps {
  item: LibraryItem;
  viewMode: "grid" | "list";
  onOpen: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ item, viewMode, onOpen }) => {
  const { updateLibraryItem } = useApp();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLibraryItem(item.id!, { favorite: !item.favorite });
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLibraryItem(item.id!, { pinned: !item.pinned });
  };

  const source = item.type;
  const isAI = item.summary || item.flashcards?.length;

  const cardDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (viewMode === "list") {
    return (
      <div 
        onClick={onOpen}
        className="p-3.5 px-4 rounded-xl border border-border bg-card shadow-xs hover:border-foreground/20 hover:shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 select-text"
      >
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          <div className="p-2 rounded-lg border border-border bg-secondary text-muted-foreground shrink-0">
            {source === "PDF" ? (
              <FileText size={14} />
            ) : source === "Image" ? (
              <ImageIcon size={14} />
            ) : (
              <File size={14} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-extrabold text-foreground truncate">{item.title}</h4>
              {item.pinned && <Pin size={10} className="text-muted-foreground rotate-45 shrink-0" />}
              {isAI && (
                <span className="text-[7px] font-extrabold px-1 rounded bg-foreground text-background shrink-0 uppercase tracking-widest">
                  AI Notes
                </span>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground font-semibold leading-none mt-1">
              {item.category} • {cardDate}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleToggleFavorite}
            className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition"
          >
            <Star size={11} className={item.favorite ? "fill-foreground text-foreground" : ""} />
          </button>
          <ChevronRight size={14} className="text-muted-foreground/60" />
        </div>
      </div>
    );
  }

  return (
    <Card 
      onClick={onOpen}
      className="border border-border bg-card shadow-sm hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between text-left rounded-2xl relative select-text"
    >
      <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        
        {/* Card Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md border border-border bg-secondary text-muted-foreground shrink-0">
              {source === "PDF" ? (
                <FileText size={12} />
              ) : source === "Image" ? (
                <ImageIcon size={12} />
              ) : (
                <File size={12} />
              )}
            </div>
            <span className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest">
              {item.category}
            </span>
          </div>

          <div className="flex space-x-1">
            <button
              onClick={handleTogglePin}
              className={`p-1 rounded-md border transition cursor-pointer ${
                item.pinned 
                  ? "bg-foreground border-foreground text-background" 
                  : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pin size={9} />
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-1 rounded-md border transition cursor-pointer ${
                item.favorite 
                  ? "bg-foreground border-foreground text-background" 
                  : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star size={9} className={item.favorite ? "fill-background" : ""} />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview Area */}
        {item.type === "Image" && item.fileURL ? (
          <div className="w-full aspect-video rounded-xl bg-secondary/20 border border-border overflow-hidden select-none pointer-events-none">
            <img src={item.fileURL} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl bg-secondary/35 border border-border flex items-center justify-center text-muted-foreground select-none pointer-events-none">
            <FileText size={24} className="opacity-45" />
          </div>
        )}

        {/* Resource Details */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {item.title}
            </h3>
            {isAI && (
              <span className="text-[7px] font-extrabold px-1 rounded bg-foreground text-background uppercase tracking-widest shrink-0 mt-0.5">
                AI Notes
              </span>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground font-bold">
            Uploaded: {cardDate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
