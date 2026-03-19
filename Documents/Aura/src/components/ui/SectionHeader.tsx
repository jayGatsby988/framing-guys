"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  gradient?: boolean;
  align?: "left" | "center";
  id?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  gradient = false,
  align = "center",
  id,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Badge variant="accent">{badge}</Badge>
        </motion.div>
      )}

      <motion.h2
        id={id}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: 0.6,
          delay: badge ? 0.1 : 0,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-balance",
          gradient ? "gradient-text" : "text-[#F8F8FC]"
        )}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.6,
            delay: badge ? 0.2 : 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className={cn(
            "text-lg text-[#9898A8] leading-relaxed max-w-2xl text-balance",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export default SectionHeader;
