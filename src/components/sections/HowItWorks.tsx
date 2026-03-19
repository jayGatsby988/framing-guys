"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, Brain, Settings2, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Capture",
    description:
      "AURA listens to lectures, reads whiteboards, and captures classroom content in real-time using your device's microphone and camera.",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
  {
    number: "02",
    icon: Brain,
    title: "Process",
    description:
      "AI models transcribe speech, recognize text in images, identify key concepts, and structure the content for easy learning and review.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    number: "03",
    icon: Settings2,
    title: "Personalize",
    description:
      "Content adapts to each student's needs — larger text, high contrast, audio descriptions, simplified language, or whatever makes learning accessible.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Deliver",
    description:
      "Students receive captions, notes, summaries, and study materials through their preferred format — text, audio, or visual overlays.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative py-24 lg:py-32 bg-[#0F0F12] overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none grid-pattern opacity-30"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="How It Works"
          title="From lecture hall to study session"
          subtitle="AURA's AI pipeline captures classroom content, processes it intelligently, personalizes it for your needs, and delivers it in the format that works best for you."
          align="center"
          id="how-it-works-heading"
          className="mb-20"
        />

        {/* Steps */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              className="h-full origin-left"
              style={{
                background: "linear-gradient(90deg, #6366F1, #818CF8, #A78BFA, #34D399)",
              }}
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="relative"
                >
                  {/* Number/Icon badge */}
                  <div className="relative z-10 flex flex-col items-start lg:items-center text-left lg:text-center">
                    <div className="relative mb-6">
                      <div
                        className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center`}
                      >
                        <Icon size={28} className={step.color} />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0F0F12] border border-[#1F1F28] flex items-center justify-center text-[10px] font-bold text-[#5A5A6E]">
                        {step.number.replace("0", "")}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#F8F8FC] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#9898A8] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
