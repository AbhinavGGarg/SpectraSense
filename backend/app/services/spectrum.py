from __future__ import annotations

from typing import Dict, List

import numpy as np
from scipy.interpolate import interp1d
from scipy.ndimage import gaussian_filter1d

from app.models.schemas import SpectralPoint


def approximate_spectral_curve(feature_map: Dict[str, float]) -> List[SpectralPoint]:
    b = feature_map["mean_b"]
    g = feature_map["mean_g"]
    r = feature_map["mean_r"]

    anchor_wavelengths = np.array([430, 460, 500, 540, 580, 620, 670], dtype=np.float32)
    anchor_intensities = np.array(
        [
            max(b * 0.95, 0.01),
            b,
            (0.65 * b + 0.35 * g),
            g,
            (0.65 * g + 0.35 * r),
            r,
            max(r * 0.85, 0.01),
        ],
        dtype=np.float32,
    )

    interpolate = interp1d(anchor_wavelengths, anchor_intensities, kind="quadratic")
    dense_wavelengths = np.arange(430, 671, 5, dtype=np.float32)
    dense_intensity = interpolate(dense_wavelengths)
    smooth = gaussian_filter1d(dense_intensity, sigma=1.2)

    normalized = (smooth - smooth.min()) / (smooth.max() - smooth.min() + 1e-8)

    return [
        SpectralPoint(wavelength=int(wavelength), intensity=float(value))
        for wavelength, value in zip(dense_wavelengths.tolist(), normalized.tolist())
    ]
