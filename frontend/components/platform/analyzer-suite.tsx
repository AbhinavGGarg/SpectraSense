"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  Download,
  FileImage,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload,
  XCircle
} from "lucide-react";
import { AnalysisMode, AnalysisResponse } from "@/types/analysis";
import { AnalysisHistoryItem, DemoPreset, ExplanationMode } from "@/types/platform";
import { analyzeSample } from "@/lib/api";
import { createMockAnalysis, recommendationList } from "@/lib/mock-analysis";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { SpectralCurveChart } from "@/components/spectral-curve-chart";
import { RGBHistogramChart } from "@/components/rgb-histogram-chart";

interface AnalyzerSuiteProps {
  demoPresets: DemoPreset[];
  demoRequestToken: string | null;
  onDemoRequestConsumed: () => void;
}

interface DashboardState {
  mode: AnalysisMode;
  previewUrl: string;
  processedUrl: string | null;
  result: AnalysisResponse;
  sourceType: "live" | "demo";
  title: string;
}

const HISTORY_KEY = "spectrasense-analysis-history-v2";

const MODE_OPTIONS: Array<{ label: string; value: AnalysisMode }> = [
  { label: "Plant Health", value: "plant_health" },
  { label: "Water Sample", value: "water_sample" },
  { label: "Food Freshness", value: "food_freshness" },
  { label: "Medicine / Tablet", value: "medicine_tablet" }
];

const STAGES = [
  "Processing optical features...",
  "Estimating visible-band response...",
  "Comparing against reference signatures...",
  "Generating interpretable result summary..."
];

function modeLabel(mode: AnalysisMode) {
  return mode.replaceAll("_", " ");
}

function confidenceState(confidence: number): "low" | "moderate" | "higher" {
  if (confidence < 0.58) {
    return "low";
  }
  if (confidence < 0.77) {
    return "moderate";
  }
  return "higher";
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read selected file."));
    reader.readAsDataURL(file);
  });
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not process demo image."));
    reader.readAsDataURL(blob);
  });
}

async function buildProcessedPreview(sourceDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not initialize processing canvas."));
        return;
      }

      context.drawImage(img, 0, 0, width, height);
      const roiWidth = Math.round(width * 0.58);
      const roiHeight = Math.round(height * 0.58);
      const x = Math.round((width - roiWidth) / 2);
      const y = Math.round((height - roiHeight) / 2);

      const roi = context.getImageData(x, y, roiWidth, roiHeight);
      for (let idx = 0; idx < roi.data.length; idx += 4) {
        roi.data[idx] = Math.min(255, roi.data[idx] * 1.12);
        roi.data[idx + 1] = Math.min(255, roi.data[idx + 1] * 1.08);
        roi.data[idx + 2] = Math.min(255, roi.data[idx + 2] * 1.05);
      }

      const roiCanvas = document.createElement("canvas");
      roiCanvas.width = roiWidth;
      roiCanvas.height = roiHeight;
      const roiContext = roiCanvas.getContext("2d");
      if (!roiContext) {
        reject(new Error("Could not create ROI canvas."));
        return;
      }

      roiContext.putImageData(roi, 0, 0);
      resolve(roiCanvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Could not load image for processing preview."));
    img.src = sourceDataUrl;
  });
}

function getSimpleExplanation(result: AnalysisResponse) {
  return `This sample leans toward '${result.predicted_class}' because channel balance and feature ratios are closest to that reference profile.`;
}

function getScientificExplanation(result: AnalysisResponse) {
  return result.explanation;
}

function createHistoryItem(input: {
  mode: AnalysisMode;
  previewUrl: string;
  processedUrl: string | null;
  result: AnalysisResponse;
  sourceType: "live" | "demo";
  title: string;
}): AnalysisHistoryItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    mode: input.mode,
    title: input.title,
    sourceType: input.sourceType,
    previewUrl: input.previewUrl,
    processedUrl: input.processedUrl,
    result: input.result
  };
}

function exportReport(payload: DashboardState) {
  const matches = payload.result.top_matches
    .map((item) => `<li><strong>${item.label}</strong> — ${(item.score * 100).toFixed(1)}%</li>`)
    .join("");

  const html = `
  <html>
    <head>
      <title>SpectraSense Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; padding: 24px; color: #111827; }
        .card { border: 1px solid #d1d5db; border-radius: 14px; padding: 18px; margin-bottom: 16px; }
        h1, h2 { margin: 0 0 10px 0; }
        .small { color: #4b5563; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>SpectraSense Analysis Summary</h1>
      <p class="small">Generated ${new Date().toLocaleString()}</p>
      <div class="card">
        <h2>Primary Result</h2>
        <p><strong>Domain:</strong> ${modeLabel(payload.mode)}</p>
        <p><strong>Prediction:</strong> ${payload.result.predicted_class}</p>
        <p><strong>Confidence:</strong> ${(payload.result.confidence * 100).toFixed(1)}%</p>
      </div>
      <div class="card">
        <h2>Top Matches</h2>
        <ul>${matches}</ul>
      </div>
      <div class="card">
        <h2>Key Features</h2>
        <p>Mean R: ${payload.result.feature_vector.mean_r.toFixed(3)} | Mean G: ${payload.result.feature_vector.mean_g.toFixed(3)} | Mean B: ${payload.result.feature_vector.mean_b.toFixed(3)}</p>
        <p>R/G Ratio: ${payload.result.feature_vector.rg_ratio.toFixed(3)} | Brightness: ${payload.result.feature_vector.intensity_mean.toFixed(3)}</p>
      </div>
      <div class="card">
        <h2>Limitations</h2>
        <p>${payload.result.limitations}</p>
      </div>
    </body>
  </html>`;

  const reportWindow = window.open("", "_blank", "width=920,height=720");
  if (!reportWindow) {
    return;
  }
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
}

export function AnalyzerSuite({ demoPresets, demoRequestToken, onDemoRequestConsumed }: AnalyzerSuiteProps) {
  const [mode, setMode] = useState<AnalysisMode>("plant_health");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>("simple");
  const [loading, setLoading] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as AnalysisHistoryItem[];
      setHistory(parsed.slice(0, 8));
    } catch {
      // ignore malformed history
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  }, [history]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStageIndex((current) => Math.min(current + 1, STAGES.length - 1));
    }, 900);

    return () => window.clearInterval(timer);
  }, [loading]);

  const historySummary = useMemo(() => history.slice(0, 6), [history]);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Could not access camera. Please allow camera permissions or upload an image.");
    }
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `spectrasense-capture-${Date.now()}.png`, { type: "image/png" });

    setSelectedFile(file);
    setPreviewUrl(dataUrl);
    setError(null);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const onSelectFile = (file: File) => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localUrl);
    setError(null);
  };

  const onInputFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const onDropFile = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const runLiveAnalysis = async () => {
    if (!selectedFile || !previewUrl) {
      setError("Please upload or capture a sample image first.");
      return;
    }

    setLoading(true);
    setLoadingStageIndex(0);
    setError(null);

    try {
      const [result, sourceDataUrl] = await Promise.all([
        analyzeSample(selectedFile, mode),
        fileToDataUrl(selectedFile)
      ]);

      const processed = await buildProcessedPreview(sourceDataUrl);
      const title = `${modeLabel(mode)} | ${result.predicted_class}`;
      const nextDashboard: DashboardState = {
        mode,
        previewUrl: sourceDataUrl,
        processedUrl: processed,
        result,
        sourceType: "live",
        title
      };

      setDashboard(nextDashboard);
      const nextHistoryItem = createHistoryItem({
        mode,
        previewUrl: sourceDataUrl,
        processedUrl: processed,
        result,
        sourceType: "live",
        title
      });
      setHistory((current) => [nextHistoryItem, ...current].slice(0, 8));
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Analysis failed unexpectedly.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoImageAsFile = async (preset: DemoPreset) => {
    const response = await fetch(preset.imagePath);
    const blob = await response.blob();
    return new File([blob], `${preset.id}.png`, { type: blob.type || "image/png" });
  };

  const runDemoAnalysis = useCallback(async (presetId: string) => {
    const preset = demoPresets.find((item) => item.id === presetId) ?? demoPresets[0];
    if (!preset) {
      return;
    }

    setLoading(true);
    setLoadingStageIndex(0);
    setError(null);

    try {
      const [previewDataUrl, selectedDemoFile] = await Promise.all([
        imageUrlToDataUrl(preset.imagePath),
        loadDemoImageAsFile(preset)
      ]);

      const result = createMockAnalysis(preset.id, preset.imagePath);
      const processed = await buildProcessedPreview(previewDataUrl);

      setMode(preset.mode);
      setSelectedFile(selectedDemoFile);
      setPreviewUrl(previewDataUrl);

      const title = `${preset.title} Demo | ${result.predicted_class}`;
      const nextDashboard: DashboardState = {
        mode: preset.mode,
        previewUrl: previewDataUrl,
        processedUrl: processed,
        result,
        sourceType: "demo",
        title
      };

      setDashboard(nextDashboard);
      const nextHistoryItem = createHistoryItem({
        mode: preset.mode,
        previewUrl: previewDataUrl,
        processedUrl: processed,
        result,
        sourceType: "demo",
        title
      });
      setHistory((current) => [nextHistoryItem, ...current].slice(0, 8));
    } catch {
      setError("Demo analysis failed to load. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [demoPresets]);

  useEffect(() => {
    if (!demoRequestToken) {
      return;
    }
    const presetId = demoRequestToken.split("::")[1] ?? demoRequestToken;
    void runDemoAnalysis(presetId);
    onDemoRequestConsumed();
  }, [demoRequestToken, onDemoRequestConsumed, runDemoAnalysis]);

  const restoreHistoryItem = (item: AnalysisHistoryItem) => {
    setMode(item.mode);
    setPreviewUrl(item.previewUrl);
    setDashboard({
      mode: item.mode,
      previewUrl: item.previewUrl,
      processedUrl: item.processedUrl,
      result: item.result,
      sourceType: item.sourceType,
      title: item.title
    });
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const status = dashboard ? confidenceState(dashboard.result.confidence) : "low";

  return (
    <section id="analyzer" className="px-6 py-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Analyzer</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100 md:text-4xl">SpectraSense Analysis Workspace</h2>
          <p className="mt-3 max-w-4xl text-slate-300">
            Capture or upload a sample, run RGB-based computational spectroscopy, inspect interpretable results, and export a responsible summary.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Run Analysis</CardTitle>
              <CardDescription>Choose domain, add image, and process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Domain Selector</p>
                <Select
                  options={MODE_OPTIONS}
                  value={mode}
                  onChange={(event) => setMode(event.target.value as AnalysisMode)}
                />
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDropFile}
                className={cn(
                  "rounded-2xl border border-dashed p-6 transition",
                  dragActive ? "border-cyan-200 bg-cyan-300/10" : "border-white/20 bg-white/5"
                )}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <Upload className="h-5 w-5 text-cyan-200" />
                  <div>
                    <p className="text-sm text-slate-100">Drag and drop sample image</p>
                    <p className="text-xs text-slate-400">or use upload / camera options below</p>
                  </div>
                  <input type="file" accept="image/*" onChange={onInputFile} className="text-xs text-slate-300" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={openCamera}>
                  <Camera className="mr-2 h-4 w-4" />
                  {cameraOpen ? "Camera Active" : "Capture with Webcam"}
                </Button>
                {demoPresets.map((preset) => (
                  <Button key={preset.id} size="sm" variant="ghost" onClick={() => runDemoAnalysis(preset.id)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {preset.title}
                  </Button>
                ))}
              </div>

              {cameraOpen && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl border border-white/10" />
                  <Button size="sm" onClick={captureFrame}>Capture Frame</Button>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={runLiveAnalysis} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileImage className="mr-2 h-4 w-4" />}
                  Run Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setDashboard(null);
                    setError(null);
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {loading && (
                <div className="rounded-xl border border-cyan-200/20 bg-cyan-300/10 p-4">
                  <p className="text-sm text-cyan-100">{STAGES[loadingStageIndex]}</p>
                  <Progress className="mt-2" value={((loadingStageIndex + 1) / STAGES.length) * 100} />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-rose-300/25 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <XCircle className="mr-2 inline h-4 w-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>Session memory for quick comparison.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {historySummary.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  No analyses yet. Run a live or demo analysis to populate this panel.
                </div>
              )}

              {historySummary.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => restoreHistoryItem(item)}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-200/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <span className="text-xs text-cyan-200">{Math.round(item.result.confidence * 100)}%</span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{modeLabel(item.mode)} • {item.sourceType}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                </button>
              ))}

              {historySummary.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearHistory}>Clear History</Button>
              )}
            </CardContent>
          </Card>
        </div>

        {dashboard && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Original Sample</CardTitle>
                  <CardDescription>{dashboard.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
                    <Image src={dashboard.previewUrl} alt="Original sample" fill className="object-cover" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-cyan-200/80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processed ROI View</CardTitle>
                  <CardDescription>Visual indication of preprocessing focus area.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
                    <Image
                      src={dashboard.processedUrl ?? dashboard.previewUrl}
                      alt="Processed sample preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <SpectralCurveChart data={dashboard.result.spectral_curve} />
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Card</CardTitle>
                  <CardDescription>Primary class + confidence context.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Predicted Class</p>
                    <p className="text-2xl font-semibold text-cyan-100">{dashboard.result.predicted_class}</p>
                    <p className="text-sm text-slate-300">Domain: {modeLabel(dashboard.mode)}</p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                      <span>Confidence</span>
                      <span>{Math.round(dashboard.result.confidence * 100)}%</span>
                    </div>
                    <Progress value={dashboard.result.confidence * 100} />
                    <div className="mt-2 text-xs">
                      {status === "low" && <span className="text-amber-200">Status: low confidence</span>}
                      {status === "moderate" && <span className="text-blue-200">Status: moderate confidence</span>}
                      {status === "higher" && <span className="text-lime-200">Status: higher confidence</span>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    {dashboard.result.what_this_tells_us}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => exportReport(dashboard)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <RGBHistogramChart data={dashboard.result.histograms} />

              <Card>
                <CardHeader>
                  <CardTitle>Top Match Comparison</CardTitle>
                  <CardDescription>Most similar reference classes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboard.result.top_matches.slice(0, 3).map((match) => (
                    <div key={match.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-100">{match.label}</p>
                        <p className="text-sm text-cyan-200">{Math.round(match.score * 100)}%</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{match.insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Breakdown</CardTitle>
                  <CardDescription>Beginner-friendly extracted signal summary.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    { label: "Average Red", value: dashboard.result.feature_vector.mean_r },
                    { label: "Average Green", value: dashboard.result.feature_vector.mean_g },
                    { label: "Average Blue", value: dashboard.result.feature_vector.mean_b },
                    { label: "Red/Green Ratio", value: dashboard.result.feature_vector.rg_ratio / 2 },
                    { label: "Brightness", value: dashboard.result.feature_vector.intensity_mean },
                    { label: "Saturation", value: dashboard.result.feature_vector.hsv_mean.s }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-slate-300">
                        <span>{item.label}</span>
                        <span className="text-slate-100">{item.value.toFixed(3)}</span>
                      </div>
                      <Progress value={Math.max(0, Math.min(100, item.value * 100))} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Explanation Panel</CardTitle>
                  <CardDescription>Switch between simple and scientific wording.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex rounded-full border border-white/15 bg-white/5 p-1 text-sm">
                    <button
                      type="button"
                      onClick={() => setExplanationMode("simple")}
                      className={cn(
                        "rounded-full px-3 py-1.5",
                        explanationMode === "simple" ? "bg-cyan-300/20 text-cyan-100" : "text-slate-300"
                      )}
                    >
                      Explain Simply
                    </button>
                    <button
                      type="button"
                      onClick={() => setExplanationMode("scientific")}
                      className={cn(
                        "rounded-full px-3 py-1.5",
                        explanationMode === "scientific" ? "bg-cyan-300/20 text-cyan-100" : "text-slate-300"
                      )}
                    >
                      Scientific Explanation
                    </button>
                  </div>
                  <div className="rounded-xl border border-cyan-200/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">
                    {explanationMode === "simple"
                      ? getSimpleExplanation(dashboard.result)
                      : getScientificExplanation(dashboard.result)}
                  </div>
                  <p className="text-xs text-slate-400">Uncertainty: {dashboard.result.uncertainty_note}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations / Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-200">
                  {recommendationList(dashboard.result).map((tip) => (
                    <div key={tip} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <CheckCircle2 className="mr-2 inline h-4 w-4 text-cyan-200" />
                      {tip}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-amber-200/25 bg-amber-300/10">
                <CardHeader>
                  <CardTitle>Limitations</CardTitle>
                  <CardDescription className="text-amber-100">Always interpret responsibly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-amber-100">
                  <p>{dashboard.result.limitations}</p>
                  <p>
                    <strong>Reminder:</strong> This is not a laboratory-grade spectrometer and should not be used for clinical or regulatory decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
