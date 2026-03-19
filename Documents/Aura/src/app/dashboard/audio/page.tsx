'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Volume2, VolumeX, Play, Pause, Square, Type, FileText,
  Loader2, Copy, Download, Sparkles, Settings2, RotateCcw
} from 'lucide-react'
import { logActivity } from '@/lib/supabase'

export default function AudioPage() {
  // TTS State
  const [ttsText, setTtsText] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)

  // Summarizer State
  const [summaryInput, setSummaryInput] = useState('')
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)

  // Tab
  const [activeTab, setActiveTab] = useState<'tts' | 'summarize'>('tts')

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    function loadVoices() {
      const v = window.speechSynthesis.getVoices()
      setVoices(v)
      if (v.length > 0 && !selectedVoice) {
        const english = v.find(voice => voice.lang.startsWith('en'))
        setSelectedVoice(english?.name || v[0].name)
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.cancel() }
  }, [selectedVoice])

  function speak() {
    if (!ttsText.trim()) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(ttsText)
    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = pitch

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false) }
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false) }
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false) }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    logActivity('audio', 'Text-to-speech', `${ttsText.slice(0, 40)}...`)
  }

  function togglePause() {
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  async function summarize() {
    if (!summaryInput.trim()) return
    setSummarizing(true)
    setSummary('')
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: summaryInput }),
      })
      const data = await res.json()
      setSummary(data.analysis || 'Could not generate summary.')
      await logActivity('audio', 'Content summarized', `${summaryInput.slice(0, 40)}...`)
    } catch {
      setSummary('Failed to generate summary. Please try again.')
    }
    setSummarizing(false)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-teal-400" />
          </div>
          Audio Tools
        </h1>
        <p className="text-white/50 mt-2">Text-to-speech and AI-powered content summarization.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('tts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'tts'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          Text-to-Speech
        </button>
        <button
          onClick={() => setActiveTab('summarize')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'summarize'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Summarizer
        </button>
      </div>

      {/* TTS Tab */}
      {activeTab === 'tts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Text Input */}
            <div className="lg:col-span-2">
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Type or paste text here and AURA will read it aloud..."
                rows={10}
                className="w-full bg-[#0F0F12] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 resize-none"
              />
              <div className="flex items-center gap-3 mt-3">
                {!isSpeaking ? (
                  <button
                    onClick={speak}
                    disabled={!ttsText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 disabled:opacity-40 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Speak
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePause}
                      className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl hover:bg-amber-500/30 transition-colors"
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  </>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-1.5 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-teal-400 rounded-full animate-pulse"
                        style={{
                          height: `${12 + Math.random() * 16}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '0.6s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Voice Settings */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Voice Settings
              </h3>

              <div>
                <label className="text-xs text-white/40 block mb-1.5">Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-teal-500/50"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-white/40">Speed</label>
                  <span className="text-xs text-white/30">{rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-white/40">Pitch</label>
                  <span className="text-xs text-white/30">{pitch}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <p className="text-[10px] text-white/20">Uses your browser&apos;s built-in speech synthesis. Voice selection varies by browser and OS.</p>
            </div>
          </div>

          {/* Sample texts */}
          <div>
            <p className="text-xs text-white/30 mb-2">Try a sample:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Welcome message', text: 'Welcome to AURA. I am your accessibility assistant, here to help you see, hear, and navigate the world with confidence.' },
                { label: 'Navigation', text: 'You are facing north. There is a crosswalk 10 meters ahead. The traffic light is currently red. A coffee shop is on your left.' },
                { label: 'Document', text: 'This document is a medical appointment reminder for March 25th at 2:30 PM with Dr. Johnson at City Medical Center, Suite 204.' },
              ].map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => setTtsText(sample.text)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/10 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summarizer Tab */}
      {activeTab === 'summarize' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <textarea
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="Paste any text — an article, transcript, email, document — and AURA will pull out the key points..."
                rows={14}
                className="w-full bg-[#0F0F12] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 resize-none"
              />
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={summarize}
                  disabled={!summaryInput.trim() || summarizing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 disabled:opacity-40 transition-colors"
                >
                  {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Summarize
                </button>
                <button
                  onClick={() => { setSummaryInput(''); setSummary('') }}
                  className="p-2.5 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs text-white/20 ml-auto">{summaryInput.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* Output */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  AI Summary
                </h3>
                {summary && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(summary)
                        utterance.rate = 0.9
                        window.speechSynthesis.speak(utterance)
                      }}
                      className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(summary)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5 min-h-[320px]">
                {summarizing ? (
                  <div className="flex flex-col items-center justify-center h-[280px] gap-3">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    <p className="text-sm text-white/40">Analyzing content...</p>
                  </div>
                ) : summary ? (
                  <div className="text-sm text-white/70 space-y-2 leading-relaxed">
                    {summary.split('\n').map((line, i) => {
                      if (line.match(/^(SUMMARY|HIGHLIGHTS|ACTION ITEMS|KEY POINTS):/i)) {
                        return <h4 key={i} className="text-teal-300 font-semibold text-xs uppercase tracking-wider mt-3 mb-1">{line}</h4>
                      }
                      if (line.trim()) return <p key={i}>{line}</p>
                      return null
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[280px] text-center">
                    <FileText className="w-10 h-10 text-white/10 mb-3" />
                    <p className="text-white/30 text-sm">Paste text and click Summarize</p>
                    <p className="text-white/15 text-xs mt-1">AURA will extract key points and action items</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
