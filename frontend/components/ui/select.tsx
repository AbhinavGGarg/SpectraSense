import * as React from "react";
import { cn } from "@/lib/utils";

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ label: string; value: string }>;
}

export function Select({ className, options, ...props }: NativeSelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/70",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
