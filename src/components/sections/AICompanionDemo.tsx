"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Zap } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hi! I'm AURA, your AI accessibility companion. I can describe what I see, read content aloud, help you navigate, or answer any questions. What would you like help with?",
    timestamp: "now",
  },
];

const responseBank = [
  {
    keywords: ["around", "surroundings", "see", "what"],
    response: "Using your camera, I can see: You're in what appears to be an indoor space. There's a desk ahead, a window to your right with natural light, and a bookshelf on the left wall. The path ahead is clear.",
  },
  {
    keywords: ["read", "page", "content", "website"],
    response: "I'm reading the current page: \"AURA — Adaptive Universal Responsive Assistant. One intelligent layer for a more accessible world. AURA combines AI vision assistance, real-time captions, voice control...\"",
  },
  {
    keywords: ["navigate", "home", "go to", "scroll"],
    response: "Navigating to the top of the page. I can also help you jump to any section — just say or type where you'd like to go.",
  },
  {
    keywords: ["summarize", "summary", "brief", "overview"],
    response: "Here's a summary of this page: AURA is an AI-powered accessibility platform designed for people with vision and hearing impairments. Key features include Vision Assist (AI scene understanding), Live Captions (real-time transcription), Voice Control, and Web Overlay. Currently in early access.",
  },
  {
    keywords: ["hello", "hi", "hey", "greet"],
    response: "Hello! I'm here to help make your digital and physical world more accessible. You can ask me to describe your surroundings, read content, help navigate, or just have a conversation.",
  },
  {
    keywords: ["help", "what can", "how do", "features", "capabilities"],
    response: "I can help you with: 🔍 Describing scenes and objects around you • 📖 Reading any text or page content aloud • 🧭 Navigation assistance and guidance • 🎙 Starting live captions for conversations • 🌐 Improving any website's accessibility • 💬 Answering questions about anything. What would you like to try?",
  },
  {
    keywords: ["caption", "transcript", "hear", "speech"],
    response: "Activating Live Captions. I'll now transcribe speech in real time and display it here. I can also identify different speakers and detect ambient sounds like alarms or doorbells.",
  },
  {
    keywords: ["accessible", "accessibility", "wcag", "standard"],
    response: "Accessibility is at the core of everything I do. AURA follows WCAG 2.1 AA standards, supporting screen readers, keyboard navigation, reduced motion preferences, and high contrast modes. This website itself is built to be fully accessible.",
  },
];

const defaultResponse = "I understand you're looking for help. Could you be more specific? I can describe your surroundings, read content, help navigate, start live captions, or assist with accessibility settings. What would be most helpful right now?";

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const item of responseBank) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }
  return defaultResponse;
};

const quickPrompts = [
  { icon: "👁", label: "What's around me?" },
  { icon: "📖", label: "Read this page" },
  { icon: "🧭", label: "Help me navigate" },
  { icon: "✨", label: "Summarize this" },
];

export function AICompanionDemo() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      const response = getResponse(text);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section
      id="ai-demo"
      aria-labelledby="ai-heading"
      className="relative py-24 lg:py-32 bg-[#0F0F12] overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.05) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="AI Companion"
          title="Your intelligent accessibility assistant"
          subtitle="Ask AURA anything. Describe scenes, read content, navigate your environment, and get help with any accessibility need — in natural conversation."
          align="center"
          id="ai-heading"
          className="mb-16"
        />

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1F1F28]">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <Zap size={14} className="text-white" fill="white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F8F8FC] leading-none">
                    AURA
                  </p>
                  <p className="text-[10px] text-[#5A5A6E]">AI Companion</p>
                </div>
                <Badge variant="success" dot className="text-[10px] ml-auto">
                  Online
                </Badge>
              </div>

              {/* Messages */}
              <div
                className="h-80 overflow-y-auto p-4 space-y-4"
                role="log"
                aria-live="polite"
                aria-label="AI conversation"
              >
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "flex gap-2.5",
                        msg.role === "user" && "flex-row-reverse"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={14} className="text-indigo-400" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          msg.role === "assistant"
                            ? "bg-[#141418] border border-[#1F1F28] rounded-tl-sm"
                            : "bg-indigo-600 rounded-tr-sm"
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm leading-relaxed",
                            msg.role === "assistant"
                              ? "text-[#9898A8]"
                              : "text-white"
                          )}
                        >
                          {msg.content}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            msg.role === "assistant"
                              ? "text-[#5A5A6E]"
                              : "text-indigo-200"
                          )}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <Bot size={14} className="text-indigo-400" />
                      </div>
                      <div className="bg-[#141418] border border-[#1F1F28] rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#9898A8] animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#9898A8] animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#9898A8] animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="px-4 py-2 border-t border-[#1F1F28] flex gap-2 overflow-x-auto">
                {quickPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => sendMessage(p.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] border border-[#1F1F28] text-xs text-[#9898A8] hover:text-[#F8F8FC] hover:border-indigo-500/30 transition-colors whitespace-nowrap"
                    aria-label={`Quick prompt: ${p.label}`}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 px-4 py-3 border-t border-[#1F1F28]"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AURA anything..."
                  className="flex-1 bg-[#141418] border border-[#1F1F28] rounded-xl px-4 py-2.5 text-sm text-[#F8F8FC] placeholder:text-[#5A5A6E] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  aria-label="Message AURA"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:bg-indigo-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Send message"
                >
                  <Send size={14} className="text-white" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AICompanionDemo;
