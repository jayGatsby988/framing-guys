"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, Captions, AudioLines, Globe, Mic, Bot } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";

const features = [
  {
    icon: Eye,
    title: "Vision Assist",
    description:
      "Real-time AI-powered scene understanding that describes your surroundings, reads text, identifies objects, and guides navigation with natural language.",
    tag: "Computer Vision",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    gradient: "from-violet-600/20 to-transparent",
  },
  {
    icon: Captions,
    title: "Live Captions",
    description:
      "Real-time speech-to-text transcription with speaker differentiation, sound event detection, and support for 40+ languages.",
    tag: "Speech Recognition",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    gradient: "from-blue-600/20 to-transparent",
  },
  {
    icon: AudioLines,
    title: "Audio Tools",
    description:
      "Convert any audio content — meetings, podcasts, videos — into searchable text with key highlight extraction and smart summaries.",
    tag: "Audio Processing",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    gradient: "from-cyan-600/20 to-transparent",
  },
  {
    icon: Globe,
    title: "Web Overlay",
    description:
      "Instantly improve any website's accessibility with one click — enhanced contrast, resizable text, keyboard navigation, and alt text.",
    tag: "Browser Extension",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    gradient: "from-indigo-600/20 to-transparent",
  },
  {
    icon: Mic,
    title: "Voice Control",
    description:
      "Navigate apps, browse the web, and control your device with natural spoken commands — hands-free and fully customizable.",
    tag: "Voice Interface",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    gradient: "from-emerald-600/20 to-transparent",
  },
  {
    icon: Bot,
    title: "AI Companion",
    description:
      "Your always-available intelligent assistant that answers questions, reads content, describes images, and guides you through any task.",
    tag: "AI Assistant",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    gradient: "from-amber-600/20 to-transparent",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export function FeaturesOverview() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative py-24 lg:py-32 bg-[#070709]"
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Capabilities"
          title="Everything you need, in one platform"
          subtitle="AURA integrates six powerful accessibility tools into a single, seamless experience. No switching between apps. No compromises."
          align="center"
          id="features-heading"
          className="mb-16"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 60px rgba(99, 102, 241, 0.08)",
                }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-2xl bg-[#0F0F12] border border-[#1F1F28] hover:border-[#2F2F40] p-6 overflow-hidden group cursor-default transition-colors`}
              >
                {/* Gradient accent corner */}
                <div
                  className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl bg-gradient-to-bl ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`inline-flex p-2.5 rounded-xl ${feature.bgColor} border ${feature.borderColor}`}
                    >
                      <Icon size={22} className={feature.color} />
                    </div>
                    <Badge variant="muted" className="text-[11px]">
                      {feature.tag}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-[#F8F8FC] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#9898A8] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesOverview;
