from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

from app.utils.image_utils import bgr_to_rgb, rgb_to_bgr


@dataclass
class PreprocessResult:
    rgb_full: np.ndarray
    rgb_roi: np.ndarray
    resized: bool
    roi_strategy: str


def resize_long_edge(image: np.ndarray, max_edge: int = 720) -> tuple[np.ndarray, bool]:
    h, w = image.shape[:2]
    long_edge = max(h, w)
    if long_edge <= max_edge:
        return image, False

    scale = max_edge / float(long_edge)
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, True


def gray_world_white_balance(bgr: np.ndarray) -> np.ndarray:
    channels = cv2.split(bgr.astype(np.float32))
    means = [np.mean(channel) for channel in channels]
    gray_mean = np.mean(means)
    balanced = []

    for channel, mean in zip(channels, means):
        scale = gray_mean / (mean + 1e-6)
        balanced.append(np.clip(channel * scale, 0, 255))

    merged = cv2.merge(balanced)
    return merged.astype(np.uint8)


def extract_roi(rgb: np.ndarray) -> tuple[np.ndarray, str]:
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    saturation = hsv[:, :, 1]
    value = hsv[:, :, 2]

    _, sat_mask = cv2.threshold(saturation, 35, 255, cv2.THRESH_BINARY)
    _, val_mask = cv2.threshold(value, 30, 255, cv2.THRESH_BINARY)
    mask = cv2.bitwise_and(sat_mask, val_mask)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        largest = max(contours, key=cv2.contourArea)
        area_ratio = cv2.contourArea(largest) / float(rgb.shape[0] * rgb.shape[1])

        if area_ratio > 0.08:
            x, y, w, h = cv2.boundingRect(largest)
            pad_x = max(int(0.05 * w), 4)
            pad_y = max(int(0.05 * h), 4)
            x0 = max(x - pad_x, 0)
            y0 = max(y - pad_y, 0)
            x1 = min(x + w + pad_x, rgb.shape[1])
            y1 = min(y + h + pad_y, rgb.shape[0])
            return rgb[y0:y1, x0:x1], "saturation-threshold-ROI"

    h, w = rgb.shape[:2]
    crop_h = int(h * 0.6)
    crop_w = int(w * 0.6)
    y0 = (h - crop_h) // 2
    x0 = (w - crop_w) // 2
    return rgb[y0 : y0 + crop_h, x0 : x0 + crop_w], "central-crop-fallback"


def preprocess_image(bgr_image: np.ndarray) -> PreprocessResult:
    resized_image, resized = resize_long_edge(bgr_image)
    balanced = gray_world_white_balance(resized_image)
    denoised = cv2.GaussianBlur(balanced, (5, 5), 0)

    rgb_full = bgr_to_rgb(denoised)
    rgb_roi, strategy = extract_roi(rgb_full)

    if rgb_roi.size == 0:
        rgb_roi = rgb_full
        strategy = "full-image-fallback"

    return PreprocessResult(
        rgb_full=rgb_full,
        rgb_roi=rgb_roi,
        resized=resized,
        roi_strategy=strategy,
    )
