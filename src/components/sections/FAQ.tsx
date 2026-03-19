"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is AURA?",
    answer:
      "AURA (Adaptive Universal Real-time Accessibility) is an AI-powered accessibility platform that combines six core tools: Vision Assist (real-time scene understanding), Live Captions (speech transcription), Audio Tools (audio-to-text processing), Web Overlay (instant website accessibility improvements), Voice Control (natural language navigation), and an AI Companion (conversational assistant). Together, they create a unified accessibility layer for both digital and physical environments.",
  },
  {
    question: "How does the Vision Assist feature work?",
    answer:
      "Vision Assist uses your device's camera combined with our computer vision AI to analyze your environment in real time. It identifies objects, estimates distances and directions, reads text (including signs, menus, and labels), recognizes faces, and describes scenes in natural language. All of this is delivered via audio feedback in under 100 milliseconds, giving you an accurate and timely picture of your surroundings.",
  },
  {
    question: "Is my data private? Where is it processed?",
    answer:
      "Your privacy is paramount. AURA processes as much data on-device as technically feasible — particularly for Vision Assist and real-time captions. When cloud processing is necessary (for complex scene understanding or long audio transcription), your data is encrypted in transit and at rest, processed immediately, and never stored, sold, or used for training. We comply with GDPR, CCPA, and applicable data protection laws. Our full privacy policy details every data flow.",
  },
  {
    question: "Which browsers and devices does AURA support?",
    answer:
      "The web platform works best in Chrome and Edge, which have the most comprehensive Web Speech API support. Firefox and Safari work for most features but have limited speech recognition support. The Web Overlay extension is available for Chrome and Edge. Native mobile apps for iOS (iPhone 12+) and Android (Android 10+) are coming in Q2 2026, with full Vision Assist support. The AI Companion and captions work across all modern browsers.",
  },
  {
    question: "How accurate are the Live Captions?",
    answer:
      "Our Live Captions achieve 99.2% accuracy for English in clear audio conditions, measured against a standard test corpus. Accuracy can vary depending on accent strength, background noise, and audio quality. We support 40+ languages with accuracy ranging from 95-99%. Speaker identification correctly labels speakers in 94% of multi-speaker scenarios. We continuously improve our models with monthly updates.",
  },
  {
    question: "Can AURA work offline?",
    answer:
      "Partial offline support is available. Core functions like basic object detection, stored voice commands, and pre-configured accessibility profiles work without an internet connection. Live captions, detailed AI descriptions, and AI Companion responses require connectivity. We're actively expanding our on-device AI capabilities to support full offline use by late 2026.",
  },
  {
    question: "How much will AURA cost?",
    answer:
      "We're committed to making AURA affordable and accessible to everyone who needs it. We'll offer a free tier with core features, a premium tier for advanced AI capabilities and unlimited usage, and an enterprise tier for organizations. We're also working with disability advocacy groups on subsidized pricing for individuals who cannot afford standard pricing. Exact pricing will be announced at launch.",
  },
  {
    question: "When will AURA be publicly available?",
    answer:
      "We're currently in a closed early access phase. Join our waitlist to be among the first to receive access. We're onboarding users in batches to ensure quality — early access users get lifetime discounted pricing and direct input into feature development. We anticipate broader public launch in mid-2026.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative py-24 lg:py-32 bg-[#070709] overflow-hidden"
    >
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="FAQ"
          title="Common questions"
          subtitle="Everything you need to know about AURA. Can't find what you're looking for? Contact us directly."
          align="center"
          id="faq-heading"
          className="mb-12"
        />

        <div className="space-y-3" role="list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                role="listitem"
              >
                <div
                  className={cn(
                    "rounded-xl border transition-all duration-200",
                    isOpen
                      ? "bg-[#0F0F12] border-indigo-500/30 shadow-lg shadow-indigo-600/5"
                      : "bg-[#0F0F12] border-[#1F1F28] hover:border-[#2F2F40]"
                  )}
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <span
                      className={cn(
                        "text-sm font-semibold leading-relaxed",
                        isOpen ? "text-[#F8F8FC]" : "text-[#9898A8]"
                      )}
                    >
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 mt-0.5"
                    >
                      <ChevronDown
                        size={16}
                        className={isOpen ? "text-indigo-400" : "text-[#5A5A6E]"}
                      />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-[#1F1F28] pt-4">
                          <p className="text-sm text-[#9898A8] leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
