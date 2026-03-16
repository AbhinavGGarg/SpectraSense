export type AnalysisMode = "plant_health" | "water_sample" | "food_freshness" | "medicine_tablet";

export interface FeatureVector {
  mean_r: number;
  mean_g: number;
  mean_b: number;
  std_r: number;
  std_g: number;
  std_b: number;
  norm_r: number;
  norm_g: number;
  norm_b: number;
  rg_ratio: number;
  rb_ratio: number;
  gb_ratio: number;
  intensity_mean: number;
  intensity_std: number;
  hsv_mean: { h: number; s: number; v: number };
  lab_mean: { l: number; a: number; b: number };
}

export interface SpectralPoint {
  wavelength: number;
  intensity: number;
}

export interface TopMatch {
  label: string;
  score: number;
  mode: string;
  insight: string;
}

export interface HistogramSet {
  channel: "r" | "g" | "b";
  bin: number;
  wavelengthHint: number;
  value: number;
}

export interface AnalysisResponse {
  sample_metadata: {
    file_name: string;
    mode: AnalysisMode;
    width: number;
    height: number;
    roi_width: number;
    roi_height: number;
  };
  preprocessing_summary: {
    resized: boolean;
    white_balanced: boolean;
    denoised: boolean;
    roi_strategy: string;
  };
  predicted_class: string;
  confidence: number;
  top_matches: TopMatch[];
  feature_vector: FeatureVector;
  histograms: HistogramSet[];
  spectral_curve: SpectralPoint[];
  explanation: string;
  what_this_tells_us: string;
  limitations: string;
  uncertainty_note: string;
}
