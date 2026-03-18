"use client";

import { motion } from "framer-motion";
import {
  Atom,
  BadgeCheck,
  Beaker,
  Camera,
  CheckCircle2,
  Droplets,
  FlaskConical,
  Leaf,
  Lightbulb,
  Microscope,
  Pill,
  Rocket,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoPreset, InteractiveScienceTopic, ScienceDetailMode, UseCaseCardData } from "@/types/platform";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home" },
  { id: "problem", label: "Problem" },
  { id: "science", label: "Science" },
  { id: "analyzer", label: "Analyzer" },
  { id: "use-cases", label: "Use Cases" },
  { id: "impact", label: "Impact" }
] as const;

interface PlatformNavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onAnalyzeClick: () => void;
}

export function PlatformNavbar({ activeSection, onNavigate, onAnalyzeClick }: PlatformNavbarProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-left"
        >
          <span className="rounded-lg bg-cyan-300/20 p-2 text-cyan-100">
            <Microscope className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">SpectraSense</span>
            <span className="text-xs text-slate-400">Portable Computational Spectroscopy</span>
          </span>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                activeSection === item.id ? "bg-cyan-300/20 text-cyan-100" : "text-slate-300 hover:text-slate-100"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={onAnalyzeClick}>
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze a Sample
        </Button>
      </div>
    </div>
  );
}

interface HeroSectionProps {
  onAnalyzeClick: () => void;
  onScienceClick: () => void;
  onDemoClick: () => void;
}

export function HeroSection({ onAnalyzeClick, onScienceClick, onDemoClick }: HeroSectionProps) {
  const bars = [0.22, 0.36, 0.58, 0.41, 0.72, 0.65, 0.48, 0.3, 0.52, 0.69];

  return (
    <section id="home" className="px-6 pb-24 pt-28 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <Badge>Hackathon MVP | Responsible Scientific Screening</Badge>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight text-slate-50 md:text-6xl">
            Turn Everyday Cameras Into <span className="text-cyan-200">Scientific Screening Tools</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-200">
            SpectraSense combines RGB sensing, optics, signal processing, and interpretable machine learning to estimate coarse
            material signatures for low-cost early screening and science education.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onAnalyzeClick}>Analyze a Sample</Button>
            <Button size="lg" variant="outline" onClick={onScienceClick}>Explore the Science</Button>
            <Button size="lg" variant="ghost" onClick={onDemoClick}>Try Demo Analysis</Button>
          </div>
          <p className="mt-5 text-sm text-slate-400">
            Not a laboratory replacement. Built for awareness, triage-style screening, and educational exploration.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl border border-cyan-200/20 bg-slate-900/70 p-6 shadow-panel"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Live Signal Preview</p>
            <span className="rounded-full border border-cyan-200/25 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-100">MVP</span>
          </div>

          <div className="mt-5 flex h-28 items-end gap-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 pb-3">
            {bars.map((height, idx) => (
              <motion.span
                key={`bar-${idx}`}
                initial={{ height: 4 }}
                animate={{ height: `${height * 100}%` }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
                className="w-5 rounded-sm bg-gradient-to-t from-blue-500/80 via-cyan-400/80 to-lime-300/80"
              />
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Leaf, label: "Plant" },
              { icon: Droplets, label: "Water" },
              { icon: FlaskConical, label: "Food" },
              { icon: Pill, label: "Tablet" }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
                <item.icon className="mb-2 h-4 w-4 text-cyan-200" />
                {item.label} Screening Mode
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function ProblemSection() {
  const cards = [
    {
      icon: Leaf,
      title: "Agriculture",
      text: "Farmers often need earlier indicators of stress before visible yield loss.",
      why: "Faster field feedback can guide targeted interventions."
    },
    {
      icon: Droplets,
      title: "Water Awareness",
      text: "Water checks can be delayed when lab infrastructure is limited.",
      why: "Early optical screening can support community awareness."
    },
    {
      icon: FlaskConical,
      title: "Food Freshness",
      text: "Visual freshness checks are subjective and sometimes too late.",
      why: "Coarse optical cues can improve timing of decisions."
    },
    {
      icon: Pill,
      title: "Medicine Integrity",
      text: "Counterfeit or degraded tablets may show subtle color shifts.",
      why: "Awareness-level checks can flag suspicious mismatches sooner."
    }
  ];

  return (
    <section id="problem" className="px-6 py-20 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">The Problem</p>
        <h2 className="mt-3 max-w-4xl text-3xl font-semibold text-slate-100 md:text-4xl">
          Critical material analysis is valuable, but often too centralized, expensive, or slow for field contexts.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="h-full">
              <CardHeader>
                <card.icon className="mb-2 h-5 w-5 text-cyan-200" />
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <p>{card.text}</p>
                <p className="rounded-lg border border-cyan-200/20 bg-cyan-300/10 p-2 text-cyan-100">Why it matters: {card.why}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MissionSection() {
  return (
    <section className="px-6 py-20 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-rose-400/10 p-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Mission / Why We Built This</p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-100">Accessible science, rigorous honesty, practical impact.</h3>
          <p className="mt-4 text-slate-200">
            We built SpectraSense to bring laboratory-style thinking into real-world settings using consumer hardware plus computation.
            We care about widening access to scientific insight while being explicit about what this system can and cannot claim.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Responsible Science Principles</p>
          {[
            "Educational and early-screening use",
            "Transparent limitations and uncertainty",
            "Not for clinical or regulatory decisions",
            "Best used for triage and awareness before confirmatory testing"
          ].map((rule) => (
            <div key={rule} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-200" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface HowItWorksSectionProps {
  scientificMode: boolean;
  onToggleScientificMode: () => void;
}

export function HowItWorksSection({ scientificMode, onToggleScientificMode }: HowItWorksSectionProps) {
  const steps = [
    {
      icon: Camera,
      title: "Capture Image",
      plain: "Take or upload a sample photo.",
      scientific: "Acquire RGB radiometric sample under constrained framing and illumination."
    },
    {
      icon: ScanSearch,
      title: "Preprocess",
      plain: "Clean image and isolate the sample area.",
      scientific: "Apply white balancing, denoising, and ROI extraction to reduce scene bias."
    },
    {
      icon: Beaker,
      title: "Extract Features",
      plain: "Measure color, brightness, and ratios.",
      scientific: "Compute RGB/HSV/Lab summary statistics, ratios, and normalized histogram descriptors."
    },
    {
      icon: Waves,
      title: "Estimate Spectrum",
      plain: "Build a rough visible-light curve from RGB signals.",
      scientific: "Interpolate coarse visible-band intensity response using RGB channel anchors and smoothing."
    },
    {
      icon: Atom,
      title: "Reference Matching",
      plain: "Compare to known example signatures.",
      scientific: "Perform nearest-reference similarity against curated feature signatures."
    },
    {
      icon: Sparkles,
      title: "ML Prediction",
      plain: "Rank likely categories with confidence.",
      scientific: "Use lightweight interpretable ensemble classification for class probability estimation."
    },
    {
      icon: Lightbulb,
      title: "Scientific Explanation",
      plain: "Explain what was found and what to do next.",
      scientific: "Return confidence context, uncertainty framing, and responsible interpretation guidance."
    }
  ];

  return (
    <section id="science" className="px-6 py-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">How It Works</p>
            <h2 className="mt-2 max-w-4xl text-3xl font-semibold text-slate-100 md:text-4xl">
              Interactive computational spectroscopy pipeline
            </h2>
          </div>
          <Button variant="outline" onClick={onToggleScientificMode}>
            {scientificMode ? "Scientific Mode: ON" : "Scientific Mode: OFF"}
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
            >
              <step.icon className="mb-3 h-5 w-5 text-cyan-200" />
              <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
              <p className="mt-2 text-sm text-slate-300">{scientificMode ? step.scientific : step.plain}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface DemoModeSectionProps {
  presets: DemoPreset[];
  onRunDemo: (presetId: string) => void;
}

export function DemoModeSection({ presets, onRunDemo }: DemoModeSectionProps) {
  return (
    <section id="demo" className="px-6 py-16 lg:px-10">
      <div className="mx-auto w-full max-w-7xl rounded-3xl border border-cyan-200/20 bg-cyan-300/10 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/90">Hackathon Demo Mode</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-50">One-click full analysis walkthrough</h3>
            <p className="mt-2 text-sm text-cyan-50/90">Instantly load realistic sample + complete results dashboard for judges.</p>
          </div>
          <Button onClick={() => onRunDemo(presets[0]?.id ?? "plant-stress")}>Try Demo Analysis</Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onRunDemo(preset.id)}
              className="rounded-2xl border border-white/15 bg-slate-950/60 p-4 text-left transition hover:border-cyan-200/40 hover:bg-slate-900"
            >
              <p className="text-sm font-semibold text-slate-100">{preset.title}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-cyan-200/80">{preset.subtitle}</p>
              <p className="mt-3 text-sm text-slate-300">{preset.shortStory}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

interface UseCasesSectionProps {
  useCases: UseCaseCardData[];
}

export function UseCasesSection({ useCases }: UseCasesSectionProps) {
  return (
    <section id="use-cases" className="px-6 py-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Real-World Use Case Mode</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-100 md:text-4xl">Practical scenarios, responsible interpretation</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {useCases.map((card) => (
            <Card key={card.title} className="h-full">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>Mode: {card.mode.replaceAll("_", " ")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-slate-300"><span className="text-slate-100">Sample:</span> {card.sampleType}</p>
                <p className="text-slate-300"><span className="text-slate-100">Detect focus:</span> {card.detectionFocus}</p>
                <p className="text-slate-300"><span className="text-slate-100">Why it matters:</span> {card.whyItMatters}</p>
                <p className="rounded-lg border border-cyan-200/20 bg-cyan-400/10 p-2 text-cyan-100">
                  Interpret responsibly: {card.interpretation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ScienceEducationSectionProps {
  topics: InteractiveScienceTopic[];
  mode: ScienceDetailMode;
  onModeChange: (mode: ScienceDetailMode) => void;
}

export function ScienceEducationSection({ topics, mode, onModeChange }: ScienceEducationSectionProps) {
  return (
    <section className="px-6 py-20 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Interactive Science</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100 md:text-4xl">Learn the science behind the signal</h2>
          </div>
          <div className="flex rounded-full border border-white/15 bg-white/5 p-1 text-sm">
            <button
              type="button"
              onClick={() => onModeChange("beginner")}
              className={cn(
                "rounded-full px-3 py-1.5",
                mode === "beginner" ? "bg-cyan-300/20 text-cyan-100" : "text-slate-300"
              )}
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => onModeChange("advanced")}
              className={cn(
                "rounded-full px-3 py-1.5",
                mode === "advanced" ? "bg-cyan-300/20 text-cyan-100" : "text-slate-300"
              )}
            >
              Advanced
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic) => (
            <Card key={topic.title}>
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{mode === "beginner" ? topic.beginner : topic.advanced}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ImpactSection() {
  const impacts = [
    {
      title: "Field-ready early screening",
      icon: Rocket,
      text: "Portable first-pass sensing for agriculture, water, and community awareness."
    },
    {
      title: "Low-cost science education",
      icon: Microscope,
      text: "Hands-on optics and signal analysis in classrooms and citizen science contexts."
    },
    {
      title: "Sustainability and food systems",
      icon: Leaf,
      text: "Faster freshness and crop-stress signals can improve resource decisions."
    },
    {
      title: "Counterfeit awareness",
      icon: ShieldAlert,
      text: "Visual mismatch flagging for follow-up with proper verification channels."
    }
  ];

  const roadmap = [
    "External calibration cards",
    "Larger domain-specific reference datasets",
    "Multi-image averaging",
    "Reference-card normalization",
    "Mobile deployment",
    "Domain-specialized classifiers"
  ];

  return (
    <section id="impact" className="px-6 py-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Impact & Future</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-100 md:text-4xl">From hackathon MVP to scalable scientific access</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {impacts.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="mb-2 h-5 w-5 text-cyan-200" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Future Roadmap</CardTitle>
            <CardDescription>Planned upgrades for reliability and real-world utility.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-2">
                <BadgeCheck className="mr-2 inline h-4 w-4 text-cyan-200" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function PlatformFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-10 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
        <p className="font-medium text-slate-100">SpectraSense</p>
        <p>Portable computational spectroscopy for responsible early screening and science accessibility.</p>
      </div>
    </footer>
  );
}
