"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="pt-10 pb-6 border-t border-border mt-12 text-center select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground font-semibold">
        <span>© {new Date().getFullYear()} Noter Inc. All rights reserved.</span>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-foreground transition">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition">Help & Support</a>
        </div>
      </div>
    </footer>
  );
};
