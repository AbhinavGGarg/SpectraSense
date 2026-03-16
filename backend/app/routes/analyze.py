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
    spectral_curve = approximate_spectral_curve(features.vector_for_model)
    classification = classify_sample(features.vector_for_model, mode)

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
