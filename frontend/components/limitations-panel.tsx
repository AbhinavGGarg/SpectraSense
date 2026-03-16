import { AlertOctagon } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LimitationsPanelProps {
  result: AnalysisResponse;
}

export function LimitationsPanel({ result }: LimitationsPanelProps) {
  return (
    <Card className="border-amber-200/25 bg-amber-400/10">
      <CardHeader>
        <CardTitle>Limitations & Scientific Honesty</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-amber-100">
        <div className="mb-2 flex items-center gap-2">
          <AlertOctagon className="h-4 w-4" />
          <span>Educational and early-screening MVP, not certified laboratory testing.</span>
        </div>
        <p>{result.limitations}</p>
      </CardContent>
    </Card>
  );
}
