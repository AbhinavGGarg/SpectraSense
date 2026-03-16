from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="SpectraSense API",
    version="0.1.0",
    description=(
        "Computational spectroscopy MVP API for smartphone-image-based, approximate optical analysis. "
        "Educational and early-screening use only."
    ),
)

origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allow_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "SpectraSense API",
        "message": "Portable computational spectroscopy backend is running.",
    }
