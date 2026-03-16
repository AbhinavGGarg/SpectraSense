import { AnalysisMode } from "@/types/analysis";
import { Select } from "@/components/ui/select";

interface AnalysisModeSelectorProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

const options = [
  { label: "Plant Health", value: "plant_health" },
  { label: "Water Sample", value: "water_sample" },
  { label: "Food Freshness", value: "food_freshness" },
  { label: "Medicine / Tablet", value: "medicine_tablet" }
];

export function AnalysisModeSelector({ value, onChange }: AnalysisModeSelectorProps) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as AnalysisMode)}
      options={options}
    />
  );
}
