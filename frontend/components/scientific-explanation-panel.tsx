import { Lightbulb, Microscope } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScientificExplanationPanelProps {
  result: AnalysisResponse;
}

export function ScientificExplanationPanel({ result }: ScientificExplanationPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scientific Interpretation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-200">
        <div className="rounded-xl border border-cyan-200/20 bg-cyan-300/10 p-3">
          <div className="mb-1 flex items-center gap-2 text-cyan-100">
            <Microscope className="h-4 w-4" />
            Optical reasoning
          </div>
          <p>{result.explanation}</p>
        </div>

        <div className="rounded-xl border border-blue-200/20 bg-blue-300/10 p-3">
          <div className="mb-1 flex items-center gap-2 text-blue-100">
            <Lightbulb className="h-4 w-4" />
            Uncertainty note
          </div>
          <p>{result.uncertainty_note}</p>
        </div>
      </CardContent>
    </Card>
  );
}
