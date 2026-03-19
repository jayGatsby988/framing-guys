'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, Upload, Camera, X, Loader2, Image as ImageIcon,
  AlertTriangle, MapPin, Type, Scan, RotateCcw, Copy, Volume2
} from 'lucide-react'
import { supabase, DEFAULT_PROFILE_ID, logActivity } from '@/lib/supabase'

type AnalysisMode = 'scene' | 'ocr' | 'object' | 'document'

const modes: { id: AnalysisMode; label: string; icon: typeof Eye; desc: string }[] = [
  { id: 'scene', label: 'Scene Description', icon: Eye, desc: 'Describe the full scene' },
  { id: 'ocr', label: 'Read Text', icon: Type, desc: 'Extract text from image' },
  { id: 'object', label: 'Object Detection', icon: Scan, desc: 'Identify objects & positions' },
  { id: 'document', label: 'Document Reader', icon: ImageIcon, desc: 'Summarize documents' },
]

interface HistoryItem {
  id: string
  description: string
  analysis_type: string
  created_at: string
}

export default function VisionPage() {
  const [mode, setMode] = useState<AnalysisMode>('scene')
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    loadHistory()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  async function loadHistory() {
    const { data } = await supabase
      .from('vision_analyses')
      .select('id, description, analysis_type, created_at')
      .eq('profile_id', DEFAULT_PROFILE_ID)
      .order('created_at', { ascending: false })
      .limit(20)
    setHistory(data ?? [])
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setResult('')
    }
    reader.readAsDataURL(file)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch {
      alert('Could not access camera. Please check permissions.')
    }
  }

  function captureFrame() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setImage(dataUrl)
    setFileName('Camera capture')
    setResult('')
    stopCamera()
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  const getSystemPrompt = useCallback((m: AnalysisMode) => {
    const prompts: Record<AnalysisMode, string> = {
      scene: 'You are AURA Vision Assist. Describe this image in detail for a visually impaired user. Include: overall scene, key objects with approximate positions, any text visible, potential hazards, and navigation guidance. Be concise but thorough. Format with clear sections: SCENE, OBJECTS, TEXT (if any), HAZARDS (if any), GUIDANCE.',
      ocr: 'You are AURA Text Reader. Extract ALL text visible in this image. Preserve the layout as much as possible. If it\'s a sign, menu, label, or document, describe what type it is first, then list all text. Be extremely accurate with the text extraction.',
      object: 'You are AURA Object Detection. List every identifiable object in this image with: name, approximate position (left/center/right, near/far), estimated size, and confidence. Format as a clean list. Include spatial relationships between objects. Highlight anything that could be a hazard.',
      document: 'You are AURA Document Reader. This is a document or printed material. Extract the full text content, then provide: 1) A brief summary of what this document is about, 2) Key information extracted, 3) Any action items or important dates/numbers. Make it accessible and easy to understand.',
    }
    return prompts[m]
  }, [])

  async function analyze() {
    if (!image) return
    setLoading(true)
    setResult('')
    try {
      const base64 = image.split(',')[1]
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, systemPrompt: getSystemPrompt(mode) }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.description)

      // Save to Supabase
      await supabase.from('vision_analyses').insert({
        profile_id: DEFAULT_PROFILE_ID,
        description: data.description,
        analysis_type: mode,
      })
      await logActivity('vision', `${mode} analysis`, fileName || 'Image analyzed')
      loadHistory()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setResult(`Error: ${message}. Please try again.`)
    }
    setLoading(false)
  }

  function speakResult() {
    if (!result || typeof window === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(result)
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  function copyResult() {
    navigator.clipboard.writeText(result)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          Vision Assist
        </h1>
        <p className="text-white/50 mt-2">Upload an image or use your camera — AURA will describe what it sees.</p>
      </motion.div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Camera View */}
          <AnimatePresence>
            {cameraActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative rounded-2xl overflow-hidden border border-white/10"
              >
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover bg-black" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <button onClick={captureFrame} className="px-6 py-2.5 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors">
                    Capture
                  </button>
                  <button onClick={stopCamera} className="px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Area */}
          {!cameraActive && (
            <div
              onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
            >
              {image ? (
                <div className="relative">
                  <img src={image} alt="Uploaded" className="max-h-[300px] mx-auto rounded-xl object-contain" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setImage(null); setResult(''); setFileName('') }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-white/30 mt-3">{fileName}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-white/20 mx-auto mb-3 group-hover:text-purple-400/50 transition-colors" />
                  <p className="text-white/40 text-sm">Drop an image here or click to upload</p>
                  <p className="text-white/20 text-xs mt-1">JPG, PNG, WEBP up to 20MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!cameraActive && (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:bg-white/10 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Use Camera
              </button>
            )}
            <button
              onClick={analyze}
              disabled={!image || loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Scan className="w-4 h-4" /> Analyze Image</>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">Analysis Result</h3>
            {result && (
              <div className="flex gap-1">
                <button onClick={speakResult} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5" title="Read aloud">
                  <Volume2 className="w-4 h-4" />
                </button>
                <button onClick={copyResult} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5" title="Copy text">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => setResult('')} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5" title="Clear">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="p-5 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[260px] gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-sm text-white/40">AURA is analyzing your image...</p>
              </div>
            ) : result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="prose prose-invert prose-sm max-w-none">
                  {result.split('\n').map((line, i) => {
                    if (line.match(/^(SCENE|OBJECTS|TEXT|HAZARDS|GUIDANCE|SUMMARY|KEY INFORMATION|ACTION ITEMS):/i)) {
                      return <h4 key={i} className="text-purple-300 font-semibold text-xs uppercase tracking-wider mt-4 mb-2 flex items-center gap-2">
                        {line.includes('HAZARD') && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        {line.includes('GUIDANCE') && <MapPin className="w-3.5 h-3.5 text-green-400" />}
                        {line}
                      </h4>
                    }
                    if (line.startsWith('- ') || line.startsWith('• ')) {
                      return <p key={i} className="text-white/70 text-sm ml-3 my-1">{line}</p>
                    }
                    if (line.trim()) {
                      return <p key={i} className="text-white/70 text-sm my-1">{line}</p>
                    }
                    return <br key={i} />
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] text-center">
                <Eye className="w-10 h-10 text-white/10 mb-3" />
                <p className="text-white/30 text-sm">Upload an image and click Analyze</p>
                <p className="text-white/15 text-xs mt-1">AURA will describe what it sees</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 mb-3">Recent Analyses</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setResult(item.description)}
                className="w-full text-left bg-[#0F0F12] border border-white/5 rounded-xl px-4 py-3 hover:bg-[#111115] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60 truncate">{item.description.slice(0, 80)}...</p>
                    <p className="text-xs text-white/20 mt-0.5">{item.analysis_type} &middot; {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
