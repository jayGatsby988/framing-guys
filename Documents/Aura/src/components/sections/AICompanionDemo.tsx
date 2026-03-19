"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Zap, AlertCircle } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: now,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      // Build the conversation history for the API (skip the initial greeting's timestamp)
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
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
          subtitle="Ask AURA anything. Describe scenes, read content, navigate your environment, and get help with any accessibility need — powered by GPT-4o."
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
                  <p className="text-[10px] text-[#5A5A6E]">AI Companion · GPT-4o</p>
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
                            "text-sm leading-relaxed whitespace-pre-wrap",
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

                {error && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 px-2">
                    <AlertCircle size={12} />
                    <span>{error}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="px-4 py-2 border-t border-[#1F1F28] flex gap-2 overflow-x-auto">
                {quickPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => sendMessage(p.label)}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] border border-[#1F1F28] text-xs text-[#9898A8] hover:text-[#F8F8FC] hover:border-indigo-500/30 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
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
