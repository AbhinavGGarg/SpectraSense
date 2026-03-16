# SpectraSense

Portable computational spectroscopy MVP that explores how smartphone images can be used for low-cost, approximate chemical and material analysis.

## Project Overview

SpectraSense is a STEM-heavy hackathon product demonstrating an end-to-end scientific workflow:

1. Capture or upload a sample image.
2. Preprocess the image using computer vision.
3. Extract interpretable optical features.
4. Estimate an RGB-derived spectral signature.
5. Compare against a reference dataset.
6. Predict likely material class with confidence and similarity context.
7. Explain results and limitations transparently.

This is not presented as a certified lab analyzer. It is an educational and engineering-focused MVP for early screening and scientific accessibility.

## The Problem

High-value analysis in agriculture, water safety, food quality, and counterfeit awareness is often expensive, centralized, and slow. Traditional instrumentation is powerful but not always available in field settings.

## Why It Matters

When actionable science is hard to access, people miss early signals. A portable approach based on consumer hardware can lower barriers and increase scientific awareness, especially in low-resource contexts.

## Mission and Passion

We are deeply motivated by the intersection of optics, chemistry, machine learning, and software engineering. SpectraSense was built from the belief that scientific insight should not remain locked in expensive labs.

## STEM Disciplines Involved

- Physics
- Chemistry
- Optics
- Spectroscopy
- Analytical Science
- Signal Processing
- Computer Vision
- Machine Learning
- Software Engineering

## Scientific Foundation

Spectroscopy studies how matter interacts with light. Different materials absorb/reflect light differently and create characteristic patterns. Smartphone cameras capture broad RGB responses, not high-resolution spectra, but those responses still contain coarse optical information.

SpectraSense uses computational methods to estimate an interpretable, approximate spectral signature from RGB data and compare that signature to curated references.

## MVP Scope

Focused on one high-quality end-to-end workflow:

- Storytelling around scientific accessibility
- Live sample analysis flow
- Interpretable computational pipeline
- Classification + similarity outputs
- Scientific explanation + limitations

No auth, billing, dashboards, or unnecessary platform complexity.

## Tech Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn-style component system
- Recharts
- Lucide Icons

### Backend

- FastAPI
- OpenCV
- NumPy
- SciPy
- scikit-learn
- pandas
- pydantic
- uvicorn

## Architecture

```text
spectrasense/
  frontend/
    app/
    components/
    lib/
    types/
    public/samples/
  backend/
    app/
      routes/
      services/
      models/
      data/
      utils/
```

## Analysis Pipeline

1. `POST /api/analyze` receives image + analysis mode.
2. Preprocessing:
   - Resize (if needed)
   - Gray-world white balance
   - Gaussian denoise
   - ROI detection (saturation-threshold with central-crop fallback)
3. Feature extraction:
   - RGB mean/std
   - normalized channel proportions
   - channel ratios
   - intensity metrics
   - HSV and Lab summary features
   - per-channel histograms
4. Spectral approximation:
   - map RGB anchors to visible wavelength regions
   - interpolate and smooth coarse spectral curve
5. Classification and matching:
   - reference dataset filter by mode
   - RandomForest + KNN ensemble probabilities
   - cosine similarity top matches
6. Result packaging:
   - class, confidence, top matches
   - curve and histogram data for visualization
   - explanation, uncertainty note, limitations

## Limitations (Scientific Honesty)

- RGB-derived approximation, not full laboratory spectroscopy.
- Strong sensitivity to lighting, camera quality, and framing.
- Not a medical, regulatory, or certified laboratory tool.
- Intended for education, curiosity-driven analysis, and early-screening support.

## Future Improvements

- Controlled illumination protocol and calibration cards
- Larger and experimentally collected reference datasets
- Better segmentation for sample isolation
- Sensor fusion and optional low-cost diffraction attachments
- Active learning for domain-specific improvements

## Run Locally

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Flow

1. Start with problem and mission sections.
2. Explain RGB-based spectroscopy approximation.
3. Use sample image or webcam capture.
4. Run analysis.
5. Walk through spectral chart, histograms, and top matches.
6. Emphasize interpretation, uncertainty, and limitations.
7. Close with impact vision on democratized scientific sensing.
