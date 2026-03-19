"use client";

import React from "react";
import { motion } from "framer-motion";
import { Keyboard, Eye, Volume2, Minimize2, Shield, Check } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const commitments = [
  {
    icon: Shield,
    title: "WCAG 2.1 AA Compliant",
    description:
      "This website meets or exceeds Web Content Accessibility Guidelines 2.1 Level AA standards across all pages.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
  },
  {
    icon: Eye,
    title: "Screen Reader Optimized",
    description:
      "Fully compatible with NVDA, VoiceOver, JAWS, and TalkBack. All content has proper semantic markup and ARIA labels.",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
  {
    icon: Keyboard,
    title: "Full Keyboard Navigation",
    description:
      "Every interactive element is reachable and operable by keyboard alone. Tab order is logical and skip links are provided.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Minimize2,
    title: "Reduced Motion Support",
    description:
      "Respects the `prefers-reduced-motion` media query. All animations and transitions are disabled when requested.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: Volume2,
    title: "High Contrast Support",
    description:
      "All text meets minimum contrast ratios. High contrast mode is available and properly supported throughout.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    icon: Check,
    title: "Tested with Real Users",
    description:
      "Our accessibility features are validated by people with disabilities, not just automated tools. Real feedback drives real improvements.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
  },
];

export function AccessibilityCommitment() {
  return (
    <section
      id="accessibility"
      aria-labelledby="accessibility-heading"
      className="relative py-24 lg:py-32 bg-[#0F0F12] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Our Commitment"
          title="We build for every learner — including on this website"
          subtitle="AURA doesn't just talk about accessible education. Our own platform is a living demonstration of what inclusive learning technology looks like in practice."
          align="center"
          id="accessibility-heading"
          className="mb-16"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {commitments.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={`bg-[#0F0F12] border ${item.borderColor} rounded-2xl p-5 hover:shadow-lg transition-shadow`}
              >
                <div
                  className={`inline-flex p-2 rounded-xl ${item.bgColor} border ${item.borderColor} mb-4`}
                >
                  <Icon size={18} className={item.color} />
                </div>
                <h3 className="text-sm font-bold text-[#F8F8FC] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#9898A8] leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Statement */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-[#0F0F12] border border-indigo-500/20 rounded-2xl px-8 py-5">
            <p className="text-sm text-[#9898A8] max-w-2xl">
              Found an accessibility issue on this site?{" "}
              <button
                className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
                onClick={() => {
                  const el = document.getElementById("contact");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Please let us know
              </button>
              . We take every report seriously and commit to resolving issues within 72 hours.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AccessibilityCommitment;
