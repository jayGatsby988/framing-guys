"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowDown, Mic, Eye, ChevronRight, FileText, Sparkles, Camera, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const notesTitles = [
  "Biology 101 — Cellular Respiration",
  "Physics 201 — Wave Mechanics",
  "Chemistry 301 — Organic Compounds",
];

const transcriptSnippets = [
  "...aerobic respiration requires oxygen to produce ATP, while anaerobic does not. The mitochondria serves as the primary site...",
  "...the wavelength determines color. When light passes through a prism, it separates into its component frequencies...",
  "...carbon chains form the backbone of organic molecules. Functional groups determine the compound's reactivity...",
];

const aiSummaries = [
  "ATP synthesis occurs in mitochondria via oxidative phosphorylation. Key distinction: aerobic (O2 required, 36 ATP) vs anaerobic (no O2, 2 ATP).",
  "Wave-particle duality: light behaves as both wave and particle. Wavelength inversely proportional to frequency (c = lambda * f).",
  "Organic chemistry fundamentals: carbon's 4 bonds enable complex structures. Functional groups: -OH (alcohol), -COOH (acid), -NH2 (amine).",
];

const visionResults = [
  {
    image: "Lecture Hall — Whiteboard",
    objects: [
      { label: "Whiteboard", confidence: "98%", color: "text-emerald-400" },
      { label: "Cell diagram", confidence: "94%", color: "text-emerald-400" },
      { label: "Handwritten text", confidence: "91%", color: "text-emerald-400" },
      { label: "Professor (pointing)", confidence: "89%", color: "text-blue-400" },
    ],
    description: "Whiteboard contains labeled cell diagram with mitochondria highlighted. Professor is pointing to the electron transport chain.",
  },
  {
    image: "Textbook — Chapter 5",
    objects: [
      { label: "Printed text", confidence: "99%", color: "text-emerald-400" },
      { label: "Formula: E=mc\u00B2", confidence: "96%", color: "text-emerald-400" },
      { label: "Bar chart", confidence: "93%", color: "text-emerald-400" },
      { label: "Footnotes (3)", confidence: "88%", color: "text-amber-400" },
    ],
    description: "Page 142, Chapter 5. Contains energy formula and comparison chart. 3 footnotes reference external studies.",
  },
  {
    image: "Lab Environment",
    objects: [
      { label: "Microscope", confidence: "97%", color: "text-emerald-400" },
      { label: "Safety sign", confidence: "95%", color: "text-amber-400" },
      { label: "Sample slides", confidence: "90%", color: "text-emerald-400" },
      { label: "Lab instructions", confidence: "87%", color: "text-blue-400" },
    ],
    description: "Lab station with compound microscope. Safety goggles required. Currently on step 3 of 8 in the procedure.",
  },
];

export function Hero() {
  const [noteIndex, setNoteIndex] = useState(0);
  const [visionIndex, setVisionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNoteIndex((prev) => (prev + 1) % notesTitles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisionIndex((prev) => (prev + 1) % visionResults.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#070709]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl animate-pulse-glow pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl animate-float pointer-events-none"
        style={{
          background: "radial-gradient(circle, #A78BFA, transparent 70%)",
          animationDelay: "2s",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #818CF8, transparent 60%)" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* Left floating panel — Lecture Notes Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -60, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block"
          >
            <div
              className="glass-card rounded-2xl overflow-hidden w-full max-w-xs mx-auto animate-float"
              style={{ animationDelay: "1s" }}
              aria-label="Lecture Notes app mockup"
            >
              {/* Title bar */}
              <div className="px-4 py-3 border-b border-[#1F1F28] flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-[#F8F8FC]">
                  Lecture Notes
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-[#5A5A6E]">REC</span>
                </div>
              </div>

              {/* Note title */}
              <div className="px-4 pt-3 pb-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={noteIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-semibold text-[#F8F8FC] truncate"
                  >
                    {notesTitles[noteIndex]}
                  </motion.p>
                </AnimatePresence>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={10} className="text-[#5A5A6E]" />
                  <span className="text-[10px] text-[#5A5A6E]">12:34 elapsed</span>
                  <span className="text-[10px] text-[#5A5A6E]">|</span>
                  <Mic size={10} className="text-red-400" />
                  <span className="text-[10px] text-red-400">Recording</span>
                </div>
              </div>

              {/* Transcript section */}
              <div className="px-4 py-2">
                <p className="text-[10px] text-[#5A5A6E] uppercase tracking-wider font-semibold mb-1">Transcript</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={noteIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-xs text-[#9898A8] leading-relaxed line-clamp-3"
                  >
                    {transcriptSnippets[noteIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* AI Summary section */}
              <div className="px-4 pb-3">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={10} className="text-indigo-400" />
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">AI Summary</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={noteIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="text-xs text-indigo-300/80 leading-relaxed line-clamp-3"
                    >
                      {aiSummaries[noteIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="px-4 py-2.5 border-t border-[#1F1F28] flex items-center gap-2">
                <div className="flex gap-0.5 items-end h-4">
                  {[...Array(8)].map((_, i) => (
                    <span key={i} className="wave-bar" style={{ height: "4px" }} />
                  ))}
                </div>
                <span className="text-xs text-[#5A5A6E]">Lecture in progress</span>
              </div>
            </div>
          </motion.div>

          {/* Center content */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge variant="accent" className="mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block mr-1.5" />
                The Ultimate Education Platform for the Impaired
              </Badge>
            </motion.div>

            {/* AURA Acronym */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex items-center gap-3 sm:gap-4 mb-6"
            >
              {[
                { letter: "A", word: "daptive" },
                { letter: "U", word: "niversal" },
                { letter: "R", word: "eal-time" },
                { letter: "A", word: "ccessibility" },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span className="text-[#2A2A3C] text-sm select-none" aria-hidden="true">&middot;</span>
                  )}
                  <span className="text-sm sm:text-base tracking-wide">
                    <span className="font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {item.letter}
                    </span>
                    <span className="text-white/50 font-light">
                      {item.word}
                    </span>
                  </span>
                </React.Fragment>
              ))}
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight mb-6 text-balance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {["Every", "student", "deserves", "to"].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + i * 0.07,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="inline-block mr-[0.2em] text-[#F8F8FC]"
                >
                  {word}
                </motion.span>
              ))}
              {" "}
              {["learn", "without", "limits."].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + (4 + i) * 0.07,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className={`inline-block mr-[0.2em] ${i === 0 ? "gradient-text" : "text-[#F8F8FC]"}`}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-lg sm:text-xl text-[#9898A8] leading-relaxed max-w-2xl mb-10 text-balance"
            >
              Live captions, AI note-taking, and vision assistance — one platform
              so students with disabilities never fall behind.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-14"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection("contact")}
                icon={<ChevronRight size={18} />}
                iconPosition="right"
              >
                Request Early Access
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => scrollToSection("vision-demo")}
                icon={
                  <span className="w-8 h-8 rounded-full border border-[#1F1F28] flex items-center justify-center">
                    <Play size={12} className="text-indigo-400 ml-0.5" fill="currentColor" />
                  </span>
                }
                iconPosition="left"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap items-center justify-center gap-0 divide-x divide-[#1F1F28]"
            >
              {[
                { number: "240M+", label: "students with disabilities", sub: "" },
                { number: "90%", label: "lack proper learning tools", sub: "" },
                { number: "1 platform", label: "built for them", sub: "" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="px-6 py-1 text-center first:pl-0 last:pr-0"
                >
                  <p className="text-2xl font-bold text-[#F8F8FC]">{stat.number}</p>
                  <p className="text-xs text-[#5A5A6E] mt-0.5">
                    {stat.sub && <span className="text-[#9898A8]">{stat.sub} </span>}
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right floating panel — Vision Assist Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block"
          >
            <div
              className="glass-card rounded-2xl overflow-hidden w-full max-w-xs mx-auto animate-float"
              style={{ animationDelay: "3s" }}
              aria-label="Vision Assist app mockup"
            >
              {/* Title bar */}
              <div className="px-4 py-3 border-b border-[#1F1F28] flex items-center gap-2">
                <Eye size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-[#F8F8FC]">
                  Vision Assist
                </span>
                <div className="ml-auto">
                  <Badge variant="success" dot className="text-[10px] py-0.5">Active</Badge>
                </div>
              </div>

              {/* Image analysis mock */}
              <div className="relative mx-4 mt-4 rounded-xl overflow-hidden bg-[#0A0A0D] h-20 border border-[#1F1F28]">
                <div className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, #0A0A0D 0%, #1a1a2e 50%, #0A0A0D 100%)"
                  }}
                />
                {/* Scan line */}
                <div
                  className="absolute left-0 right-0 h-0.5 opacity-60 animate-scan-line"
                  style={{ background: "linear-gradient(90deg, transparent, #6366F1, transparent)" }}
                />
                {/* Bounding box mockup */}
                <div className="absolute top-2 left-3 w-16 h-12 border border-indigo-500/40 rounded-sm" />
                <div className="absolute top-1 left-3 text-[8px] text-indigo-400 bg-indigo-500/20 px-1 rounded">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={visionIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {visionResults[visionIndex].image}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
                  <Camera size={9} className="text-[#9898A8]" />
                  <span className="text-[9px] text-[#9898A8]">Analyzing</span>
                </div>
                <div className="absolute bottom-1.5 right-2 text-[9px] text-[#5A5A6E]">
                  AI Vision
                </div>
              </div>

              {/* Detected Objects */}
              <div className="px-4 pt-3 pb-2">
                <p className="text-[10px] text-[#5A5A6E] uppercase tracking-wider font-semibold mb-1.5">Detected Objects</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={visionIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-1.5"
                  >
                    {visionResults[visionIndex].objects.map((obj, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 text-xs"
                      >
                        <Square size={8} className={obj.color} fill="currentColor" />
                        <span className="text-[#9898A8] flex-1">{obj.label}</span>
                        <span className="text-[#5A5A6E] text-[10px]">{obj.confidence}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* AI Description */}
              <div className="px-4 pb-3">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={10} className="text-indigo-400" />
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Scene Description</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={visionIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-xs text-indigo-300/80 leading-relaxed line-clamp-3"
                    >
                      {visionResults[visionIndex].description}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        onClick={() => scrollToSection("problem")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#5A5A6E] hover:text-[#9898A8] transition-colors group"
        aria-label="Scroll to next section"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  );
}

export default Hero;
