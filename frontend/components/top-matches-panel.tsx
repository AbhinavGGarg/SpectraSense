import { AnalysisResponse } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopMatchesPanelProps {
  result: AnalysisResponse;
}

export function TopMatchesPanel({ result }: TopMatchesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Reference Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {result.top_matches.map((match, idx) => (
            <div key={`${match.label}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-100">{match.label}</p>
                <p className="text-sm text-cyan-200">{Math.round(match.score * 100)}% similarity</p>
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{match.mode.replace("_", " ")}</p>
              <p className="mt-2 text-sm text-slate-300">{match.insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
