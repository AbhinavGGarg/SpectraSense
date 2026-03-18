"use client";

import { useEffect, useMemo, useState } from "react";
import { demoPresets } from "@/lib/mock-analysis";
import { InteractiveScienceTopic, ScienceDetailMode, UseCaseCardData } from "@/types/platform";
import { AnalyzerSuite } from "@/components/platform/analyzer-suite";
import {
  DemoModeSection,
  HeroSection,
  HowItWorksSection,
  ImpactSection,
  MissionSection,
  PlatformFooter,
  PlatformNavbar,
  ProblemSection,
  ScienceEducationSection,
  UseCasesSection
} from "@/components/platform/sections";

const sectionIds = ["home", "problem", "science", "analyzer", "use-cases", "impact"];

const useCases: UseCaseCardData[] = [
  {
    title: "Farmer Crop Check",
    mode: "plant_health",
    sampleType: "Leaf images from field rows",
    detectionFocus: "Stress-like reflectance shifts",
    whyItMatters: "Helps triage crop areas for follow-up scouting before large yield losses.",
    interpretation: "Use trends across repeated captures, then confirm with agronomic testing."
  },
  {
    title: "Community Water Screening",
    mode: "water_sample",
    sampleType: "Container water under consistent lighting",
    detectionFocus: "Turbidity/algae-like optical cues",
    whyItMatters: "Supports faster awareness when formal water tests are delayed.",
    interpretation: "Treat as an early flag, not a safety certification."
  },
  {
    title: "Food Freshness Check",
    mode: "food_freshness",
    sampleType: "Fruit/produce surface image",
    detectionFocus: "Ripening vs oxidation-like shifts",
    whyItMatters: "Can help reduce spoilage and improve storage decisions.",
    interpretation: "Combine with smell/texture and food-safety best practices."
  },
  {
    title: "Tablet Verification Awareness",
    mode: "medicine_tablet",
    sampleType: "Tablet color profile against neutral background",
    detectionFocus: "Visible mismatch from baseline appearance",
    whyItMatters: "Raises awareness of possible counterfeit/degradation signals.",
    interpretation: "Never use as proof of authenticity; rely on trusted medical/pharmacy channels."
  }
];

const scienceTopics: InteractiveScienceTopic[] = [
  {
    title: "What is computational spectroscopy?",
    beginner: "It uses camera color information to estimate how a sample interacts with light.",
    advanced: "It approximates optical signatures in a constrained feature space using RGB-derived observables and statistical modeling."
  },
  {
    title: "What can RGB tell us?",
    beginner: "RGB can reveal coarse color and reflectance differences between sample types.",
    advanced: "RGB channels encode broad-band response, enabling low-resolution proxy signatures for class-level comparisons."
  },
  {
    title: "What can RGB not tell us?",
    beginner: "It cannot give full chemical composition like a lab spectrometer.",
    advanced: "RGB lacks spectral resolution and controlled acquisition fidelity needed for definitive analytical quantification."
  },
  {
    title: "Why lighting matters",
    beginner: "Shadows and bright glare can change the result a lot.",
    advanced: "Illumination variance introduces sensor-dependent bias and distribution shift in extracted optical features."
  },
  {
    title: "Why this is not a lab instrument",
    beginner: "This is an early screening helper, not a final test.",
    advanced: "The MVP prioritizes accessibility and interpretability, not validated instrumentation or regulatory-grade certainty."
  }
];

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SpectraSensePlatform() {
  const [activeSection, setActiveSection] = useState("home");
  const [scientificMode, setScientificMode] = useState(false);
  const [scienceDetailMode, setScienceDetailMode] = useState<ScienceDetailMode>("beginner");
  const [demoRequestToken, setDemoRequestToken] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const sectionId of sectionIds) {
      const element = document.getElementById(sectionId);
      if (!element) {
        continue;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          });
        },
        { threshold: 0.45 }
      );
      observer.observe(element);
      observers.push(observer);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const featuredDemoId = useMemo(() => demoPresets[0]?.id ?? null, []);

  const requestDemo = (presetId?: string) => {
    const selected = presetId ?? featuredDemoId;
    if (!selected) {
      return;
    }
    setDemoRequestToken(`${Date.now()}::${selected}`);
    scrollToSection("analyzer");
  };

  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 spectrum-grid opacity-25" />
      <div className="pointer-events-none absolute left-1/2 top-[22rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[150px] pulse-glow" />

      <PlatformNavbar activeSection={activeSection} onNavigate={scrollToSection} onAnalyzeClick={() => scrollToSection("analyzer")} />

      <main className="relative z-10">
        <HeroSection
          onAnalyzeClick={() => scrollToSection("analyzer")}
          onScienceClick={() => scrollToSection("science")}
          onDemoClick={() => requestDemo()}
        />
        <ProblemSection />
        <MissionSection />
        <HowItWorksSection scientificMode={scientificMode} onToggleScientificMode={() => setScientificMode((value) => !value)} />
        <DemoModeSection presets={demoPresets} onRunDemo={requestDemo} />
        <AnalyzerSuite
          demoPresets={demoPresets}
          demoRequestToken={demoRequestToken}
          onDemoRequestConsumed={() => setDemoRequestToken(null)}
        />
        <UseCasesSection useCases={useCases} />
        <ScienceEducationSection topics={scienceTopics} mode={scienceDetailMode} onModeChange={setScienceDetailMode} />
        <ImpactSection />
      </main>

      <PlatformFooter />
    </div>
  );
}
