"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, FlaskConical, BookOpen, Globe } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";

const useCases = [
  {
    icon: GraduationCap,
    context: "In the Lecture Hall",
    title: "Never miss a word in class",
    description:
      "Students with hearing impairments get real-time captions of lectures and discussions. AURA automatically generates structured notes with key points and summaries, so students can focus on learning — not scrambling to keep up.",
    mockUI: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F0F12] border border-[#1F1F28]">
          <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
            <span className="text-[10px]">🎙</span>
          </div>
          <div className="flex-1">
            <div className="h-1.5 w-full bg-[#1F1F28] rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-violet-500 rounded-full" />
            </div>
          </div>
          <span className="text-[9px] text-[#5A5A6E]">Live</span>
        </div>
        <p className="text-[10px] text-[#9898A8] px-1 leading-relaxed">
          &quot;The key principle of cellular respiration is that glucose molecules are broken down...&quot;
        </p>
        <div className="text-[10px] text-[#5A5A6E] px-1">✓ AI Notes generated • 3 key points • Summary ready</div>
      </div>
    ),
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    badgeVariant: "muted" as const,
  },
  {
    icon: FlaskConical,
    context: "In the Lab",
    title: "See every detail clearly",
    description:
      "Vision-impaired students can read lab instructions, identify equipment labels, and follow step-by-step procedures with AI vision assistance. AURA reads what you can't — so you can participate fully in hands-on learning.",
    mockUI: (
      <div className="space-y-1.5">
        <div className="relative h-16 rounded-lg bg-[#080810] border border-[#1F1F28] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔬</div>
          <div className="absolute bottom-1 left-1 right-1">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70" />
          </div>
        </div>
        <div className="space-y-1">
          {[
            { icon: "✓", text: "Reading: 'NaCl 0.9% Solution'", c: "text-emerald-400" },
            { icon: "ℹ", text: "Step 4 of 6: Add 5mL to beaker", c: "text-blue-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px]">
              <span className={item.c}>{item.icon}</span>
              <span className="text-[#9898A8]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    badgeVariant: "muted" as const,
  },
  {
    icon: BookOpen,
    context: "Study Sessions",
    title: "Study smarter, not harder",
    description:
      "AURA turns recorded lectures into searchable study guides with AI-generated flashcards, summaries, and highlighted key concepts. Students with any disability can review at their own pace in their preferred format.",
    mockUI: (
      <div className="space-y-1.5">
        {[
          { name: "P", color: "bg-violet-500", text: "Lecture: Cellular Respiration (47 min)" },
          { name: "AI", color: "bg-emerald-500", text: "12 key concepts • 8 flashcards generated" },
        ].map((msg, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className={`w-4 h-4 rounded-full ${msg.color} flex items-center justify-center text-[9px] text-white font-bold shrink-0 mt-0.5`}>
              {msg.name}
            </div>
            <p className="text-[10px] text-[#9898A8] leading-relaxed">{msg.text}</p>
          </div>
        ))}
        <div className="mt-2 p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400">
          Study guide exported • Ready for review
        </div>
      </div>
    ),
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    badgeVariant: "muted" as const,
  },
  {
    icon: Globe,
    context: "Online Courses",
    title: "Every LMS, fully accessible",
    description:
      "AURA's browser extension instantly transforms Canvas, Blackboard, Coursera, and any learning platform — improving contrast, enlarging text, adding keyboard navigation, and generating alt text for every image.",
    mockUI: (
      <div className="space-y-1.5">
        <div className="p-2 rounded-lg bg-[#0F0F12] border border-[#1F1F28] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Globe size={10} className="text-indigo-400" />
            <span className="text-[9px] text-indigo-400">AURA Active on Canvas</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {["High Contrast", "Large Text", "Screen Reader"].map((feat) => (
              <div key={feat} className="bg-indigo-600/10 border border-indigo-500/20 rounded p-1 text-center">
                <span className="text-[8px] text-indigo-300">{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[9px] text-[#5A5A6E] px-1">3 accessibility improvements applied</p>
      </div>
    ),
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    badgeVariant: "muted" as const,
  },
];

export function UseCases() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-heading"
      className="relative py-24 lg:py-32 bg-[#070709] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Campus Life"
          title="Designed for how students actually learn"
          subtitle="AURA meets students where they are — in lecture halls, labs, study sessions, and online courses. Real education scenarios, real accessibility solutions."
          align="center"
          id="use-cases-heading"
          className="mb-16"
        />

        <div className="grid sm:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -4 }}
                className={`relative bg-[#0F0F12] border ${useCase.borderColor} rounded-2xl p-6 overflow-hidden group`}
              >
                {/* Background glow */}
                <div
                  className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl ${useCase.bgColor} opacity-20 group-hover:opacity-40 transition-opacity`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`inline-flex p-2 rounded-xl ${useCase.bgColor} border ${useCase.borderColor}`}>
                      <Icon size={18} className={useCase.color} />
                    </div>
                    <Badge variant="muted" className="text-[10px]">
                      {useCase.context}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-[#F8F8FC] mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-[#9898A8] leading-relaxed mb-5">
                    {useCase.description}
                  </p>

                  {/* Mock UI */}
                  <div className={`bg-[#141418] border border-[#1F1F28] rounded-xl p-3`}>
                    {useCase.mockUI}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default UseCases;
