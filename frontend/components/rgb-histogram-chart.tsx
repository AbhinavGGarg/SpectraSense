"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { HistogramSet } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RGBHistogramChartProps {
  data: HistogramSet[];
}

export function RGBHistogramChart({ data }: RGBHistogramChartProps) {
  const grouped = Array.from({ length: 16 }, (_, index) => {
    const current = data.filter((item) => item.bin === index);
    const byChannel = Object.fromEntries(current.map((item) => [item.channel, item.value])) as Record<string, number>;

    return {
      bin: index,
      r: byChannel.r ?? 0,
      g: byChannel.g ?? 0,
      b: byChannel.b ?? 0
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>RGB Channel Histogram</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="bin" stroke="#cbd5e1" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
              <YAxis stroke="#cbd5e1" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 12 }}
              />
              <Legend wrapperStyle={{ color: "#e2e8f0" }} />
              <Bar dataKey="r" fill="#fb7185" name="Red" radius={[3, 3, 0, 0]} />
              <Bar dataKey="g" fill="#4ade80" name="Green" radius={[3, 3, 0, 0]} />
              <Bar dataKey="b" fill="#60a5fa" name="Blue" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
