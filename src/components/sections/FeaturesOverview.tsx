"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, Captions, AudioLines, Globe, Mic, Bot } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";

const features = [
  {
    icon: Captions,
    title: "Lecture Captions",
    description:
      "Real-time speech-to-text that captures every word of lectures, discussions, and Q&A — with speaker labels so you always know who's talking. Inspired by AccessHear.",
    tag: "Live Transcription",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    gradient: "from-blue-600/20 to-transparent",
  },
  {
    icon: Bot,
    title: "AI Lecture Notes",
    description:
      "Record lectures and let AI generate structured notes with key points, summaries, and action items. Never miss important content — even if you can't write fast enough.",
    tag: "Smart Notes",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    gradient: "from-amber-600/20 to-transparent",
  },
  {
    icon: Eye,
    title: "Vision Assist",
    description:
      "AI-powered reading of whiteboards, textbooks, slides, and lab materials. Describes diagrams, reads small print, and helps visually impaired students access all classroom content.",
    tag: "Classroom Vision",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    gradient: "from-violet-600/20 to-transparent",
  },
  {
    icon: AudioLines,
    title: "Study Audio Tools",
    description:
      "Convert recorded lectures, podcasts, and study materials into searchable text with AI-extracted highlights, flashcard generation, and smart study summaries.",
    tag: "Audio Learning",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    gradient: "from-cyan-600/20 to-transparent",
  },
  {
    icon: Globe,
    title: "Accessible Web Learning",
    description:
      "Make any online course, LMS, or educational website instantly accessible — enhanced contrast, readable fonts, keyboard nav, and alt text for every image.",
    tag: "Browser Extension",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    gradient: "from-indigo-600/20 to-transparent",
  },
  {
    icon: Mic,
    title: "Voice Navigation",
    description:
      "Control your learning tools, navigate study materials, and interact with the platform hands-free — essential for students with motor impairments.",
    tag: "Voice Interface",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    gradient: "from-emerald-600/20 to-transparent",
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
          badge="Learning Tools"
          title="Every tool an impaired student needs"
          subtitle="AURA integrates six powerful learning and accessibility tools into one platform — designed for how students actually learn in classrooms, labs, and online."
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
