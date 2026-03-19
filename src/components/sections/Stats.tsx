"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
  color: string;
}

const stats: StatItem[] = [
  {
    value: 2.2,
    suffix: "B+",
    label: "People with vision impairment",
    sublabel: "worldwide — a number growing every year",
    color: "text-violet-400",
  },
  {
    value: 430,
    suffix: "M+",
    label: "People with hearing loss",
    sublabel: "affecting 1 in 20 people globally",
    color: "text-blue-400",
  },
  {
    value: 97.4,
    suffix: "%",
    label: "Of websites fail accessibility tests",
    sublabel: "making most of the web inaccessible",
    color: "text-red-400",
  },
  {
    value: 71,
    suffix: "%",
    label: "Leave inaccessible sites immediately",
    sublabel: "representing $6.9B in lost revenue",
    color: "text-amber-400",
  },
];

function AnimatedNumber({
  value,
  suffix,
  color,
}: {
  value: number;
  suffix: string;
  color: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayed(current);

      if (step >= steps) {
        setDisplayed(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, value]);

  const formatted =
    displayed < 10
      ? displayed.toFixed(1)
      : Math.round(displayed).toString();

  return (
    <span ref={ref} className={`text-5xl sm:text-6xl font-bold ${color}`}>
      {formatted}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section
      id="stats"
      aria-labelledby="stats-heading"
      className="relative py-24 lg:py-32 bg-[#0F0F12] overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="The Scale"
          title="The numbers that drive our mission"
          subtitle="These aren't just statistics. They represent real people whose lives are limited by a lack of accessible technology."
          align="center"
          id="stats-heading"
          className="mb-16"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl p-6 text-center hover:border-[#2F2F40] transition-colors"
            >
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                color={stat.color}
              />
              <h3 className="text-sm font-semibold text-[#F8F8FC] mt-3 mb-1">
                {stat.label}
              </h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                {stat.sublabel}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-[#9898A8] mt-12 max-w-xl mx-auto"
        >
          AURA exists to change these numbers. One accessible experience at a time.
        </motion.p>
      </div>
    </section>
  );
}

export default Stats;
