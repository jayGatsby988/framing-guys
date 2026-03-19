'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Camera, Loader2, Volume2, Copy, Eye, Wifi, WifiOff,
  RotateCcw, Pause, Play, AlertTriangle, MapPin, Sparkles,
  Smartphone, Scan, Vibrate, ArrowRight
} from 'lucide-react'
import { logActivity } from '@/lib/supabase'

export default function LiveCameraPage() {
  const [sessionId] = useState(() => Math.random().toString(36).slice(2, 10))
  const [connected, setConnected] = useState(false)
  const [latestFrame, setLatestFrame] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState('')
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [frameAge, setFrameAge] = useState<number | null>(null)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [fps, setFps] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const analyzeRef = useRef<NodeJS.Timeout | null>(null)
  const lastAnalyzedRef = useRef<string | null>(null)
  const frameCountRef = useRef(0)
  const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const mobileUrl = `${baseUrl}/live/${sessionId}`

  // FPS counter
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
    }, 1000)
    return () => { if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current) }
  }, [])

  // Poll for new frames — fast polling (500ms)
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/live?sessionId=${sessionId}`)
        const data = await res.json()
        if (data.image) {
          setLatestFrame(data.image)
          setFrameAge(data.age)
          setConnected(true)
          frameCountRef.current++
          // Reset disconnect timer
          if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current)
          disconnectTimerRef.current = setTimeout(() => {
            setConnected(false)
            setLatestFrame(null)
          }, 8000)
        }
      } catch {
        // Ignore poll errors
      }
    }, 500)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (analyzeRef.current) clearInterval(analyzeRef.current)
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current)
    }
  }, [sessionId])

  // Auto-analyze frames
  const analyzeFrame = useCallback(async (frameData: string) => {
    if (analyzing || frameData === lastAnalyzedRef.current) return
    setAnalyzing(true)
    lastAnalyzedRef.current = frameData

    try {
      const base64 = frameData.includes(',') ? frameData.split(',')[1] : frameData
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          systemPrompt: `You are AURA Live Vision assisting a visually impaired user in real-time. Their phone camera is streaming to you. Be extremely concise and practical.

SCENE: One sentence — what's in front of them right now.
OBJECTS: Key things with positions (left/center/right, near/far). Max 3 items.
HAZARDS: Any safety concerns (stairs, curbs, traffic, obstacles, wet floor). Say "None detected" if safe.
GUIDANCE: One actionable instruction (e.g., "Path is clear ahead", "Step down in 2 feet", "Door handle on your right").

Prioritize safety above all. Be direct. No camera quality comments.`
        }),
      })
      const data = await res.json()
      if (data.description) {
        setResult(data.description)
        setAnalysisCount(c => c + 1)

        // Send guidance back to phone
        const guidanceLine = data.description.split('\n').find((l: string) => l.match(/^GUIDANCE:/i))
        if (guidanceLine) {
          fetch('/api/live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, guidance: guidanceLine.replace(/^GUIDANCE:\s*/i, '') }),
          }).catch(() => {})
        }

        // Auto-speak new results
        if (autoSpeak && typeof window !== 'undefined') {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(data.description)
          utterance.rate = 1.05
          window.speechSynthesis.speak(utterance)
        }

        await logActivity('vision', 'Live camera analysis', 'Real-time frame analyzed')
      }
    } catch {
      // Silently fail
    }
    setAnalyzing(false)
  }, [analyzing, sessionId, autoSpeak])

  useEffect(() => {
    if (autoAnalyze && latestFrame && connected) {
      analyzeRef.current = setInterval(() => {
        if (latestFrame && !analyzing) {
          analyzeFrame(latestFrame)
        }
      }, 3000)

      if (analysisCount === 0) {
        analyzeFrame(latestFrame)
      }

      return () => { if (analyzeRef.current) clearInterval(analyzeRef.current) }
    }
  }, [autoAnalyze, latestFrame, connected, analyzeFrame, analyzing, analysisCount])

  function speakResult() {
    if (!result) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(result)
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/20 flex items-center justify-center border border-red-500/20">
            <Camera className="w-5 h-5 text-red-400" />
          </div>
          Live AR Vision
        </h1>
        <p className="text-white/40 mt-2 text-sm">Scan the QR code with your phone. AURA will analyze what your camera sees and speak guidance in real-time.</p>
      </motion.div>

      {!connected ? (
        /* ── QR CODE SCREEN ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0B0B0F] border border-white/[0.06] rounded-3xl overflow-hidden"
        >
          <div className="p-8 lg:p-12 flex flex-col items-center text-center">
            {/* Instructions */}
            <div className="flex items-center gap-3 mb-6">
              {[
                { icon: Smartphone, text: 'Open phone camera' },
                { icon: Scan, text: 'Scan QR code' },
                { icon: Vibrate, text: 'Get live guidance' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    <step.icon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] text-white/50 font-medium">{step.text}</span>
                  </div>
                  {i < 2 && <ArrowRight className="w-3 h-3 text-white/10" />}
                </div>
              ))}
            </div>

            {/* Big QR Code */}
            <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 mb-6">
              <QRCodeSVG
                value={mobileUrl}
                size={320}
                level="H"
                includeMargin={false}
                style={{ width: '100%', height: 'auto', maxWidth: 320 }}
              />
            </div>

            <p className="text-white/30 text-sm mb-2 max-w-sm">
              Point your phone camera at this QR code. It will open AURA&apos;s camera page and start streaming automatically.
            </p>

            {/* URL copy */}
            <div className="flex items-center gap-2 mt-2">
              <code className="text-[10px] text-white/15 font-mono break-all">{mobileUrl}</code>
              <button
                onClick={() => navigator.clipboard.writeText(mobileUrl)}
                className="p-1.5 rounded-lg text-white/15 hover:text-white/40 hover:bg-white/5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Connection status bar */}
          <div className="px-6 py-4 border-t border-white/[0.04] bg-white/[0.01] flex items-center gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-white/20" />
              <span className="text-sm text-white/30">Waiting for phone connection...</span>
            </div>
            <div className="ml-auto">
              <Loader2 className="w-4 h-4 text-white/15 animate-spin" />
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── LIVE FEED ── */
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Camera feed — 3 cols */}
          <div className="lg:col-span-3 space-y-3">
            {/* Status bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Phone connected</span>
              <span className="text-xs text-emerald-400/40 ml-auto">
                {fps > 0 && `${fps} fps`}
                {frameAge !== null && frameAge < 2000 && ' \u00B7 Live'}
                {frameAge !== null && frameAge >= 2000 && ` \u00B7 ${Math.floor(frameAge / 1000)}s ago`}
              </span>
            </div>

            {/* Video feed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-black rounded-2xl overflow-hidden border border-white/10 aspect-video"
            >
              {latestFrame && (
                <img
                  src={latestFrame}
                  alt="Live camera feed"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/80 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] text-white font-bold">LIVE</span>
                </div>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                <Eye className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] text-white/60">{analysisCount} scans</span>
              </div>
              {analyzing && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/90 backdrop-blur-sm">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                  <span className="text-[10px] text-white font-semibold">Analyzing frame...</span>
                </div>
              )}
              {/* Scan line */}
              {!analyzing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent animate-scan-line" />
                </div>
              )}
            </motion.div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAutoAnalyze(!autoAnalyze)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  autoAnalyze
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}
              >
                {autoAnalyze ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {autoAnalyze ? 'Auto-analyzing' : 'Paused'}
              </button>
              <button
                onClick={() => latestFrame && analyzeFrame(latestFrame)}
                disabled={analyzing}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Analyze Now
              </button>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  autoSpeak
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
              </button>
            </div>
          </div>

          {/* Analysis panel — 2 cols */}
          <div className="lg:col-span-2 bg-[#0B0B0F] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Narration
              </h3>
              {result && (
                <div className="flex gap-1">
                  <button onClick={speakResult} className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5" title="Read aloud">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(result)} className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5" title="Copy">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {result ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={result.slice(0, 30)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    {result.split('\n').map((line, i) => {
                      if (line.match(/^(SCENE|OBJECTS|KEY OBJECTS|HAZARDS|GUIDANCE|TEXT):/i)) {
                        const isHazard = line.includes('HAZARD')
                        const isGuidance = line.includes('GUIDANCE')
                        return (
                          <h4 key={i} className={`font-semibold text-[11px] uppercase tracking-wider mt-3 mb-1 flex items-center gap-1.5 ${
                            isHazard ? 'text-amber-400' : isGuidance ? 'text-emerald-400' : 'text-indigo-300'
                          }`}>
                            {isHazard && <AlertTriangle className="w-3.5 h-3.5" />}
                            {isGuidance && <MapPin className="w-3.5 h-3.5" />}
                            {line}
                          </h4>
                        )
                      }
                      if (line.startsWith('- ') || line.startsWith('\u2022 ')) {
                        return <p key={i} className="text-white/60 text-xs ml-3 my-0.5">{line}</p>
                      }
                      if (line.trim()) {
                        return <p key={i} className="text-white/60 text-xs my-0.5">{line}</p>
                      }
                      return null
                    })}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Camera className="w-8 h-8 text-white/[0.06] mb-3" />
                  <p className="text-white/20 text-xs">Waiting for first analysis...</p>
                  <p className="text-white/10 text-[10px] mt-1">AURA analyzes frames every 3 seconds</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line { animation: scan-line 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
