from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.models.schemas import ClassificationResult, TopMatch
from app.services.features import FEATURE_COLUMNS

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "reference_dataset.csv"

CLASS_EXPLANATIONS = {
    "healthy_leaf": "Optical profile aligns with chlorophyll-rich vegetation baseline.",
    "nitrogen_deficiency_indicator": "Elevated red dominance with lower green suggests potential nutrient stress trend.",
    "chlorosis_like_condition": "Reduced green response and altered channel ratios resemble chlorosis-like optical behavior.",
    "clear_water_baseline": "Balanced low-saturation profile is consistent with a clear water optical baseline.",
    "algae_like_contamination": "Green-weighted response and elevated saturation can indicate algae-like contamination features.",
    "turbid_contaminated_water": "Flattened channel profile and elevated scattering-like brightness suggest turbidity.",
    "fresh_fruit": "Higher saturation and balanced reflectance are closer to fresh produce signatures.",
    "ripening_stage": "Shifted red/yellow channel dominance indicates progression toward ripening.",
    "spoilage_oxidation_stage": "Color drift and reduced vibrancy align with oxidation and spoilage-like signals.",
    "baseline_authentic_tablet": "Color profile closely matches expected baseline tablet appearance.",
    "suspicious_color_mismatch": "Detected optical mismatch from baseline may warrant counterfeit or degradation suspicion.",
}


def _uncertainty_note(confidence: float, top_match_score: float) -> str:
    if confidence >= 0.78 and top_match_score >= 0.8:
        return "Model agreement is relatively strong for this MVP dataset, but controlled retesting is still recommended."
    if confidence >= 0.6:
        return "Signal is moderately consistent with reference data. Capture under stable lighting for better confidence."
    return "Confidence is limited; image conditions or class overlap likely affected certainty. Re-capture and verify with formal tests if critical."


def _compatibility_check(sample: Dict[str, float], mode_subset: pd.DataFrame) -> tuple[bool, float, str]:
    if mode_subset.empty:
        return False, 0.0, "Selected analysis mode has no reference profiles configured."

    key_columns = [
        "mean_r",
        "mean_g",
        "mean_b",
        "std_r",
        "std_g",
        "std_b",
        "rg_ratio",
        "gb_ratio",
        "intensity_mean",
        "intensity_std",
        "s_mean",
    ]

    sample_vector = np.array([[sample[column] for column in FEATURE_COLUMNS]], dtype=np.float64)
    mode_vectors = mode_subset[FEATURE_COLUMNS].values
    mode_similarity = cosine_similarity(sample_vector, mode_vectors)[0]
    top_similarity = float(np.max(mode_similarity))

    subset_means = mode_subset[key_columns].mean()
    subset_stds = mode_subset[key_columns].std(ddof=0).replace(0, 1e-3)
    z_scores = []
    for column in key_columns:
        z_value = abs((sample[column] - float(subset_means[column])) / float(subset_stds[column]))
        z_scores.append(float(z_value))
    average_z = float(np.mean(z_scores))

    # Weighted compatibility score in [0, 1].
    compatibility_score = float(np.clip(0.72 * top_similarity + 0.28 * (1.0 / (1.0 + average_z)), 0.0, 1.0))
    is_compatible = top_similarity >= 0.89 and compatibility_score >= 0.70

    reason = (
        "Sample appears to be outside the selected analysis mode. "
        "Use a clearer, mode-relevant sample (plant leaf, water sample, food item, or medicine/tablet)."
    )
    if is_compatible:
        reason = "Sample appears compatible with the selected analysis mode."

    return is_compatible, compatibility_score, reason


@lru_cache(maxsize=1)
def load_reference_dataset() -> pd.DataFrame:
    data = pd.read_csv(DATA_PATH)
    expected_columns = set(FEATURE_COLUMNS + ["mode", "label", "insight"])
    missing = expected_columns - set(data.columns)
    if missing:
        raise ValueError(f"Reference dataset is missing required columns: {sorted(missing)}")
    return data


def _build_models(x: pd.DataFrame, y: pd.Series) -> tuple[Pipeline, Pipeline]:
    knn_neighbors = min(5, len(x))

    rf = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=220,
                    random_state=42,
                    class_weight="balanced_subsample",
                    min_samples_leaf=1,
                ),
            ),
        ]
    )

    knn = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("model", KNeighborsClassifier(n_neighbors=max(1, knn_neighbors), weights="distance")),
        ]
    )

    rf.fit(x, y)
    knn.fit(x, y)
    return rf, knn


def _merged_probabilities(rf: Pipeline, knn: Pipeline, sample_vector: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    rf_model = rf.named_steps["model"]
    knn_model = knn.named_steps["model"]

    rf_classes = rf_model.classes_
    knn_classes = knn_model.classes_
    all_classes = np.unique(np.concatenate([rf_classes, knn_classes]))

    rf_probs = rf.predict_proba(sample_vector)[0]
    knn_probs = knn.predict_proba(sample_vector)[0]

    merged = np.zeros_like(all_classes, dtype=np.float64)
    for idx, label in enumerate(all_classes):
        if label in rf_classes:
            merged[idx] += 0.6 * rf_probs[np.where(rf_classes == label)[0][0]]
        if label in knn_classes:
            merged[idx] += 0.4 * knn_probs[np.where(knn_classes == label)[0][0]]

    merged = merged / np.sum(merged)
    return all_classes, merged


def classify_sample(sample: Dict[str, float], mode: str) -> ClassificationResult:
    dataset = load_reference_dataset()

    subset = dataset[dataset["mode"] == mode].copy()
    mode_subset = subset.copy()
    if len(subset) < 8:
        subset = dataset.copy()

    x = subset[FEATURE_COLUMNS]
    y = subset["label"]

    rf, knn = _build_models(x, y)

    sample_vector = pd.DataFrame([{column: sample[column] for column in FEATURE_COLUMNS}], columns=FEATURE_COLUMNS)
    classes, probabilities = _merged_probabilities(rf, knn, sample_vector)

    best_index = int(np.argmax(probabilities))
    predicted_label = str(classes[best_index])
    confidence = float(probabilities[best_index])

    similarities = cosine_similarity(sample_vector.values, x.values)[0]
    similarity_order = np.argsort(similarities)[::-1]

    top_matches: List[TopMatch] = []
    seen_labels = set()
    for idx in similarity_order:
        row = subset.iloc[int(idx)]
        label = str(row["label"])
        if label in seen_labels:
            continue
        seen_labels.add(label)
        top_matches.append(
            TopMatch(
                label=label,
                score=float(np.clip(similarities[idx], 0.0, 1.0)),
                mode=str(row["mode"]),
                insight=str(row["insight"]),
            )
        )
        if len(top_matches) >= 3:
            break

    dominant_channel = max(
        [("red", sample["mean_r"]), ("green", sample["mean_g"]), ("blue", sample["mean_b"])],
        key=lambda item: item[1],
    )[0]

    explanation = (
        f"Prediction leans toward '{predicted_label}' with dominant {dominant_channel}-channel response, "
        f"R/G ratio of {sample['rg_ratio']:.2f}, and similarity to curated references in the selected mode."
    )

    what_this_tells_us = CLASS_EXPLANATIONS.get(
        predicted_label,
        "Sample appears closest to this class in the current reference library; treat as a screening-level indication.",
    )

    best_similarity = top_matches[0].score if top_matches else 0.0
    uncertainty_note = _uncertainty_note(confidence=confidence, top_match_score=best_similarity)
    sample_compatible, compatibility_score, compatibility_reason = _compatibility_check(sample=sample, mode_subset=mode_subset)

    return ClassificationResult(
        predicted_class=predicted_label,
        confidence=float(np.clip(confidence, 0.0, 1.0)),
        top_matches=top_matches,
        explanation=explanation,
        what_this_tells_us=what_this_tells_us,
        uncertainty_note=uncertainty_note,
        sample_compatible=sample_compatible,
        compatibility_score=compatibility_score,
        compatibility_reason=compatibility_reason,
    )
