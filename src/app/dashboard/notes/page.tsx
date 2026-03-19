'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, FileText, Plus, Trash2, Download, Copy, Search,
  Loader2, Clock, Sparkles, Save, FolderOpen, Tag, Edit3,
  ChevronRight, Volume2, Pause, Play, BookOpen
} from 'lucide-react'
import { supabase, DEFAULT_PROFILE_ID, logActivity } from '@/lib/supabase'

interface Note {
  id: string
  title: string
  content: string
  transcript: string
  tags: string[]
  duration_seconds: number | null
  word_count: number | null
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  // Note list state
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Editor state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [duration, setDuration] = useState(0)
  const [isSupported, setIsSupported] = useState(true)

  // AI state
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState('')

  // View state
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [showTranscript, setShowTranscript] = useState(true)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transcriptRef = useRef('')
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Check speech recognition support
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setIsSupported(false)
    loadNotes()
    return () => {
      recognitionRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [])

  // Auto-save when content changes
  useEffect(() => {
    if (!selectedNote && !title && !content && !transcript) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      if (title || content || transcript) {
        handleSave(true)
      }
    }, 5000)
  }, [title, content, transcript])

  async function loadNotes() {
    setLoading(true)
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('profile_id', DEFAULT_PROFILE_ID)
      .order('updated_at', { ascending: false })
      .limit(50)
    if (data) setNotes(data)
    setLoading(false)
  }

  function startNewNote() {
    setSelectedNote(null)
    setTitle('')
    setContent('')
    setTranscript('')
    setTags([])
    setSummary('')
    setDuration(0)
    setView('editor')
  }

  function openNote(note: Note) {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setTranscript(note.transcript || '')
    setTags(note.tags || [])
    setSummary('')
    setDuration(note.duration_seconds || 0)
    setView('editor')
    transcriptRef.current = note.transcript || ''
  }

  async function handleSave(isAutoSave = false) {
    if (!title.trim() && !content.trim() && !transcript.trim()) return
    if (!isAutoSave) setSaving(true)

    const noteData = {
      profile_id: DEFAULT_PROFILE_ID,
      title: title.trim() || `Note — ${new Date().toLocaleDateString()}`,
      content: content.trim(),
      transcript: transcript.trim(),
      tags,
      duration_seconds: duration || null,
      word_count: (content + ' ' + transcript).trim().split(/\s+/).filter(Boolean).length || null,
      updated_at: new Date().toISOString(),
    }

    if (selectedNote) {
      const { data } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', selectedNote.id)
        .select()
        .single()
      if (data) {
        setSelectedNote(data)
        setNotes(prev => prev.map(n => n.id === data.id ? data : n))
      }
    } else {
      const { data } = await supabase
        .from('notes')
        .insert({ ...noteData, created_at: new Date().toISOString() })
        .select()
        .single()
      if (data) {
        setSelectedNote(data)
        setNotes(prev => [data, ...prev])
      }
    }

    setLastSaved(new Date())
    if (!isAutoSave) {
      setSaving(false)
      logActivity('notes', 'save', title.trim() || 'Untitled')
    }
  }

  async function handleDelete(noteId: string) {
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
    if (selectedNote?.id === noteId) {
      setView('list')
      setSelectedNote(null)
    }
    logActivity('notes', 'delete', 'Deleted note')
  }

  // Speech Recognition
  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript + ' '
        } else {
          interimText += result[0].transcript
        }
      }
      if (finalText) {
        transcriptRef.current += finalText
        setTranscript(transcriptRef.current)
      }
      setInterim(interimText)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return
      console.error('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      if (isRecording && !isPaused) {
        try { recognition.start() } catch (e) { /* ignore */ }
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    setIsPaused(false)

    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)

    logActivity('notes', 'record', 'Started recording')
  }, [isRecording, isPaused])

  function pauseRecording() {
    recognitionRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsPaused(true)
  }

  function resumeRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' '
        } else {
          interimText += event.results[i][0].transcript
        }
      }
      if (finalText) {
        transcriptRef.current += finalText
        setTranscript(transcriptRef.current)
      }
      setInterim(interimText)
    }
    recognition.onerror = (event) => { if (event.error !== 'no-speech') console.error(event.error) }
    recognition.onend = () => {
      if (isRecording && !isPaused) {
        try { recognition.start() } catch (e) { /* ignore */ }
      }
    }
    recognition.start()
    recognitionRef.current = recognition
    setIsPaused(false)
    timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setIsPaused(false)
    setInterim('')
    logActivity('notes', 'record', `Stopped recording (${formatDuration(duration)})`)
  }

  async function summarizeContent() {
    const text = (content + '\n\n' + transcript).trim()
    if (!text) return
    setSummarizing(true)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: 'lecture' }),
      })
      const data = await res.json()
      setSummary(data.summary || 'Could not generate summary.')
    } catch {
      setSummary('Failed to summarize.')
    }
    setSummarizing(false)
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  function exportNote() {
    const text = `# ${title || 'Untitled Note'}\n\nDate: ${new Date().toLocaleDateString()}\nTags: ${tags.join(', ') || 'None'}\n\n## Notes\n${content}\n\n## Transcript\n${transcript}\n\n${summary ? `## Summary\n${summary}` : ''}`
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(title || 'note').replace(/\s+/g, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyToClipboard() {
    const text = `${title}\n\n${content}\n\n${transcript}`
    navigator.clipboard.writeText(text)
  }

  function formatDuration(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const filteredNotes = notes.filter(n => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return n.title.toLowerCase().includes(q) ||
           n.content.toLowerCase().includes(q) ||
           (n.tags || []).some(t => t.includes(q))
  })

  const allTags = [...new Set(notes.flatMap(n => n.tags || []))]

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  return (
    <div className="max-w-full">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-emerald-400" />
                  Lecture Notes
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  Record lectures, take notes, and get AI summaries
                </p>
              </div>
              <button
                onClick={startNewNote}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium border border-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>

            {/* Search & Tags */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        searchQuery === tag
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">
                  {notes.length === 0
                    ? 'No notes yet. Create your first note!'
                    : 'No notes match your search.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredNotes.map((note, i) => (
                  <motion.button
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => openNote(note)}
                    className="text-left p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-white/80 group-hover:text-white truncate pr-4">
                        {note.title || 'Untitled'}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-400 flex-shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-white/30 line-clamp-2 mb-3">
                      {note.content || note.transcript || 'Empty note'}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-white/20">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                      </span>
                      {note.word_count && (
                        <span>{note.word_count} words</span>
                      )}
                      {note.duration_seconds && note.duration_seconds > 0 && (
                        <span className="flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          {formatDuration(note.duration_seconds)}
                        </span>
                      )}
                    </div>
                    {(note.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/25">
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-[9px] text-white/20">+{note.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setView('list'); loadNotes() }}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                All Notes
              </button>
              <div className="flex items-center gap-2">
                {lastSaved && (
                  <span className="text-[10px] text-white/20">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <button
                  onClick={exportNote}
                  className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                  title="Export as Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                  title="Copy all"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {selectedNote && (
                  <button
                    onClick={() => handleDelete(selectedNote.id)}
                    className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs font-medium border border-emerald-500/20 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-transparent text-xl font-bold text-white placeholder:text-white/20 focus:outline-none mb-2 pb-2 border-b border-white/5"
            />

            {/* Tags */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-white/20" />
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => removeTag(tag)}
                  className="px-2 py-0.5 rounded-md text-xs bg-emerald-500/10 text-emerald-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-emerald-500/10"
                >
                  #{tag} ×
                </button>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Add tag..."
                className="bg-transparent text-xs text-white/40 placeholder:text-white/20 focus:outline-none w-20"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!isSupported}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-30"
                >
                  <Mic className="w-4 h-4" />
                  Record Lecture
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeRecording}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors text-sm font-medium"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors text-sm"
                  >
                    <MicOff className="w-4 h-4" />
                    Stop
                  </button>
                </>
              )}
              <div className="flex items-center gap-2 ml-auto text-xs text-white/30">
                {isRecording && !isPaused && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400">Recording</span>
                  </div>
                )}
                {isPaused && (
                  <span className="text-yellow-400">Paused</span>
                )}
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Editor Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Notes Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Notes
                  </h3>
                  <span className="text-[10px] text-white/20">
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your notes here..."
                  className="w-full h-[300px] bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/30 resize-none leading-relaxed"
                />
              </div>

              {/* Transcript Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Live Transcript
                  </h3>
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="text-[10px] text-white/20 hover:text-white/40 transition-colors"
                  >
                    {showTranscript ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showTranscript && (
                  <div className="w-full h-[300px] bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm text-white/60 overflow-y-auto leading-relaxed">
                    {transcript || interim ? (
                      <>
                        <span>{transcript}</span>
                        {interim && (
                          <span className="text-indigo-400/50 italic">{interim}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-white/20">
                        {isRecording ? 'Listening...' : 'Start recording to see live transcript here.'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Summary
                </h3>
                <button
                  onClick={summarizeContent}
                  disabled={summarizing || (!content && !transcript)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors disabled:opacity-30 border border-indigo-500/15"
                >
                  {summarizing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Summarize
                </button>
              </div>
              {summary ? (
                <div className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                  {summary}
                </div>
              ) : (
                <p className="text-xs text-white/20">
                  Click Summarize to get an AI-generated summary of your notes and transcript.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
