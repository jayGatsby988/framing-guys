'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Copy, Download, Volume2, Trash2,
  Loader2, Clock, Sparkles, RotateCcw, Pause, Play
} from 'lucide-react'
import { supabase, DEFAULT_PROFILE_ID, logActivity } from '@/lib/supabase'

interface TranscriptEntry {
  text: string
  timestamp: string
  isFinal: boolean
}

interface SavedTranscript {
  id: string
  title: string
  content: string
  summary: string | null
  duration_seconds: number | null
  word_count: number | null
  created_at: string
}

export default function CaptionsPage() {
  const [isListening, setIsListening] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [interim, setInterim] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [duration, setDuration] = useState(0)
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)
  const [savedTranscripts, setSavedTranscripts] = useState<SavedTranscript[]>([])
  const [selectedTranscript, setSelectedTranscript] = useState<SavedTranscript | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setIsSupported(false); return }
    loadSavedTranscripts()
    return () => {
      recognitionRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript, interim])

  async function loadSavedTranscripts() {
    const { data } = await supabase
      .from('transcripts')
      .select('*')
      .eq('profile_id', DEFAULT_PROFILE_ID)
      .order('created_at', { ascending: false })
      .limit(20)
    setSavedTranscripts(data ?? [])
  }

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const text = result[0].transcript.trim()
          if (text) {
            setTranscript(prev => [...prev, {
              text,
              timestamp: new Date().toLocaleTimeString(),
              isFinal: true,
            }])
          }
          setInterim('')
        } else {
          interimText += result[0].transcript
        }
      }
      if (interimText) setInterim(interimText)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' and 'network' are expected in restricted environments (e.g. previews)
      if (event.error === 'no-speech' || event.error === 'network' || event.error === 'not-allowed') return
      console.warn('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      // Auto-restart if still listening (handles browser timeouts)
      if (recognitionRef.current && !isPaused) {
        try { recognitionRef.current.start() } catch {}
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
    setIsPaused(false)
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }, [isPaused])

  function stopListening() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    setIsPaused(false)
    setInterim('')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function togglePause() {
    if (isPaused) {
      startListening()
    } else {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function getFullText() {
    return transcript.map(t => t.text).join(' ')
  }

  function copyTranscript() {
    navigator.clipboard.writeText(getFullText())
  }

  function downloadTranscript() {
    const text = transcript.map(t => `[${t.timestamp}] ${t.text}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aura-transcript-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function summarizeTranscript() {
    const text = getFullText()
    if (!text) return
    setSummarizing(true)
    setSummary('')
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await res.json()
      setSummary(data.analysis || 'Could not generate summary.')
    } catch {
      setSummary('Failed to generate summary.')
    }
    setSummarizing(false)
  }

  async function saveTranscript() {
    const text = getFullText()
    if (!text) return
    const wordCount = text.split(/\s+/).length
    await supabase.from('transcripts').insert({
      profile_id: DEFAULT_PROFILE_ID,
      title: `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      content: text,
      summary: summary || null,
      duration_seconds: duration,
      word_count: wordCount,
    })
    await logActivity('captions', 'Saved transcript', `${wordCount} words, ${formatDuration(duration)}`)
    loadSavedTranscripts()
  }

  function speakText(text: string) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <MicOff className="w-16 h-16 text-white/10 mb-4" />
        <h2 className="text-xl font-semibold text-white/60">Speech Recognition Not Supported</h2>
        <p className="text-white/30 mt-2 max-w-md">Your browser doesn&apos;t support the Web Speech API. Please try Chrome, Edge, or Safari.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Mic className="w-5 h-5 text-pink-400" />
          </div>
          Live Captions
        </h1>
        <p className="text-white/50 mt-2">Real-time speech-to-text. Start speaking and see your words appear instantly.</p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
          >
            <Mic className="w-5 h-5" />
            Start Listening
          </button>
        ) : (
          <>
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-5 py-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-medium hover:bg-amber-500/30 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopListening}
              className="flex items-center gap-2 px-5 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
            >
              <MicOff className="w-4 h-4" />
              Stop
            </button>
          </>
        )}

        {/* Status */}
        <div className="flex items-center gap-4 ml-auto">
          {isListening && (
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-pink-400 animate-pulse'}`} />
              <span className="text-xs text-white/40">{isPaused ? 'Paused' : 'Listening'}</span>
            </div>
          )}
          {duration > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(duration)}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transcript Panel */}
        <div className="lg:col-span-2 bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">Live Transcript</h3>
            <div className="flex gap-1">
              <button onClick={copyTranscript} disabled={!transcript.length} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-30" title="Copy all">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={downloadTranscript} disabled={!transcript.length} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-30" title="Download">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => { setTranscript([]); setInterim(''); setSummary(''); setDuration(0) }} disabled={!transcript.length} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-30" title="Clear">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="p-5 h-[400px] overflow-y-auto space-y-3">
            {transcript.length === 0 && !interim ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mic className="w-10 h-10 text-white/10 mb-3" />
                <p className="text-white/30 text-sm">
                  {isListening ? 'Listening... Start speaking' : 'Click "Start Listening" to begin'}
                </p>
              </div>
            ) : (
              <>
                {transcript.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 group"
                  >
                    <span className="text-[10px] text-white/20 pt-1 flex-shrink-0 font-mono w-16">{entry.timestamp}</span>
                    <p className="text-sm text-white/80 leading-relaxed">{entry.text}</p>
                    <button
                      onClick={() => speakText(entry.text)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-white/50 flex-shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
                {interim && (
                  <div className="flex gap-3">
                    <span className="text-[10px] text-white/20 pt-1 flex-shrink-0 font-mono w-16">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <p className="text-sm text-white/40 italic">{interim}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Save + Summarize */}
          {transcript.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5 flex flex-wrap gap-2">
              <button
                onClick={saveTranscript}
                className="px-4 py-2 bg-pink-500/20 text-pink-300 rounded-lg text-sm font-medium hover:bg-pink-500/30 transition-colors"
              >
                Save Transcript
              </button>
              <button
                onClick={summarizeTranscript}
                disabled={summarizing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
              >
                {summarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Summarize
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Summary */}
          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0F0F12] border border-indigo-500/20 rounded-2xl p-5"
              >
                <h3 className="text-sm font-medium text-indigo-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Summary
                </h3>
                <div className="text-sm text-white/60 space-y-2">
                  {summary.split('\n').map((line, i) => (
                    line.trim() ? <p key={i}>{line}</p> : null
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Saved Transcripts */}
          <div className="bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="text-sm font-medium text-white/60">Saved Transcripts</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {savedTranscripts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white/20 text-xs">No saved transcripts yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {savedTranscripts.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTranscript(t)}
                      className="w-full text-left px-5 py-3 hover:bg-white/5 transition-colors"
                    >
                      <p className="text-sm text-white/60 truncate">{t.title}</p>
                      <p className="text-xs text-white/20 mt-0.5">
                        {t.word_count} words &middot; {t.duration_seconds ? formatDuration(t.duration_seconds) : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Transcript Modal */}
      <AnimatePresence>
        {selectedTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTranscript(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F0F12] border border-white/10 rounded-2xl max-w-lg w-full max-h-[70vh] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-medium text-white">{selectedTranscript.title}</h3>
                <button onClick={() => setSelectedTranscript(null)} className="text-white/30 hover:text-white/60">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <p className="text-sm text-white/70 whitespace-pre-wrap">{selectedTranscript.content}</p>
                {selectedTranscript.summary && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-medium text-indigo-300 mb-2">Summary</h4>
                    <p className="text-sm text-white/50">{selectedTranscript.summary}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
