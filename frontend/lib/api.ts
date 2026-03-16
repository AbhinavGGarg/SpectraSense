import { AnalysisMode, AnalysisResponse } from "@/types/analysis";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function analyzeSample(file: File, mode: AnalysisMode): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const fallback = "Analysis failed. Please retry with a clearer sample image.";
    try {
      const data = (await response.json()) as { detail?: string };
      throw new Error(data.detail ?? fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return (await response.json()) as AnalysisResponse;
}
