"use client";

import { motion } from "framer-motion";
import { ArrowRight, Atom, Camera, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  onAnalyzeClick: () => void;
}

export function HeroSection({ onAnalyzeClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <Badge>Portable Computational Spectroscopy</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-balance text-4xl font-semibold leading-tight text-slate-50 md:text-6xl"
          >
            Turning everyday cameras into <span className="text-cyan-200">portable scientific instruments</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-2xl text-lg text-slate-200"
          >
            SpectraSense is a mission-driven STEM platform exploring how smartphone RGB sensing, optics, signal
            processing, and machine learning can approximate material analysis for low-cost field screening.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button size="lg" onClick={onAnalyzeClick}>
              Analyze a Sample
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById("science")?.scrollIntoView({ behavior: "smooth" })}>
              Explore the Science
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid gap-4"
        >
          <div className="rounded-2xl border border-cyan-200/20 bg-slate-900/70 p-6 backdrop-blur-md">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-cyan-100/90">Scientific Stack</p>
            <div className="grid grid-cols-3 gap-3 text-sm text-slate-100">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><Atom className="mb-2 h-4 w-4 text-cyan-200" />Optics</div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><Waves className="mb-2 h-4 w-4 text-blue-200" />Signal Processing</div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><Camera className="mb-2 h-4 w-4 text-lime-200" />Computer Vision</div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-accent-cyan/10 via-accent-blue/10 to-accent-rose/10 p-6">
            <p className="text-sm text-slate-100">
              Not a laboratory replacement. A rigorous, educational MVP for early screening and accessible science.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
