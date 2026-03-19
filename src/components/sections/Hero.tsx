"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowDown, Mic, Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const captionLines = [
  {
    speaker: "SPEAKER 1",
    text: '"The meeting starts at 3pm and we\'ll review the quarterly results then."',
  },
  {
    speaker: "SPEAKER 2",
    text: '"Perfect, I\'ll prepare the presentation slides by then."',
  },
  {
    speaker: "SPEAKER 1",
    text: '"Great — also, could you bring the accessibility audit report?"',
  },
  {
    speaker: "SPEAKER 2",
    text: '"Of course. I\'ll include the WCAG compliance summary as well."',
  },
];

const sceneDetections = [
  [
    { icon: "✓", label: "Park bench", detail: "3m ahead", color: "text-emerald-400" },
    { icon: "✓", label: "Person walking", detail: "left", color: "text-emerald-400" },
    { icon: "✓", label: "Clear pathway", detail: "forward", color: "text-emerald-400" },
    { icon: "⚠", label: "Bicycle approaching", detail: "right", color: "text-amber-400" },
  ],
  [
    { icon: "✓", label: "Crosswalk signal", detail: "walk now", color: "text-emerald-400" },
    { icon: "✓", label: "Bus stop", detail: "15m ahead", color: "text-emerald-400" },
    { icon: "⚠", label: "Wet floor sign", detail: "nearby", color: "text-amber-400" },
    { icon: "✓", label: "Clear path", detail: "ahead", color: "text-emerald-400" },
  ],
  [
    { icon: "✓", label: "Door handle", detail: "1.2m ahead", color: "text-emerald-400" },
    { icon: "✓", label: "Exit sign", detail: "above", color: "text-emerald-400" },
    { icon: "✓", label: "Step down", detail: "0.5m ahead", color: "text-emerald-400" },
    { icon: "ℹ", label: "Café entrance", detail: "right", color: "text-blue-400" },
  ],
];

const sceneDescriptions = [
  '"Safe to walk forward. Bicycle approaching from right."',
  '"Walk signal active. Bus stop 15 meters ahead."',
  '"Door ahead at 1.2 meters. Watch for step down."',
];

export function Hero() {
  const [captionIndex, setCaptionIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [currentCaption, setCurrentCaption] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % captionLines.length);
      setCurrentCaption((prev) => (prev + 1) % captionLines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % sceneDetections.length);
    }, 4000);
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
          {/* Left floating panel */}
          <motion.div
            initial={{ opacity: 0, x: -60, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block"
          >
            <div
              className="glass-card rounded-2xl overflow-hidden w-full max-w-xs mx-auto animate-float"
              style={{ animationDelay: "1s" }}
              aria-label="Live Captions demo panel"
            >
              <div className="px-4 py-3 border-b border-[#1F1F28] flex items-center gap-2">
                <Mic size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-[#F8F8FC]">
                  Live Captions
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-[#5A5A6E]">Live</span>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[160px]">
                <AnimatePresence mode="popLayout">
                  {captionLines.slice(0, 3).map((line, i) => {
                    const visible = i <= ((captionIndex) % captionLines.length);
                    return (
                      <motion.div
                        key={`${i}-${Math.floor(captionIndex / captionLines.length)}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: i === captionIndex % captionLines.length ? 1 : 0.5, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-xs"
                      >
                        <p className="text-[#5A5A6E] font-semibold tracking-wider text-[10px] mb-0.5">
                          {line.speaker}
                        </p>
                        <p className="text-[#9898A8] leading-relaxed">{line.text}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className="px-4 py-2.5 border-t border-[#1F1F28] flex items-center gap-2">
                <div className="flex gap-0.5 items-end h-4">
                  {[...Array(8)].map((_, i) => (
                    <span key={i} className="wave-bar" style={{ height: "4px" }} />
                  ))}
                </div>
                <span className="text-xs text-[#5A5A6E]">2 speakers detected</span>
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
              <Badge variant="accent" className="mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block mr-1.5" />
                AI-Powered Accessibility Platform
              </Badge>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight mb-6 text-balance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {["One", "intelligent", "layer", "for", "a", "more"].map((word, i) => (
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
              {["accessible", "world."].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + (6 + i) * 0.07,
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
              AURA combines AI vision assistance, real-time captions, voice
              control, and web accessibility tools into one seamless experience —
              built for the 1.3 billion people who deserve better.
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
                { number: "2.2B+", label: "vision impaired", sub: "people" },
                { number: "430M+", label: "hearing loss", sub: "people" },
                { number: "1 platform", label: "for all", sub: "" },
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

          {/* Right floating panel */}
          <motion.div
            initial={{ opacity: 0, x: 60, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block"
          >
            <div
              className="glass-card rounded-2xl overflow-hidden w-full max-w-xs mx-auto animate-float"
              style={{ animationDelay: "3s" }}
              aria-label="Scene Analysis demo panel"
            >
              <div className="px-4 py-3 border-b border-[#1F1F28] flex items-center gap-2">
                <Eye size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-[#F8F8FC]">
                  Scene Analysis
                </span>
                <div className="ml-auto">
                  <Badge variant="success" dot className="text-[10px] py-0.5">Active</Badge>
                </div>
              </div>

              {/* Mock camera view */}
              <div className="relative mx-4 mt-4 rounded-xl overflow-hidden bg-[#0A0A0D] h-24 border border-[#1F1F28]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full opacity-30"
                    style={{
                      background: "linear-gradient(180deg, #0A0A0D 0%, #1a1a2e 50%, #0A0A0D 100%)"
                    }}
                  />
                </div>
                {/* Scan line */}
                <div
                  className="absolute left-0 right-0 h-0.5 opacity-60 animate-scan-line"
                  style={{ background: "linear-gradient(90deg, transparent, #6366F1, transparent)" }}
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-[#9898A8]">LIVE</span>
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-[#5A5A6E]">
                  AI Vision
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sceneIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-1.5"
                  >
                    {sceneDetections[sceneIndex].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className={item.color}>{item.icon}</span>
                        <span className="text-[#9898A8] flex-1">{item.label}</span>
                        <span className="text-[#5A5A6E]">{item.detail}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="px-4 pb-4">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg px-3 py-2">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={sceneIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-indigo-300 italic"
                    >
                      {sceneDescriptions[sceneIndex]}
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
