import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "muted" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#141418] border border-[#1F1F28] text-[#9898A8]",
  accent:
    "bg-indigo-600/10 border border-indigo-500/30 text-indigo-400",
  success:
    "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
  warning:
    "bg-amber-500/10 border border-amber-500/30 text-amber-400",
  muted: "bg-[#0F0F12] border border-[#1F1F28] text-[#5A5A6E]",
  outline: "bg-transparent border border-[#1F1F28] text-[#9898A8]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[#9898A8]",
  accent: "bg-indigo-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  muted: "bg-[#5A5A6E]",
  outline: "bg-[#9898A8]",
};

export function Badge({
  variant = "default",
  className,
  children,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 animate-pulse",
            dotColors[variant]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
