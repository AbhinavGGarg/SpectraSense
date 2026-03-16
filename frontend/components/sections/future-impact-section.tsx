"use client";

import { motion } from "framer-motion";
import { BookOpen, Leaf, Shield, Smartphone } from "lucide-react";

const impacts = [
  {
    title: "Field-ready early screening",
    icon: Smartphone,
    description: "Portable screening in agriculture, environmental checks, and rapid triage contexts."
  },
  {
    title: "Low-cost science education",
    icon: BookOpen,
    description: "Turn classrooms and communities into hands-on optics and analytical science labs."
  },
  {
    title: "Sustainability and food systems",
    icon: Leaf,
    description: "Improve awareness around crop stress and spoilage dynamics with faster optical cues."
  },
  {
    title: "Counterfeit awareness",
    icon: Shield,
    description: "Flag visible color mismatches for further confirmation with formal testing pathways."
  }
];

export function FutureImpactSection() {
  return (
    <section id="impact" className="px-6 py-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Future Impact</p>
        <h2 className="mt-3 max-w-4xl text-3xl font-semibold text-slate-100 md:text-4xl">
          Building toward a future where scientific sensing is more portable, scalable, and democratized.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {impacts.map((impact, index) => (
            <motion.div
              key={impact.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
            >
              <impact.icon className="mb-3 h-5 w-5 text-cyan-200" />
              <h3 className="text-lg font-semibold text-slate-100">{impact.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{impact.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
