"use client";

import { motion } from "framer-motion";
import { Microscope, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onAnalyzeClick: () => void;
}

export function Navbar({ onAnalyzeClick }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-300/15 p-2 text-accent-cyan">
            <Microscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/90">SpectraSense</p>
            <p className="text-xs text-slate-400">Computational Spectroscopy MVP</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
          <a href="#problem" className="hover:text-cyan-200">Problem</a>
          <a href="#science" className="hover:text-cyan-200">How It Works</a>
          <a href="#analyzer" className="hover:text-cyan-200">Analyzer</a>
          <a href="#impact" className="hover:text-cyan-200">Impact</a>
        </div>

        <Button variant="outline" size="sm" onClick={onAnalyzeClick}>
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze a Sample
        </Button>
      </div>
    </motion.nav>
  );
}
