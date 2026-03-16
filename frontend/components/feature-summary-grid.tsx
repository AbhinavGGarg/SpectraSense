import { AnalysisResponse } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureSummaryGridProps {
  result: AnalysisResponse;
}

function renderNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(3) : "-";
}

export function FeatureSummaryGrid({ result }: FeatureSummaryGridProps) {
  const fv = result.feature_vector;
  const summary = [
    { label: "Mean R", value: fv.mean_r },
    { label: "Mean G", value: fv.mean_g },
    { label: "Mean B", value: fv.mean_b },
    { label: "R/G Ratio", value: fv.rg_ratio },
    { label: "R/B Ratio", value: fv.rb_ratio },
    { label: "G/B Ratio", value: fv.gb_ratio },
    { label: "Intensity Mean", value: fv.intensity_mean },
    { label: "Intensity Std", value: fv.intensity_std },
    { label: "HSV H", value: fv.hsv_mean.h },
    { label: "HSV S", value: fv.hsv_mean.s },
    { label: "Lab L", value: fv.lab_mean.l },
    { label: "Lab a", value: fv.lab_mean.a }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Optical Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{renderNumber(item.value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
