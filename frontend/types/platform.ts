import { AnalysisMode, AnalysisResponse } from "@/types/analysis";

export type ExplanationMode = "simple" | "scientific";
export type ScienceDetailMode = "beginner" | "advanced";

export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  mode: AnalysisMode;
  imagePath: string;
  shortStory: string;
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  mode: AnalysisMode;
  title: string;
  sourceType: "live" | "demo";
  previewUrl: string;
  processedUrl: string | null;
  result: AnalysisResponse;
}

export interface AnalyzerProgressState {
  active: boolean;
  stageIndex: number;
  stages: string[];
}

export interface ReportPayload {
  mode: AnalysisMode;
  previewUrl: string;
  processedUrl: string | null;
  result: AnalysisResponse;
}

export interface UseCaseCardData {
  title: string;
  mode: AnalysisMode;
  sampleType: string;
  detectionFocus: string;
  whyItMatters: string;
  interpretation: string;
}

export interface InteractiveScienceTopic {
  title: string;
  beginner: string;
  advanced: string;
}

export interface AnalyzerDashboardData {
  mode: AnalysisMode;
  previewUrl: string;
  processedUrl: string | null;
  result: AnalysisResponse;
}

export type AnalyzeRunner = (file: File, mode: AnalysisMode) => Promise<AnalysisResponse>;
