import { AnalysisMode, AnalysisResponse } from "@/types/analysis";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function analyzeSample(file: File, mode: AnalysisMode): Promise<AnalysisResponse> {
  if (typeof window !== "undefined") {
    const runningOnLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const apiPointsToLocalhost = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
    if (!runningOnLocalhost && apiPointsToLocalhost) {
      throw new Error("Backend API URL is not configured for deployment. Set NEXT_PUBLIC_API_BASE_URL to your deployed FastAPI URL.");
    }
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Could not reach analysis server. Verify backend deployment and NEXT_PUBLIC_API_BASE_URL.");
  }

  if (!response.ok) {
    const fallback = "Analysis failed. Please retry with a clearer sample image.";
    let message = fallback;
    try {
      const data = (await response.json()) as { detail?: string };
      if (typeof data.detail === "string" && data.detail.trim().length > 0) {
        message = data.detail;
      }
    } catch {
      // Keep fallback message when backend payload is not JSON.
    }
    throw new Error(message);
  }

  return (await response.json()) as AnalysisResponse;
}
