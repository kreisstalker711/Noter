"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, Check, Trash2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onContinue: () => void;
  disabled?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  onClear,
  onContinue,
  disabled = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm overflow-hidden rounded-2xl select-none max-w-2xl mx-auto">
      <CardContent className="p-5.5 space-y-4">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-foreground tracking-tight">Extracted Text</h3>
          
          <div className="flex items-center space-x-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              disabled={disabled || !text}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-foreground disabled:opacity-50 transition cursor-pointer flex items-center justify-center"
              title="Copy Text"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
            
            {/* Clear button */}
            <button
              onClick={onClear}
              disabled={disabled || !text}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-destructive/10 text-foreground hover:text-destructive disabled:opacity-50 transition cursor-pointer flex items-center justify-center"
              title="Clear Editor"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="No text extracted yet..."
            rows={12}
            className="w-full p-4 rounded-xl border border-border bg-background text-foreground text-xs leading-relaxed font-semibold focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-transparent transition-all select-text font-mono resize-y"
          />
        </div>

        {/* Continue Button */}
        <div className="flex justify-end pt-1">
          <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.985 }}>
            <Button
              onClick={onContinue}
              disabled={disabled || !text.trim()}
              className="h-10.5 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              Continue
              <ArrowRight size={15} />
            </Button>
          </motion.div>
        </div>

      </CardContent>
    </Card>
  );
};
