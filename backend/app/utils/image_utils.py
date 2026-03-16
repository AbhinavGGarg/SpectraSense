from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np


@dataclass
class LoadedImage:
    bgr: np.ndarray
    width: int
    height: int


class UnsupportedImageError(ValueError):
    pass


def load_image_from_bytes(content: bytes) -> LoadedImage:
    array = np.frombuffer(content, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise UnsupportedImageError("Unable to decode uploaded image. Please use PNG or JPEG.")

    height, width = image.shape[:2]
    return LoadedImage(bgr=image, width=width, height=height)


def bgr_to_rgb(image: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


def rgb_to_bgr(image: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
