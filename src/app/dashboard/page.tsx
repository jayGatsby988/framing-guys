'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, Mic, MessageSquare, Volume2, Accessibility, Settings,
  ArrowRight, Clock, Sparkles, Activity, Camera, Send,
  GripVertical, X, Plus, LayoutGrid, Minimize2, Maximize2,
  ArrowUpRight, Zap, Shield, ChevronRight, EyeOff,
  RotateCcw, Copy, Loader2
} from 'lucide-react'
import { supabase, DEFAULT_PROFILE_ID, logActivity } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────
interface ActivityItem {
  id: string; action: string; tool: string; details: string | null; created_at: string
}
interface WidgetConfig {
  id: string; visible: boolean; size: 'sm' | 'md' | 'lg'
}
interface ChatMsg { role: 'user' | 'assistant'; content: string }

const WIDGET_IDS = ['stats', 'quick-actions', 'chat', 'vision', 'live-camera', 'activity', 'accessibility'] as const
type WidgetId = typeof WIDGET_IDS[number]

const WIDGET_META: Record<WidgetId, { label: string; icon: typeof Eye; color: string }> = {
  'stats': { label: 'System Status', icon: Zap, color: '#6366F1' },
  'quick-actions': { label: 'Quick Launch', icon: LayoutGrid, color: '#8B5CF6' },
  'chat': { label: 'AI Assistant', icon: MessageSquare, color: '#6366F1' },
  'vision': { label: 'Vision Assist', icon: Eye, color: '#8B5CF6' },
  'live-camera': { label: 'Live Camera', icon: Camera, color: '#EF4444' },
  'activity': { label: 'Activity Feed', icon: Clock, color: '#14B8A6' },
  'accessibility': { label: 'Quick A11y', icon: Accessibility, color: '#F59E0B' },
}

function getDefaultLayout(): Record<WidgetId, WidgetConfig> {
  const layout: Record<string, WidgetConfig> = {}
  WIDGET_IDS.forEach(id => {
    layout[id] = { id, visible: true, size: id === 'chat' || id === 'activity' ? 'lg' : 'md' }
  })
  return layout as Record<WidgetId, WidgetConfig>
}

function loadLayout(): Record<WidgetId, WidgetConfig> {
  if (typeof window === 'undefined') return getDefaultLayout()
  try {
    const saved = localStorage.getItem('aura-widget-layout')
    if (saved) {
      const parsed = JSON.parse(saved)
      const defaults = getDefaultLayout()
      // Merge with defaults to handle new widgets
      for (const id of WIDGET_IDS) {
        if (parsed[id]) defaults[id] = { ...defaults[id], ...parsed[id] }
      }
      return defaults
    }
  } catch {}
  return getDefaultLayout()
}

function saveLayout(layout: Record<WidgetId, WidgetConfig>) {
  localStorage.setItem('aura-widget-layout', JSON.stringify(layout))
}

// ─── Helpers ──────────────────────────────────────────────
const toolIcons: Record<string, typeof Eye> = {
  vision: Eye, captions: Mic, chat: MessageSquare,
  audio: Volume2, accessibility: Accessibility, settings: Settings,
}
const toolColors: Record<string, string> = {
  vision: '#8B5CF6', captions: '#EC4899', chat: '#6366F1',
  audio: '#14B8A6', accessibility: '#F59E0B', settings: '#64748B',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Widget Shell ─────────────────────────────────────────
function WidgetShell({ id, layout, setLayout, children, noPad, fullLink }: {
  id: WidgetId
  layout: Record<WidgetId, WidgetConfig>
  setLayout: (l: Record<WidgetId, WidgetConfig>) => void
  children: React.ReactNode
  noPad?: boolean
  fullLink?: string
}) {
  const meta = WIDGET_META[id]
  const config = layout[id]
  const [minimized, setMinimized] = useState(false)

  function hideWidget() {
    const next = { ...layout, [id]: { ...config, visible: false } }
    setLayout(next)
    saveLayout(next)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        bg-[#0B0B0F] border border-white/[0.06] rounded-2xl overflow-hidden
        hover:border-white/[0.1] transition-colors duration-300
        ${config.size === 'lg' ? 'col-span-2' : ''}
      `}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <GripVertical className="w-3.5 h-3.5 text-white/10 cursor-grab" />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{meta.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {fullLink && (
            <Link href={fullLink} className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors" title="Open full page">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <button onClick={() => setMinimized(!minimized)} className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors">
            {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={hideWidget} className="p-1 rounded-md text-white/20 hover:text-red-400/60 hover:bg-red-500/10 transition-colors" title="Hide widget">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Widget Body */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={noPad ? '' : 'p-4'}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────
export default function DashboardConsole() {
  const [layout, setLayout] = useState<Record<WidgetId, WidgetConfig>>(getDefaultLayout)
  const [configOpen, setConfigOpen] = useState(false)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState({ vision: 0, captions: 0, chats: 0 })
  const [displayName, setDisplayName] = useState('User')

  // Chat widget state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Vision widget state
  const [visionResult, setVisionResult] = useState('')
  const [visionLoading, setVisionLoading] = useState(false)
  const visionInputRef = useRef<HTMLInputElement>(null)

  // A11y widget state
  const [a11y, setA11y] = useState({ fontSize: 100, highContrast: false, dyslexiaFont: false, reducedMotion: false })

  useEffect(() => {
    setLayout(loadLayout())
    loadData()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function loadData() {
    const [actRes, visRes, capRes, chatRes, profileRes] = await Promise.all([
      supabase.from('activity_log').select('*').eq('profile_id', DEFAULT_PROFILE_ID).order('created_at', { ascending: false }).limit(6),
      supabase.from('vision_analyses').select('id', { count: 'exact' }).eq('profile_id', DEFAULT_PROFILE_ID),
      supabase.from('transcripts').select('id', { count: 'exact' }).eq('profile_id', DEFAULT_PROFILE_ID),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('profile_id', DEFAULT_PROFILE_ID),
      supabase.from('profiles').select('display_name').eq('id', DEFAULT_PROFILE_ID).single(),
    ])
    setActivity(actRes.data ?? [])
    setStats({ vision: visRes.count ?? 0, captions: capRes.count ?? 0, chats: chatRes.count ?? 0 })
    if (profileRes.data?.display_name) setDisplayName(profileRes.data.display_name)
  }

  // Chat send
  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg: ChatMsg = { role: 'user', content: chatInput.trim() }
    const msgs = [...chatMessages, userMsg]
    setChatMessages(msgs)
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs.slice(-10) }),
      })
      const data = await res.json()
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        await logActivity('chat', 'Dashboard quick chat', chatInput.trim().slice(0, 80))
      }
    } catch {}
    setChatLoading(false)
  }, [chatInput, chatMessages, chatLoading])

  // Vision analyze
  async function analyzeImage(file: File) {
    setVisionLoading(true)
    setVisionResult('')
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      try {
        const res = await fetch('/api/vision', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, systemPrompt: 'Describe this image concisely for a visually impaired user. Focus on key objects, text, and spatial layout. Be brief.' }),
        })
        const data = await res.json()
        if (data.description) {
          setVisionResult(data.description)
          await logActivity('vision', 'Quick vision analysis', data.description.slice(0, 80))
        }
      } catch { setVisionResult('Analysis failed. Try again.') }
      setVisionLoading(false)
    }
    reader.readAsDataURL(file)
  }

  // A11y apply
  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-size', `${a11y.fontSize}%`)
    if (a11y.highContrast) document.documentElement.classList.add('high-contrast')
    else document.documentElement.classList.remove('high-contrast')
    if (a11y.dyslexiaFont) document.documentElement.classList.add('dyslexia-font')
    else document.documentElement.classList.remove('dyslexia-font')
    if (a11y.reducedMotion) document.documentElement.classList.add('reduced-motion')
    else document.documentElement.classList.remove('reduced-motion')
  }, [a11y])

  function toggleWidget(id: WidgetId) {
    const next = { ...layout, [id]: { ...layout[id], visible: !layout[id].visible } }
    setLayout(next)
    saveLayout(next)
  }

  function resetLayout() {
    const def = getDefaultLayout()
    setLayout(def)
    saveLayout(def)
  }

  const visibleWidgets = WIDGET_IDS.filter(id => layout[id].visible)
  const hiddenWidgets = WIDGET_IDS.filter(id => !layout[id].visible)

  return (
    <div className="space-y-4 pb-8">
      {/* ── Console Header Bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400/70 font-mono">ONLINE</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <h1 className="text-sm font-semibold text-white/70">
            {getGreeting()}, <span className="text-white">{displayName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {hiddenWidgets.length > 0 && (
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all text-[11px] font-medium"
            >
              <Plus className="w-3 h-3" />
              Add Widget
              {hiddenWidgets.length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] flex items-center justify-center font-bold">{hiddenWidgets.length}</span>
              )}
            </button>
          )}
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className={`p-1.5 rounded-lg border transition-all ${configOpen ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/[0.06] text-white/30 hover:text-white/60'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Widget Config Panel ── */}
      <AnimatePresence>
        {configOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0B0B0F] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Configure Widgets</span>
                <button onClick={resetLayout} className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {WIDGET_IDS.map(id => {
                  const meta = WIDGET_META[id]
                  const visible = layout[id].visible
                  return (
                    <button
                      key={id}
                      onClick={() => toggleWidget(id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        visible
                          ? 'bg-white/5 border-white/10 text-white/70'
                          : 'bg-transparent border-white/[0.04] text-white/20'
                      }`}
                    >
                      <meta.icon className="w-3.5 h-3.5" style={{ color: visible ? meta.color : undefined }} />
                      <span className="truncate">{meta.label}</span>
                      {visible ? (
                        <EyeOff className="w-3 h-3 ml-auto text-white/15 hover:text-white/40 flex-shrink-0" />
                      ) : (
                        <Plus className="w-3 h-3 ml-auto text-white/15 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Widget Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {/* Stats Widget */}
          {layout.stats.visible && (
            <WidgetShell key="stats" id="stats" layout={layout} setLayout={l => { setLayout(l); saveLayout(l) }}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Vision Scans', value: stats.vision, color: '#8B5CF6', icon: Eye },
                  { label: 'Transcripts', value: stats.captions, color: '#EC4899', icon: Mic },
                  { label: 'Conversations', value: stats.chats, color: '#6366F1', icon: MessageSquare },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.03]">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </WidgetShell>
          )}

          {/* Quick Actions Widget */}
          {layout['quick-actions'].visible && (
            <WidgetShell key="quick-actions" id="quick-actions" layout={layout} setLayout={l => { setLayout(l); saveLayout(l) }}>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { href: '/dashboard/vision', icon: Eye, label: 'Vision', gradient: 'from-purple-500 to-violet-600' },
                  { href: '/dashboard/captions', icon: Mic, label: 'Captions', gradient: 'from-pink-500 to-rose-600' },
                  { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat', gradient: 'from-indigo-500 to-blue-600' },
                  { href: '/dashboard/audio', icon: Volume2, label: 'Audio', gradient: 'from-teal-500 to-emerald-600' },
                  { href: '/dashboard/live', icon: Camera, label: 'Live Cam', gradient: 'from-red-500 to-orange-600' },
                  { href: '/dashboard/accessibility', icon: Accessibility, label: 'A11y', gradient: 'from-amber-500 to-orange-600' },
                ].map(tool => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] text-white/40 group-hover:text-white/70 font-medium transition-colors">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </WidgetShell>
          )}

          {/* Chat Widget */}
          {layout.chat.visible && (
            <WidgetShell key="chat" id="chat" layout={layout} setLayout={l => { setLayout(l); saveLayout(l) }} noPad fullLink="/dashboard/chat">
              <div className="flex flex-col" style={{ height: 260 }}>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-8 h-8 text-white/[0.06] mb-2" />
                      <p className="text-[11px] text-white/20">Ask AURA anything...</p>
                      <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                        {['Describe my surroundings', 'Read this text aloud', 'Help me navigate'].map(q => (
                          <button
                            key={q}
                            onClick={() => { setChatInput(q); }}
                            className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-500/20 text-indigo-100 rounded-br-sm'
                          : 'bg-white/[0.04] text-white/70 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="px-3 py-2 rounded-xl bg-white/[0.04] rounded-bl-sm">
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-t border-white/[0.04] p-2.5 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30"
                  />
                  <button
                    onClick={sendChat}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-3 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-30 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </WidgetShell>
          )}

          {/* Vision Widget */}
          {layout.vision.visible && (
            <WidgetShell key="vision" id="vision" layout={layout} setLayout={l => { setLayout(l); saveLayout(l) }} fullLink="/dashboard/vision">
              <div className="space-y-3">
                <input
                  ref={visionInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) analyzeImage(file)
                  }}
                />
                <button
                  onClick={() => visionInputRef.current?.click()}
                  disabled={visionLoading}
                  className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-white/[0.06] rounded-xl text-white/30 hover:text-white/60 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all disabled:opacity-30"
                >
                  {visionLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Eye className="w-4 h-4" /> Drop or click to analyze an image</>
                  )}
                </button>
                {visionResult && (
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-white/60 leading-relaxed">{visionResult}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(visionResult)}
                        className="p-1 text-white/15 hover:text-white/40 flex-shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </WidgetShell>
          )}

          {/* Live Camera Widget */}
          {layout['live-camera'].visible && (
            <WidgetShell key="live-camera" id="live-camera" layout={layout} setLayout={l => { setLayout(l); saveLayout(l) }} fullLink="/dashboard/live">
              <Link href="/dashboard/live" className="group block">
                <div className="flex items-center gap-4 p-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">Live Camera Vision</h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[8px] font-bold uppercase">New</span>
                    </div>
                    <p className="text-[11px] text-white/30 leading-relaxed">
                      Scan QR with phone, get real-time AI narration here.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </WidgetShell>
          )}

          {/* Activity Widget */}
          {layout.activity.visible && (
            <WidgetShell key="activity" id="activity" layout={layout} setLayout={l => { setLayout(l); saveLayout(l) }} noPad>
              {activity.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="w-6 h-6 text-white/[0.06] mx-auto mb-2" />
                  <p className="text-[11px] text-white/15">No activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {activity.map((item) => {
                    const Icon = toolIcons[item.tool] ?? Activity
                    const color = toolColors[item.tool] ?? '#64748B'
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.015] transition-colors">
                        <div className="w-6 h-6 rounded-md bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white/50 truncate">{item.action}</p>
                          {item.details && <p className="text-[10px] text-white/15 truncate">{item.details}</p>}
                        </div>
                        <span className="text-[9px] text-white/10 font-mono flex-shrink-0">{timeAgo(item.created_at)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </WidgetShell>
          )}

          {/* Accessibility Quick Controls Widget */}
          {layout.accessibility.visible && (
            <WidgetShell key="accessibility" id="accessibility" layout={layout} setLayout={l => { setLayout(l); saveLayout(l) }} fullLink="/dashboard/accessibility">
              <div className="space-y-3">
                {/* Font Size */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">Font Size</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setA11y(p => ({ ...p, fontSize: Math.max(80, p.fontSize - 10) }))}
                      className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70 flex items-center justify-center text-xs font-bold transition-colors"
                    >-</button>
                    <span className="text-xs text-white/60 font-mono w-10 text-center">{a11y.fontSize}%</span>
                    <button
                      onClick={() => setA11y(p => ({ ...p, fontSize: Math.min(200, p.fontSize + 10) }))}
                      className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70 flex items-center justify-center text-xs font-bold transition-colors"
                    >+</button>
                  </div>
                </div>
                {/* Toggles */}
                {[
                  { key: 'highContrast' as const, label: 'High Contrast' },
                  { key: 'dyslexiaFont' as const, label: 'Dyslexia Font' },
                  { key: 'reducedMotion' as const, label: 'Reduced Motion' },
                ].map(toggle => (
                  <div key={toggle.key} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40">{toggle.label}</span>
                    <button
                      onClick={() => setA11y(p => ({ ...p, [toggle.key]: !p[toggle.key] }))}
                      className={`relative w-8 h-[18px] rounded-full transition-colors ${a11y[toggle.key] ? 'bg-indigo-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${a11y[toggle.key] ? 'left-[16px]' : 'left-[2px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </WidgetShell>
          )}
        </AnimatePresence>
      </div>

      {/* ── Extension Banner ── */}
      <div className="bg-[#0B0B0F] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-0.5">AURA Chrome Extension</h3>
          <p className="text-[11px] text-white/30">Use AURA&apos;s accessibility tools on any website. Controls text, contrast, captions, and more.</p>
        </div>
        <Link href="/install" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[11px] font-medium hover:bg-indigo-500/25 transition-all flex-shrink-0">
          Install <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
