import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
      neutral: "border-slate-300/20 bg-slate-500/10 text-slate-200",
      success: "border-lime-300/30 bg-lime-300/10 text-lime-100"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
