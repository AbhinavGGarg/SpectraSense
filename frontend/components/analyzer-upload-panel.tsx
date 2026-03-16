"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Loader2, Upload } from "lucide-react";
import { AnalysisMode } from "@/types/analysis";
import { AnalysisModeSelector } from "@/components/analysis-mode-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AnalyzerUploadPanelProps {
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
}

const sampleImages = [
  { label: "Plant Sample", path: "/samples/plant-chlorosis-like.png" },
  { label: "Water Sample", path: "/samples/water-turbid-like.png" },
  { label: "Food Sample", path: "/samples/food-ripening-like.png" },
  { label: "Tablet Sample", path: "/samples/tablet-mismatch-like.png" }
];

function dataUrlToFile(dataUrl: string, fileName: string) {
  const [meta, content] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(content);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], fileName, { type: mime });
}

export function AnalyzerUploadPanel({
  mode,
  onModeChange,
  selectedFile,
  previewUrl,
  onFileSelected,
  onAnalyze,
  loading,
  error
}: AnalyzerUploadPanelProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const canAnalyze = useMemo(() => Boolean(selectedFile) && !loading, [selectedFile, loading]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const onInputFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraOpen(false);
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    const file = dataUrlToFile(dataUrl, `spectrasense-capture-${Date.now()}.png`);
    onFileSelected(file);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const loadSampleImage = async (path: string) => {
    const response = await fetch(path);
    const blob = await response.blob();
    const name = path.split("/").pop() ?? "sample.png";
    const file = new File([blob], name, { type: blob.type || "image/png" });
    onFileSelected(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Analyzer</CardTitle>
        <CardDescription>
          Upload or capture a sample, choose domain context, and run optical analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Analysis Mode</p>
            <AnalysisModeSelector value={mode} onChange={onModeChange} />
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Upload Image</p>
            <Input type="file" accept="image/*" onChange={onInputFile} />
          </div>
          <div className="self-end">
            <Button onClick={onAnalyze} disabled={!canAnalyze} className="w-full lg:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={openCamera}>
            <Camera className="mr-2 h-4 w-4" />
            {cameraOpen ? "Camera Active" : "Capture with Webcam"}
          </Button>
          {sampleImages.map((sample) => (
            <Button key={sample.path} variant="ghost" size="sm" onClick={() => loadSampleImage(sample.path)}>
              <ImagePlus className="mr-2 h-4 w-4" />
              {sample.label}
            </Button>
          ))}
        </div>

        {cameraOpen && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl border border-white/10" />
            <Button onClick={captureFrame}>Capture Frame</Button>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {previewUrl && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Current Sample Preview</p>
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/10">
              <Image src={previewUrl} alt="Selected sample preview" fill className="object-cover" />
            </div>
            <p className="mt-2 truncate text-xs text-slate-300">{selectedFile?.name ?? "sample-image"}</p>
          </div>
        )}

        {error && <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
      </CardContent>
    </Card>
  );
}
