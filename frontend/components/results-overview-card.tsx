import { FlaskConical, Sparkles } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ResultsOverviewCardProps {
  result: AnalysisResponse;
}

export function ResultsOverviewCard({ result }: ResultsOverviewCardProps) {
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicted Class</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-cyan-100">{result.predicted_class}</p>
            <p className="mt-1 text-sm text-slate-300">Mode: {result.sample_metadata.mode.replace("_", " ")}</p>
          </div>
          <Badge variant="success">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            {confidencePercent}% confidence
          </Badge>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
            <span>Model confidence</span>
            <span>{confidencePercent}%</span>
          </div>
          <Progress value={confidencePercent} />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
          <div className="mb-1 flex items-center gap-2 text-cyan-100">
            <FlaskConical className="h-4 w-4" />
            What this likely indicates
          </div>
          <p>{result.what_this_tells_us}</p>
        </div>
      </CardContent>
    </Card>
  );
}
