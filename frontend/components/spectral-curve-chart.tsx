"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { SpectralPoint } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpectralCurveChartProps {
  data: SpectralPoint[];
}

export function SpectralCurveChart({ data }: SpectralCurveChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approximate Spectral Signature (RGB-Derived)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis
                dataKey="wavelength"
                stroke="#cbd5e1"
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
              />
              <YAxis
                stroke="#cbd5e1"
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                domain={[0, 1]}
                label={{ value: "Normalized Intensity", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#67e8f9" }}
              />
              <Line type="monotone" dataKey="intensity" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-slate-300">
          This curve is an approximation interpolated from smartphone RGB response and not a full-resolution laboratory spectrum.
        </p>
      </CardContent>
    </Card>
  );
}
