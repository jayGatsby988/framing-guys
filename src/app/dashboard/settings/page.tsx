'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Globe, Bell, Shield, Palette, Save,
  Loader2, Check, Volume2, Eye, Mic, Moon, Sun, Type,
  Contrast, MousePointer, Minus, Plus, Zap, RotateCcw,
  Monitor, Sparkles
} from 'lucide-react'
import { supabase, DEFAULT_PROFILE_ID, getPreferences, updatePreferences, logActivity } from '@/lib/supabase'

interface UnifiedSettings {
  // Appearance (from both pages)
  theme: string
  fontSize: number
  lineHeight: number
  letterSpacing: number
  dyslexiaFont: boolean
  highContrast: boolean
  reducedMotion: boolean
  largePointer: boolean
  focusHighlight: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  simplifiedLayout: boolean
  // Voice & Audio
  voiceSpeed: number
  autoReadAloud: boolean
  soundAlerts: boolean
  captionSize: string
  // Profile
  language: string
  displayName: string
}

const defaults: UnifiedSettings = {
  theme: 'dark',
  fontSize: 16,
  lineHeight: 1.6,
  letterSpacing: 0,
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  largePointer: false,
  focusHighlight: false,
  colorBlindMode: 'none',
  simplifiedLayout: false,
  voiceSpeed: 1.0,
  autoReadAloud: false,
  soundAlerts: true,
  captionSize: 'medium',
  language: 'en',
  displayName: 'User',
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
]

function Toggle({ label, desc, value, onChange, icon: Icon }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void; icon: typeof Eye
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white/40" />
        </div>
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="text-xs text-white/30">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-white/10'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function Slider({ label, value, min, max, step, unit, onChange, icon: Icon }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; icon: typeof Type
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/80">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} className="p-1 rounded bg-white/5 text-white/40 hover:text-white/60">
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs text-white/50 w-14 text-center">{value}{unit}</span>
          <button onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))} className="p-1 rounded bg-white/5 text-white/40 hover:text-white/60">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UnifiedSettings>(defaults)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('appearance')
  const [previewText] = useState(
    'AURA makes the web accessible for everyone. This preview demonstrates how your accessibility settings affect content readability and usability. Try adjusting the controls to see real-time changes.'
  )

  useEffect(() => {
    loadSettings()
  }, [])

  // Apply CSS variable changes to document root in real-time
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--a11y-font-size', `${settings.fontSize}px`)
    root.style.setProperty('--a11y-line-height', `${settings.lineHeight}`)
    root.style.setProperty('--a11y-letter-spacing', `${settings.letterSpacing}px`)

    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    if (settings.largePointer) {
      root.style.cursor = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><circle cx=\'16\' cy=\'16\' r=\'14\' fill=\'%236366F1\' opacity=\'0.6\'/></svg>") 16 16, auto'
    } else {
      root.style.cursor = ''
    }

    return () => {
      root.style.removeProperty('--a11y-font-size')
      root.style.removeProperty('--a11y-line-height')
      root.style.removeProperty('--a11y-letter-spacing')
      root.classList.remove('high-contrast', 'reduce-motion')
      root.style.cursor = ''
    }
  }, [settings])

  async function loadSettings() {
    const data = await getPreferences()
    if (data) setSettings(prev => ({ ...prev, ...data }))

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', DEFAULT_PROFILE_ID)
      .single()
    if (profile?.display_name) setSettings(prev => ({ ...prev, displayName: profile.display_name }))
  }

  async function save() {
    setSaving(true)
    const { displayName, ...prefs } = settings
    await updatePreferences(prefs)
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', DEFAULT_PROFILE_ID)
    logActivity('settings', 'Saved settings', 'All preferences updated')
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function update<K extends keyof UnifiedSettings>(key: K, value: UnifiedSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
    logActivity('settings', `Changed ${key}`, String(value))
  }

  function resetAll() {
    setSettings(defaults)
    logActivity('settings', 'Reset all settings', 'Restored defaults')
  }

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-400" />
            </div>
            Settings
          </h1>
          <p className="text-white/50 mt-2">Customize AURA&apos;s appearance, accessibility, and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Section Nav */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* ===================== APPEARANCE ===================== */}
          {activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Controls Column */}
                <div className="space-y-4">
                  {/* Theme */}
                  <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Theme
                    </h3>
                    <div className="flex gap-3">
                      {['dark', 'light'].map((t) => (
                        <button
                          key={t}
                          onClick={() => update('theme', t)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium capitalize ${
                            settings.theme === t
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {t === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text & Typography */}
                  <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Text &amp; Typography
                    </h3>
                    <div className="divide-y divide-white/5">
                      <Slider label="Font Size" value={settings.fontSize} min={12} max={32} step={1} unit="px" onChange={(v) => update('fontSize', v)} icon={Type} />
                      <Slider label="Line Height" value={settings.lineHeight} min={1} max={3} step={0.1} unit="" onChange={(v) => update('lineHeight', v)} icon={Type} />
                      <Slider label="Letter Spacing" value={settings.letterSpacing} min={0} max={5} step={0.5} unit="px" onChange={(v) => update('letterSpacing', v)} icon={Type} />
                      <Toggle label="Dyslexia-Friendly Font" desc="Use OpenDyslexic typeface" value={settings.dyslexiaFont} onChange={(v) => update('dyslexiaFont', v)} icon={Type} />
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Visual
                    </h3>
                    <div className="divide-y divide-white/5">
                      <Toggle label="High Contrast" desc="Increase contrast for better readability" value={settings.highContrast} onChange={(v) => update('highContrast', v)} icon={Contrast} />
                      <Toggle label="Reduced Motion" desc="Minimize animations and transitions" value={settings.reducedMotion} onChange={(v) => update('reducedMotion', v)} icon={Zap} />
                      <Toggle label="Large Pointer" desc="Make cursor larger and more visible" value={settings.largePointer} onChange={(v) => update('largePointer', v)} icon={MousePointer} />
                      <Toggle label="Focus Highlights" desc="Show clear focus indicators" value={settings.focusHighlight} onChange={(v) => update('focusHighlight', v)} icon={Monitor} />
                      <Toggle label="Simplified Layout" desc="Remove visual clutter" value={settings.simplifiedLayout} onChange={(v) => update('simplifiedLayout', v)} icon={Monitor} />
                    </div>
                  </div>

                  {/* Color Vision */}
                  <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Color Vision
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => update('colorBlindMode', mode)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
                            settings.colorBlindMode === mode
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                          }`}
                        >
                          {mode === 'none' ? 'Default' : mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Preview Column */}
                <div className="space-y-4">
                  <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 sticky top-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-4">Live Preview</h3>

                    <div
                      className={`bg-[#070709] border border-white/10 rounded-xl p-6 transition-all ${
                        settings.highContrast ? 'bg-black border-white' : ''
                      } ${settings.simplifiedLayout ? 'max-w-md mx-auto' : ''}`}
                      style={{
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                        letterSpacing: `${settings.letterSpacing}px`,
                        fontFamily: settings.dyslexiaFont ? '"OpenDyslexic", sans-serif' : 'inherit',
                      }}
                    >
                      <h2 className={`text-lg font-bold mb-3 ${settings.highContrast ? 'text-white' : 'text-white/90'}`}>
                        How AURA Works
                      </h2>
                      <p className={`mb-4 ${settings.highContrast ? 'text-white' : 'text-white/70'}`}>
                        {previewText}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          settings.highContrast ? 'bg-white text-black' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>Vision</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          settings.highContrast ? 'bg-white text-black' : 'bg-pink-500/20 text-pink-300'
                        }`}>Hearing</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          settings.highContrast ? 'bg-white text-black' : 'bg-teal-500/20 text-teal-300'
                        }`}>Audio</span>
                      </div>

                      <button className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        settings.highContrast
                          ? 'bg-white text-black hover:bg-gray-200'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                      } ${settings.focusHighlight ? 'focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black' : ''}`}>
                        Sample Button
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-white/5 rounded-xl">
                      <h4 className="text-xs font-medium text-white/40 mb-2">Active Settings</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {settings.fontSize !== 16 && <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded text-[10px]">Font: {settings.fontSize}px</span>}
                        {settings.lineHeight !== 1.6 && <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded text-[10px]">Line Height: {settings.lineHeight}</span>}
                        {settings.letterSpacing !== 0 && <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded text-[10px]">Spacing: {settings.letterSpacing}px</span>}
                        {settings.highContrast && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded text-[10px]">High Contrast</span>}
                        {settings.reducedMotion && <span className="px-2 py-0.5 bg-green-500/10 text-green-300 rounded text-[10px]">Reduced Motion</span>}
                        {settings.dyslexiaFont && <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded text-[10px]">Dyslexia Font</span>}
                        {settings.largePointer && <span className="px-2 py-0.5 bg-pink-500/10 text-pink-300 rounded text-[10px]">Large Pointer</span>}
                        {settings.focusHighlight && <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-300 rounded text-[10px]">Focus Highlight</span>}
                        {settings.simplifiedLayout && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded text-[10px]">Simplified</span>}
                        {settings.colorBlindMode !== 'none' && <span className="px-2 py-0.5 bg-rose-500/10 text-rose-300 rounded text-[10px]">{settings.colorBlindMode}</span>}
                        {settings.theme === 'light' && <span className="px-2 py-0.5 bg-orange-500/10 text-orange-300 rounded text-[10px]">Light Mode</span>}
                        {settings.fontSize === 16 && settings.lineHeight === 1.6 && settings.letterSpacing === 0 && !settings.highContrast && !settings.reducedMotion && !settings.dyslexiaFont && !settings.largePointer && !settings.focusHighlight && !settings.simplifiedLayout && settings.colorBlindMode === 'none' && settings.theme === 'dark' && (
                          <span className="text-[10px] text-white/20">Default settings active</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== VOICE & AUDIO ===================== */}
          {activeSection === 'voice' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 space-y-2">
                <h3 className="text-lg font-semibold text-white mb-4">Voice &amp; Audio</h3>
                <div className="divide-y divide-white/5">
                  <Slider label="Voice Speed" value={settings.voiceSpeed} min={0.5} max={2} step={0.1} unit="x" onChange={(v) => update('voiceSpeed', v)} icon={Volume2} />
                  <Toggle label="Auto Read-Aloud" desc="Automatically read new AI responses" value={settings.autoReadAloud} onChange={(v) => update('autoReadAloud', v)} icon={Volume2} />
                  <Toggle label="Sound Alerts" desc="Play audio cues for important events" value={settings.soundAlerts} onChange={(v) => update('soundAlerts', v)} icon={Bell} />
                </div>

                <div className="pt-4">
                  <label className="text-sm text-white/60 block mb-3">Caption Size</label>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => update('captionSize', size)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                          settings.captionSize === size
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== PROFILE ===================== */}
          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Profile</h3>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Display Name</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => update('displayName', e.target.value)}
                    className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => update('language', e.target.value)}
                    className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-indigo-500/50"
                  >
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== NOTIFICATIONS ===================== */}
          {activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <div className="divide-y divide-white/5">
                  <Toggle label="Sound Alerts" desc="Play audio cues for important events" value={settings.soundAlerts} onChange={(v) => update('soundAlerts', v)} icon={Bell} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== PRIVACY ===================== */}
          {activeSection === 'privacy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Privacy &amp; Data</h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white/60 mb-2">Data Storage</h4>
                  <p className="text-xs text-white/40 leading-relaxed">
                    AURA stores your conversation history, transcripts, and vision analyses in a secure Supabase database.
                    Image data is processed via OpenAI&apos;s API and is not stored permanently.
                    You can delete your data at any time from this settings page.
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm hover:bg-red-500/20 transition-colors">
                  Delete All My Data
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
