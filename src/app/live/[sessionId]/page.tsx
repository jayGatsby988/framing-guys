'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Camera, Loader2, WifiOff, Wifi, Pause, Play, Volume2, AlertTriangle, Navigation } from 'lucide-react'

export default function MobileCameraPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [streaming, setStreaming] = useState(false)
  const [paused, setPaused] = useState(false)
  const [framesSent, setFramesSent] = useState(0)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const [guidance, setGuidance] = useState('')
  const [guidanceHistory, setGuidanceHistory] = useState<string[]>([])
  const [hasHazard, setHasHazard] = useState(false)
  const [autoStarted, setAutoStarted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const guidanceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    canvasRef.current = document.createElement('canvas')
    return () => { stopStreaming() }
  }, [])

  // Auto-start camera on mount
  useEffect(() => {
    if (!autoStarted) {
      setAutoStarted(true)
      // Small delay to let page render
      const t = setTimeout(() => startCamera(), 500)
      return () => clearTimeout(t)
    }
  }, [autoStarted])

  // Haptic feedback when guidance changes
  useEffect(() => {
    if (guidance && navigator.vibrate) {
      if (hasHazard) {
        // Strong double vibrate for hazards
        navigator.vibrate([100, 50, 200])
      } else {
        // Light pulse for normal guidance
        navigator.vibrate(50)
      }
    }
  }, [guidance, hasHazard])

  // Speak guidance
  useEffect(() => {
    if (guidance && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(guidance)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }, [guidance])

  async function startCamera() {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraReady(true)
      setStreaming(true)
      startSending()
    } catch {
      setError('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const captureAndSend = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || paused) return

    const video = videoRef.current
    const canvas = canvasRef.current
    // Capture at 640x480 for fast transfer
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, 640, 480)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5)

    try {
      const res = await fetch('/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, image: dataUrl }),
      })
      const data = await res.json()
      setFramesSent(c => c + 1)

      // Check for guidance from desktop
      if (data.guidance && data.guidanceAge < 15000) {
        const newGuidance = data.guidance
        if (newGuidance !== guidance) {
          setGuidance(newGuidance)
          setGuidanceHistory(prev => [newGuidance, ...prev].slice(0, 5))
          // Check if hazard related
          const lower = newGuidance.toLowerCase()
          setHasHazard(
            lower.includes('hazard') || lower.includes('careful') ||
            lower.includes('watch') || lower.includes('stop') ||
            lower.includes('stair') || lower.includes('step') ||
            lower.includes('obstacle') || lower.includes('danger')
          )
        }
      }
    } catch {
      // Silently retry next interval
    }
  }, [sessionId, paused, guidance])

  function startSending() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    // Send frames every 500ms (~2 fps network, camera runs at 30fps locally)
    intervalRef.current = setInterval(() => {
      captureAndSend()
    }, 500)
    captureAndSend()
  }

  function stopStreaming() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStreaming(false)
    setCameraReady(false)
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header - minimal */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/5 bg-[#0A0A10] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold">AURA Live</span>
        </div>
        <div className="flex items-center gap-2">
          {streaming ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5">
              <WifiOff className="w-3 h-3 text-white/30" />
              <span className="text-[10px] text-white/30">Offline</span>
            </div>
          )}
          <div className="px-2 py-0.5 rounded-full bg-white/5">
            <span className="text-[10px] text-white/30 font-mono">{framesSent}f</span>
          </div>
        </div>
      </div>

      {/* Camera Feed - full screen */}
      <div className="flex-1 relative bg-black overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraReady ? '' : 'hidden'}`}
          style={{ transform: 'scaleX(1)' }}
        />

        {/* Pre-camera state */}
        {!cameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            {error ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-lg font-bold mb-2">Camera Access Needed</h2>
                <p className="text-red-300/60 text-sm mb-6 max-w-xs">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-8 py-3.5 bg-indigo-500 text-white rounded-2xl font-semibold text-base active:scale-95 transition-all"
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                <p className="text-white/40 text-sm">Starting camera...</p>
              </>
            )}
          </div>
        )}

        {/* Live overlays */}
        {cameraReady && (
          <>
            {/* Status badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full ${paused ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-[10px] text-white/80 font-bold">{paused ? 'PAUSED' : 'LIVE'}</span>
              </div>
            </div>

            {/* Scanning effect */}
            {!paused && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" style={{ animation: 'scan-line 2.5s ease-in-out infinite' }} />
              </div>
            )}

            {/* Guidance overlay - bottom of screen, above controls */}
            {guidance && (
              <div
                ref={guidanceRef}
                className={`absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md transition-colors duration-300 ${
                  hasHazard
                    ? 'bg-red-900/70 border-t-2 border-red-500'
                    : 'bg-black/60 border-t border-indigo-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    hasHazard ? 'bg-red-500/30' : 'bg-indigo-500/30'
                  }`}>
                    {hasHazard ? (
                      <AlertTriangle className="w-4 h-4 text-red-300" />
                    ) : (
                      <Navigation className="w-4 h-4 text-indigo-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${
                      hasHazard ? 'text-red-100' : 'text-white/90'
                    }`}>
                      {guidance}
                    </p>
                    {guidanceHistory.length > 1 && (
                      <p className="text-[10px] text-white/30 mt-1 truncate">
                        Previous: {guidanceHistory[1]}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel()
                        const u = new SpeechSynthesisUtterance(guidance)
                        u.rate = 1.0
                        window.speechSynthesis.speak(u)
                      }
                    }}
                    className="p-2 rounded-xl bg-white/10 text-white/60 active:scale-95 flex-shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls - fixed bottom */}
      {cameraReady && (
        <div className="px-4 py-3 border-t border-white/5 bg-[#0A0A10] flex gap-2 flex-shrink-0">
          <button
            onClick={() => setPaused(!paused)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all ${
              paused
                ? 'bg-indigo-500 text-white'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={stopStreaming}
            className="px-5 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-semibold text-sm active:scale-95 transition-all"
          >
            Stop
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
