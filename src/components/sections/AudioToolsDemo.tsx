"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioLines,
  Upload,
  FileAudio,
  Sparkles,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const mockTranscript = `[00:00:00] Welcome to today's podcast episode on digital accessibility.
[00:00:08] Our guest, Dr. Sarah Chen, is a leading researcher in assistive technology.
[00:00:15] Dr. Chen: "The statistics are clear — over a billion people worldwide need assistive technology."
[00:00:24] Host: "What are the most critical gaps you see in current solutions?"
[00:00:31] Dr. Chen: "The biggest gap is real-time environmental awareness for blind users outdoors."
[00:00:40] "Current GPS systems tell you where you are, but not what's around you."
[00:00:48] Host: "And that's where AI vision assistance comes in?"
[00:00:53] Dr. Chen: "Exactly. AI can describe scenes, read signs, identify people — all in real time."`;

const exportFormats = ["TXT", "PDF", "SRT", "DOCX"];

export function AudioToolsDemo() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateProcessing();
  };

  const handleFileSelect = () => {
    simulateProcessing();
  };

  const simulateProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasResult(true);
      summarizeTranscript(mockTranscript);
    }, 2000);
  };

  const summarizeTranscript = async (transcript: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to summarize");
      setAiAnalysis(data.analysis);
    } catch {
      setAiAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mockTranscript).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse AI analysis into highlights
  const parseHighlights = (analysis: string): string[] => {
    const lines = analysis.split("\n");
    const highlights: string[] = [];
    let inHighlights = false;
    for (const line of lines) {
      if (line.includes("HIGHLIGHTS:") || line.includes("KEY") || line.includes("Highlight")) {
        inHighlights = true;
        continue;
      }
      if (inHighlights && line.startsWith("-")) {
        highlights.push(line.replace(/^-\s*/, ""));
      }
      if (inHighlights && line.includes("ACTION")) break;
    }
    return highlights.length > 0 ? highlights : analysis.split("\n").filter(l => l.startsWith("-")).map(l => l.replace(/^-\s*/, ""));
  };

  const parseSummary = (analysis: string): string => {
    const match = analysis.match(/SUMMARY:\s*([\s\S]*?)(?=HIGHLIGHTS|KEY|$)/i);
    return match ? match[1].trim() : analysis.split("\n")[0] || "";
  };

  return (
    <section
      id="audio-tools"
      aria-labelledby="audio-tools-heading"
      className="relative py-24 lg:py-32 bg-[#070709] overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Audio Tools"
          title="Transform any audio into accessible content"
          subtitle="Upload audio files, recordings, or podcasts. AURA transcribes, summarizes, and extracts key information — powered by AI."
          align="center"
          id="audio-tools-heading"
          className="mb-16"
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Upload zone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-600/10"
                    : "border-[#1F1F28] hover:border-[#2F2F40] hover:bg-[#0F0F12]"
                }`}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Drop audio file or click to browse"
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  aria-label="Select audio file"
                />

                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#141418] border border-[#1F1F28] flex items-center justify-center">
                    {isProcessing ? (
                      <AudioLines size={24} className="text-indigo-400 animate-pulse" />
                    ) : (
                      <Upload size={24} className="text-[#5A5A6E]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[#F8F8FC] font-medium mb-1">
                      {isProcessing ? "Transcribing..." : "Drop audio file here"}
                    </p>
                    <p className="text-sm text-[#5A5A6E]">
                      {isProcessing
                        ? "AI is processing your audio"
                        : "Supports MP3, WAV, M4A, OGG, FLAC"}
                    </p>
                  </div>
                  {!isProcessing && (
                    <Button variant="secondary" size="sm" icon={<FileAudio size={14} />}>
                      Browse Files
                    </Button>
                  )}
                  {isProcessing && (
                    <div className="flex gap-1 h-8 items-end">
                      {[...Array(8)].map((_, i) => (
                        <span key={i} className="wave-bar" style={{ height: "4px" }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Supported features */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🎙", label: "Speaker ID", desc: "Separate speakers automatically" },
                  { icon: "🌍", label: "40+ Languages", desc: "Auto language detection" },
                  { icon: "⚡", label: "Fast Processing", desc: "1 hour audio in ~2 min" },
                  { icon: "🔒", label: "Private", desc: "Audio deleted after processing" },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    className="bg-[#0F0F12] border border-[#1F1F28] rounded-xl p-3"
                  >
                    <span className="text-lg">{feat.icon}</span>
                    <p className="text-sm font-medium text-[#F8F8FC] mt-1">
                      {feat.label}
                    </p>
                    <p className="text-xs text-[#5A5A6E]">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Output panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl overflow-hidden h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F28]">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-sm font-semibold text-[#F8F8FC]">
                    AI Output
                  </span>
                  {hasResult && (
                    <Badge variant="success" className="text-[10px]">
                      Complete
                    </Badge>
                  )}
                  {isAnalyzing && (
                    <Badge variant="accent" className="text-[10px]">
                      Summarizing...
                    </Badge>
                  )}
                </div>
                {hasResult && (
                  <button
                    onClick={handleCopy}
                    aria-label="Copy transcript"
                    className="p-1.5 rounded-lg text-[#5A5A6E] hover:text-[#9898A8] hover:bg-[#141418] transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!hasResult ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-64 p-8 text-center"
                  >
                    <AudioLines size={40} className="text-[#1F1F28] mb-4" />
                    <p className="text-[#5A5A6E] text-sm">
                      Upload an audio file to see the transcript appear here
                    </p>
                    <button
                      onClick={simulateProcessing}
                      className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Try with demo audio
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col h-full"
                  >
                    {/* AI Summary */}
                    {aiAnalysis && (
                      <div className="px-4 py-3 border-b border-[#1F1F28]">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={12} className="text-indigo-400" />
                          <p className="text-xs text-indigo-400 font-medium">
                            AI Summary
                          </p>
                        </div>
                        <p className="text-xs text-[#9898A8] leading-relaxed mb-3">
                          {parseSummary(aiAnalysis)}
                        </p>
                        <p className="text-xs text-[#5A5A6E] font-medium mb-2">
                          Key Highlights
                        </p>
                        <ul className="space-y-1.5">
                          {parseHighlights(aiAnalysis).map((h, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-2 text-xs"
                            >
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span className="text-[#9898A8]">{h}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="px-4 py-3 border-b border-[#1F1F28] flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                        <span className="text-xs text-indigo-400">AI is summarizing the transcript...</span>
                      </div>
                    )}

                    {/* Transcript */}
                    <div className="flex-1 px-4 py-3 overflow-y-auto max-h-48">
                      <p className="text-xs text-[#5A5A6E] font-medium mb-2">
                        Full Transcript
                      </p>
                      <pre className="text-xs text-[#9898A8] leading-relaxed whitespace-pre-wrap font-sans">
                        {mockTranscript}
                      </pre>
                    </div>

                    {/* Export */}
                    <div className="px-4 py-3 border-t border-[#1F1F28]">
                      <p className="text-xs text-[#5A5A6E] mb-2">Export as</p>
                      <div className="flex gap-2">
                        {exportFormats.map((fmt) => (
                          <button
                            key={fmt}
                            className="px-3 py-1 rounded-lg text-xs bg-[#141418] border border-[#1F1F28] text-[#9898A8] hover:text-[#F8F8FC] hover:border-indigo-500/30 transition-colors flex items-center gap-1.5"
                            aria-label={`Export as ${fmt}`}
                          >
                            <Download size={10} />
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AudioToolsDemo;
