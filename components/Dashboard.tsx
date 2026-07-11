"use client";

import React from "react";
import { Hero } from "./dashboard/Hero";
import { QuickActions } from "./dashboard/QuickActions";
import { HowItWorks } from "./dashboard/HowItWorks";
import { Features } from "./dashboard/Features";
import { Demo } from "./dashboard/Demo";
import { Tips } from "./dashboard/Tips";
import { EmptyLibrary } from "./dashboard/EmptyLibrary";
import { Footer } from "./dashboard/Footer";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-9">
      {/* Welcome hero section */}
      <Hero />

      {/* Action cards grid */}
      <QuickActions />

      {/* Vertical alignment or horizontal steps workflow */}
      <HowItWorks />

      {/* Feature listings */}
      <Features />

      {/* Try a Sample Demo card */}
      <Demo />

      {/* Empty library preview */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/85">Your Library</h2>
        <EmptyLibrary />
      </div>

      {/* Best scanning advice grid */}
      <Tips />

      {/* SaaS footer */}
      <Footer />
    </div>
  );
};
