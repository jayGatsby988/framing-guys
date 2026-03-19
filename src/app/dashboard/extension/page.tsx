'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Chrome, Volume2, BookOpen, Eye, Link2, Focus, StickyNote,
  Sparkles, Ruler, Palette, Type, Contrast, MousePointer,
  Download, RefreshCw, Cloud, Settings2, ToggleLeft
} from 'lucide-react'

interface ExtensionConfig {
  // Reading Tools
  readAloud: boolean
  readingGuide: boolean
  pageSimplifier: boolean
  highlightHeadings: boolean
  highlightLinks: boolean
  // Education Tools
  focusMode: boolean
  quickNotes: boolean
  pageSummarizer: boolean
  lineRuler: boolean
  // Accessibility
  ttsOnSelect: boolean
  colorVisionFilters: boolean
  fontSpacingControls: boolean
  highContrastMode: boolean
  largeCursor: boolean
  // Quick Settings
  defaultTtsSpeed: number
  floatingActionButton: boolean
  // Sync
  syncNotesToDashboard: boolean
  lastSynced: string | null
}

const defaultConfig: ExtensionConfig = {
  readAloud: true,
  readingGuide: false,
  pageSimplifier: false,
  highlightHeadings: true,
  highlightLinks: true,
  focusMode: false,
  quickNotes: true,
  pageSummarizer: true,
  lineRuler: false,
  ttsOnSelect: true,
  colorVisionFilters: false,
  fontSpacingControls: false,
  highContrastMode: false,
  largeCursor: false,
  defaultTtsSpeed: 1.0,
  floatingActionButton: true,
  syncNotesToDashboard: true,
  lastSynced: null,
}

const STORAGE_KEY = 'aura-extension-config'

export default function ExtensionPage() {
  const [config, setConfig] = useState<ExtensionConfig>(defaultConfig)
  const [syncing, setSyncing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setConfig(prev => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const persistAndBroadcast = useCallback((updated: ExtensionConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
    // Communicate with Chrome extension
    try {
      window.postMessage(
        { type: 'AURA_CONFIG_UPDATE', payload: updated },
        window.location.origin
      )
    } catch {
      // ignore postMessage errors
    }
  }, [])

  function updateConfig<K extends keyof ExtensionConfig>(key: K, value: ExtensionConfig[K]) {
    setConfig(prev => {
      const updated = { ...prev, [key]: value }
      persistAndBroadcast(updated)
      return updated
    })
  }

  function handleSync() {
    setSyncing(true)
    setTimeout(() => {
      const now = new Date().toISOString()
      setConfig(prev => {
        const updated = { ...prev, lastSynced: now }
        persistAndBroadcast(updated)
        return updated
      })
      setSyncing(false)
    }, 1500)
  }

  function formatLastSynced(iso: string | null): string {
    if (!iso) return 'Never'
    try {
      const d = new Date(iso)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return 'Just now'
      if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
      return d.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  // Toggle sub-component matching existing dashboard style
  function Toggle({ label, desc, enabled, onChange, icon: Icon }: {
    label: string
    desc: string
    enabled: boolean
    onChange: (v: boolean) => void
    icon: typeof Eye
  }) {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-white/40" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white/80">{label}</p>
            <p className="text-xs text-white/30">{desc}</p>
          </div>
        </div>
        <button
          onClick={() => onChange(!enabled)}
          role="switch"
          aria-checked={enabled}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${enabled ? 'bg-indigo-500' : 'bg-white/10'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <Chrome className="w-5 h-5 text-indigo-400" />
            </div>
            Browser Extension
          </h1>
          <p className="text-white/50 mt-2">Configure your AURA Chrome Extension features and preferences.</p>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Feature Toggles (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Reading Tools */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Reading Tools
            </h3>
            <div className="divide-y divide-white/5">
              <Toggle
                label="Read Aloud"
                desc="Read any webpage content aloud"
                enabled={config.readAloud}
                onChange={(v) => updateConfig('readAloud', v)}
                icon={Volume2}
              />
              <Toggle
                label="Reading Guide"
                desc="Horizontal ruler that follows your cursor"
                enabled={config.readingGuide}
                onChange={(v) => updateConfig('readingGuide', v)}
                icon={Ruler}
              />
              <Toggle
                label="Page Simplifier"
                desc="Strip distractions for cleaner reading"
                enabled={config.pageSimplifier}
                onChange={(v) => updateConfig('pageSimplifier', v)}
                icon={ToggleLeft}
              />
              <Toggle
                label="Highlight Headings"
                desc="Make page structure more visible"
                enabled={config.highlightHeadings}
                onChange={(v) => updateConfig('highlightHeadings', v)}
                icon={Type}
              />
              <Toggle
                label="Highlight Links"
                desc="Make all links stand out on any page"
                enabled={config.highlightLinks}
                onChange={(v) => updateConfig('highlightLinks', v)}
                icon={Link2}
              />
            </div>
          </motion.div>

          {/* Education Tools */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Education Tools
            </h3>
            <div className="divide-y divide-white/5">
              <Toggle
                label="Focus Mode"
                desc="Dim distractions, highlight main content"
                enabled={config.focusMode}
                onChange={(v) => updateConfig('focusMode', v)}
                icon={Focus}
              />
              <Toggle
                label="Quick Notes"
                desc="Take notes on any page, synced to dashboard"
                enabled={config.quickNotes}
                onChange={(v) => updateConfig('quickNotes', v)}
                icon={StickyNote}
              />
              <Toggle
                label="Page Summarizer"
                desc="AI-powered page summaries"
                enabled={config.pageSummarizer}
                onChange={(v) => updateConfig('pageSummarizer', v)}
                icon={Sparkles}
              />
              <Toggle
                label="Line Ruler"
                desc="Horizontal ruler to track reading position"
                enabled={config.lineRuler}
                onChange={(v) => updateConfig('lineRuler', v)}
                icon={Ruler}
              />
            </div>
          </motion.div>

          {/* Accessibility */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Accessibility
            </h3>
            <div className="divide-y divide-white/5">
              <Toggle
                label="Text-to-Speech on Select"
                desc="Hear selected text read aloud"
                enabled={config.ttsOnSelect}
                onChange={(v) => updateConfig('ttsOnSelect', v)}
                icon={Volume2}
              />
              <Toggle
                label="Color Vision Filters"
                desc="Apply color blindness corrections"
                enabled={config.colorVisionFilters}
                onChange={(v) => updateConfig('colorVisionFilters', v)}
                icon={Palette}
              />
              <Toggle
                label="Font & Spacing Controls"
                desc="Customize text size and spacing"
                enabled={config.fontSpacingControls}
                onChange={(v) => updateConfig('fontSpacingControls', v)}
                icon={Type}
              />
              <Toggle
                label="High Contrast Mode"
                desc="Increase page contrast"
                enabled={config.highContrastMode}
                onChange={(v) => updateConfig('highContrastMode', v)}
                icon={Contrast}
              />
              <Toggle
                label="Large Cursor"
                desc="Make cursor more visible"
                enabled={config.largeCursor}
                onChange={(v) => updateConfig('largeCursor', v)}
                icon={MousePointer}
              />
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Extension Status */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <Chrome className="w-4 h-4" />
              Extension Status
            </h3>

            {/* Stylized browser extension mockup */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                <Chrome className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold text-sm">AURA for Chrome</h4>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.0
              </span>
              <p className="text-white/30 text-xs mt-3 leading-relaxed">
                Accessibility tools, reading aids, and AI-powered features right in your browser.
              </p>
              <a
                href="/dashboard/extension#install"
                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Install Extension
              </a>
            </div>
          </motion.div>

          {/* Quick Settings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Quick Settings
            </h3>

            {/* TTS Speed Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Default TTS Speed</span>
                <span className="text-xs text-white/40 font-mono">{config.defaultTtsSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={config.defaultTtsSpeed}
                onChange={(e) => updateConfig('defaultTtsSpeed', parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/20">0.5x</span>
                <span className="text-[10px] text-white/20">1.0x</span>
                <span className="text-[10px] text-white/20">2.0x</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-1">
              <Toggle
                label="Floating Action Button"
                desc="Show quick-access button on every page"
                enabled={config.floatingActionButton}
                onChange={(v) => updateConfig('floatingActionButton', v)}
                icon={ToggleLeft}
              />
            </div>
          </motion.div>

          {/* Sync */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Sync
            </h3>

            <div className="border-b border-white/5 pb-1">
              <Toggle
                label="Sync notes to dashboard"
                desc="Keep extension notes in sync"
                enabled={config.syncNotesToDashboard}
                onChange={(v) => updateConfig('syncNotesToDashboard', v)}
                icon={Cloud}
              />
            </div>

            <div className="pt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">Last synced</span>
                <span className="text-xs text-white/60">{formatLastSynced(config.lastSynced)}</span>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
