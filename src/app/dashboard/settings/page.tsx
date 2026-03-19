'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Globe, Bell, Shield, Palette, Save,
  Loader2, Check, Volume2, Eye, Mic, Moon, Sun
} from 'lucide-react'
import { supabase, DEFAULT_PROFILE_ID, getPreferences, updatePreferences } from '@/lib/supabase'

interface Preferences {
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  voiceSpeed: number
  captionSize: string
  language: string
  theme: string
  autoReadAloud: boolean
  soundAlerts: boolean
  displayName?: string
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

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    voiceSpeed: 1.0,
    captionSize: 'medium',
    language: 'en',
    theme: 'dark',
    autoReadAloud: false,
    soundAlerts: true,
  })
  const [displayName, setDisplayName] = useState('User')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')

  useEffect(() => {
    loadPrefs()
  }, [])

  async function loadPrefs() {
    const data = await getPreferences()
    if (data) setPrefs(prev => ({ ...prev, ...data }))

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', DEFAULT_PROFILE_ID)
      .single()
    if (profile?.display_name) setDisplayName(profile.display_name)
  }

  async function save() {
    setSaving(true)
    await updatePreferences(prefs)
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', DEFAULT_PROFILE_ID)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updatePref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
    { id: 'captions', label: 'Captions', icon: Mic },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-400" />
            </div>
            Settings
          </h1>
          <p className="text-white/50 mt-2">Customize AURA to work best for you.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
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
        <div className="lg:col-span-3 bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Profile</h3>
              <div>
                <label className="text-sm text-white/60 block mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-2">Language</label>
                <select
                  value={prefs.language}
                  onChange={(e) => updatePref('language', e.target.value)}
                  className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-indigo-500/50"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {activeSection === 'display' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Display</h3>
              <div>
                <label className="text-sm text-white/60 block mb-2">Theme</label>
                <div className="flex gap-3">
                  {['dark', 'light'].map((t) => (
                    <button
                      key={t}
                      onClick={() => updatePref('theme', t)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium capitalize ${
                        prefs.theme === t
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white/60">Default Font Size</label>
                  <span className="text-xs text-white/30">{prefs.fontSize}px</span>
                </div>
                <input type="range" min={12} max={28} value={prefs.fontSize} onChange={(e) => updatePref('fontSize', parseInt(e.target.value))} className="w-full max-w-sm accent-indigo-500" />
              </div>
              <div className="flex items-center justify-between max-w-sm">
                <div>
                  <p className="text-sm text-white/80">High Contrast</p>
                  <p className="text-xs text-white/30">Increase contrast for better readability</p>
                </div>
                <button
                  onClick={() => updatePref('highContrast', !prefs.highContrast)}
                  role="switch"
                  aria-checked={prefs.highContrast}
                  className={`relative w-11 h-6 rounded-full transition-colors ${prefs.highContrast ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${prefs.highContrast ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between max-w-sm">
                <div>
                  <p className="text-sm text-white/80">Reduced Motion</p>
                  <p className="text-xs text-white/30">Minimize animations</p>
                </div>
                <button
                  onClick={() => updatePref('reducedMotion', !prefs.reducedMotion)}
                  role="switch"
                  aria-checked={prefs.reducedMotion}
                  className={`relative w-11 h-6 rounded-full transition-colors ${prefs.reducedMotion ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${prefs.reducedMotion ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'voice' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Voice & Audio</h3>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white/60">Voice Speed</label>
                  <span className="text-xs text-white/30">{prefs.voiceSpeed}x</span>
                </div>
                <input type="range" min={0.5} max={2} step={0.1} value={prefs.voiceSpeed} onChange={(e) => updatePref('voiceSpeed', parseFloat(e.target.value))} className="w-full max-w-sm accent-indigo-500" />
              </div>
              <div className="flex items-center justify-between max-w-sm">
                <div>
                  <p className="text-sm text-white/80">Auto Read-Aloud</p>
                  <p className="text-xs text-white/30">Automatically read new AI responses</p>
                </div>
                <button
                  onClick={() => updatePref('autoReadAloud', !prefs.autoReadAloud)}
                  role="switch"
                  aria-checked={prefs.autoReadAloud}
                  className={`relative w-11 h-6 rounded-full transition-colors ${prefs.autoReadAloud ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${prefs.autoReadAloud ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'captions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Captions</h3>
              <div>
                <label className="text-sm text-white/60 block mb-3">Caption Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updatePref('captionSize', size)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                        prefs.captionSize === size
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center justify-between max-w-sm">
                <div>
                  <p className="text-sm text-white/80">Sound Alerts</p>
                  <p className="text-xs text-white/30">Play audio cues for important events</p>
                </div>
                <button
                  onClick={() => updatePref('soundAlerts', !prefs.soundAlerts)}
                  role="switch"
                  aria-checked={prefs.soundAlerts}
                  className={`relative w-11 h-6 rounded-full transition-colors ${prefs.soundAlerts ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${prefs.soundAlerts ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'privacy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Privacy & Data</h3>
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
