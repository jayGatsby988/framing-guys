"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, MessageSquareOff, Navigation } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const problems = [
  {
    icon: Globe,
    title: "Inaccessible Classrooms",
    description:
      "Most lecture halls, online courses, and learning platforms are built without accessibility in mind. Students with disabilities are forced to rely on outdated tools or fall behind entirely.",
    stat: "90%",
    statLabel: "of ed-tech tools lack proper accessibility",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    icon: MessageSquareOff,
    title: "Missed Lectures",
    description:
      "Students with hearing impairments miss critical lecture content, class discussions, and Q&A sessions. Without real-time captions and AI notes, every class is an uphill battle.",
    stat: "70%",
    statLabel: "of deaf students report missing lecture content",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    icon: Navigation,
    title: "Learning Materials Out of Reach",
    description:
      "Textbooks, whiteboards, lab instructions, and handouts are visual-first. Students with vision impairments can't read the board, examine diagrams, or navigate campus independently.",
    stat: "240M+",
    statLabel: "students worldwide with disabilities",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export function Problem() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="relative py-24 lg:py-32 bg-[#070709] overflow-hidden"
    >
      {/* Subtle background gradient */}
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
          badge="The Problem"
          title="Education wasn't built for every student."
          subtitle="Students with disabilities are systematically excluded from classrooms, lectures, and learning materials — not because they can't learn, but because the tools weren't designed for them."
          align="center"
          id="problem-heading"
          className="mb-16"
        />

        {/* Problem cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-2xl bg-[#0F0F12] border ${problem.borderColor} p-6 overflow-hidden group`}
              >
                {/* Background accent */}
                <div
                  className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl ${problem.bgColor} opacity-30 group-hover:opacity-50 transition-opacity`}
                />

                <div className={`inline-flex p-2.5 rounded-xl ${problem.bgColor} border ${problem.borderColor} mb-5`}>
                  <Icon size={22} className={problem.color} />
                </div>

                <h3 className="text-lg font-bold text-[#F8F8FC] mb-3">
                  {problem.title}
                </h3>
                <p className="text-sm text-[#9898A8] leading-relaxed mb-6">
                  {problem.description}
                </p>

                <div className="flex items-end gap-2 pt-4 border-t border-[#1F1F28]">
                  <span className={`text-3xl font-bold ${problem.color}`}>
                    {problem.stat}
                  </span>
                  <span className="text-xs text-[#5A5A6E] pb-1 leading-tight">
                    {problem.statLabel}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Supporting stat */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-2xl bg-[#0F0F12] border border-[#1F1F28] p-8 md:p-12 text-center overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)",
            }}
          />
          <blockquote className="relative">
            <p className="text-4xl sm:text-5xl font-bold text-[#F8F8FC] mb-3">
              <span className="gradient-text">Only 1 in 10</span>
            </p>
            <p className="text-xl text-[#9898A8] max-w-2xl mx-auto">
              students with disabilities have access to the{" "}
              <span className="text-[#F8F8FC] font-medium">
                assistive technology they need
              </span>
              {" "}to participate fully in higher education.
            </p>
            <footer className="mt-4">
              <cite className="text-sm text-[#5A5A6E] not-italic">
                — WHO &amp; UNESCO Global Report on Assistive Technology, 2024
              </cite>
            </footer>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}

export default Problem;
