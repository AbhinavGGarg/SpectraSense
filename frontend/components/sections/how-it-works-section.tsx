"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Camera, Gauge, ScanSearch, Sigma, Sparkle, Workflow } from "lucide-react";

const steps = [
  { icon: Camera, title: "Capture Image", detail: "Acquire sample image from phone or upload." },
  { icon: Sparkle, title: "Preprocess", detail: "Normalize lighting, denoise, isolate region of interest." },
  { icon: Gauge, title: "Extract Features", detail: "Compute RGB statistics, ratios, histogram and color-space features." },
  { icon: Sigma, title: "Estimate Spectrum", detail: "Interpolate coarse RGB-derived spectral signature across visible bands." },
  { icon: ScanSearch, title: "Reference Matching", detail: "Compare sample vector against curated optical signatures." },
  { icon: BrainCircuit, title: "ML Prediction", detail: "Use interpretable classifiers for probable class prediction." },
  { icon: Workflow, title: "Scientific Explanation", detail: "Return confidence, matches, and limitations with context." },
];

export function HowItWorksSection() {
  return (
    <section id="science" className="px-6 py-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">How It Works</p>
        <h2 className="mt-3 max-w-4xl text-3xl font-semibold text-slate-100 md:text-4xl">
          A transparent computational spectroscopy pipeline grounded in optics + data science.
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-7">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="relative rounded-2xl border border-white/10 bg-slate-900/70 p-4"
            >
              <step.icon className="mb-3 h-5 w-5 text-cyan-200" />
              <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
              <p className="mt-2 text-xs text-slate-300">{step.detail}</p>
              {idx < steps.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-cyan-200/50 lg:block" />
              )}
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-300">
          SpectraSense estimates coarse optical signatures from RGB response. It does not reconstruct laboratory-grade
          spectra and is intended for educational and early-screening workflows.
        </p>
      </div>
    </section>
  );
}
