"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

const values = [
  {
    title: "Education Equity",
    description:
      "Every student — regardless of disability — deserves the same quality of education. AURA levels the playing field with AI tools that bridge the accessibility gap in classrooms.",
  },
  {
    title: "Privacy First",
    description:
      "Student data is sacred. AURA processes lecture content on-device where possible, complies with FERPA, and never shares or sells student information.",
  },
  {
    title: "Universal Campus Access",
    description:
      "From community colleges to research universities, AURA should be available to every student who needs it — regardless of their institution's budget or location.",
  },
  {
    title: "Human-Centered Learning",
    description:
      "AI should enhance the student-teacher relationship, not replace it. AURA empowers students to participate fully in the classroom experience alongside their peers.",
  },
];

export function Mission() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      className="relative py-32 lg:py-40 overflow-hidden bg-[#070709]"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 40%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main quote */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="accent" className="mb-8">Our Mission</Badge>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p
              id="mission-heading"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight max-w-5xl mx-auto mb-8"
            >
              <span className="text-[#F8F8FC]">&ldquo;Education is a </span>
              <span className="gradient-text">right</span>
              <span className="text-[#F8F8FC]">,</span>
              <br />
              <span className="text-[#F8F8FC]">not a </span>
              <span className="gradient-text">privilege</span>
              <span className="text-[#F8F8FC]">.&rdquo;</span>
            </p>
          </motion.blockquote>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-[#9898A8] max-w-3xl mx-auto leading-relaxed"
          >
            We started AURA because we believe that no student should fail
            because their classroom wasn&apos;t designed for them. When we build
            education technology that works for impaired students, we don&apos;t just
            serve them — we build better learning tools for everyone.
          </motion.p>
        </div>

        {/* Values grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl p-6 hover:border-indigo-500/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 transition-colors">
                <span className="text-lg">
                  {["🌐", "🔒", "♾️", "🤝"][index]}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#F8F8FC] mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-[#9898A8] leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Mission;
