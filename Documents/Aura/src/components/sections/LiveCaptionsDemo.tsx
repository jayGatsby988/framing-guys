"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Captions, Check, Volume2, Users } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";

const mockMessages = [
  {
    id: 1,
    speaker: "Prof. Chen",
    color: "bg-violet-500",
    time: "2:31 PM",
    text: "Good afternoon everyone. Today we'll continue with cellular biology, focusing on mitochondrial function.",
    type: "speech",
  },
  {
    id: 2,
    type: "event",
    icon: "🔔",
    text: "Door opened",
    time: "2:32 PM",
  },
  {
    id: 3,
    speaker: "Student",
    color: "bg-blue-500",
    time: "2:32 PM",
    text: "Could you explain how ATP synthase works in the electron transport chain?",
    type: "speech",
  },
  {
    id: 4,
    speaker: "Prof. Chen",
    color: "bg-violet-500",
    time: "2:33 PM",
    text: "Great question. ATP synthase uses the proton gradient to drive phosphorylation of ADP to ATP.",
    type: "speech",
  },
  {
    id: 5,
    type: "event",
    icon: "🎵",
    text: "Background music detected",
    time: "2:33 PM",
  },
  {
    id: 6,
    speaker: "Prof. Chen",
    color: "bg-violet-500",
    time: "2:34 PM",
    text: "The key takeaway is that each glucose molecule yields approximately 36-38 ATP molecules through oxidative phosphorylation.",
    type: "speech",
  },
];

const benefits = [
  "99.2% speech recognition accuracy in lecture settings",
  "Automatic professor and student speaker identification",
  "AI-generated lecture summaries and key points",
  "40+ languages supported for international students",
  "Export notes as study guides and flashcards",
  "Seamless integration with AURA Lecture Notes",
];

export function LiveCaptionsDemo() {
  const [visibleMessages, setVisibleMessages] = useState(3);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!isLiveMode) return;
    const interval = setInterval(() => {
      setVisibleMessages((prev) =>
        prev < mockMessages.length ? prev + 1 : prev
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, transcript]);

  const handleToggleLive = () => {
    if (!isLiveMode) {
      setIsLiveMode(true);
      setVisibleMessages(3);
      if (isSupported) {
        startListening();
      }
    } else {
      setIsLiveMode(false);
      stopListening();
      resetTranscript();
    }
  };

  return (
    <section
      id="captions-demo"
      aria-labelledby="captions-heading"
      className="relative py-24 lg:py-32 bg-[#0F0F12] overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 0% 50%, rgba(99,102,241,0.04) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Lecture Captions"
          title="Hear every word of every lecture."
          subtitle="Real-time speech transcription built for the classroom — captures professors, student questions, and discussions so no one falls behind. Inspired by AccessHear."
          align="center"
          id="captions-heading"
          className="mb-16"
        />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Transcript UI */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F28]">
                <div className="flex items-center gap-2.5">
                  <Captions size={16} className="text-blue-400" />
                  <span className="text-sm font-semibold text-[#F8F8FC]">
                    Live Transcript
                  </span>
                  {isLiveMode && (
                    <Badge variant="success" dot className="text-[10px]">
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#5A5A6E]" />
                  <span className="text-xs text-[#5A5A6E]">2 speakers</span>
                </div>
              </div>

              {/* Messages */}
              <div
                className="h-72 overflow-y-auto p-4 space-y-4"
                role="log"
                aria-live="polite"
                aria-label="Live transcript"
              >
                <AnimatePresence>
                  {mockMessages
                    .slice(0, visibleMessages)
                    .map((msg) => {
                      if (msg.type === "event") {
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 py-1"
                          >
                            <span className="text-sm">{msg.icon}</span>
                            <span className="text-xs text-[#5A5A6E] italic">
                              {msg.text}
                            </span>
                            <span className="text-xs text-[#5A5A6E] ml-auto">
                              {msg.time}
                            </span>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div
                            className={`w-7 h-7 rounded-full ${msg.color} flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5`}
                          >
                            {msg.speaker?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-[#F8F8FC]">
                                {msg.speaker}
                              </span>
                              <span className="text-[10px] text-[#5A5A6E]">
                                {msg.time}
                              </span>
                            </div>
                            <p className="text-sm text-[#9898A8] leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>

                {/* Live speech */}
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                      Y
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#F8F8FC]">You</span>
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                      <p className="text-sm text-[#9898A8] leading-relaxed">
                        {transcript}
                        <span className="text-[#5A5A6E] italic">
                          {interimTranscript}
                        </span>
                        <span className="inline-block w-0.5 h-3.5 bg-indigo-400 ml-0.5 animate-typing-cursor" />
                      </p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <p className="text-xs text-amber-400 text-center py-2">{error}</p>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Summary */}
              <div className="mx-4 mb-4 bg-[#141418] border border-[#1F1F28] rounded-xl p-3">
                <p className="text-xs text-[#5A5A6E] mb-2 font-medium">
                  AI Summary
                </p>
                <p className="text-xs text-[#9898A8] leading-relaxed">
                  Biology lecture on cellular respiration. Key topic: ATP synthase
                  and oxidative phosphorylation. Each glucose yields 36-38 ATP.
                  Question asked about electron transport chain.
                </p>
              </div>

              {/* Controls */}
              <div className="px-4 pb-4 flex items-center gap-3">
                <Button
                  variant={isLiveMode ? "secondary" : "primary"}
                  size="sm"
                  icon={
                    isLiveMode ? (
                      <MicOff size={14} />
                    ) : (
                      <Mic size={14} />
                    )
                  }
                  onClick={handleToggleLive}
                >
                  {isLiveMode ? "Stop Captions" : "Start Live Caption"}
                </Button>

                {!isSupported && (
                  <p className="text-xs text-[#5A5A6E]">
                    Use Chrome for speech support
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-8"
          >
            <div>
              <Badge variant="accent" className="mb-5">Classroom Speech Recognition</Badge>
              <h3 className="text-2xl font-bold text-[#F8F8FC] mb-4">
                Never miss a word of a lecture
              </h3>
              <p className="text-[#9898A8] leading-relaxed">
                AURA&apos;s Lecture Captions use state-of-the-art speech
                recognition to transcribe every word in real time — whether
                you&apos;re in a lecture hall, a study group, or an online class.
                Built from the same technology as AccessHear.
              </p>
            </div>

            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-emerald-400" />
                  </div>
                  <span className="text-sm text-[#9898A8]">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "99.2%", label: "Accuracy rate", icon: "🎯" },
                { number: "40+", label: "Languages", icon: "🌍" },
                { number: "<100ms", label: "Latency", icon: "⚡" },
                { number: "∞", label: "Meeting length", icon: "⏱" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#0F0F12] border border-[#1F1F28] rounded-xl p-4 text-center"
                >
                  <span className="text-xl mb-1 block">{stat.icon}</span>
                  <p className="text-xl font-bold text-[#F8F8FC]">
                    {stat.number}
                  </p>
                  <p className="text-xs text-[#5A5A6E]">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default LiveCaptionsDemo;
