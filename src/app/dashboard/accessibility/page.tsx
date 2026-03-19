'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Accessibility, Type, Contrast, MousePointer, Eye, Minus, Plus,
  Sun, Moon, Zap, RotateCcw, Monitor, Sparkles, Volume2
} from 'lucide-react'
import { logActivity } from '@/lib/supabase'

interface AccessibilityState {
  fontSize: number
  lineHeight: number
  letterSpacing: number
  highContrast: boolean
  reducedMotion: boolean
  dyslexiaFont: boolean
  largePointer: boolean
  focusHighlight: boolean
  darkMode: boolean
  readAloud: boolean
  simplifiedLayout: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
}

const defaults: AccessibilityState = {
  fontSize: 16,
  lineHeight: 1.6,
  letterSpacing: 0,
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
  largePointer: false,
  focusHighlight: false,
  darkMode: true,
  readAloud: false,
  simplifiedLayout: false,
  colorBlindMode: 'none',
}

export default function AccessibilityPage() {
  const [state, setState] = useState<AccessibilityState>(defaults)
  const [previewText] = useState(
    'AURA makes the web accessible for everyone. This preview demonstrates how your accessibility settings affect content readability and usability. Try adjusting the controls to see real-time changes.'
  )

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement
    root.style.setProperty('--a11y-font-size', `${state.fontSize}px`)
    root.style.setProperty('--a11y-line-height', `${state.lineHeight}`)
    root.style.setProperty('--a11y-letter-spacing', `${state.letterSpacing}px`)

    if (state.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (state.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    if (state.largePointer) {
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
  }, [state])

  function update<K extends keyof AccessibilityState>(key: K, value: AccessibilityState[K]) {
    setState(prev => ({ ...prev, [key]: value }))
    logActivity('accessibility', `Changed ${key}`, String(value))
  }

  function resetAll() {
    setState(defaults)
    logActivity('accessibility', 'Reset all settings', 'Restored defaults')
  }

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
            <button onClick={() => onChange(Math.max(min, value - step))} className="p-1 rounded bg-white/5 text-white/40 hover:text-white/60">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs text-white/50 w-14 text-center">{value}{unit}</span>
            <button onClick={() => onChange(Math.min(max, value + step))} className="p-1 rounded bg-white/5 text-white/40 hover:text-white/60">
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

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Accessibility className="w-5 h-5 text-amber-400" />
            </div>
            Accessibility Tools
          </h1>
          <p className="text-white/50 mt-2">Customize your experience. Changes apply in real-time.</p>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white/70 hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Text Settings */}
          <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text & Typography
            </h3>
            <div className="divide-y divide-white/5">
              <Slider label="Font Size" value={state.fontSize} min={12} max={32} step={1} unit="px" onChange={(v) => update('fontSize', v)} icon={Type} />
              <Slider label="Line Height" value={state.lineHeight} min={1} max={3} step={0.1} unit="" onChange={(v) => update('lineHeight', v)} icon={Type} />
              <Slider label="Letter Spacing" value={state.letterSpacing} min={0} max={5} step={0.5} unit="px" onChange={(v) => update('letterSpacing', v)} icon={Type} />
              <Toggle label="Dyslexia-Friendly Font" desc="Use OpenDyslexic typeface" value={state.dyslexiaFont} onChange={(v) => update('dyslexiaFont', v)} icon={Type} />
            </div>
          </div>

          {/* Visual Settings */}
          <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visual
            </h3>
            <div className="divide-y divide-white/5">
              <Toggle label="High Contrast" desc="Increase contrast for better readability" value={state.highContrast} onChange={(v) => update('highContrast', v)} icon={Contrast} />
              <Toggle label="Reduced Motion" desc="Minimize animations and transitions" value={state.reducedMotion} onChange={(v) => update('reducedMotion', v)} icon={Zap} />
              <Toggle label="Large Pointer" desc="Make cursor larger and more visible" value={state.largePointer} onChange={(v) => update('largePointer', v)} icon={MousePointer} />
              <Toggle label="Focus Highlights" desc="Show clear focus indicators" value={state.focusHighlight} onChange={(v) => update('focusHighlight', v)} icon={Monitor} />
            </div>
          </div>

          {/* Assistance */}
          <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Assistance
            </h3>
            <div className="divide-y divide-white/5">
              <Toggle label="Auto Read-Aloud" desc="Automatically read new content" value={state.readAloud} onChange={(v) => update('readAloud', v)} icon={Volume2} />
              <Toggle label="Simplified Layout" desc="Remove visual clutter" value={state.simplifiedLayout} onChange={(v) => update('simplifiedLayout', v)} icon={Monitor} />
            </div>
          </div>

          {/* Color Blind Mode */}
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
                    state.colorBlindMode === mode
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {mode === 'none' ? 'Default' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 sticky top-6">
            <h3 className="text-sm font-semibold text-white/60 mb-4">Live Preview</h3>

            <div
              className={`bg-[#070709] border border-white/10 rounded-xl p-6 transition-all ${
                state.highContrast ? 'bg-black border-white' : ''
              } ${state.simplifiedLayout ? 'max-w-md mx-auto' : ''}`}
              style={{
                fontSize: `${state.fontSize}px`,
                lineHeight: state.lineHeight,
                letterSpacing: `${state.letterSpacing}px`,
                fontFamily: state.dyslexiaFont ? '"OpenDyslexic", sans-serif' : 'inherit',
              }}
            >
              <h2 className={`text-lg font-bold mb-3 ${state.highContrast ? 'text-white' : 'text-white/90'}`}>
                How AURA Works
              </h2>
              <p className={`mb-4 ${state.highContrast ? 'text-white' : 'text-white/70'}`}>
                {previewText}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  state.highContrast ? 'bg-white text-black' : 'bg-indigo-500/20 text-indigo-300'
                }`}>Vision</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  state.highContrast ? 'bg-white text-black' : 'bg-pink-500/20 text-pink-300'
                }`}>Hearing</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  state.highContrast ? 'bg-white text-black' : 'bg-teal-500/20 text-teal-300'
                }`}>Audio</span>
              </div>

              <button className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                state.highContrast
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              } ${state.focusHighlight ? 'focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black' : ''}`}>
                Sample Button
              </button>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <h4 className="text-xs font-medium text-white/40 mb-2">Active Settings</h4>
              <div className="flex flex-wrap gap-1.5">
                {state.fontSize !== 16 && <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded text-[10px]">Font: {state.fontSize}px</span>}
                {state.highContrast && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded text-[10px]">High Contrast</span>}
                {state.reducedMotion && <span className="px-2 py-0.5 bg-green-500/10 text-green-300 rounded text-[10px]">Reduced Motion</span>}
                {state.dyslexiaFont && <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded text-[10px]">Dyslexia Font</span>}
                {state.largePointer && <span className="px-2 py-0.5 bg-pink-500/10 text-pink-300 rounded text-[10px]">Large Pointer</span>}
                {state.focusHighlight && <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-300 rounded text-[10px]">Focus Highlight</span>}
                {state.readAloud && <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300 rounded text-[10px]">Read-Aloud</span>}
                {state.simplifiedLayout && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded text-[10px]">Simplified</span>}
                {state.colorBlindMode !== 'none' && <span className="px-2 py-0.5 bg-rose-500/10 text-rose-300 rounded text-[10px]">{state.colorBlindMode}</span>}
                {state.fontSize === 16 && !state.highContrast && !state.reducedMotion && !state.dyslexiaFont && (
                  <span className="text-[10px] text-white/20">Default settings active</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
