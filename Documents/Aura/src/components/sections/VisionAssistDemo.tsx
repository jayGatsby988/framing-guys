"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, RefreshCw, ChevronRight, Check, Upload, Camera, ImageIcon } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const scenarios = [
  {
    description:
      "Park bench detected 3 meters ahead. Clear pathway. One person walking from left. Bicycle approaching from right — caution advised.",
    objects: [
      { label: "Park Bench", detail: "3.0m ahead", confidence: 97, color: "bg-emerald-500" },
      { label: "Person", detail: "2.1m left", confidence: 94, color: "bg-blue-500" },
      { label: "Bicycle", detail: "4.5m right", confidence: 89, color: "bg-amber-500" },
      { label: "Clear Path", detail: "Forward", confidence: 98, color: "bg-emerald-500" },
    ],
  },
  {
    description:
      "Indoor corridor. Door with handle visible 1.2 meters ahead. Exit sign above. Staircase begins at 0.5 meters. Caution: step down.",
    objects: [
      { label: "Door Handle", detail: "1.2m ahead", confidence: 99, color: "bg-emerald-500" },
      { label: "Exit Sign", detail: "Above", confidence: 96, color: "bg-blue-500" },
      { label: "Staircase", detail: "0.5m ahead", confidence: 98, color: "bg-red-500" },
      { label: "Handrail", detail: "Right wall", confidence: 91, color: "bg-emerald-500" },
    ],
  },
  {
    description:
      "Street intersection. Crosswalk signal showing walk now. Bus stop 15 meters ahead on the right. Wet floor sign near entrance.",
    objects: [
      { label: "Crosswalk", detail: "Walk signal", confidence: 99, color: "bg-emerald-500" },
      { label: "Bus Stop", detail: "15m right", confidence: 95, color: "bg-blue-500" },
      { label: "Wet Floor", detail: "Nearby", confidence: 88, color: "bg-amber-500" },
      { label: "Building", detail: "Ahead", confidence: 92, color: "bg-blue-500" },
    ],
  },
];

const modes = ["Object Detection", "Text Reading", "Navigation", "Faces"];
const benefits = [
  "Real-time scene analysis with 97%+ accuracy",
  "Distance and direction estimation",
  "Obstacle and hazard detection",
  "Text recognition in any language",
  "Face recognition with emotion detection",
  "Works in low-light conditions",
];

export function VisionAssistDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [activeMode, setActiveMode] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentScenario = scenarios[scenarioIndex];

  useEffect(() => {
    if (!uploadedImage) {
      typeText(currentScenario.description);
    }
  }, [scenarioIndex]);

  const typeText = (text: string) => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
    return () => clearInterval(interval);
  };

  const handleRefresh = () => {
    if (uploadedImage) {
      // Re-analyze the uploaded image
      analyzeImage(uploadedImage);
      return;
    }
    setIsRefreshing(true);
    setTimeout(() => {
      setScenarioIndex((prev) => (prev + 1) % scenarios.length);
      setIsRefreshing(false);
    }, 800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setAiDescription(null);
    setDisplayedText("");

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setAiDescription(data.description);
      typeText(data.description);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setAiDescription(msg);
      typeText(`Error: ${msg}. Try uploading another image.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setAiDescription(null);
    setDisplayedText("");
    typeText(currentScenario.description);
  };

  return (
    <section
      id="vision-demo"
      aria-labelledby="vision-heading"
      className="relative py-24 lg:py-32 bg-[#070709] overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.05] pointer-events-none"
        style={{ background: "radial-gradient(circle, #A78BFA, transparent)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Badge variant="accent" className="mb-5">Vision Assist</Badge>
            <h2
              id="vision-heading"
              className="text-3xl sm:text-4xl font-bold text-[#F8F8FC] mb-5 leading-tight"
            >
              AI eyes that describe{" "}
              <span className="gradient-text">the world around you</span>
            </h2>
            <p className="text-[#9898A8] leading-relaxed mb-8">
              AURA&apos;s vision AI understands your environment in real time — detecting
              objects, reading text, estimating distances, and describing scenes with
              natural language. Upload any image to try it live with GPT-4o.
            </p>

            <ul className="space-y-3 mb-10">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-indigo-400" />
                  </div>
                  <span className="text-sm text-[#9898A8]">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant="primary"
                size="lg"
                icon={<Upload size={18} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Image to Analyze
              </Button>
              {uploadedImage && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={clearUpload}
                >
                  Clear &amp; Reset Demo
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              aria-label="Upload image for vision analysis"
            />
          </motion.div>

          {/* Right - demo UI */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F28]">
                <div className="flex items-center gap-2.5">
                  <Eye size={16} className="text-violet-400" />
                  <span className="text-sm font-semibold text-[#F8F8FC]">
                    Vision Assist
                  </span>
                  <Badge variant={uploadedImage ? "accent" : "success"} dot className="text-[10px]">
                    {uploadedImage ? "Uploaded" : "Active"}
                  </Badge>
                </div>
                <button
                  onClick={handleRefresh}
                  aria-label="Refresh scene"
                  className="p-1.5 rounded-lg text-[#5A5A6E] hover:text-[#9898A8] hover:bg-[#141418] transition-colors"
                >
                  <RefreshCw
                    size={14}
                    className={isRefreshing || isAnalyzing ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* Mode selector */}
              <div className="flex gap-1 px-4 py-2.5 border-b border-[#1F1F28] overflow-x-auto">
                {modes.map((mode, i) => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(i)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      activeMode === i
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "text-[#5A5A6E] hover:text-[#9898A8]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Camera feed / uploaded image */}
              <div className="relative mx-4 mt-4 rounded-xl overflow-hidden bg-[#080810] border border-[#1F1F28] h-44">
                {uploadedImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt="Uploaded image for analysis"
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                          <span className="text-xs text-indigo-300">Analyzing with GPT-4o...</span>
                        </div>
                      </div>
                    )}
                    {/* Scan line overlay */}
                    {isAnalyzing && (
                      <div
                        className="absolute left-0 right-0 h-1 opacity-80"
                        style={{
                          background: "linear-gradient(90deg, transparent, #818CF8, transparent)",
                          animation: "scan-line 2s linear infinite",
                        }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {/* Fake camera visual */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #0a0a14 0%, #10102a 50%, #0a0a14 100%)",
                      }}
                    />

                    {/* Grid overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                      }}
                    />

                    {/* Scan line */}
                    <div
                      className="absolute left-0 right-0 h-0.5 animate-scan-line opacity-70"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #818CF8, transparent)",
                      }}
                    />

                    {/* Object detection boxes */}
                    <AnimatePresence>
                      {!isRefreshing && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-8 left-10 w-16 h-14 border border-emerald-500/60 rounded-sm"
                          >
                            <span className="absolute -top-4 left-0 text-[9px] text-emerald-400 bg-emerald-500/20 px-1 rounded">
                              bench
                            </span>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.2 }}
                            className="absolute top-6 right-16 w-10 h-20 border border-blue-500/60 rounded-sm"
                          >
                            <span className="absolute -top-4 left-0 text-[9px] text-blue-400 bg-blue-500/20 px-1 rounded">
                              person
                            </span>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.4 }}
                            className="absolute top-16 right-4 w-12 h-14 border border-amber-500/60 rounded-sm"
                          >
                            <span className="absolute -top-4 left-0 text-[9px] text-amber-400 bg-amber-500/20 px-1 rounded">
                              bike
                            </span>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Corner markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-violet-500/60 rounded-tl" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-violet-500/60 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-violet-500/60 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-violet-500/60 rounded-br" />

                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-[#9898A8]">
                    {uploadedImage ? "UPLOADED" : "LIVE"}
                  </span>
                </div>
              </div>

              {/* Detections - only show for demo mode */}
              {!uploadedImage && (
                <div className="px-4 py-3 space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={scenarioIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      {currentScenario.objects.map((obj, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-xs text-[#9898A8] w-28 shrink-0">
                            {obj.label}
                          </span>
                          <div className="flex-1 h-1.5 bg-[#141418] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${obj.confidence}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                              className={`h-full rounded-full ${obj.color}`}
                            />
                          </div>
                          <span className="text-xs text-[#5A5A6E] w-12 text-right shrink-0">
                            {obj.detail}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* Upload prompt for image mode */}
              {uploadedImage && !isAnalyzing && !aiDescription && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-[#5A5A6E]">Processing image...</p>
                </div>
              )}

              {/* Description */}
              <div className="mx-4 mb-4 bg-[#141418] border border-[#1F1F28] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[#5A5A6E]">
                    {uploadedImage ? "GPT-4o Vision Analysis" : "AI Description"}
                  </p>
                  {uploadedImage && aiDescription && (
                    <Badge variant="accent" className="text-[9px]">Live AI</Badge>
                  )}
                </div>
                <p className="text-sm text-[#9898A8] leading-relaxed min-h-[40px] whitespace-pre-wrap">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-3.5 bg-indigo-400 ml-0.5 animate-typing-cursor" />
                  )}
                </p>
              </div>

              {/* Upload CTA inside card */}
              {!uploadedImage && (
                <div className="mx-4 mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#1F1F28] text-xs text-[#5A5A6E] hover:text-indigo-400 hover:border-indigo-500/30 transition-colors"
                  >
                    <Camera size={14} />
                    Upload your own image for real AI analysis
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default VisionAssistDemo;
