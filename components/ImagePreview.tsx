"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { FileText, X, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ImagePreviewProps {
  file: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onClear,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    // PDF files do not render image previews
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setPreviewUrl(null);
      return;
    }

    // Generate local URL for previewing images
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) return null;

  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

  return (
    <Card className="border border-border bg-card shadow-sm overflow-hidden select-none max-w-xl mx-auto rounded-2xl relative">
      {/* Clear Image Button */}
      {!disabled && (
        <button
          onClick={onClear}
          className="absolute right-3.5 top-3.5 z-10 p-1.5 rounded-full border border-border bg-background hover:bg-secondary text-foreground transition cursor-pointer active:scale-90"
          title="Remove File"
        >
          <X size={15} />
        </button>
      )}

      <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[220px]">
        {isPdf ? (
          /* PDF file Preview */
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-secondary text-foreground border border-border/60 max-w-max mx-auto animate-pulse">
              <FileText size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-foreground truncate max-w-[280px] mx-auto">
                {file.name}
              </h4>
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary">
                Ready for OCR extraction
              </p>
            </div>
          </div>
        ) : (
          /* Image file Preview */
          previewUrl && (
            <div className="w-full space-y-4">
              <div className="relative w-full h-44 sm:h-56 overflow-hidden rounded-xl border border-border/80 bg-background/50">
                <img
                  src={previewUrl}
                  alt="Scanned Document Preview"
                  className="object-contain w-full h-full max-h-full"
                />
              </div>
              <div className="text-left flex items-center space-x-1.5 justify-center">
                <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[220px]">
                  {file.name}
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-semibold">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
