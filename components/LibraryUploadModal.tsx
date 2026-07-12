"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, UploadCloud, FileText, Image as ImageIcon, 
  Plus, Check, Loader2, AlertCircle, FolderPlus 
} from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface LibraryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolder?: string;
}

export const LibraryUploadModal: React.FC<LibraryUploadModalProps> = ({ 
  isOpen, 
  onClose,
  currentFolder = "Root"
}) => {
  const { 
    addLibraryItem, 
    customCategories, 
    addCustomCategory,
    libraryItems 
  } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Standard Categories list + custom categories from context
  const defaultCategories = [
    "Mathematics", "Physics", "Chemistry", "Biology", 
    "Computer Science", "English", "History", "Economics", 
    "Business Studies", "Languages"
  ];
  const allCategories = [...defaultCategories, ...customCategories];
  
  const [category, setCategory] = useState("Physics");
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  // Extract folder list from current library items to allow sorting into folders
  const folderList = Array.from(
    new Set([
      "Root", 
      "Semester 1", 
      "Mid Term", 
      "Final Exams", 
      "Important", 
      "Assignments", 
      ...libraryItems.map(item => item.folder).filter(Boolean)
    ])
  );
  
  const [folder, setFolder] = useState(currentFolder);
  const [tagsInput, setTagsInput] = useState("");
  
  // Progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    // Limit to 10MB
    const maxSize = 10 * 1024 * 1024; 
    if (selectedFile.size > maxSize) {
      setError("File exceeds 10MB size limit. Please choose a smaller document.");
      return;
    }
    
    setFile(selectedFile);
    // Auto-fill title if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name;
      setTitle(nameWithoutExt);
    }
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCustomCategory(newCatName.trim());
      setCategory(newCatName.trim());
      setNewCatName("");
      setShowAddCat(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !title) {
      setError("Please select a file or enter a note title.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(15);

    // Simulate animated upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 12;
      });
    }, 120);

    try {
      const parsedTags = tagsInput
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Perform saving sequence
      await addLibraryItem({
        title: title || (file ? file.name : "Untitled Resource"),
        description: description,
        fileURL: "",
        category: category,
        folder: folder,
        tags: parsedTags,
        type: "Text", // determined automatically by base64 extensions
        size: file ? file.size : 0,
        favorite: false,
        pinned: false,
        file: file || undefined
      });

      setUploadProgress(100);
      clearInterval(progressInterval);
      
      // Delay closing modal briefly to showcase 100% checkmark
      setTimeout(() => {
        onClose();
        resetForm();
      }, 500);
    } catch (err: any) {
      console.error(err);
      clearInterval(progressInterval);
      setError(err.message || "Failed to upload file. Please verify network access.");
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setCategory("Physics");
    setFolder(currentFolder);
    setTagsInput("");
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-card border border-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight leading-none">Upload Study Resource</h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              Add PDFs, images, text, slides, or notes to your library.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-secondary transition text-muted-foreground hover:text-foreground cursor-pointer"
            disabled={isUploading}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-semibold flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          {!file && !isUploading && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3.5 ${
                dragActive 
                  ? "border-foreground bg-secondary/50" 
                  : "border-border hover:border-foreground/35 hover:bg-secondary/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx,.ppt,.pptx"
              />
              <div className="p-3 rounded-xl bg-secondary border border-border text-muted-foreground/80">
                <UploadCloud size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-foreground">
                  Drag & drop file here, or click to browse
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  Supports PDF, PNG, JPG, Word, PPT, TXT (Max 10MB)
                </p>
              </div>
            </div>
          )}

          {/* File Selected Preview */}
          {file && !isUploading && (
            <div className="p-4 rounded-xl border border-border bg-secondary/40 flex items-center justify-between">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground">
                  {file.name.toLowerCase().endsWith(".pdf") ? (
                    <FileText size={16} />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-foreground truncate pr-2">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="p-6 rounded-2xl border border-border bg-secondary/30 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
                  {uploadProgress === 100 ? "Upload Complete" : "Uploading File..."}
                </span>
                <span className="text-[10px] font-black text-foreground">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-foreground" 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
              {uploadProgress === 100 && (
                <div className="flex items-center justify-center space-x-1.5 text-foreground text-[10px] font-bold">
                  <Check size={12} className="stroke-[3]" />
                  <span>Configuring study materials...</span>
                </div>
              )}
            </div>
          )}

          {/* File Metadata Form Fields */}
          {!isUploading && (
            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  Resource Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics Chapter 3: Kinematics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-foreground"
                  required
                />
              </div>

              {/* Description input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Summarize the resource content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[64px] py-2 px-3.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-foreground resize-none"
                />
              </div>

              {/* Category & Folder Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      Subject
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCat(!showAddCat)}
                      className="text-[9px] font-extrabold text-primary hover:underline cursor-pointer"
                    >
                      {showAddCat ? "Cancel" : "+ Custom"}
                    </button>
                  </div>

                  {showAddCat ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="New Subject"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 h-9.5 px-3 rounded-lg border border-border bg-card text-xs focus:outline-none focus:border-foreground"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCategory}
                        className="h-9.5 w-9.5 p-0 bg-primary text-primary-foreground hover:opacity-90 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-foreground appearance-none cursor-pointer"
                    >
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Folder selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Folder
                  </label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-foreground appearance-none cursor-pointer"
                  >
                    {folderList.map(fol => (
                      <option key={fol} value={fol}>{fol}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. revision, formula, lecture-notes"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          {!isUploading && (
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl font-bold cursor-pointer hover:bg-secondary/40 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!file && !title}
                className="flex-1 h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow-sm active:scale-98 transition-transform"
              >
                Create Resource
              </Button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};
