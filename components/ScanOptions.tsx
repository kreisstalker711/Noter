"use client";

import React, { useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Camera, FileUp, AlertTriangle } from "lucide-react";

interface ScanOptionsProps {
  onFileSelect: (file: File) => void;
  onError: (error: string | null) => void;
  onOpenCamera: () => void;
  disabled?: boolean;
}

export const ScanOptions: React.FC<ScanOptionsProps> = ({
  onFileSelect,
  onError,
  onOpenCamera,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    validateAndSelectFile(file);
  };

  const validateAndSelectFile = (file: File) => {
    // 1. File Type validation
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    
    const isValidType = validTypes.includes(file.type) || 
                        ["png", "jpg", "jpeg", "pdf"].includes(fileExtension || "");
    
    if (!isValidType) {
      onError("Unsupported file format. Please upload JPG, PNG, JPEG, or PDF.");
      return;
    }

    // 2. File Size validation (10 MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onError("File size exceeds 10 MB limit. Please compress and try again.");
      return;
    }

    // Pass validated file
    onFileSelect(file);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 select-none">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, application/pdf"
        className="hidden"
        disabled={disabled}
      />

      {/* Option 1: Scan with Camera */}
      <Card className="border border-border bg-card shadow-sm hover:shadow transition duration-200 flex flex-col justify-between">
        <CardContent className="p-5.5 space-y-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground w-11 h-11 flex items-center justify-center border border-border/40">
            <Camera size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-foreground tracking-tight">Scan with Camera</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              Capture a new image of your notes using your device camera.
            </p>
          </div>
        </CardContent>
        <div className="p-5.5 pt-0">
          <Button
            type="button"
            onClick={onOpenCamera}
            disabled={disabled}
            className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs"
          >
            Open Camera
          </Button>
        </div>
      </Card>

      {/* Option 2: Import Files */}
      <Card className="border border-border bg-card shadow-sm hover:shadow transition duration-200 flex flex-col justify-between">
        <CardContent className="p-5.5 space-y-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground w-11 h-11 flex items-center justify-center border border-border/40">
            <FileUp size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-foreground tracking-tight">Import Files</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              Import study textbooks, PDFs, slides, or existing images.
            </p>
          </div>
        </CardContent>
        <div className="p-5.5 pt-0">
          <Button
            type="button"
            onClick={triggerFileSelect}
            disabled={disabled}
            className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer text-xs"
          >
            Choose File
          </Button>
        </div>
      </Card>
      
    </div>
  );
};
