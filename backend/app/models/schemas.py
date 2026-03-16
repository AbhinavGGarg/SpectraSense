from __future__ import annotations

from typing import Dict, List, Literal

from pydantic import BaseModel, Field

AnalysisMode = Literal["plant_health", "water_sample", "food_freshness", "medicine_tablet"]


class HSVMean(BaseModel):
    h: float
    s: float
    v: float


class LabMean(BaseModel):
    l: float
    a: float
    b: float


class FeatureVector(BaseModel):
    mean_r: float
    mean_g: float
    mean_b: float
    std_r: float
    std_g: float
    std_b: float
    norm_r: float
    norm_g: float
    norm_b: float
    rg_ratio: float
    rb_ratio: float
    gb_ratio: float
    intensity_mean: float
    intensity_std: float
    hsv_mean: HSVMean
    lab_mean: LabMean


class HistogramBin(BaseModel):
    channel: Literal["r", "g", "b"]
    bin: int
    wavelengthHint: int
    value: float


class SpectralPoint(BaseModel):
    wavelength: int
    intensity: float


class TopMatch(BaseModel):
    label: str
    score: float
    mode: str
    insight: str


class SampleMetadata(BaseModel):
    file_name: str
    mode: AnalysisMode
    width: int
    height: int
    roi_width: int
    roi_height: int


class PreprocessingSummary(BaseModel):
    resized: bool
    white_balanced: bool
    denoised: bool
    roi_strategy: str


class AnalyzeResponse(BaseModel):
    sample_metadata: SampleMetadata
    preprocessing_summary: PreprocessingSummary
    predicted_class: str
    confidence: float = Field(ge=0.0, le=1.0)
    top_matches: List[TopMatch]
    feature_vector: FeatureVector
    histograms: List[HistogramBin]
    spectral_curve: List[SpectralPoint]
    explanation: str
    what_this_tells_us: str
    limitations: str
    uncertainty_note: str


class ClassificationResult(BaseModel):
    predicted_class: str
    confidence: float
    top_matches: List[TopMatch]
    explanation: str
    what_this_tells_us: str
    uncertainty_note: str
    sample_compatible: bool
    compatibility_score: float
    compatibility_reason: str


class ExtractedFeatures(BaseModel):
    feature_vector: FeatureVector
    histograms: List[HistogramBin]
    vector_for_model: Dict[str, float]
