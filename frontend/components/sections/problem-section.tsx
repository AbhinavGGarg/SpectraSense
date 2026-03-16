"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Droplets, Leaf, Pill, TestTube2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const problems = [
  {
    title: "Agriculture",
    icon: Leaf,
    description: "Farmers often need faster, cheaper indicators of plant stress before yield loss becomes visible.",
  },
  {
    title: "Water Awareness",
    icon: Droplets,
    description: "Water quality clues can be missed when lab tests are delayed, expensive, or logistically hard.",
  },
  {
    title: "Food Freshness",
    icon: TestTube2,
    description: "Visual spoilage checks are subjective; early optical shifts can provide better screening signals.",
  },
  {
    title: "Medicine Integrity",
    icon: Pill,
    description: "Tablet color mismatches can indicate degradation or counterfeit suspicion needing further validation.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="px-6 py-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.25em] text-cyan-200/80"
        >
          The Problem
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 max-w-4xl text-3xl font-semibold text-slate-100 md:text-4xl"
        >
          Critical scientific analysis is still too centralized, costly, and inaccessible in real-world settings.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-8 rounded-2xl border border-amber-200/20 bg-amber-400/10 p-5 text-amber-100"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <p>
              Traditional analytical workflows are powerful but often require lab equipment, expert handling, and time that many communities do not have.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, idx) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <problem.icon className="mb-3 h-6 w-6 text-cyan-200" />
                  <CardTitle>{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{problem.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
