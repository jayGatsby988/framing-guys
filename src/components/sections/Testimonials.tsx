"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";

const testimonials = [
  {
    name: "Maya Rodriguez",
    role: "Graduate Student, University of Michigan",
    avatar: "MR",
    avatarColor: "bg-violet-600",
    quote:
      "As someone with moderate hearing loss, AURA has completely transformed my classroom experience. The live captions are remarkably accurate, and the speaker identification means I always know who's talking. I finally feel like an equal participant in seminars.",
    badge: "Hearing Impairment",
  },
  {
    name: "James Okafor",
    role: "Software Engineer, San Francisco",
    avatar: "JO",
    avatarColor: "bg-blue-600",
    quote:
      "I've been blind since birth and have used countless assistive tools. AURA's Vision Assist is genuinely different — it doesn't just tell me there's a person, it tells me where they are, what direction they're moving, and whether the path is clear. It's given me a new kind of independence.",
    badge: "Vision Impairment",
  },
  {
    name: "Dr. Priya Sharma",
    role: "Accessibility Consultant, London",
    avatar: "PS",
    avatarColor: "bg-emerald-600",
    quote:
      "I recommend AURA to every organization I work with. The Web Overlay feature alone is worth it — clients who previously found the web overwhelming can now browse confidently. The all-in-one approach solves the fragmentation problem I've seen for years.",
    badge: "Accessibility Professional",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative py-24 lg:py-32 bg-[#070709] overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.04) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Stories"
          title="Real impact, real people"
          subtitle="These are illustrative accounts representing the experiences of people who need accessible technology every day. AURA is designed for them."
          align="center"
          id="testimonials-heading"
          className="mb-4"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-[#5A5A6E] mb-12 italic"
        >
          * Testimonials are illustrative composites based on real accessibility challenges, presented for demonstration purposes.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{ y: -4 }}
              className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl p-6 flex flex-col gap-5 hover:border-[#2F2F40] transition-colors"
            >
              <Quote size={24} className="text-indigo-500/40 shrink-0" />

              <p className="text-sm text-[#9898A8] leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-start gap-3 pt-4 border-t border-[#1F1F28]">
                <div
                  className={`w-10 h-10 rounded-full ${t.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F8F8FC]">{t.name}</p>
                  <p className="text-xs text-[#5A5A6E] truncate">{t.role}</p>
                  <Badge variant="muted" className="text-[10px] mt-1.5 py-0.5">
                    {t.badge}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
