"use client";

import { motion } from "framer-motion";
import { FlaskConical, HeartHandshake, Rocket } from "lucide-react";

export function MissionSection() {
  return (
    <section className="px-6 py-20 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-rose-400/10 p-8 md:grid-cols-3 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Our Mission</p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-50">Lab thinking, field reality, accessible science.</h3>
          <p className="mt-4 text-slate-200">
            We built SpectraSense because we care deeply about translating physics, chemistry, optics, and machine
            learning into practical tools. The goal is not hype. The goal is to lower barriers to early screening,
            empower curiosity-driven analysis, and make scientific reasoning more available in the real world.
          </p>
        </motion.div>

        <div className="grid gap-3 text-sm text-slate-100">
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-4">
            <HeartHandshake className="mb-2 h-5 w-5 text-cyan-200" />
            Science should be empowering, not exclusive.
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-4">
            <FlaskConical className="mb-2 h-5 w-5 text-blue-200" />
            Computational methods can extend consumer hardware.
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-4">
            <Rocket className="mb-2 h-5 w-5 text-lime-200" />
            MVP today, scalable sensing platform tomorrow.
          </div>
        </div>
      </div>
    </section>
  );
}
