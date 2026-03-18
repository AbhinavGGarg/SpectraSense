import { AnalysisMode, AnalysisResponse, HistogramSet, SpectralPoint, TopMatch } from "@/types/analysis";
import { DemoPreset } from "@/types/platform";

interface MockSeed {
  id: string;
  mode: AnalysisMode;
  predictedClass: string;
  confidence: number;
  channelMeans: { r: number; g: number; b: number };
  channelStd: { r: number; g: number; b: number };
  topMatches: TopMatch[];
  simpleExplanation: string;
  whatItMeans: string;
  uncertainty: string;
}

const LIMITATIONS =
  "This is a computational spectroscopy MVP using RGB-derived estimates, not a laboratory-grade spectrometer. Results are sensitive to lighting, camera quality, and framing. Use for early screening, education, and awareness only. Confirm concerning findings with proper testing.";

const seeds: Record<string, MockSeed> = {
  "plant-healthy": {
    id: "plant-healthy",
    mode: "plant_health",
    predictedClass: "healthy_leaf",
    confidence: 0.82,
    channelMeans: { r: 0.28, g: 0.53, b: 0.21 },
    channelStd: { r: 0.11, g: 0.13, b: 0.09 },
    topMatches: [
      { label: "healthy_leaf", score: 0.82, mode: "plant_health", insight: "Strong chlorophyll-like green reflectance profile." },
      { label: "nitrogen_deficiency_indicator", score: 0.12, mode: "plant_health", insight: "Mild red drift not dominant." },
      { label: "chlorosis_like_condition", score: 0.06, mode: "plant_health", insight: "Low chlorosis-style signal overlap." }
    ],
    simpleExplanation:
      "Green reflectance dominates over red, matching healthy foliage references in the MVP optical feature space.",
    whatItMeans: "Leaf sample appears closer to healthy baseline behavior than stress signatures.",
    uncertainty: "Moderate confidence. Recheck under neutral daylight for consistency."
  },
  "plant-stress": {
    id: "plant-stress",
    mode: "plant_health",
    predictedClass: "chlorosis_like_condition",
    confidence: 0.74,
    channelMeans: { r: 0.45, g: 0.34, b: 0.22 },
    channelStd: { r: 0.1, g: 0.08, b: 0.08 },
    topMatches: [
      { label: "chlorosis_like_condition", score: 0.74, mode: "plant_health", insight: "Reduced green dominance with altered color ratios." },
      { label: "nitrogen_deficiency_indicator", score: 0.18, mode: "plant_health", insight: "Shares red-shifted stress characteristics." },
      { label: "healthy_leaf", score: 0.08, mode: "plant_health", insight: "Lower overlap with healthy reference." }
    ],
    simpleExplanation:
      "Green response is weaker than expected and red is elevated, which aligns with stress-like foliar patterns.",
    whatItMeans: "Sample trends toward stress/chlorosis-like optical behavior and may warrant closer observation.",
    uncertainty: "Moderate confidence. Retake with uniform lighting and compare to healthy control leaf."
  },
  "water-clean": {
    id: "water-clean",
    mode: "water_sample",
    predictedClass: "clear_water_baseline",
    confidence: 0.79,
    channelMeans: { r: 0.2, g: 0.27, b: 0.34 },
    channelStd: { r: 0.05, g: 0.06, b: 0.07 },
    topMatches: [
      { label: "clear_water_baseline", score: 0.79, mode: "water_sample", insight: "Low-saturation blue-biased optical profile." },
      { label: "turbid_contaminated_water", score: 0.13, mode: "water_sample", insight: "Slight luminance rise but limited turbidity features." },
      { label: "algae_like_contamination", score: 0.08, mode: "water_sample", insight: "Minimal green contamination signature." }
    ],
    simpleExplanation:
      "Blue channel is dominant with low color variability, matching clear-water reference patterns.",
    whatItMeans: "Optically closer to clear-water baseline than contamination profiles.",
    uncertainty: "Moderate confidence. Strong reflections can alter readings; retest if needed."
  },
  "water-questionable": {
    id: "water-questionable",
    mode: "water_sample",
    predictedClass: "turbid_contaminated_water",
    confidence: 0.77,
    channelMeans: { r: 0.37, g: 0.36, b: 0.34 },
    channelStd: { r: 0.07, g: 0.06, b: 0.05 },
    topMatches: [
      { label: "turbid_contaminated_water", score: 0.77, mode: "water_sample", insight: "Flattened channels and scattering-like profile." },
      { label: "algae_like_contamination", score: 0.16, mode: "water_sample", insight: "Some contamination overlap but less green bias." },
      { label: "clear_water_baseline", score: 0.07, mode: "water_sample", insight: "Low similarity to clean baseline." }
    ],
    simpleExplanation:
      "Channel flattening and elevated brightness suggest turbidity-like scattering in the sample.",
    whatItMeans: "Sample appears optically closer to questionable/turbid water signatures.",
    uncertainty: "Moderate confidence. Use this as screening only and confirm with proper tests."
  },
  "food-fresh": {
    id: "food-fresh",
    mode: "food_freshness",
    predictedClass: "fresh_fruit",
    confidence: 0.81,
    channelMeans: { r: 0.56, g: 0.43, b: 0.24 },
    channelStd: { r: 0.12, g: 0.11, b: 0.09 },
    topMatches: [
      { label: "fresh_fruit", score: 0.81, mode: "food_freshness", insight: "High saturation with fresh-like color separation." },
      { label: "ripening_stage", score: 0.14, mode: "food_freshness", insight: "Some ripening overlap in red-yellow transition." },
      { label: "spoilage_oxidation_stage", score: 0.05, mode: "food_freshness", insight: "Low oxidation-like profile match." }
    ],
    simpleExplanation:
      "Saturation and color balance align with fresher produce signatures in the reference library.",
    whatItMeans: "Sample appears closer to fresh-state optical patterns than spoilage profiles.",
    uncertainty: "Moderate confidence. Texture and odor still matter; this is visual screening only."
  },
  "food-spoilage": {
    id: "food-spoilage",
    mode: "food_freshness",
    predictedClass: "spoilage_oxidation_stage",
    confidence: 0.76,
    channelMeans: { r: 0.49, g: 0.34, b: 0.21 },
    channelStd: { r: 0.09, g: 0.08, b: 0.07 },
    topMatches: [
      { label: "spoilage_oxidation_stage", score: 0.76, mode: "food_freshness", insight: "Reduced saturation and oxidation-like color drift." },
      { label: "ripening_stage", score: 0.17, mode: "food_freshness", insight: "Some overlap with late ripening profile." },
      { label: "fresh_fruit", score: 0.07, mode: "food_freshness", insight: "Limited similarity to fresh baseline." }
    ],
    simpleExplanation:
      "Lower saturation and a brown-leaning shift suggest oxidation/spoilage-like optical behavior.",
    whatItMeans: "Sample trends toward spoilage-like features in this MVP model space.",
    uncertainty: "Moderate confidence. Verify with smell/texture checks and food safety practices."
  },
  "tablet-normal": {
    id: "tablet-normal",
    mode: "medicine_tablet",
    predictedClass: "baseline_authentic_tablet",
    confidence: 0.84,
    channelMeans: { r: 0.67, g: 0.66, b: 0.7 },
    channelStd: { r: 0.04, g: 0.05, b: 0.04 },
    topMatches: [
      { label: "baseline_authentic_tablet", score: 0.84, mode: "medicine_tablet", insight: "Strong alignment with baseline color profile." },
      { label: "suspicious_color_mismatch", score: 0.16, mode: "medicine_tablet", insight: "Low mismatch signal." },
      { label: "color_outlier", score: 0.0, mode: "medicine_tablet", insight: "No significant outlier pattern." }
    ],
    simpleExplanation:
      "Color profile is close to the baseline reference for expected tablet appearance.",
    whatItMeans: "Sample does not show a strong visible mismatch signal in this MVP comparison.",
    uncertainty: "Moderate confidence. Visual checks cannot confirm authenticity alone."
  },
  "tablet-suspicious": {
    id: "tablet-suspicious",
    mode: "medicine_tablet",
    predictedClass: "suspicious_color_mismatch",
    confidence: 0.78,
    channelMeans: { r: 0.57, g: 0.49, b: 0.63 },
    channelStd: { r: 0.06, g: 0.06, b: 0.05 },
    topMatches: [
      { label: "suspicious_color_mismatch", score: 0.78, mode: "medicine_tablet", insight: "Visible deviation from expected tablet profile." },
      { label: "baseline_authentic_tablet", score: 0.22, mode: "medicine_tablet", insight: "Partial overlap with baseline remains." },
      { label: "color_outlier", score: 0.0, mode: "medicine_tablet", insight: "Mismatch remains within MVP feature space." }
    ],
    simpleExplanation:
      "Color balance departs from baseline reference and may warrant authenticity/degradation follow-up.",
    whatItMeans: "Sample shows suspicious visual mismatch and should be checked with reliable channels.",
    uncertainty: "Moderate confidence. Never make medical decisions from this screening alone."
  }
};

export const demoPresets: DemoPreset[] = [
  {
    id: "plant-stress",
    title: "Plant Check",
    subtitle: "Healthy vs Stress Screening",
    mode: "plant_health",
    imagePath: "/samples/plant-chlorosis-like.png",
    shortStory: "Field leaf image with chlorosis-like color shift."
  },
  {
    id: "water-questionable",
    title: "Water Screening",
    subtitle: "Clear vs Questionable",
    mode: "water_sample",
    imagePath: "/samples/water-turbid-like.png",
    shortStory: "Surface sample with scattering-like turbidity signal."
  },
  {
    id: "food-spoilage",
    title: "Food Freshness",
    subtitle: "Fresh vs Spoilage Indicators",
    mode: "food_freshness",
    imagePath: "/samples/food-ripening-like.png",
    shortStory: "Fruit sample showing oxidation-leaning color drift."
  },
  {
    id: "tablet-suspicious",
    title: "Tablet Awareness",
    subtitle: "Baseline vs Mismatch",
    mode: "medicine_tablet",
    imagePath: "/samples/tablet-mismatch-like.png",
    shortStory: "Tablet visual mismatch for awareness-level screening."
  }
];

function createSpectralCurve(seed: MockSeed): SpectralPoint[] {
  const anchors = [
    { w: 430, i: seed.channelMeans.b * 0.92 },
    { w: 460, i: seed.channelMeans.b },
    { w: 520, i: (seed.channelMeans.g + seed.channelMeans.b * 0.25) / 1.25 },
    { w: 550, i: seed.channelMeans.g },
    { w: 600, i: (seed.channelMeans.r + seed.channelMeans.g * 0.35) / 1.35 },
    { w: 620, i: seed.channelMeans.r },
    { w: 670, i: seed.channelMeans.r * 0.87 }
  ];

  const points: SpectralPoint[] = [];
  for (let w = 430; w <= 670; w += 5) {
    let left = anchors[0];
    let right = anchors[anchors.length - 1];
    for (let idx = 0; idx < anchors.length - 1; idx += 1) {
      if (w >= anchors[idx].w && w <= anchors[idx + 1].w) {
        left = anchors[idx];
        right = anchors[idx + 1];
        break;
      }
    }
    const t = (w - left.w) / (right.w - left.w || 1);
    const intensity = left.i + (right.i - left.i) * t;
    points.push({ wavelength: w, intensity });
  }

  const min = Math.min(...points.map((point) => point.intensity));
  const max = Math.max(...points.map((point) => point.intensity));

  return points.map((point) => ({
    wavelength: point.wavelength,
    intensity: (point.intensity - min) / (max - min + 1e-8)
  }));
}

function createHistograms(seed: MockSeed): HistogramSet[] {
  const channels = [
    { key: "r", mean: seed.channelMeans.r, std: seed.channelStd.r, hint: 620 },
    { key: "g", mean: seed.channelMeans.g, std: seed.channelStd.g, hint: 540 },
    { key: "b", mean: seed.channelMeans.b, std: seed.channelStd.b, hint: 460 }
  ] as const;

  const values: HistogramSet[] = [];
  for (const channel of channels) {
    let total = 0;
    const raw = Array.from({ length: 16 }, (_, bin) => {
      const x = (bin + 0.5) / 16;
      const v = Math.exp(-((x - channel.mean) ** 2) / (2 * (channel.std ** 2 + 1e-5)));
      total += v;
      return v;
    });

    raw.forEach((value, bin) => {
      values.push({
        channel: channel.key,
        bin,
        wavelengthHint: channel.hint,
        value: value / (total || 1)
      });
    });
  }

  return values;
}

function asModeLabel(mode: AnalysisMode) {
  return mode.replaceAll("_", " ");
}

export function createMockAnalysis(presetId: string, imagePath: string): AnalysisResponse {
  const seed = seeds[presetId] ?? seeds["plant-stress"];
  const normSum = seed.channelMeans.r + seed.channelMeans.g + seed.channelMeans.b;

  return {
    sample_metadata: {
      file_name: imagePath.split("/").pop() ?? "demo-sample.png",
      mode: seed.mode,
      width: 520,
      height: 360,
      roi_width: 340,
      roi_height: 220
    },
    preprocessing_summary: {
      resized: false,
      white_balanced: true,
      denoised: true,
      roi_strategy: "demo-central-focus"
    },
    predicted_class: seed.predictedClass,
    confidence: seed.confidence,
    top_matches: seed.topMatches,
    feature_vector: {
      mean_r: seed.channelMeans.r,
      mean_g: seed.channelMeans.g,
      mean_b: seed.channelMeans.b,
      std_r: seed.channelStd.r,
      std_g: seed.channelStd.g,
      std_b: seed.channelStd.b,
      norm_r: seed.channelMeans.r / normSum,
      norm_g: seed.channelMeans.g / normSum,
      norm_b: seed.channelMeans.b / normSum,
      rg_ratio: seed.channelMeans.r / (seed.channelMeans.g + 1e-6),
      rb_ratio: seed.channelMeans.r / (seed.channelMeans.b + 1e-6),
      gb_ratio: seed.channelMeans.g / (seed.channelMeans.b + 1e-6),
      intensity_mean: (seed.channelMeans.r + seed.channelMeans.g + seed.channelMeans.b) / 3,
      intensity_std: (seed.channelStd.r + seed.channelStd.g + seed.channelStd.b) / 3,
      hsv_mean: {
        h: seed.mode === "water_sample" ? 0.52 : seed.mode === "plant_health" ? 0.25 : 0.1,
        s: seed.mode === "medicine_tablet" ? 0.16 : 0.58,
        v: 0.64
      },
      lab_mean: {
        l: 0.57,
        a: seed.mode === "plant_health" ? -0.14 : 0.08,
        b: seed.mode === "water_sample" ? -0.1 : 0.16
      }
    },
    histograms: createHistograms(seed),
    spectral_curve: createSpectralCurve(seed),
    explanation:
      `Result favors '${seed.predictedClass}' by RGB ratio alignment, histogram distribution, and nearest reference behavior in ${asModeLabel(seed.mode)} mode.`,
    what_this_tells_us: seed.whatItMeans,
    limitations: LIMITATIONS,
    uncertainty_note: seed.uncertainty
  };
}

export function recommendationList(result: AnalysisResponse): string[] {
  const recommendations = [
    "Capture under even, neutral lighting and avoid strong shadows.",
    "Place the sample on a neutral background to reduce color contamination.",
    "Use closer framing so the sample fills most of the image.",
    "Compare against a known reference sample when possible.",
    "Repeat measurement 2-3 times and look for consistent trends.",
    "For concerning findings, perform confirmatory laboratory or certified testing."
  ];

  if (result.confidence < 0.62) {
    recommendations.unshift("Confidence is limited. Retake image with improved lighting and focus before interpretation.");
  }

  return recommendations;
}
