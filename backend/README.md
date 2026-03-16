# SpectraSense Backend

FastAPI backend implementing image-based computational spectroscopy approximation.

## Modules

- `app/main.py`: API app and CORS setup
- `app/routes/analyze.py`: analysis endpoint
- `app/services/preprocess.py`: image preprocessing + ROI extraction
- `app/services/features.py`: feature engineering + histograms
- `app/services/spectrum.py`: RGB-to-spectrum approximation
- `app/services/classify.py`: ML classification + similarity matching
- `app/models/schemas.py`: pydantic schemas
- `app/data/reference_dataset.csv`: curated MVP reference signatures
- `app/utils/image_utils.py`: image loading utilities

## API

### `POST /api/analyze`

Multipart form data:

- `file`: image file
- `mode`: one of
  - `plant_health`
  - `water_sample`
  - `food_freshness`
  - `medicine_tablet`

Returns structured response with:

- metadata
- preprocessing summary
- extracted features
- histogram data
- approximate spectral curve
- predicted class + confidence
- top reference matches
- explanation, uncertainty note, and limitations

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
