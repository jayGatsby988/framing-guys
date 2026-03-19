"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "glass" | "elevated" | "bordered";

interface CardProps {
  variant?: CardVariant;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-[#0F0F12] border border-[#1F1F28]",
  glass:
    "bg-[#0F0F12]/70 backdrop-blur-xl border border-[#1F1F28]/80 shadow-xl",
  elevated: "bg-[#141418] border border-[#1F1F28] shadow-2xl",
  bordered:
    "bg-[#0F0F12] border-2 border-indigo-500/20 shadow-lg shadow-indigo-600/5",
};

export function Card({
  variant = "default",
  hover = true,
  className,
  children,
  onClick,
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: "0 20px 60px rgba(99, 102, 241, 0.10)",
              borderColor: "rgba(99, 102, 241, 0.25)",
            }
          : {}
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl overflow-hidden",
        onClick && "cursor-pointer",
        variantClasses[variant],
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)}>{children}</div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-6 pb-6", className)}>{children}</div>;
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-6 pb-6 pt-4 border-t border-[#1F1F28]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;
