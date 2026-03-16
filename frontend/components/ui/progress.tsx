import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ value, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)} {...props}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-lime transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
