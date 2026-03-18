from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import AnalyzeResponse
from app.services.classify import classify_sample
from app.services.features import extract_features
from app.services.preprocess import preprocess_image
from app.services.spectrum import approximate_spectral_curve
from app.utils.image_utils import UnsupportedImageError, load_image_from_bytes

router = APIRouter(prefix="/api", tags=["analysis"])

LIMITATIONS_TEXT = (
    "This is an approximate computational spectroscopy MVP derived from RGB camera data. "
    "Outputs depend heavily on lighting, camera quality, and sample framing. "
    "It is not a substitute for certified laboratory testing or regulatory diagnostics."
)

VALID_MODES = {
    "plant_health",
    "water_sample",
    "food_freshness",
    "medicine_tablet",
}


def _quality_gate(vector: dict[str, float]) -> str | None:
    if vector["intensity_std"] < 0.025:
        return "Image appears too uniform. Please capture a clearer sample region with visible texture/color variation."
    if vector["intensity_mean"] < 0.08 or vector["intensity_mean"] > 0.93:
        return "Image lighting is too dark or too overexposed. Please retake in neutral lighting."
    if max(vector["mean_r"], vector["mean_g"], vector["mean_b"]) < 0.09:
        return "Sample region is too dim for analysis. Increase lighting and try again."
    return None


def _mode_relevance_gate(vector: dict[str, float], mode: str) -> str | None:
    saturation = float(vector["s_mean"])
    intensity_mean = float(vector["intensity_mean"])
    intensity_std = float(vector["intensity_std"])
    rg_ratio = float(vector["rg_ratio"])
    rb_ratio = float(vector["rb_ratio"])
    gb_ratio = float(vector["gb_ratio"])

    if mode == "plant_health":
        if saturation < 0.26:
            return (
                "Analyze failed: this image does not look like a plant-health sample in this MVP pipeline. "
                "Use a leaf-focused image with richer pigment variation."
            )
        if intensity_mean < 0.18 or intensity_mean > 0.82:
            return "Analyze failed: plant sample exposure is outside usable range. Retake under neutral lighting."
        return None

    if mode == "water_sample":
        if saturation > 0.30:
            return (
                "Analyze failed: this image appears too saturated for a water-focused optical profile. "
                "Use a clearer water sample frame."
            )
        if intensity_std > 0.16 or intensity_mean > 0.58:
            return (
                "Analyze failed: this image does not match expected water-texture/brightness characteristics. "
                "Retake with the water region filling most of the frame."
            )
        return None

    if mode == "food_freshness":
        if saturation < 0.28:
            return (
                "Analyze failed: this image is too low-saturation for food-freshness screening. "
                "Capture the food item closer with better color visibility."
            )
        if intensity_mean < 0.2 or intensity_mean > 0.86:
            return "Analyze failed: food sample lighting is outside usable range for this MVP."
        return None

    if mode == "medicine_tablet":
        if saturation > 0.24:
            return (
                "Analyze failed: this image appears too color-saturated for tablet profile matching. "
                "Use a well-lit close shot of a tablet on a neutral background."
            )
        if intensity_mean < 0.58:
            return "Analyze failed: tablet sample appears too dark for reliable screening in this MVP."
        if max(abs(rg_ratio - 1.0), abs(rb_ratio - 1.0), abs(gb_ratio - 1.0)) > 0.16:
            return "Analyze failed: tablet color balance is outside expected profile range. Re-capture under neutral lighting."
        return None

    return "Analyze failed: unsupported analysis mode."


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "spectrasense-backend"}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_sample(file: UploadFile = File(...), mode: str = Form("plant_health")) -> AnalyzeResponse:
    if mode not in VALID_MODES:
        raise HTTPException(status_code=400, detail=f"Unsupported mode '{mode}'.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        loaded = load_image_from_bytes(content)
    except UnsupportedImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    processed = preprocess_image(loaded.bgr)
    features = extract_features(processed.rgb_roi)
    quality_error = _quality_gate(features.vector_for_model)
    if quality_error:
        raise HTTPException(status_code=422, detail=quality_error)

    relevance_error = _mode_relevance_gate(features.vector_for_model, mode)
    if relevance_error:
        raise HTTPException(status_code=422, detail=relevance_error)

    spectral_curve = approximate_spectral_curve(features.vector_for_model)
    classification = classify_sample(features.vector_for_model, mode)
    if not classification.sample_compatible:
        raise HTTPException(status_code=422, detail=classification.compatibility_reason)

    roi_height, roi_width = processed.rgb_roi.shape[:2]

    return AnalyzeResponse(
        sample_metadata={
            "file_name": file.filename or "uploaded-sample",
            "mode": mode,
            "width": int(loaded.width),
            "height": int(loaded.height),
            "roi_width": int(roi_width),
            "roi_height": int(roi_height),
        },
        preprocessing_summary={
            "resized": processed.resized,
            "white_balanced": True,
            "denoised": True,
            "roi_strategy": processed.roi_strategy,
        },
        predicted_class=classification.predicted_class,
        confidence=classification.confidence,
        top_matches=classification.top_matches,
        feature_vector=features.feature_vector,
        histograms=features.histograms,
        spectral_curve=spectral_curve,
        explanation=classification.explanation,
        what_this_tells_us=classification.what_this_tells_us,
        limitations=LIMITATIONS_TEXT,
        uncertainty_note=classification.uncertainty_note,
    )
