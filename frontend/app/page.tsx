"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { analyzeSample } from "@/lib/api";
import { AnalysisMode, AnalysisResponse } from "@/types/analysis";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { MissionSection } from "@/components/sections/mission-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { AnalyzerUploadPanel } from "@/components/analyzer-upload-panel";
import { ImagePreviewCard } from "@/components/image-preview-card";
import { ResultsOverviewCard } from "@/components/results-overview-card";
import { SpectralCurveChart } from "@/components/spectral-curve-chart";
import { RGBHistogramChart } from "@/components/rgb-histogram-chart";
import { FeatureSummaryGrid } from "@/components/feature-summary-grid";
import { TopMatchesPanel } from "@/components/top-matches-panel";
import { ScientificExplanationPanel } from "@/components/scientific-explanation-panel";
import { LimitationsPanel } from "@/components/limitations-panel";
import { FutureImpactSection } from "@/components/sections/future-impact-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  const [mode, setMode] = useState<AnalysisMode>("plant_health");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const analyzerRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const nextPreview = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreview);

    return () => {
      URL.revokeObjectURL(nextPreview);
    };
  }, [selectedFile]);

  const analyze = async () => {
    if (!selectedFile) {
      setError("Please add a sample image before running analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeSample(selectedFile, mode);
      setResult(analysis);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Unexpected error while analyzing sample.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const scientificDisciplines = useMemo(
    () => [
      "Physics",
      "Chemistry",
      "Optics",
      "Spectroscopy",
      "Signal Processing",
      "Computer Vision",
      "Machine Learning",
      "Analytical Science",
      "Software Engineering"
    ],
    []
  );

  const scrollToAnalyzer = () => {
    analyzerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 spectrum-grid opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-[22rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px] pulse-glow" />
      <Navbar onAnalyzeClick={scrollToAnalyzer} />

      <main className="relative z-10">
        <HeroSection onAnalyzeClick={scrollToAnalyzer} />
        <ProblemSection />
        <MissionSection />
        <HowItWorksSection />

        <section className="px-6 py-16 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Interdisciplinary Foundation</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {scientificDisciplines.map((discipline) => (
                <span
                  key={discipline}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100"
                >
                  {discipline}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="analyzer" ref={analyzerRef} className="px-6 py-24 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">MVP Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-100 md:text-4xl">Run a live computational spectroscopy analysis</h2>
            <p className="mt-4 max-w-4xl text-slate-300">
              Upload a sample or capture one from webcam. SpectraSense preprocesses the image, extracts optical features,
              approximates a spectral signature, and compares against a reference dataset to produce interpretable, domain-specific outputs.
            </p>

            <div className="mt-8">
              <AnalyzerUploadPanel
                mode={mode}
                onModeChange={setMode}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onFileSelected={(file) => {
                  setSelectedFile(file);
                  setError(null);
                }}
                onAnalyze={analyze}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </section>

        {result && previewUrl && (
          <motion.section
            id="results"
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-24 lg:px-10"
          >
            <div className="mx-auto w-full max-w-7xl space-y-6">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Results</p>
              <h2 className="text-3xl font-semibold text-slate-100 md:text-4xl">Analysis Output</h2>

              <div className="grid gap-6 lg:grid-cols-3">
                <ImagePreviewCard imageUrl={previewUrl} fileName={selectedFile?.name ?? "sample-image"} />
                <div className="lg:col-span-2">
                  <ResultsOverviewCard result={result} />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <SpectralCurveChart data={result.spectral_curve} />
                <RGBHistogramChart data={result.histograms} />
              </div>

              <FeatureSummaryGrid result={result} />

              <div className="grid gap-6 lg:grid-cols-2">
                <TopMatchesPanel result={result} />
                <ScientificExplanationPanel result={result} />
              </div>

              <LimitationsPanel result={result} />
            </div>
          </motion.section>
        )}

        <FutureImpactSection />
      </main>

      <Footer />
    </div>
  );
}
