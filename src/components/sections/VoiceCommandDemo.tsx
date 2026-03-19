"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, CheckCircle, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

const suggestions = [
  { label: "Start captions", icon: "🎙" },
  { label: "Read page", icon: "📖" },
  { label: "Increase text", icon: "🔍" },
  { label: "Open Vision Assist", icon: "👁" },
  { label: "Navigate home", icon: "🏠" },
  { label: "Find nearest exit", icon: "🚪" },
  { label: "Describe scene", icon: "🌄" },
  { label: "Summarize content", icon: "✨" },
];

type HistoryItem = {
  id: number;
  command: string;
  result: string;
  timestamp: string;
  status: "success" | "processing";
};

const commandResponses: Record<string, string> = {
  "start captions": "Live captions activated. Listening for speech...",
  "read page": "Reading page content: AURA — Adaptive Universal Responsive Assistant...",
  "increase text": "Text size increased to Large.",
  "open vision assist": "Vision Assist activated. Point camera at your surroundings.",
  "navigate home": "Scrolling to top of page.",
  "find nearest exit": "Using GPS and camera to locate nearest exit...",
  "describe scene": "Analyzing camera feed. Scene description loading...",
  "summarize content": "Generating AI summary of current page content...",
};

const getResponse = (command: string): string => {
  const lower = command.toLowerCase();
  for (const [key, value] of Object.entries(commandResponses)) {
    if (lower.includes(key)) return value;
  }
  return `Command recognized: "${command}". Processing...`;
};

export function VoiceCommandDemo() {
  const [isActive, setIsActive] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [executingChip, setExecutingChip] = useState<string | null>(null);
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
    if (transcript && isListening) {
      const lastSentence = transcript.trim().split(/[.!?]/).pop()?.trim();
      if (lastSentence && lastSentence.length > 3) {
        addToHistory(lastSentence);
        resetTranscript();
      }
    }
  }, [transcript]);

  const addToHistory = (command: string) => {
    const id = Date.now();
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setHistory((prev) => [
      {
        id,
        command,
        result: getResponse(command),
        timestamp: time,
        status: "processing",
      },
      ...prev.slice(0, 4),
    ]);

    setTimeout(() => {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "success" } : item
        )
      );
    }, 1200);
  };

  const handleMicToggle = () => {
    if (isActive) {
      setIsActive(false);
      stopListening();
    } else {
      setIsActive(true);
      if (isSupported) {
        startListening();
      }
    }
  };

  const handleChip = (label: string) => {
    setExecutingChip(label);
    addToHistory(label);
    setTimeout(() => setExecutingChip(null), 1000);
  };

  return (
    <section
      id="voice-demo"
      aria-labelledby="voice-heading"
      className="relative py-24 lg:py-32 bg-[#070709] overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.03) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Voice Control"
          title="Navigate with your voice, naturally"
          subtitle="Speak commands to control AURA and any connected app. Hands-free navigation designed for how you actually talk."
          align="center"
          id="voice-heading"
          className="mb-16"
        />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - mic + suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center"
          >
            {/* Mic button */}
            <div className="relative mb-8">
              {/* Animated rings */}
              {isActive && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="absolute inset-0 rounded-full border-2 border-emerald-500/20"
                  />
                  <motion.div
                    animate={{ scale: [1, 2.0, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    className="absolute inset-0 rounded-full border border-emerald-500/10"
                  />
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMicToggle}
                className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                  isActive
                    ? "bg-emerald-600 shadow-emerald-600/30 border-2 border-emerald-500"
                    : "bg-[#141418] border-2 border-[#1F1F28] hover:border-indigo-500/50 shadow-black/40"
                )}
                aria-label={isActive ? "Stop voice commands" : "Start voice commands"}
                aria-pressed={isActive}
              >
                {isActive ? (
                  <Mic size={36} className="text-white" />
                ) : (
                  <MicOff size={36} className="text-[#5A5A6E]" />
                )}
              </motion.button>
            </div>

            {/* Waveform */}
            <div className="h-10 flex items-center justify-center gap-1 mb-4">
              {isActive ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="wave-bar" />
                ))
              ) : (
                <div className="flex gap-1 items-end">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 h-1 rounded-full bg-[#1F1F28]"
                    />
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-[#9898A8] mb-2 text-center">
              {isActive ? (
                <>
                  <span className="text-emerald-400 font-medium">Listening...</span>
                  {" "}say a command
                </>
              ) : (
                "Tap the mic or click a suggestion below"
              )}
            </p>

            {interimTranscript && (
              <p className="text-sm text-indigo-300 italic text-center max-w-xs">
                &quot;{interimTranscript}&quot;
              </p>
            )}

            {error && !isSupported && (
              <p className="text-xs text-amber-400 text-center mt-1">
                Use Chrome for real voice commands
              </p>
            )}

            {/* Suggestions */}
            <div className="mt-6 w-full">
              <p className="text-xs text-[#5A5A6E] text-center mb-3 uppercase tracking-wider">
                Quick Commands
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <motion.button
                    key={s.label}
                    onClick={() => handleChip(s.label)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-left",
                      executingChip === s.label
                        ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-300"
                        : "bg-[#0F0F12] border border-[#1F1F28] text-[#9898A8] hover:border-indigo-500/30 hover:text-[#F8F8FC]"
                    )}
                    aria-label={`Execute command: ${s.label}`}
                  >
                    <span>{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                    {executingChip === s.label && (
                      <CheckCircle size={12} className="text-emerald-400 ml-auto shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - command history */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F28]">
                <div className="flex items-center gap-2">
                  <Mic size={14} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-[#F8F8FC]">
                    Command History
                  </span>
                </div>
                {history.length > 0 && (
                  <span className="text-xs text-[#5A5A6E]">
                    {history.length} command{history.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div
                className="min-h-[300px] p-4"
                role="log"
                aria-live="polite"
                aria-label="Command history"
              >
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Mic size={32} className="text-[#1F1F28] mb-3" />
                    <p className="text-sm text-[#5A5A6E]">
                      Commands will appear here
                    </p>
                    <p className="text-xs text-[#5A5A6E] mt-1">
                      Try clicking a suggestion or speaking
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-3">
                      {history.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#141418] border border-[#1F1F28] rounded-xl p-3"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{'"'}{item.command}{'"'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.status === "success" ? (
                                <CheckCircle size={12} className="text-emerald-400" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                              )}
                              <span className="text-[10px] text-[#5A5A6E]">
                                {item.timestamp}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-[#5A5A6E] leading-relaxed flex items-start gap-1.5">
                            <ChevronRight size={10} className="mt-0.5 shrink-0 text-indigo-400" />
                            {item.result}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default VoiceCommandDemo;
