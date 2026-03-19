"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Eye, Type, MousePointer, Keyboard, Layout } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const textSizes = ["sm", "md", "lg", "xl"];

interface OverlaySettings {
  highContrast: boolean;
  textSize: number;
  showAltText: boolean;
  keyboardMode: boolean;
  simplifiedLayout: boolean;
  largeClickTargets: boolean;
}

export function WebOverlayDemo() {
  const [settings, setSettings] = useState<OverlaySettings>({
    highContrast: false,
    textSize: 1,
    showAltText: false,
    keyboardMode: false,
    simplifiedLayout: false,
    largeClickTargets: false,
  });

  const toggle = (key: keyof OverlaySettings) => {
    if (key === "textSize") return;
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const auraActive =
    settings.highContrast ||
    settings.textSize > 1 ||
    settings.showAltText ||
    settings.keyboardMode ||
    settings.simplifiedLayout ||
    settings.largeClickTargets;

  const controls = [
    {
      key: "highContrast" as const,
      label: "High Contrast",
      icon: Eye,
      description: "Boost color contrast",
    },
    {
      key: "showAltText" as const,
      label: "Show Alt Text",
      icon: Type,
      description: "Display image descriptions",
    },
    {
      key: "keyboardMode" as const,
      label: "Keyboard Navigation",
      icon: Keyboard,
      description: "Enhanced focus indicators",
    },
    {
      key: "simplifiedLayout" as const,
      label: "Simplified Layout",
      icon: Layout,
      description: "Reduce visual complexity",
    },
    {
      key: "largeClickTargets" as const,
      label: "Large Click Targets",
      icon: MousePointer,
      description: "Bigger interactive areas",
    },
  ];

  return (
    <section
      id="overlay-demo"
      aria-labelledby="overlay-heading"
      className="relative py-24 lg:py-32 bg-[#0F0F12] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Web Overlay"
          title="Make any website accessible, instantly"
          subtitle="AURA's overlay engine transforms any webpage — improving contrast, enlarging text, adding keyboard navigation, and more — in real time."
          align="center"
          id="overlay-heading"
          className="mb-16"
        />

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start max-w-6xl mx-auto">
          {/* Controls panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl overflow-hidden sticky top-24">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1F1F28]">
                <Globe size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-[#F8F8FC]">
                  AURA Overlay
                </span>
                {auraActive && (
                  <Badge variant="success" dot className="text-[10px] ml-auto">
                    Active
                  </Badge>
                )}
              </div>

              <div className="p-4 space-y-1">
                {controls.map(({ key, label, icon: Icon, description }) => (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left",
                      settings[key]
                        ? "bg-indigo-600/15 border border-indigo-500/30"
                        : "hover:bg-[#141418] border border-transparent"
                    )}
                    role="switch"
                    aria-checked={settings[key] as boolean}
                  >
                    <Icon
                      size={14}
                      className={settings[key] ? "text-indigo-400" : "text-[#5A5A6E]"}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-medium",
                          settings[key] ? "text-[#F8F8FC]" : "text-[#9898A8]"
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-[10px] text-[#5A5A6E] truncate">
                        {description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-8 h-4 rounded-full transition-colors duration-200 shrink-0",
                        settings[key] ? "bg-indigo-600" : "bg-[#1F1F28]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full bg-white mt-0.5 transition-transform duration-200 shadow-sm",
                          settings[key] ? "translate-x-[18px]" : "translate-x-[2px]"
                        )}
                      />
                    </div>
                  </button>
                ))}

                {/* Text size */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Type size={14} className="text-[#5A5A6E]" />
                      <span className="text-xs font-medium text-[#9898A8]">
                        Text Size
                      </span>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium">
                      {textSizes[settings.textSize]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    value={settings.textSize}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        textSize: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${(settings.textSize / 3) * 100}%, #1F1F28 ${(settings.textSize / 3) * 100}%, #1F1F28 100%)`,
                    }}
                    aria-label="Text size"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Website preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative">
              {/* Before/after labels */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="muted" className="text-xs">
                    {auraActive ? "With AURA" : "Without AURA"}
                  </Badge>
                </div>
                <p className="text-xs text-[#5A5A6E]">
                  Toggle controls to see changes
                </p>
              </div>

              {/* Mock webpage */}
              <div
                className={cn(
                  "rounded-2xl border overflow-hidden transition-all duration-300",
                  auraActive
                    ? "border-indigo-500/30 shadow-lg shadow-indigo-600/10"
                    : "border-[#1F1F28]"
                )}
              >
                {/* Browser chrome */}
                <div className="bg-[#141418] px-4 py-2.5 border-b border-[#1F1F28] flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#1F1F28]" />
                    <div className="w-3 h-3 rounded-full bg-[#1F1F28]" />
                    <div className="w-3 h-3 rounded-full bg-[#1F1F28]" />
                  </div>
                  <div className="flex-1 bg-[#0F0F12] rounded-lg px-3 py-1 text-xs text-[#5A5A6E]">
                    example-website.com
                  </div>
                  {auraActive && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                        <Globe size={10} className="text-indigo-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Page content */}
                <div
                  className={cn(
                    "p-6 transition-all duration-300",
                    settings.highContrast
                      ? "bg-black"
                      : "bg-[#1a1a22]"
                  )}
                >
                  {/* Hero area */}
                  <div className="mb-4">
                    <div
                      className={cn(
                        "mb-3 transition-all duration-300",
                        settings.highContrast ? "text-white" : "text-[#888]",
                        settings.textSize === 0 && "text-xs",
                        settings.textSize === 1 && "text-sm",
                        settings.textSize === 2 && "text-base",
                        settings.textSize === 3 && "text-lg",
                        "font-bold"
                      )}
                    >
                      Welcome to Our Website
                    </div>
                    {/* Image with alt text */}
                    <div className="relative rounded-lg overflow-hidden mb-3">
                      <div
                        className={cn(
                          "h-20 rounded-lg flex items-center justify-center transition-all duration-300",
                          settings.highContrast
                            ? "bg-[#111]"
                            : "bg-[#111]"
                        )}
                      >
                        <span className="text-3xl">🌆</span>
                      </div>
                      {settings.showAltText && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg"
                        >
                          <p className="text-xs text-white px-2 text-center">
                            Alt: City skyline at sunset with tall buildings
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <p
                      className={cn(
                        "transition-all duration-300 leading-relaxed",
                        settings.highContrast ? "text-gray-200" : "text-[#555]",
                        settings.textSize === 0 && "text-[10px]",
                        settings.textSize === 1 && "text-xs",
                        settings.textSize === 2 && "text-sm",
                        settings.textSize === 3 && "text-base"
                      )}
                    >
                      Discover our amazing products and services. We offer the
                      best quality at unbeatable prices.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Shop Now", "Learn More", "Contact Us"].map((label) => (
                      <button
                        key={label}
                        className={cn(
                          "rounded transition-all duration-300",
                          settings.largeClickTargets ? "px-4 py-2.5 text-sm" : "px-2.5 py-1 text-xs",
                          settings.highContrast
                            ? "bg-white text-black font-bold"
                            : "bg-[#333] text-[#aaa]",
                          settings.keyboardMode && "ring-2 ring-offset-1 ring-blue-500 ring-offset-black"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                    {/* Unlabeled button */}
                    {!settings.keyboardMode && (
                      <button
                        className={cn(
                          "rounded bg-[#333] transition-all duration-300",
                          settings.largeClickTargets ? "w-10 h-10" : "w-6 h-6"
                        )}
                        aria-label={
                          settings.keyboardMode ? "Close" : undefined
                        }
                      >
                        {settings.keyboardMode ? (
                          <span className="text-xs text-white">×</span>
                        ) : null}
                      </button>
                    )}
                  </div>

                  {/* Form */}
                  {!settings.simplifiedLayout && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Email address"
                        className={cn(
                          "w-full rounded px-3 py-1.5 text-xs border transition-all duration-300",
                          settings.highContrast
                            ? "bg-black border-white text-white placeholder:text-gray-400"
                            : "bg-[#111] border-[#222] text-[#666] placeholder:text-[#333]"
                        )}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        className={cn(
                          "w-full rounded px-3 py-1.5 text-xs border transition-all duration-300",
                          settings.highContrast
                            ? "bg-black border-white text-white placeholder:text-gray-400"
                            : "bg-[#111] border-[#222] text-[#666] placeholder:text-[#333]"
                        )}
                      />
                    </div>
                  )}

                  {/* AURA overlay indicator */}
                  {auraActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400"
                    >
                      <Globe size={10} />
                      <span>AURA Overlay Active — {
                        [
                          settings.highContrast && "High Contrast",
                          settings.textSize > 1 && `Text ${textSizes[settings.textSize]}`,
                          settings.showAltText && "Alt Text",
                          settings.keyboardMode && "Keyboard Mode",
                          settings.largeClickTargets && "Large Targets",
                        ]
                          .filter(Boolean)
                          .join(", ")
                      }</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default WebOverlayDemo;
