# SpectraSense Frontend

Next.js App Router frontend for the SpectraSense MVP.

## Features

- Mission-driven scientific landing page
- Problem, mission, and pipeline storytelling sections
- Live analyzer panel (upload, webcam capture, sample images)
- Recharts visualizations:
  - approximate spectral curve
  - RGB histogram
- Structured results panels:
  - prediction + confidence
  - top reference matches
  - feature summary
  - scientific interpretation
  - transparent limitations

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Environment:

- `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`)
