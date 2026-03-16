from __future__ import annotations

from typing import Dict, List

import cv2
import numpy as np

from app.models.schemas import ExtractedFeatures, FeatureVector, HistogramBin, HSVMean, LabMean

FEATURE_COLUMNS = [
    "mean_r",
    "mean_g",
    "mean_b",
    "std_r",
    "std_g",
    "std_b",
    "norm_r",
    "norm_g",
    "norm_b",
    "rg_ratio",
    "rb_ratio",
    "gb_ratio",
    "intensity_mean",
    "intensity_std",
    "h_mean",
    "s_mean",
    "v_mean",
    "l_mean",
    "a_mean",
    "b2_mean",
]


def _channel_stats(rgb: np.ndarray) -> Dict[str, float]:
    pixels = rgb.reshape(-1, 3).astype(np.float32) / 255.0
    means = pixels.mean(axis=0)
    stds = pixels.std(axis=0)

    r_mean, g_mean, b_mean = means.tolist()
    r_std, g_std, b_std = stds.tolist()

    channel_sum = r_mean + g_mean + b_mean + 1e-8
    return {
        "mean_r": float(r_mean),
        "mean_g": float(g_mean),
        "mean_b": float(b_mean),
        "std_r": float(r_std),
        "std_g": float(g_std),
        "std_b": float(b_std),
        "norm_r": float(r_mean / channel_sum),
        "norm_g": float(g_mean / channel_sum),
        "norm_b": float(b_mean / channel_sum),
        "rg_ratio": float(r_mean / (g_mean + 1e-6)),
        "rb_ratio": float(r_mean / (b_mean + 1e-6)),
        "gb_ratio": float(g_mean / (b_mean + 1e-6)),
    }


def _intensity_stats(rgb: np.ndarray) -> Dict[str, float]:
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    return {
        "intensity_mean": float(np.mean(gray)),
        "intensity_std": float(np.std(gray)),
    }


def _color_space_stats(rgb: np.ndarray) -> Dict[str, float]:
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)

    h_mean = np.mean(hsv[:, :, 0]) / 179.0
    s_mean = np.mean(hsv[:, :, 1]) / 255.0
    v_mean = np.mean(hsv[:, :, 2]) / 255.0

    l_mean = np.mean(lab[:, :, 0]) / 255.0
    a_mean = (np.mean(lab[:, :, 1]) - 128.0) / 127.0
    b2_mean = (np.mean(lab[:, :, 2]) - 128.0) / 127.0

    return {
        "h_mean": float(h_mean),
        "s_mean": float(s_mean),
        "v_mean": float(v_mean),
        "l_mean": float(l_mean),
        "a_mean": float(a_mean),
        "b2_mean": float(b2_mean),
    }


def _histograms(rgb: np.ndarray, bins: int = 16) -> List[HistogramBin]:
    hist_records: List[HistogramBin] = []
    wavelength_lookup = {"r": 620, "g": 540, "b": 460}

    for idx, channel in enumerate(["r", "g", "b"]):
        values = rgb[:, :, idx]
        hist, _ = np.histogram(values, bins=bins, range=(0, 256))
        hist_norm = hist.astype(np.float32) / float(np.sum(hist) + 1e-8)

        for bin_index, bin_value in enumerate(hist_norm.tolist()):
            hist_records.append(
                HistogramBin(
                    channel=channel,
                    bin=bin_index,
                    wavelengthHint=wavelength_lookup[channel],
                    value=float(bin_value),
                )
            )

    return hist_records


def extract_features(rgb_roi: np.ndarray) -> ExtractedFeatures:
    channel = _channel_stats(rgb_roi)
    intensity = _intensity_stats(rgb_roi)
    color_space = _color_space_stats(rgb_roi)

    combined = {**channel, **intensity, **color_space}

    vector_for_model = {column: float(combined[column]) for column in FEATURE_COLUMNS}

    feature_vector = FeatureVector(
        mean_r=combined["mean_r"],
        mean_g=combined["mean_g"],
        mean_b=combined["mean_b"],
        std_r=combined["std_r"],
        std_g=combined["std_g"],
        std_b=combined["std_b"],
        norm_r=combined["norm_r"],
        norm_g=combined["norm_g"],
        norm_b=combined["norm_b"],
        rg_ratio=combined["rg_ratio"],
        rb_ratio=combined["rb_ratio"],
        gb_ratio=combined["gb_ratio"],
        intensity_mean=combined["intensity_mean"],
        intensity_std=combined["intensity_std"],
        hsv_mean=HSVMean(h=combined["h_mean"], s=combined["s_mean"], v=combined["v_mean"]),
        lab_mean=LabMean(l=combined["l_mean"], a=combined["a_mean"], b=combined["b2_mean"]),
    )

    return ExtractedFeatures(
        feature_vector=feature_vector,
        histograms=_histograms(rgb_roi),
        vector_for_model=vector_for_model,
    )
