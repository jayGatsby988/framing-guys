'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Chrome, FolderOpen, Puzzle, CheckCircle2, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: Download,
    title: 'Download the Extension',
    description: 'Click the button below to download AURA as a ZIP file. Unzip it to a folder on your computer.',
    action: 'download',
  },
  {
    number: 2,
    icon: Chrome,
    title: 'Open Chrome Extensions',
    description: 'Go to chrome://extensions in your browser. Enable "Developer mode" using the toggle in the top-right corner.',
    action: 'chrome',
  },
  {
    number: 3,
    icon: FolderOpen,
    title: 'Load the Extension',
    description: 'Click "Load unpacked" and select the unzipped AURA folder. The extension icon will appear in your toolbar.',
    action: null,
  },
]

export default function InstallPage() {
  const [downloaded, setDownloaded] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  function markComplete(step: number) {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step])
    }
  }

  function handleDownload() {
    const link = document.createElement('a')
    link.href = '/aura-extension.zip'
    link.download = 'aura-extension.zip'
    link.click()
    setDownloaded(true)
    markComplete(1)
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/70">AURA</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-indigo-300 font-medium">Chrome Extension</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Install AURA on Chrome
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            Get AURA&apos;s accessibility tools on every website you visit. Takes less than 30 seconds.
          </p>
        </motion.div>

        {/* One-Click Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <button
            onClick={handleDownload}
            className={`w-full group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
              downloaded
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                downloaded
                  ? 'bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-gradient-to-br from-indigo-500/30 to-purple-500/20 border-indigo-500/20 group-hover:scale-105'
              }`}>
                {downloaded ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                ) : (
                  <Download className="w-7 h-7 text-indigo-400" />
                )}
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-white mb-0.5">
                  {downloaded ? 'Downloaded!' : 'Download AURA Extension'}
                </h3>
                <p className="text-sm text-white/40">
                  {downloaded
                    ? 'Unzip the file, then follow the steps below to install.'
                    : 'One click to download. Then follow 2 quick steps to activate.'}
                </p>
              </div>
              {!downloaded && (
                <div className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold group-hover:bg-indigo-400 transition-colors flex-shrink-0">
                  Download ZIP
                </div>
              )}
            </div>
          </button>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                completedSteps.includes(step.number)
                  ? 'bg-emerald-500/[0.03] border-emerald-500/15'
                  : 'bg-[#0B0B0F] border-white/[0.06] hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                  completedSteps.includes(step.number)
                    ? 'bg-emerald-500/20 border-emerald-500/30'
                    : 'bg-white/[0.04] border-white/[0.06]'
                }`}>
                  {completedSteps.includes(step.number) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <span className="text-sm font-bold text-white/40">{step.number}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed">{step.description}</p>

                  {step.action === 'download' && !downloaded && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-medium hover:bg-indigo-500/25 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download aura-extension.zip
                    </button>
                  )}
                  {step.action === 'download' && downloaded && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-white/40 text-xs font-medium hover:bg-white/[0.08] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Again
                    </button>
                  )}

                  {step.action === 'chrome' && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 font-mono text-xs text-white/50 select-all">
                        chrome://extensions
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText('chrome://extensions'); markComplete(2); }}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-white/40 text-xs font-medium hover:bg-white/[0.08] transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>

                {!completedSteps.includes(step.number) && step.number !== 1 && (
                  <button
                    onClick={() => markComplete(step.number)}
                    className="text-[10px] text-white/15 hover:text-white/40 transition-colors mt-1"
                  >
                    Mark done
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* After install */}
        {completedSteps.length === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">All set!</span>
            </div>
            <p className="text-white/40 text-sm mb-6">
              AURA is now active on every website. Look for the purple button in the bottom-right corner.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors"
            >
              Go to Dashboard <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </motion.div>
        )}

        {/* What you get */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-[#0B0B0F] border border-white/[0.06] rounded-2xl p-6"
        >
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">What You Get</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Floating accessibility button on every site',
              'Real-time text & contrast controls',
              'Live speech captions overlay',
              'Read-aloud for any web page',
              'Color blindness filters',
              'Dyslexia-friendly font toggle',
              'Simplified reading mode',
              'Settings persist across sessions',
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400/50 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-white/40">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
